// 배포 뒤 IndexNow(Bing·네이버·Yandex·Seznam)에 바뀐 블로그 글 주소만 알린다.
//
//   node scripts/indexnow-changed.mjs <base-sha> <head-sha> [--dry-run]
//
// 버셀 시절의 ISR 재검증이 없어져서, 새 글·수정 글이 검색엔진에 늦게 반영되는 것을 메운다.
// - 대상: base..head 사이에 추가·수정된 apps/blog/data/articles/<slug>.json 의 글 주소
//   (빌드된 dist/blog/sitemaps/*.xml 에 실제로 있는 언어만). 새 글이 있으면 그 언어 블로그 첫 화면도.
// - 대상이 없거나 base 를 알 수 없으면(첫 푸시·강제 푸시) 아무것도 보내지 않는다.
//   전체 제출은 큰 변경 때만 손으로: node apps/web/scripts/indexnow.mjs
// - IndexNow 실패는 배포 실패로 치지 않는다(경고만).
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const KEY = '41c58e8135404b932b1063ea9aeb6b6a' // apps/web/scripts/indexnow.mjs 와 같은 키(apps/web/public/<KEY>.txt)
const HOST = 'www.aihavit.com'
const MAX = 10000

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..')
const [base, head] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const DRY = process.argv.includes('--dry-run')

if (!base || !head || /^0+$/.test(base)) {
  console.log('indexnow: base 커밋이 없어 건너뜀')
  process.exit(0)
}

let diff
try {
  diff = execFileSync('git', ['diff', '--name-status', '--no-renames', `${base}..${head}`, '--', 'apps/blog/data/articles/'], {
    cwd: join(HERE, '../..'),
    encoding: 'utf8',
  })
} catch (e) {
  console.log(`indexnow: git diff 실패 — 건너뜀 (${e.message.split('\n')[0]})`)
  process.exit(0)
}

const changed = new Map() // slug → 'A' | 'M'
for (const line of diff.split('\n')) {
  const m = /^([AM])\tapps\/blog\/data\/articles\/([^/]+)\.json$/.exec(line)
  if (m) changed.set(m[2], m[1])
}
if (!changed.size) {
  console.log('indexnow: 바뀐 글 없음')
  process.exit(0)
}

// 실제로 배포된 주소만(빌드된 언어별 사이트맵 기준) — 원고가 없는 언어 주소는 보내지 않는다.
const dir = join(HERE, 'dist/blog/sitemaps')
const urls = new Set()
const newLangs = new Set()
for (const f of readdirSync(dir).filter((f) => f.endsWith('.xml'))) {
  const lang = f.replace(/\.xml$/, '')
  for (const [, loc] of readFileSync(join(dir, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const slug = loc.trim().split('/').pop()
    const kind = changed.get(slug)
    if (!kind) continue
    urls.add(loc.trim())
    if (kind === 'A') newLangs.add(lang)
  }
}
for (const lang of newLangs) urls.add(`https://${HOST}/blog/${lang}`)

const list = [...urls].filter((u) => new URL(u).host === HOST).slice(0, MAX)
console.log(`indexnow: 글 ${changed.size}개(새 글 ${[...changed.values()].filter((k) => k === 'A').length}) → 주소 ${list.length}개`)
if (!list.length) process.exit(0)
if (DRY) {
  console.log(list.slice(0, 20).join('\n'))
  process.exit(0)
}

try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: list }),
  })
  // 200 = 접수, 202 = 접수(키 검증 대기). 그 외는 본문에 이유가 온다.
  const body = res.status >= 300 ? await res.text() : ''
  console.log(`indexnow: ${res.status} ${body}`)
  if (res.status >= 300) console.log(`::warning::IndexNow ${res.status} — 배포는 끝났다. 필요하면 손으로 다시 보낸다.`)
} catch (e) {
  console.log(`::warning::IndexNow 요청 실패 — ${e.message}`)
}
