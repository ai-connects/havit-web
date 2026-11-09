// 엣지 함수(dist-edge/viewer-request.js) ↔ 정본 대조. 운영에 요청을 보내지 않는다.
//   1. apps/web/middleware.js 원본과 이식본: 경로 × ?lang × 쿠키 × Accept-Language 조합 전부
//   2. middleware config.matcher ↔ 이식본 inMatcher
//   3. apps/blog/next.config.js redirects() 를 path-to-regexp 로 그대로 평가한 결과 ↔ 함수(www · 옛 호스트)
//   4. 응답 헤더 정책 값 ↔ infra/cloudfront.yml
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadEdge } from './local-edge.mjs'
import { loadNextRedirects, responseHeaderPolicies, ROOT, toRegex } from './rules.mjs'

const edge = loadEdge()
const fails = []
let checked = 0
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ── 1·2. middleware ──
const { loadMiddleware } = await import(join(ROOT, 'apps/web/scripts/load-middleware.mjs'))
const mw = await loadMiddleware()
const merged = JSON.parse(readFileSync(join(ROOT, 'apps/blog/lib/merged-redirects.json'), 'utf8'))
const paths = [
  '/', '/blog', '/blog/', '/affiliate/', '/affiliate', '/ko/affiliate/', '/ru/affiliate/', '/zh-cn/affiliate/', '/pt/affiliate/',
  '/en', '/en/', '/zh', '/zh/', '/pt-br', '/pt-br/', '/ko', '/ko/', '/ja/', '/ko/x', '/ko/index.html', '/ko/affiliate',
  '/ja/tools/bmr', '/de/category/sleep-recovery', '/zh-tw/page/3', '/en/page/2', '/ko/page/2/x', '/en/a/b/c', '/es/tools', `/fr/${merged[0].from}`, `/zh-tw/${merged[5].from}`,
  '/id/some-article-2026', '/ru/x', '/zz', '/privacy.html', '/blog/ko', '/blog/ko/x',
]
const queries = ['', '?lang=ko', '?lang=EN', '?lang=zh-Hant', '?lang=pt-BR', '?lang=xx', '?a=1&b=2', '?lang=ja&x=1']
const cookies = ['', 'ko', 'en', 'pt-BR', 'zh-HK', 'bogus']
const langs = ['', 'ko-KR,ko;q=0.9,en;q=0.8', 'de', 'zh-TW', 'en-US', '*', 'fr;q=0,ja;q=0.5', 'pt-BR,pt;q=0.9', 'nn-NO', 'iw', 'es;q=0.5,id;q=0.5']
const norm = (r) => {
  if (!r || r.headers?.get?.('x-middleware-next') === '1') return 'next'
  const h = r.headers
  return { status: r.status, location: h.get('location'), cc: h.get('cache-control'), vary: h.get('vary'), cookie: h.get('set-cookie') }
}
const normEdge = (r) => {
  if (!r) return 'next'
  const h = r.headers ?? {}
  const c = r.cookies?.hv_lang
  return {
    status: r.statusCode, location: h.location?.value ?? null, cc: h['cache-control']?.value ?? null,
    vary: h.vary?.value ?? null, cookie: c ? `hv_lang=${c.value}; ${c.attributes}` : null,
  }
}
for (const p of paths) {
  for (const q of queries) for (const c of cookies) for (const al of langs) {
    const headers = new Headers()
    if (c) headers.set('cookie', `other=1; hv_lang=${c}`)
    if (al) headers.set('accept-language', al)
    const want = norm(mw.default(new Request(`https://www.aihavit.com${p}${q}`, { headers })))
    const lang = new URLSearchParams(q).get('lang') ?? ''
    const got = normEdge(await edge.middleware(p, q, lang, c, al))
    checked++
    if (!eq(want, got)) fails.push({ test: 'middleware', p, q, c, al, want, got })
  }
}
const matcher = mw.config.matcher.map((m) => new RegExp(toRegex(m).re))
for (const p of paths) {
  checked++
  const want = matcher.some((re) => re.test(p))
  if (want !== edge.inMatcher(p)) fails.push({ test: 'matcher', p, want })
}

// ── 3. next.config.js redirects() ──
const { rules, basePath } = await loadNextRedirects()
const compiled = rules.map((r) => {
  const src = r.basePath === false ? r.source : basePath + r.source
  const { re, names } = toRegex(src)
  const dest = /^https?:/.test(r.destination) || r.basePath === false ? r.destination : basePath + r.destination
  return { re: new RegExp(re, 'i'), names, dest, base: r.basePath !== false }
})
function nextRef(path, legacyHost) {
  for (const r of compiled) {
    if (r.base === legacyHost) continue // 옛 호스트에서는 basePath:false 규칙만(그쪽 /blog 는 아래 별도 처리)
    const m = r.re.exec(path)
    if (m) return r.dest.replace(/:(\w+)[+*]?/g, (_, n) => m[r.names.indexOf(n) + 1])
  }
  return null
}
const blogPaths = []
for (const l of ['ko', 'en', 'zh-tw', 'xx']) {
  merged.slice(0, 20).forEach((r) => blogPaths.push(`/blog/${l}/${r.from}`))
  blogPaths.push(`/blog/${l}/sleep-hygiene-2026`, `/blog/${l}/glp-1-side-effects2026.`, `/blog/${l}/x-20262026`, `/blog/${l}/x-2026.`,
    `/blog/${l}/abc%EE%85%8D2026.`, `/blog/${l}/tools/bmr2026`, `/blog/${l}/category/sleep2026.`, `/blog/${l}/rss.xml`, `/blog/${l}/page/2`, `/blog/${l}/tools`)
}
for (const p of blogPaths) {
  checked++
  const want = nextRef(p, false)
  const r = await edge.handler({ request: { uri: p, querystring: {}, headers: { host: { value: 'www.aihavit.com' } }, cookies: {} } })
  const got = r.statusCode ? r.headers.location.value : null
  if (want !== got) fails.push({ test: 'next-redirects', p, want, got })
}
const legacyPaths = ['/', '/ko', '/ko/tools/bmr', '/en/some-slug', '/xx/y/z']
for (const l of ['ko', 'en', 'xx']) merged.slice(0, 20).forEach((r) => legacyPaths.push(`/${l}/${r.from}`))
for (const p of legacyPaths) {
  checked++
  const want = nextRef(p, true)
  const r = await edge.handler({ request: { uri: p, querystring: {}, headers: { host: { value: 'blog.aihavit.com' } }, cookies: {} } })
  if (r.statusCode !== 308 || r.headers.location.value !== want) fails.push({ test: 'legacy', p, want, got: r.headers?.location?.value })
}

// ── 4. 응답 헤더 정책 ↔ CloudFormation ──
const yml = readFileSync(join(ROOT, 'apps/static-site/infra/cloudfront.yml'), 'utf8')
const pol = responseHeaderPolicies()
for (const [k, v] of Object.entries(pol.blog)) {
  checked++
  const val = k === 'Strict-Transport-Security' ? `AccessControlMaxAgeSec: ${v.split('=')[1]}` : k === 'X-Frame-Options' ? `FrameOption: ${v}` : k === 'Referrer-Policy' ? `ReferrerPolicy: ${v}` : 'ContentTypeOptions'
  if (!yml.includes(val)) fails.push({ test: 'headers-policy', k, v })
}

console.log(JSON.stringify({ checked, failed: fails.length, sample: fails.slice(0, 8) }, null, 1))
process.exit(fails.length ? 1 : 0)
