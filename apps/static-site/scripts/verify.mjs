// 정적 빌드 ↔ 운영(www.aihavit.com) 대조.
//
//   node scripts/local-edge.mjs &   # 배포될 CloudFront Function + dist/ 를 S3 처럼 (www :8788, blog :8789, apex :8790)
//   node scripts/verify.mjs [--per-lang 300] [--all] [--out verify-out]
//
// 전환 전 실제 CloudFront 로도 돌릴 수 있다: --local https://dxxxx.cloudfront.net (Host 별 대조는 로컬에서만)
//
// 운영에는 초당 4건 이하로만 보낸다(--rps). 결과 원문은 --out 폴더의 JSON 에 남기고
// 화면에는 요약만 찍는다.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : def
}
const PROD = arg('prod', 'https://www.aihavit.com')
const LEGACY_PROD = arg('legacy-prod', 'https://blog.aihavit.com')
const LOCAL = arg('local', 'http://localhost:8788')
const LEGACY_LOCAL = arg('legacy-local', 'http://localhost:8789')
const APEX_PROD = arg('apex-prod', 'https://aihavit.com')
const APEX_LOCAL = arg('apex-local', 'http://localhost:8790')
const RPS = Number(arg('rps', '4'))
const PER_LANG = process.argv.includes('--all') ? Infinity : Number(arg('per-lang', '300'))
const OUT = arg('out', 'verify-out')
const ONLY = arg('only', 'pages,redirects,feeds,weight').split(',')
mkdirSync(OUT, { recursive: true })

// ── 운영 요청 속도 제한 ──
let nextSlot = 0
async function prodGate() {
  const now = Date.now()
  const wait = Math.max(0, nextSlot - now)
  nextSlot = Math.max(now, nextSlot) + 1000 / RPS
  if (wait) await new Promise((r) => setTimeout(r, wait))
}
const isProd = (u) => u.startsWith(PROD) || u.startsWith(LEGACY_PROD) || u.startsWith(APEX_PROD)

async function get(url, { headers = {}, body = true } = {}) {
  if (isProd(url)) await prodGate()
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'havit-static-verify/1.0', ...headers } })
      const text = body ? await res.text() : (await res.arrayBuffer(), '')
      return { status: res.status, location: res.headers.get('location'), type: res.headers.get('content-type'), text, headers: res.headers }
    } catch (e) {
      if (attempt >= 3) return { status: 0, error: String(e), text: '' }
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

/** Location 을 같은 기준(경로+쿼리, 다른 호스트면 절대 URL)으로. */
function normLoc(loc, base) {
  if (!loc) return null
  const u = new URL(loc, base)
  const own = [new URL(PROD).host, new URL(LOCAL).host, new URL(LEGACY_LOCAL).host, new URL(APEX_LOCAL).host, new URL(APEX_PROD).host]
  const local = own.includes(u.host) && new URL(base).host === u.host
  return local ? u.pathname + u.search : u.origin.replace(/^http:\/\/localhost:\d+$/, '(self)') + u.pathname + u.search
}

const pick = (re, s) => re.exec(s)?.[1] ?? null
function seo(html) {
  const head = html.split('</head>')[0]
  return {
    title: pick(/<title[^>]*>([^<]*)<\/title>/, head),
    canonical: pick(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/, head) ?? pick(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/, head),
    robots: pick(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/, head),
    hreflang: (head.match(/hrefLang=|hreflang=/gi) ?? []).length,
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const k = i++
      out[k] = await fn(items[k], k)
    }
  }))
  return out
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
const summary = {}

