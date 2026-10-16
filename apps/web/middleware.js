import { next } from '@vercel/functions'
import { AFFILIATE_LOCALES, DEFAULT_LOCALE, LOCALES } from './plugins/locales.js'

/**
 * Send first-time visitors on `/` to the edition their device asks for.
 *
 * The 34 locale pages have been built and live since the i18n plugin landed,
 * and hreflang has always pointed at them — but nothing ever routed a visitor
 * there. A phone set to Korean opened aihavit.com and got English; the only way
 * to /ko/ was the language menu or a search result. This closes that gap.
 *
 * SEO shape, deliberately the one Google documents for locale-adaptive pages:
 *
 *   - 302, never 301. The root URL is not permanently "the Korean page"; it is
 *     the English edition that sometimes forwards. A 301 would teach caches and
 *     crawlers otherwise, and it is not undoable once cached.
 *   - No bot special-casing. Serving Googlebot something other than what a
 *     visitor with the same Accept-Language gets is cloaking. Googlebot crawls
 *     with `Accept-Language: en` (or none), so it stays on the English root by
 *     the same rule everyone else follows, and reaches the localized pages via
 *     hreflang + sitemap as it already does.
 *   - `Vary: Accept-Language, Cookie` on the redirect only. Putting Vary on the
 *     200 would fragment the CDN cache of the site's most-hit page across every
 *     distinct Accept-Language string; the redirect itself is `no-store`, and
 *     middleware runs before the cache on every request anyway.
 *
 * The cookie is what keeps the English edition reachable. Without it, a Korean
 * device clicking "English" in the switcher would land on `/` and be bounced
 * straight back to /ko/ — the language menu would look broken.
 *
 * 단, 쿠키는 **값**으로 읽어야 한다. 존재 여부만 보면 자동 라우팅으로 심긴
 * `hv_lang=ko` 까지 "영어를 골랐다" 로 읽혀서, 한국어 기기가 두 번째 방문부터
 * 영어를 받는다. 저장된 값이 기본 언어일 때만 그대로 둔다.
 */

const COOKIE = 'hv_lang'
const YEAR = 60 * 60 * 24 * 365

const SERVED = new Set(LOCALES)

/**
 * 블로그가 실제로 서빙하는 10개 언어. 마케팅 사이트의 34개 로케일과 집합이
 * 다르므로 좁혀서 매핑해야 한다 — 없는 언어로 보내면 블로그가 영어 본문을
 * 폴백으로 띄우면서 noindex 를 달기 때문에, 링크 권위가 색인도 안 되는 URL 로
 * 샌다. 출처는 블로그의 lib/i18n.ts SERVED_ROUTE_LANGS.
 */
const BLOG_LOCALES = new Set(['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'])

/** 마케팅 사이트 로케일 → 블로그 언어. 디렉터리 이름이 다른 둘만 적는다. */
const BLOG_ALIAS = { 'zh-cn': 'zh', pt: 'pt-br' }

/**
 * 폴백이 en 인 이유: sitemap 의 x-default 와 블로그 자체 FALLBACK_LANG 이
 * 둘 다 en 이다. 여기만 ko 로 두면 세 곳이 어긋난다.
 */
function toBlogLang(locale) {
  if (BLOG_LOCALES.has(locale)) return locale
  return BLOG_ALIAS[locale] ?? DEFAULT_LOCALE
}

/**
 * Browser tags that do not equal one of our locale directory names.
 *
 * Chinese is the case that actually bites: `zh-HK` and `zh-Hant` are Traditional
 * and must not fall through to the Simplified page just because their base
 * subtag is `zh`, so script and region are resolved before any base fallback.
 * `iw`/`in` are the legacy ISO codes for Hebrew and Indonesian that some older
 * Android builds still send.
 */
const ALIAS = {
  no: 'nb',
  nn: 'nb',
  iw: 'he',
  in: 'id',
  'pt-br': 'pt',
  'pt-pt': 'pt',
}

/** One Accept-Language tag → a locale we actually serve, or null. */
function toLocale(tag) {
  if (SERVED.has(tag)) return tag
  if (ALIAS[tag]) return ALIAS[tag]

  const base = tag.split('-')[0]

  if (base === 'zh') {
    // Traditional: explicit script, or one of the regions that uses it.
    return /(^|-)(hant|tw|hk|mo)(-|$)/.test(tag) ? 'zh-tw' : 'zh-cn'
  }

  if (ALIAS[base]) return ALIAS[base]
  return SERVED.has(base) ? base : null
}

