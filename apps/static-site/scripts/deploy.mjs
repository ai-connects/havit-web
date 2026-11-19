// dist/ → S3, dist-edge/ → CloudFront Function + KeyValueStore, 그리고 무효화. AWS CLI v2 를 부른다.
// 대상은 CloudFormation 스택(infra/cloudfront.yml) 출력에서 읽는다.
//
//   node scripts/deploy.mjs --stack havit-www-static [--dry-run]
//
// 순서: ⓪ 무효화 범위 계산(업로드 전 S3 와 비교) ① 새 파일 업로드(삭제 없음) ② KVS 갱신 ③ 함수 갱신·게시 ④ 지워진 파일 삭제
//       ⑤ 무효화 — 바뀐 파일만(scripts/invalidation.mjs). 엣지 함수가 바뀌었거나 바뀐 파일이 많으면 /*.
// ①이 끝나기 전에는 새 함수가 없는 파일을 가리키지 않고, ④는 새 함수가 나간 뒤에 한다.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { uploadRules } from './rules.mjs'
import { DEFAULT_CAP, planInvalidation } from './invalidation.mjs'

const HERE = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const arg = (n, d) => (process.argv.includes(`--${n}`) ? process.argv[process.argv.indexOf(`--${n}`) + 1] : d)
const DRY = process.argv.includes('--dry-run')
const STACK = arg('stack', 'havit-www-static')
const REGION = arg('region', 'us-east-1')