// ── 1. sitemap 의 모든(또는 표본) URL ──
async function pages() {
  const home = locs((await get(`${PROD}/sitemap.xml`)).text)
  const index = locs((await get(`${PROD}/blog/sitemap.xml`)).text)
  const blogByLang = {}
  for (const sm of index) {
    const lang = /sitemaps\/([^/]+)\.xml/.exec(sm)?.[1] ?? sm
    blogByLang[lang] = locs((await get(sm)).text)
  }
  const sample = [...home]
  for (const [lang, urls] of Object.entries(blogByLang)) {
    const step = Math.max(1, urls.length / Math.min(PER_LANG, urls.length))
    for (let k = 0; k < urls.length && sample.length < 1e6; k += step) sample.push(urls[Math.floor(k)])
  }
  const urls = [...new Set(sample)]
  const counts = { home: home.length, blog: Object.fromEntries(Object.entries(blogByLang).map(([l, u]) => [l, u.length])) }
  console.log(`pages: sitemap home ${home.length}, blog ${JSON.stringify(counts.blog)} → checking ${urls.length}`)
  const rows = await pool(urls, 8, async (url) => {
    const path = new URL(url).pathname + new URL(url).search
    const [p, l] = await Promise.all([get(PROD + path), get(LOCAL + path)])
    const a = { status: p.status, location: normLoc(p.location, PROD), ...(p.status === 200 ? seo(p.text) : {}) }
    const b = { status: l.status, location: normLoc(l.location, LOCAL), ...(l.status === 200 ? seo(l.text) : {}) }
    const diff = Object.keys({ ...a, ...b }).filter((k) => a[k] !== b[k])
    return { path, diff, prod: diff.length ? a : undefined, local: diff.length ? b : undefined }
  })
  const bad = rows.filter((r) => r.diff.length)
  writeFileSync(join(OUT, 'pages.json'), JSON.stringify({ counts, checked: rows.length, mismatches: bad }, null, 1))
  summary.pages = { sitemapUrls: home.length + Object.values(counts.blog).reduce((a, b) => a + b, 0), checked: rows.length, mismatches: bad.length, byField: tally(bad) }
}

function tally(bad) {
  const t = {}
  for (const r of bad) for (const k of r.diff) t[k] = (t[k] ?? 0) + 1
  return t
}

// ── 2. 리다이렉트 출발지 ──
async function redirects() {
  const merged = JSON.parse(readFileSync(new URL('../../blog/lib/merged-redirects.json', import.meta.url)))
  const web = JSON.parse(readFileSync(new URL('../../web/vercel.json', import.meta.url)))
  const langs = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr']
  const cases = []
  merged.forEach((r, i) => cases.push({ kind: 'blog-merged', path: `/blog/${langs[i % 10]}/${r.from}` }))
  merged.slice(0, 40).forEach((r, i) => cases.push({ kind: 'stray-merged', path: `/${langs[i % 10]}/${r.from}` }))
  for (const r of web.redirects) {
    const m = /:(\w+)\(([a-z|-]+)\)/.exec(r.source)
    const vals = m ? m[2].split('|') : [null]
    for (const v of vals) {
      const p = (m ? r.source.replace(m[0], v) : r.source).replace(/:path[+*]/, 'x/y')
      cases.push({ kind: 'web-vercel.json', path: p })
    }
  }
  // 운영 sitemap 의 정본 글 몇 개로 끝 슬래시·/blog 빠진 주소·.html 변형을 만든다.
  const sm = locs((await get(`${PROD}/blog/sitemaps/en.xml`)).text).slice(0, 400)
  const sm2 = locs((await get(`${PROD}/blog/sitemaps/ko.xml`)).text).slice(0, 400)
  const canon = [...sm, ...sm2].map((u) => new URL(u).pathname).filter((p) => p.split('/').length === 4)
  canon.slice(0, 40).forEach((p) => cases.push({ kind: 'trailing-slash', path: p + '/' }))
  canon.slice(40, 70).forEach((p) => cases.push({ kind: 'stray-no-blog', path: p.replace(/^\/blog/, '') }))
  for (const l of langs) cases.push({ kind: 'trailing-slash', path: `/blog/${l}/` }, { kind: 'stray-no-blog', path: `/${l}` }, { kind: 'stray-no-blog', path: `/${l}/` })
  for (const p of ['/blog/ko/tools/', '/blog/en/tools/bmr/', '/blog/ja/articles/', '/ko/tools/bmr', '/en/category/sleep-recovery', '/ko/affiliate', '/ko/affiliate/', '/affiliate', '/de/', '/de', '/blog', '/blog/', '/?lang=ko', '/blog?lang=ja', '/affiliate/?lang=de'])
    cases.push({ kind: 'misc', path: p })
  canon.slice(70, 80).forEach((p) => cases.push({ kind: 'junk-suffix', path: p + '2026.' }))
  // 언어 302 (Accept-Language / 쿠키)
  const al = [['ko-KR,ko;q=0.9', null], ['ja', null], ['de-DE', null], ['en-US', null], ['ko', 'hv_lang=en']]
  for (const [lang, cookie] of al) for (const p of ['/', '/blog', '/affiliate/'])
    cases.push({ kind: 'locale-302', path: p, headers: { 'Accept-Language': lang, ...(cookie ? { Cookie: cookie } : {}) } })
  // 옛 서브도메인
  const legacy = []
  merged.slice(0, 30).forEach((r, i) => legacy.push({ kind: 'legacy-merged', path: `/${langs[i % 10]}/${r.from}` }))
  canon.slice(0, 25).forEach((p) => legacy.push({ kind: 'legacy-host', path: p.replace(/^\/blog/, '') }))
  legacy.push({ kind: 'legacy-host', path: '/' }, { kind: 'legacy-host', path: '/ko' }, { kind: 'legacy-host', path: '/ko/tools/bmr' })
  canon.slice(0, 5).forEach((p) => legacy.push({ kind: 'legacy-blog-path', path: p }))

  const run = async (c, prodBase, localBase) => {
    const [p, l] = await Promise.all([get(prodBase + c.path, { headers: c.headers, body: false }), get(localBase + c.path, { headers: c.headers, body: false })])
    const a = { status: p.status, location: normLoc(p.location, prodBase), cookie: p.headers?.get('set-cookie')?.split(';')[0] ?? null }
    const b = { status: l.status, location: normLoc(l.location, localBase), cookie: l.headers?.get('set-cookie')?.split(';')[0] ?? null }
    const diff = Object.keys(a).filter((k) => a[k] !== b[k])
    return { ...c, diff, prod: a, local: b }
  }
  const apex = ['/', '/ko/', '/blog/ko', '/privacy.html', '/blog/en/x?y=1'].map((path) => ({ kind: 'apex-host', path }))
  const rows = [
    ...(await pool(cases, 6, (c) => run(c, PROD, LOCAL))),
    ...(await pool(legacy, 4, (c) => run(c, LEGACY_PROD, LEGACY_LOCAL))),
    ...(await pool(apex, 2, (c) => run(c, APEX_PROD, APEX_LOCAL))),
  ]
  const bad = rows.filter((r) => r.diff.length)
  const byKind = {}
  for (const r of rows) {
    byKind[r.kind] ??= { checked: 0, mismatches: 0 }
    byKind[r.kind].checked++
    if (r.diff.length) byKind[r.kind].mismatches++
  }
  writeFileSync(join(OUT, 'redirects.json'), JSON.stringify({ checked: rows.length, byKind, mismatches: bad }, null, 1))
  summary.redirects = { checked: rows.length, mismatches: bad.length, byKind }
}