/**
 * Accept-Language → the first tag we serve, honouring q-weights.
 *
 * A device set to Korean with English second sends `ko-KR,ko;q=0.9,en;q=0.8`.
 * Reading in header order would be right here but wrong for the many browsers
 * that do not emit tags in weight order, so the weights are parsed. Equal
 * weights keep header order — Array#sort is stable.
 */
function pickLocale(header) {
  if (!header) return null

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
      const weight = q === undefined ? 1 : Number.parseFloat(q.slice(2))
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(weight) ? weight : 0 }
    })
    .filter((entry) => entry.tag && entry.tag !== '*' && entry.q > 0)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const locale = toLocale(tag)
    if (locale) return locale
  }
  return null
}

function redirect(to, locale, { setCookie = true } = {}) {
  const headers = {
    Location: to,
    'Cache-Control': 'no-store',
    Vary: 'Accept-Language, Cookie',
  }
  // 쿠키는 "루트를 다시 튕기지 말라" 는 표시다. 블로그 루트는 언어 세그먼트가
  // 없으면 페이지 자체가 없어 어차피 항상 보내므로 쿠키가 할 일이 없다.
  // 오히려 심어두면 그 방문자가 나중에 `/` 로 왔을 때 마케팅 사이트의 언어
  // 라우팅이 억제된다 — 독일어 기기가 /blog 를 먼저 열었다는 이유로 `/` 에서
  // 영어를 받게 된다. 그래서 명시 선택(`?lang=`)일 때만 심는다.
  if (setCookie) {
    headers['Set-Cookie'] = `${COOKIE}=${locale}; Path=/; Max-Age=${YEAR}; SameSite=Lax; Secure`
  }
  return new Response(null, { status: 302, headers })
}

/**
 * 제휴 모집 페이지도 34개 로케일로 나간다(`/affiliate/`, `/ko/affiliate/` …).
 *
 * `/affiliate/` 는 루트와 같은 성질이다 — 그 자체가 영어판이고, 기기 언어에 따라
 * 번역판으로 보낸다. `/ko/affiliate/` 같은 로케일판은 이미 어느 판인지 분명하므로
 * 라우팅하지 않고 **`?lang=` 전환만** 받는다(`/ko/` 를 matcher 에 안 넣는 것과 같다).
 */
const AFFILIATE = /^\/(?:([a-z-]+)\/)?affiliate\/?$/

/**
 * 제휴 페이지가 실제로 존재하는 로케일. 홈(34개)보다 좁다.
 *
 * 이 집합을 안 보면 러시아어 기기가 `/affiliate/` 를 열었을 때 `/ru/affiliate/`
 * 로 302 를 받고 404 를 만난다 — 실제로 그렇게 깨졌었다. 없는 언어는 영어판에
 * 그대로 둔다.
 */
const AFFILIATE_SERVED = new Set(AFFILIATE_LOCALES)

/**
 * `/blog` 가 빠진 블로그 URL → 정본으로 301.
 *
 * 블로그(Next.js, basePath `/blog`)의 RSC 페이로드에는 `<Link>` 의 href 가
 * basePath 없이 실린다(`"href":"/en/best-ai-health-coach-apps"`). 렌더된 `<a>`
 * 에는 `/blog` 가 붙고 클라이언트 라우터가 붙여 쓰므로 Next 의 정상 동작이지만,
 * Googlebot 이 페이로드 문자열을 URL 로 주워 www 루트에서 404 를 316건 쌓았다.
 *
 * **홈 경로와 겹치지 않는 것만** 옮긴다. 홈은 34개 로케일 중 ko·ja·zh-tw·es·
 * id·de·fr 이 블로그 언어와 같은 프리픽스를 쓰고, 그 아래 실제 페이지는
 * `/{locale}/`(index.html) 와 `/{locale}/affiliate/` 뿐이다(dist 전수 확인).
 * 그 두 갈래는 건드리지 않는다.
 *
 * 여러 단계 경로는 블로그에 실제로 그 깊이가 있는 최상위 세그먼트
 * (`tools/<도구>`, `category/<슬러그>`)만 옮기고, 나머지는 원래대로 404 에
 * 둔다 — 블로그에서도 404 일 URL 을 301 로 세탁할 이유가 없다.
 *
 * 목적지는 슬래시 없는 정본이라 블로그 쪽 슬래시 정규화를 한 번 더 타지 않는다
 * (1홉). 쿼리스트링은 그대로 넘긴다.
 */