function aws(args, { json = false, mutate = true } = {}) {
  const full = [...args, '--region', REGION]
  if (DRY && mutate) {
    console.log('$ aws', full.map((a) => (/[\s*'"{]/.test(a) ? `'${a}'` : a)).join(' '))
    return json ? {} : ''
  }
  const out = execFileSync('aws', json ? [...full, '--output', 'json'] : full, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 28 })
  return json ? JSON.parse(out || '{}') : out
}

// ── 스택 출력 ──
const outputs = DRY && process.argv.includes('--fake-stack')
  ? { Bucket: 'BUCKET', DistributionId: 'DIST', FunctionName: 'havit-www-viewer-request', KvsArn: 'KVS_ARN', KvsId: '00000000-0000-0000-0000-000000000000' }
  : Object.fromEntries(aws(['cloudformation', 'describe-stacks', '--stack-name', STACK], { json: true, mutate: false }).Stacks[0].Outputs.map((o) => [o.OutputKey, o.OutputValue]))
const { Bucket, DistributionId, FunctionName, KvsArn, KvsId } = outputs
const dest = `s3://${Bucket}`
const dist = join(HERE, 'dist')

// ── ⓪ 무효화 범위: 업로드 전에 S3 의 지금 내용(ETag = MD5)과 dist 를 비교해 둔다 ──
const local = new Map()
for (const f of readdirSync(dist, { recursive: true, withFileTypes: true })) {
  if (!f.isFile()) continue
  const full = join(f.parentPath ?? f.path, f.name)
  local.set(full.slice(dist.length + 1).split('\\').join('/'), createHash('md5').update(readFileSync(full)).digest('hex'))
}
const remote = new Map()
if (!DRY || !process.argv.includes('--fake-stack')) {
  const listed = aws(['s3api', 'list-objects-v2', '--bucket', Bucket, '--query', 'Contents[].[Key,ETag]'], { json: true, mutate: false })
  for (const [k, e] of Array.isArray(listed) ? listed : []) remote.set(k, e.replace(/"/g, ''))
}
console.log(`invalidation compare: local ${local.size}, remote ${remote.size}`)

// ── ① 업로드: 규칙마다 한 번씩, 앞 규칙에 걸린 파일은 뺀다(aws CLI 필터는 뒤에 온 것이 이긴다) ──
const rules = uploadRules()
rules.forEach((r, i) => {
  const earlier = rules.slice(0, i).flatMap((e) => ['--exclude', e.glob])
  const filters = r.glob === '*' ? earlier : ['--exclude', '*', '--include', r.glob, ...earlier]
  aws([
    's3', 'sync', dist, dest, '--no-progress', '--only-show-errors', ...filters,
    '--cache-control', r.cacheControl, ...(r.contentType ? ['--content-type', r.contentType] : []),
    '--metadata-directive', 'REPLACE',
  ])
})

// ── ② KeyValueStore: 차이만 반영(한 번에 50개 한도) ──
const wanted = Object.fromEntries(JSON.parse(readFileSync(join(HERE, 'dist-edge/kvs.json'), 'utf8')).map((e) => [e.Key, e.Value]))
const current = DRY ? {} : Object.fromEntries((aws(['cloudfront-keyvaluestore', 'list-keys', '--kvs-arn', KvsArn], { json: true, mutate: false }).Items ?? []).map((e) => [e.Key, e.Value]))
const puts = Object.entries(wanted).filter(([k, v]) => current[k] !== v).map(([Key, Value]) => ({ Key, Value }))
const deletes = Object.keys(current).filter((k) => !(k in wanted)).map((Key) => ({ Key }))
let etag = DRY ? 'ETAG' : aws(['cloudfront-keyvaluestore', 'describe-key-value-store', '--kvs-arn', KvsArn], { json: true, mutate: false }).ETag
const ops = [...puts.map((p) => ['puts', p]), ...deletes.map((d) => ['deletes', d])]
for (let i = 0; i < ops.length; i += 50) {
  const chunk = ops.slice(i, i + 50)
  const p = chunk.filter(([t]) => t === 'puts').map(([, v]) => v)
  const d = chunk.filter(([t]) => t === 'deletes').map(([, v]) => v)
  const res = aws(['cloudfront-keyvaluestore', 'update-keys', '--kvs-arn', KvsArn, '--if-match', etag,
    ...(p.length ? ['--puts', JSON.stringify(p)] : []), ...(d.length ? ['--deletes', JSON.stringify(d)] : [])], { json: true })
  etag = res.ETag ?? etag
}
console.log(`kvs: ${puts.length} put, ${deletes.length} delete`)

// ── ③ 함수: KVS ID 를 넣어 갱신하고 게시 ──
const code = readFileSync(join(HERE, 'dist-edge/viewer-request.js'), 'utf8').replace('__KVS_ID__', KvsId)
if (Buffer.byteLength(code) > 10240) throw new Error('함수가 10 KB 를 넘는다')
const tmp = join(mkdtempSync(join(tmpdir(), 'edge-')), 'viewer-request.js')
writeFileSync(tmp, code)
// 지금 게시(LIVE)된 코드와 다르면 라우팅이 바뀐 것 → ⑤에서 전체 무효화
let functionChanged = true
if (!DRY || !process.argv.includes('--fake-stack')) {
  try {
    const liveFile = join(mkdtempSync(join(tmpdir(), 'edge-live-')), 'live.js')
    aws(['cloudfront', 'get-function', '--name', FunctionName, '--stage', 'LIVE', liveFile], { json: true, mutate: false })
    functionChanged = readFileSync(liveFile, 'utf8') !== code
  } catch (e) { console.log('LIVE 함수 코드를 못 읽어 전체 무효화로 간다:', e.message) }
}
const fnEtag = DRY ? 'ETAG' : aws(['cloudfront', 'describe-function', '--name', FunctionName, '--stage', 'DEVELOPMENT'], { json: true, mutate: false }).ETag
const config = JSON.stringify({ Comment: 'www.aihavit.com routing (apps/static-site)', Runtime: 'cloudfront-js-2.0', KeyValueStoreAssociations: { Quantity: 1, Items: [{ KeyValueStoreARN: KvsArn }] } })
const updated = aws(['cloudfront', 'update-function', '--name', FunctionName, '--if-match', fnEtag, '--function-config', config, '--function-code', `fileb://${tmp}`], { json: true })
aws(['cloudfront', 'publish-function', '--name', FunctionName, '--if-match', updated.ETag ?? 'ETAG'], { json: true })

// ── ④ 지워진 파일 삭제(내용은 ①에서 이미 올라갔으므로 크기만 비교) ──
aws(['s3', 'sync', dist, dest, '--delete', '--size-only', '--no-progress', '--only-show-errors'])

// ── ⑤ 무효화: 바뀐 파일만(월 1,000 경로 무료, 이후 경로당 0.005달러). 상한·함수 변경이면 /* ──
const plan = process.env.FULL_INVALIDATION
  ? { paths: ['/*'], reason: '수동 전체 무효화', changed: 0, deleted: 0 }
  : planInvalidation(local, remote, { functionChanged, cap: DEFAULT_CAP })
console.log(`invalidation: ${plan.paths.length} paths (${plan.reason}; changed ${plan.changed}, deleted ${plan.deleted})`)
if (plan.paths.length) {
  const batch = JSON.stringify({ Paths: { Quantity: plan.paths.length, Items: plan.paths }, CallerReference: `deploy-${Date.now()}` })
  const tmpBatch = join(mkdtempSync(join(tmpdir(), 'inv-')), 'batch.json')
  writeFileSync(tmpBatch, batch)
  aws(['cloudfront', 'create-invalidation', '--distribution-id', DistributionId, '--invalidation-batch', `file://${tmpBatch}`], { json: true })
}
console.log('deploy done')