// ── 3. sitemap · rss · robots ──
async function feeds() {
  const paths = ['/sitemap.xml', '/robots.txt', '/blog/robots.txt', '/blog/sitemap.xml', '/blog/rss.xml', '/llms.txt', '/llms-full.txt', '/blog/llms.txt', '/blog/api/health']
  const index = locs((await get(`${PROD}/blog/sitemap.xml`)).text)
  for (const u of index) paths.push(new URL(u).pathname)
  for (const l of ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr']) paths.push(`/blog/${l}/rss.xml`)
  // 빌드 시각만 다른 값은 의미가 같다.
  const strip = (s) => s
    .replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/g, '')
    .replace(/"ts":"[^"]*"/g, '')
  const rows = await pool(paths, 4, async (path) => {
    const [p, l] = await Promise.all([get(PROD + path), get(LOCAL + path)])
    const bytes = p.text === l.text
    const semantic = strip(p.text) === strip(l.text)
    const locSame = JSON.stringify(locs(p.text).sort()) === JSON.stringify(locs(l.text).sort())
    return { path, status: [p.status, l.status], type: [p.type, l.type], bytes, semantic, locs: locs(p.text).length, locSame, sizes: [p.text.length, l.text.length] }
  })
  writeFileSync(join(OUT, 'feeds.json'), JSON.stringify(rows, null, 1))
  summary.feeds = {
    checked: rows.length,
    byteEqual: rows.filter((r) => r.bytes).length,
    semanticEqual: rows.filter((r) => r.semantic).length,
    notEqual: rows.filter((r) => !r.semantic).map((r) => ({ path: r.path, status: r.status, locSame: r.locSame, sizes: r.sizes })),
    typeDiff: rows.filter((r) => r.type[0] !== r.type[1]).map((r) => [r.path, ...r.type]),
  }
}

