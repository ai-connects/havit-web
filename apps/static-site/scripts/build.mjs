// www.aihavit.com 정적 빌드 → S3 + CloudFront (호스트 중립 산출물 + 엣지 함수)
//   dist/            = apps/web 의 vite 빌드(그대로)          → S3 버킷 루트
//   dist/blog/       = apps/blog 의 정적 내보내기(STATIC_EXPORT=1) → S3 blog/
//   dist-edge/viewer-request.js = CloudFront Function(라우팅·리다이렉트·언어 302)
//   dist-edge/kvs.json          = CloudFront KeyValueStore 항목(병합 slug 표)
//
// Vercel 빌드 경로(apps/web `npm run build`, apps/blog `next build`)는 건드리지 않는다.
// 홈은 Vercel 과 같은 명령으로 빌드하고, 블로그는 환경변수 하나만 다르게 준다.
//
//   node scripts/build.mjs                    # 두 앱 빌드 + 조립
//   node scripts/build.mjs --skip-app-builds  # 이미 있는 apps/web/dist · apps/blog/out 으로 조립만
//   node scripts/build.mjs --edge-only        # 엣지 함수·KVS 만 다시
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { buildEdge } from './rules.mjs'

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(HERE, '../..')
const WEB = join(REPO, 'apps/web')
const BLOG = join(REPO, 'apps/blog')
const DIST = join(HERE, 'dist')
const EDGE = join(HERE, 'dist-edge')
const CACHE = join(HERE, '.cache/img-src')
const OUT_CACHE = join(HERE, '.cache/img-out')
const FN_LIMIT = 10 * 1024 // CloudFront Functions 최대 크기(조정 불가)
const EDGE_ONLY = process.argv.includes('--edge-only')