const HOME_UNDER_LOCALE = new Set(['index.html', 'affiliate'])
const BLOG_NESTED = new Set(['tools', 'category'])
/** 홈에 같은 이름의 로케일이 없는 블로그 언어 — 이 셋은 `/en` 자체도 블로그 홈. */
const BLOG_ONLY_LANGS = new Set(['en', 'zh', 'pt-br'])

export function blogStrayTarget(pathname) {
  const m = /^\/([a-z]{2}(?:-[a-z]{2})?)(?:\/(.*))?$/.exec(pathname)
  if (!m || !BLOG_LOCALES.has(m[1])) return null
  const lang = m[1]
  const parts = (m[2] ?? '').split('/').filter(Boolean)

  if (parts.length === 0) return BLOG_ONLY_LANGS.has(lang) ? `/blog/${lang}` : null
  if (HOME_UNDER_LOCALE.has(parts[0])) return null
  if (parts.length === 1 || (parts.length === 2 && BLOG_NESTED.has(parts[0]))) {
    return `/blog/${lang}/${parts.join('/')}`
  }
  return null
}

export default function middleware(request) {
  const url = new URL(request.url)

  const stray = blogStrayTarget(url.pathname)
  if (stray) {
    return new Response(null, { status: 301, headers: { Location: stray + url.search } })
  }
  const isBlogRoot = url.pathname === '/blog' || url.pathname === '/blog/'
  const affiliate = AFFILIATE.exec(url.pathname)
  // 아래 언어 라우팅은 루트·블로그 루트·제휴 페이지 전용이다. 위 블로그 경로
  // 때문에 matcher 가 넓어졌으니, 그 외 경로(`/ko/index.html` 등)는 여기서 놓아준다.
  if (url.pathname !== '/' && !isBlogRoot && !affiliate) return next()
  // 언어 세그먼트가 붙은 제휴 페이지인가(= 라우팅 대상이 아님).
  const isLocalizedAffiliate = Boolean(affiliate && affiliate[1])

  /**
   * 이 요청이 보고 있는 페이지의, 주어진 로케일판 경로.
   * 제휴 페이지는 번역이 있는 로케일만 존재하므로, 없으면 영어판을 돌려준다.
   */
  const pathFor = (locale) => {
    if (affiliate) {
      const served = AFFILIATE_SERVED.has(locale) ? locale : DEFAULT_LOCALE
      return served === DEFAULT_LOCALE ? '/affiliate/' : `/${served}/affiliate/`
    }
    return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`
  }

  /**
   * `?lang=` is the explicit override, and the language menu on every localized
   * page links to `/?lang=en` for exactly this reason: a visitor who arrived at
   * /ko/ from search has no cookie yet, so a bare `/` would bounce them back.
   */
  const requested = url.searchParams.get('lang')?.toLowerCase()
  if (requested) {
    const locale = toLocale(requested)
    if (locale) {
      // Redirect even for `en` — the response has to carry Set-Cookie, and the
      // cookie is what stops the next `/` visit from forwarding again.
      // 보던 페이지를 유지한 채 언어만 바꾼다 — 제휴 페이지에서 고르면 제휴
      // 페이지의 그 언어판으로 간다.
      const to = isBlogRoot ? `/blog/${toBlogLang(locale)}` : pathFor(locale)
      return redirect(to, locale)
    }
  }

  /**
   * 블로그 루트는 마케팅 루트와 성질이 다르다. `/` 는 그 자체로 영어판이라
   * 아무것도 안 하면 되지만, `/blog` 는 언어 세그먼트가 없으면 페이지가 없다 —
   * 오리진이 어차피 한 언어로 보낸다. 그러니 쿠키가 있든 없든 항상 보내되,
   * 어디로 보낼지를 여기서 정한다. 쿠키가 있으면 그 선택을 존중한다.
   */
  if (isBlogRoot) {
    const chosen = request.headers.get('cookie')?.match(/(?:^|;\s*)hv_lang=([^;]+)/)?.[1]
    const locale =
      (chosen && toLocale(chosen.toLowerCase())) ||
      pickLocale(request.headers.get('accept-language')) ||
      DEFAULT_LOCALE
    return redirect(`/blog/${toBlogLang(locale)}`, locale, { setCookie: false })
  }

  /**
   * 쿠키는 **값**으로 읽는다. 존재 여부만 보던 게 버그였다 — 한국어 기기가 첫
   * 방문에 /ko/ 로 가면서 `hv_lang=ko` 가 심기는데, 그 다음부터는 쿠키가 있다는
   * 이유만으로 `/` 가 영어로 나왔다. 저장해 둔 선택을 무시하고 정반대를 준 셈이다.
   *
   * 이제 값이 기본 언어면 그대로 두고(= 사용자가 영어를 고른 경우),
   * 다른 언어면 그 판으로 보낸다. 아직 없으면 기기 언어로 판단한다.
   * 어느 쪽이든 쿠키를 다시 심지는 않는다 — 이미 있는 선택을 덮어쓸 이유가 없다.
   */
  // `/ko/affiliate/` 는 이미 한국어판이다. 여기까지 왔다는 건 `?lang=` 이 없었다는
  // 뜻이므로 아무것도 하지 않는다 — `/ko/` 를 matcher 에서 뺀 것과 같은 이유다.
  if (isLocalizedAffiliate) return next()

  // pathFor 가 폴백한 결과가 지금 보고 있는 경로와 같으면 보내지 않는다 —
  // `/affiliate/` 에서 러시아어 기기는 영어판으로 폴백되므로 자기 자신으로
  // 302 를 쏘는 무한 루프가 된다.
  const goOrStay = (locale, opts) => {
    const to = pathFor(locale)
    if (to === url.pathname || (affiliate && to === '/affiliate/' && !affiliate[1])) return next()
    return redirect(to, locale, opts)
  }

  const stored = request.headers.get('cookie')?.match(/(?:^|;\s*)hv_lang=([^;]+)/)?.[1]
  if (stored) {
    const locale = toLocale(stored.toLowerCase())
    if (!locale || locale === DEFAULT_LOCALE) return next()
    return goOrStay(locale, { setCookie: false })
  }

  const locale = pickLocale(request.headers.get('accept-language'))
  if (!locale || locale === DEFAULT_LOCALE) return next()

  return goOrStay(locale)
}

/**
 * 루트·블로그 루트·제휴 페이지만. 홈의 로케일 페이지(`/ko/`)·법적 고지·에셋,
 * 그리고 `/blog/<lang>/...` 아래 전부는 이미 어느 판인지 분명하므로 건너뛴다.
 *
 * `/:locale/affiliate/` 는 이제 언어 메뉴 때문이 아니다. 메뉴는 기본 언어판
 * 경로(`/`, `/affiliate/`)로만 `?lang=` 을 보낸다 — 그 두 개는 어차피 matcher 에
 * 있다. 이 줄이 남아 있는 건 손으로 친 `/ko/affiliate/?lang=en` 같은 URL 과
 * 외부에서 들어오는 링크를 받아 주기 위해서다. (예전 주석은 메뉴가 이 경로를
 * 가리킨다고 적고 있었는데, 그 전제가 바뀌었는데도 주석만 남아 있었다.)
 * `/blog/` 도 넣은 이유는 슬래시 정규화 리다이렉트를 한 번 더 타지 않게
 * 하려는 것 — 미들웨어가 vercel.json 보다 먼저 돌아 한 홉으로 끝난다.
 */
export const config = {
  matcher: [
    '/',
    '/blog',
    '/blog/',
    '/affiliate/',
    '/:locale/affiliate/',
    // `/blog` 가 빠진 블로그 URL(blogStrayTarget). 언어 목록은 BLOG_LOCALES 와 같다.
    '/:lang(en|zh|pt-br)',
    '/:lang(en|zh|pt-br)/',
    '/:lang(ko|en|ja|zh|zh-tw|es|pt-br|id|de|fr)/:path+',
  ],
}