// ── 4. 글 5개 페이지 무게 (HTML + CSS + JS + 화면 폭에 맞는 이미지) ──
function chooseSrc(img, vw, dpr) {
  const srcset = pick(/srcSet="([^"]+)"/i, img) ?? pick(/srcset="([^"]+)"/, img)
  const src = pick(/\ssrc="([^"]+)"/, img)
  if (!srcset) return src
  const sizes = pick(/sizes="([^"]+)"/, img) ?? '100vw'
  let slot = vw
  for (const part of sizes.split(',').map((s) => s.trim())) {
    const m = /^\(max-width:\s*(\d+)px\)\s+(.+)$/.exec(part)
    const val = m ? m[2] : part
    if (m && vw > Number(m[1])) continue
    slot = val.endsWith('vw') ? (vw * parseFloat(val)) / 100 : parseFloat(val)
    break
  }
  const need = slot * dpr
  const cands = srcset.split(',').map((s) => s.trim().split(/\s+/)).map(([u, w]) => [u.replaceAll('&amp;', '&'), parseInt(w)])
  cands.sort((x, y) => x[1] - y[1])
  return (cands.find(([, w]) => w >= need) ?? cands.at(-1))[0]
}

async function weight() {
  const pagesArg = arg('weight-pages', '')
  const sm = locs((await get(`${PROD}/blog/sitemaps/ko.xml`)).text).map((u) => new URL(u).pathname).filter((p) => p.split('/').length === 4)
  const en = locs((await get(`${PROD}/blog/sitemaps/en.xml`)).text).map((u) => new URL(u).pathname).filter((p) => p.split('/').length === 4)
  const list = pagesArg ? pagesArg.split(',') : [sm[3], sm[Math.floor(sm.length / 2)], en[5], en[Math.floor(en.length / 3)], en.at(-2)]
  const accept = { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' }
  const measure = async (base, path, vw, dpr) => {
    const html = (await get(base + path)).text
    const assets = new Set()
    for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) assets.add(m[1])
    for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) assets.add(m[1])
    const imgs = []
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      const s = chooseSrc(m[0], vw, dpr)
      if (s) imgs.push({ s: s.replaceAll('&amp;', '&'), lazy: /loading="lazy"/.test(m[0]) })
    }
    let text = Buffer.byteLength(html), img = 0, imgEager = 0
    const seen = new Set()
    for (const a of assets) text += Buffer.byteLength((await get(new URL(a, base + path).href, { body: true })).text)
    for (const { s, lazy } of imgs) {
      if (seen.has(s)) continue
      seen.add(s)
      const u = new URL(s, base + path).href
      if (isProd(u)) await prodGate()
      const r = await fetch(u, { headers: accept })
      const n = (await r.arrayBuffer()).byteLength
      img += n
      if (!lazy) imgEager += n
    }
    return { html: Buffer.byteLength(html), textTotal: text, img, imgEager, images: seen.size }
  }
  const rows = []
  for (const path of list) {
    for (const [vw, dpr, label] of [[1440, 1, 'desktop'], [390, 3, 'mobile']]) {
      const p = await measure(PROD, path, vw, dpr)
      const l = await measure(LOCAL, path, vw, dpr)
      rows.push({ path, device: label, prod: p, local: l })
    }
  }
  writeFileSync(join(OUT, 'weight.json'), JSON.stringify(rows, null, 1))
  const kb = (n) => Math.round(n / 1024)
  summary.weight = rows.map((r) => `${r.device} ${r.path}: 운영 ${kb(r.prod.textTotal + r.prod.img)}KB(이미지 ${kb(r.prod.img)}) → 정적 ${kb(r.local.textTotal + r.local.img)}KB(이미지 ${kb(r.local.img)})`)
}

const t0 = Date.now()
if (ONLY.includes('feeds')) await feeds()
if (ONLY.includes('redirects')) await redirects()
if (ONLY.includes('weight')) await weight()
if (ONLY.includes('pages')) await pages()
summary.seconds = Math.round((Date.now() - t0) / 1000)
writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summary, null, 1))
console.log(JSON.stringify(summary, null, 1))
