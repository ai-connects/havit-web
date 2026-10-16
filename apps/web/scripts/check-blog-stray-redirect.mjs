/**
 * middleware 의 "`/blog` 빠진 블로그 URL → 301" 이 홈 경로를 건드리지 않는지 검사한다.
 *
 * 홈은 34개 로케일 중 7개(ko·ja·zh-tw·es·id·de·fr)가 블로그 언어와 같은
 * 프리픽스를 쓴다. 이 프리픽스 아래 홈 페이지가 하나라도 301 을 받으면 그 언어
 * 홈이 블로그로 사라진다. 그래서 로케일 테이블(plugins/locales.js)에서 홈 경로를
 * 전부 만들어 middleware 에 통과시키고, 블로그 표본은 정확한 목적지로 가는지 본다.
 *
 * 빌드 전에 돈다(dist 없이). 홈 경로 집합은 i18n-html 이 찍는 그대로다:
 * `/{l}/`, `/{l}/index.html`, 제휴 번역이 있는 로케일의 `/{l}/affiliate/`.
 */
import middleware, { blogStrayTarget } from '../middleware.js'
import { AFFILIATE_LOCALES, LOCALES } from '../plugins/locales.js'

const ORIGIN = 'https://www.aihavit.com'
const failures = []

/** 홈 경로 — 어떤 헤더 조합에서도 301 이면 안 된다. */
const homePaths = ['/', '/affiliate/', '/affiliate/index.html', '/index.html']
for (const l of LOCALES) {
  if (l === 'en') continue
  homePaths.push(`/${l}`, `/${l}/`, `/${l}/index.html`)
}
for (const l of AFFILIATE_LOCALES) {
  if (l === 'en') continue
  homePaths.push(`/${l}/affiliate`, `/${l}/affiliate/`, `/${l}/affiliate/index.html`)
}

const headerSets = [
  {},
  { 'accept-language': 'ko-KR,ko;q=0.9' },
  { 'accept-language': 'ja' },
  { cookie: 'hv_lang=de' },
]

let homeChecked = 0
for (const p of homePaths) {
  for (const h of headerSets) {
    const res = middleware(new Request(ORIGIN + p, { headers: h }))
    homeChecked += 1
    if (res.status === 301) failures.push(`홈 경로 301: ${p} ${JSON.stringify(h)}`)
    // 원래 matcher 밖이던 로케일 하위 경로는 언어 라우팅도 받으면 안 된다.
    if (p !== '/' && !p.startsWith('/affiliate') && !/\/affiliate\/?$/.test(p) && res.status !== 200) {
      failures.push(`홈 경로 비통과(${res.status}): ${p} ${JSON.stringify(h)}`)
    }
  }
}

/** 블로그 표본 — 정확한 목적지로 301, 쿼리 보존. */
const blogCases = [
  ['/en/best-calorie-counter-apps', '/blog/en/best-calorie-counter-apps'],
  ['/ko/zepbound-side-effects', '/blog/ko/zepbound-side-effects'],
  ['/ja/best-diet-apps', '/blog/ja/best-diet-apps'],
  ['/zh-tw/best-diet-apps', '/blog/zh-tw/best-diet-apps'],
  ['/pt-br/best-diet-apps', '/blog/pt-br/best-diet-apps'],
  ['/zh/best-diet-apps/', '/blog/zh/best-diet-apps'],
  ['/de/articles', '/blog/de/articles'],
  ['/fr/about', '/blog/fr/about'],
  ['/id/editorial-policy', '/blog/id/editorial-policy'],
  ['/es/rss.xml', '/blog/es/rss.xml'],
  ['/en/tools', '/blog/en/tools'],
  ['/en/tools/water', '/blog/en/tools/water'],
  ['/ko/category/nutrition', '/blog/ko/category/nutrition'],
  ['/en', '/blog/en'],
  ['/zh/', '/blog/zh'],
  ['/pt-br', '/blog/pt-br'],
  ['/en/best-diet-apps?utm_source=x&a=1', '/blog/en/best-diet-apps?utm_source=x&a=1'],
]
for (const [from, to] of blogCases) {
  const res = middleware(new Request(ORIGIN + from, { headers: { 'accept-language': 'ko' } }))
  const loc = res.headers.get('location')
  if (res.status !== 301 || loc !== to) failures.push(`블로그 ${from} → ${res.status} ${loc} (기대 301 ${to})`)
}

/** 옮기지 않는 경로 — 블로그에도 없는 깊이, 블로그 언어가 아닌 프리픽스, 홈 로케일 루트. */
const untouched = [
  '/en/a/b', '/ko/best-diet-apps/extra', '/ko/tools/water/x', '/ru/best-diet-apps',
  '/pt/best-diet-apps', '/zh-cn/best-diet-apps', '/ko', '/ko/', '/blog/en/best-diet-apps',
  '/assets/x.js', '/og/ko.png', '/privacy.html',
]
for (const p of untouched) {
  if (blogStrayTarget(p) !== null) failures.push(`옮기면 안 되는 경로: ${p} → ${blogStrayTarget(p)}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  `✓ blog stray redirect — 홈 ${homePaths.length}경로 × ${headerSets.length}헤더 = ${homeChecked}건 무영향, ` +
    `블로그 ${blogCases.length}건 301, 비대상 ${untouched.length}건 유지`,
)