const t0 = Date.now()
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s]`, ...a)
const sh = (cmd, cwd, env = {}) => execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', ...env } })

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

// ── 1. 앱 빌드 ──────────────────────────────────────────────
if (!process.argv.includes('--skip-app-builds') && !EDGE_ONLY) {
  log('web: npm run build (Vercel 과 같은 명령)')
  sh('npm run build', WEB)
  log('blog: STATIC_EXPORT=1 next build')
  // 정적 판에만 있는 경로(홈 2쪽 이후 /<lang>/page/<n>, 검색 색인)는 빌드 동안만 app/ 에 넣는다.
  // Vercel 앱에 이 경로가 생기면 basePath:false 옛 호스트 규칙과 엉켜 404 가 308 루프가 된다.
  const extra = join(BLOG, 'static-export/app')
  const added = walk(extra).map((f) => join(BLOG, 'app', relative(extra, f)))
  cpSync(extra, join(BLOG, 'app'), { recursive: true })
  try {
    sh('npm run check:tokens && npm run check:brand && npx next build', BLOG, { STATIC_EXPORT: '1' })
  } finally {
    for (const f of added) rmSync(f, { force: true })
    for (const d of ['app/[lang]/page', 'app/[lang]/search-index.json']) rmSync(join(BLOG, d), { recursive: true, force: true })
  }
}
let wantedCount = 0, made = 0
if (!EDGE_ONLY) {
for (const d of [join(WEB, 'dist'), join(BLOG, 'out')]) {
  if (!existsSync(d)) throw new Error(`${d} 가 없다 — 앱 빌드부터`)
}

// ── 2. 조립 ─────────────────────────────────────────────────
log('assemble dist/')
rmSync(DIST, { recursive: true, force: true })
cpSync(join(WEB, 'dist'), DIST, { recursive: true })
cpSync(join(BLOG, 'out'), join(DIST, 'blog'), { recursive: true })

// RSC 페이로드(<경로>.txt)는 남긴다. 2026-11-09 운영 실측: 지웠더니 next/link 프리페치·이동이
// 매번 404(CloudFront 4xx 비율 약 20%)였다. 링크는 페이지 전체 로드로 동작은 했지만 요청·지연이 늘었다.
// deploy.mjs 가 .txt 를 text/x-component + HTML 과 같은 캐시로 올린다.
let rscKept = 0
for (const f of walk(join(DIST, 'blog'))) {
  if (f.endsWith('.txt') && existsSync(f.slice(0, -4) + '.html')) rscKept++
}
log(`kept ${rscKept} RSC .txt payloads`)

// ── 3. 이미지: HTML 이 가리키는 /blog/_img/<호스트>/<경로>/<폭>.avif 만 만든다 ──
// 지금 Vercel 이미지 최적화가 AVIF 지원 브라우저(대부분)에 주는 파일과 바이트가 거의 같게 맞췄다
// (art_0024 828px: Vercel 33,952B ↔ 여기 34,128B. sharp 기준 품질 50, effort 6, 4:2:0). AVIF 를 못 읽는 옛 브라우저(iOS 16.3 이하 등)는 아래 AVIF_FALLBACK
// 스크립트가 같은 폭의 WebP 사본(Vercel 이 그 브라우저에 주던 것과 같은 바이트)으로 바꾼다.
const IMG_RE = /\/blog\/_img\/([A-Za-z0-9._/-]+?)\/(\d+)\.avif/g
const sharp = (await import('sharp')).default
const probe = (await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } }).avif().toBuffer()).toString('base64')
const AVIF_FALLBACK = `<script>(function(){var t=new Image();t.onload=function(){if(!t.width)f()};t.onerror=f;t.src='data:image/avif;base64,${probe}';function x(i){['src','srcset'].forEach(function(a){var v=i.getAttribute(a);if(v&&v.indexOf('/blog/_img/')!==-1)i.setAttribute(a,v.replace(/\\.avif( |,|$)/g,'.webp$1'))})}function f(){var r=function(){document.querySelectorAll('img').forEach(x)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',r);else r();new MutationObserver(function(l){l.forEach(function(m){m.addedNodes.forEach(function(n){if(n.tagName==='IMG')x(n);else if(n.querySelectorAll)n.querySelectorAll('img').forEach(x)})})}).observe(document.documentElement,{childList:true,subtree:true})}})()</script>`
const wanted = new Map() // key -> Set(width)
for (const f of walk(join(DIST, 'blog'))) {
  if (!f.endsWith('.html')) continue
  let html = readFileSync(f, 'utf8')
  if (html.includes('/blog/_img/')) {
    html = html.replace('<head>', `<head>${AVIF_FALLBACK}`)
    writeFileSync(f, html)
  }
  for (const m of html.matchAll(IMG_RE)) {
    if (!wanted.has(m[1])) wanted.set(m[1], new Set())
    wanted.get(m[1]).add(Number(m[2]))
  }
}
const totalVariants = [...wanted.values()].reduce((n, s) => n + s.size, 0)
log(`images: ${wanted.size} sources, ${totalVariants} variants`)

async function original(key) {
  if (key.startsWith('_local/')) {
    const p = join(BLOG, 'public', key.slice('_local/'.length))
    return readFileSync(p)
  }
  const [hostPath, query] = key.split('/__q/')
  const url = `https://${hostPath}${query ? `?${query}` : ''}`
  const cached = join(CACHE, createHash('sha1').update(url).digest('hex'))
  if (existsSync(cached)) return readFileSync(cached)
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      const buf = Buffer.from(await res.arrayBuffer())
      mkdirSync(CACHE, { recursive: true })
      writeFileSync(cached, buf)
      return buf
    } catch (e) {
      if (attempt >= 3) throw e
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}

// AVIF: Vercel 의 AVIF 와 바이트를 맞춘 설정. WebP: Vercel(=next/image) 의 WebP 와 바이트가 같다(q75).
const ENCODINGS = [['avif', { quality: 50, effort: 6, chromaSubsampling: '4:2:0' }], ['webp', { quality: 75 }]]
const queue = [...wanted.entries()]
async function worker() {
  for (let item = queue.shift(); item; item = queue.shift()) {
    const [key, widths] = item
    const src = await original(key)
    const meta = await sharp(src).metadata()
    for (const w of widths) {
      const width = Math.min(w, meta.width ?? w) // 원본보다 키우지 않는다(next/image 와 같다)
      for (const [ext, enc] of ENCODINGS) {
        const out = join(DIST, 'blog/_img', key, `${w}.${ext}`)
        const cached = join(OUT_CACHE, createHash('sha1').update(`${key}|${w}|${JSON.stringify(enc)}`).digest('hex') + '.' + ext)
        mkdirSync(dirname(out), { recursive: true })
        if (!existsSync(cached)) {
          mkdirSync(OUT_CACHE, { recursive: true })
          await sharp(src).rotate().resize({ width, withoutEnlargement: true })[ext](enc).toFile(cached)
        }
        cpSync(cached, out)
        made++
      }
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
log(`images: wrote ${made} files`)

wantedCount = wanted.size
}

// ── 4. CloudFront Function + KeyValueStore ──────────────────
const edge = await buildEdge()
const src = readFileSync(join(HERE, 'edge/viewer-request.src.js'), 'utf8').replace('const D = __DATA__;', () => `const D = ${JSON.stringify(edge.data)};`)
const { transform } = await import('esbuild')
// 식별자는 그대로 둔다(handler 이름이 바뀌면 안 된다). target 은 런타임이 모르는 문법(?. ?? 등)을 만들지 않게.
const fn = (await transform(src, { minifyWhitespace: true, minifySyntax: true, target: 'es2017', format: 'esm', legalComments: 'none' })).code
rmSync(EDGE, { recursive: true, force: true })
mkdirSync(EDGE, { recursive: true })
writeFileSync(join(EDGE, 'viewer-request.js'), fn)
writeFileSync(join(EDGE, 'kvs.json'), JSON.stringify(edge.kvs, null, 1) + '\n')
// 배포 때 __KVS_ID__ 가 36자 ID 로 바뀐다.
const fnBytes = Buffer.byteLength(fn) - '__KVS_ID__'.length + 36
const kvsBytes = edge.kvs.reduce((n, e) => n + Buffer.byteLength(e.Key) + Buffer.byteLength(e.Value), 0)
const mergedInline = Buffer.byteLength(JSON.stringify(Object.fromEntries(edge.kvs.map((e) => [e.Key.slice(2), e.Value]))))

// ── 5. 보고 ─────────────────────────────────────────────────
const files = EDGE_ONLY ? null : walk(DIST)
const report = {
  build_seconds: Math.round((Date.now() - t0) / 1000),
  files: files?.length,
  bytes: files?.reduce((n, f) => n + statSync(f).size, 0),
  images: EDGE_ONLY ? undefined : { sources: wantedCount, files: made },
  edge: {
    function_bytes: fnBytes,
    function_limit: FN_LIMIT,
    merged_map_inline_bytes: mergedInline,
    kvs: { keys: edge.kvs.length, bytes: kvsBytes, limit_bytes: 5 * 2 ** 20 },
    rules: edge.counts,
  },
}
writeFileSync(join(HERE, 'dist-report.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (fnBytes > FN_LIMIT) {
  console.error(`CloudFront Function ${fnBytes} B > ${FN_LIMIT} B — 데이터를 KVS 로 더 옮길 것`)
  process.exit(1)
}
log(`ok — ${relative(process.cwd(), DIST)}, ${relative(process.cwd(), EDGE)}`)
