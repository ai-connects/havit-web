/**
 * sitemap.xml, generated at build time.
 *
 * It used to be a hand-maintained file in public/, which meant `lastmod` only
 * moved when someone remembered to edit it — and nobody did. Three releases
 * went out over the days after 2026-08-13 while the sitemap kept telling
 * crawlers nothing had changed, so none of them triggered a re-crawl.
 *
 * Generating it removes the remembering. Locale pages get the build date because
 * they are rebuilt from index.html on every deploy; the legal documents get
 * their own dates because they genuinely only change when the document does.
 */

import {
  LOCALES,
  LOCALE_META,
  DEFAULT_LOCALE,
  I18N_PAGES,
  localeUrl,
  localesFor,
  translatedLocales,
} from './i18n-html.js'

const SITE = 'https://www.aihavit.com'

/**
 * Documents that change on their own schedule. Bump the date here when the text
 * changes — that is the whole point of them not tracking the build date.
 */
const DOCUMENTS = [
  { path: '/privacy.html', lastmod: '2026-05-24' },
  { path: '/terms.html', lastmod: '2026-06-19' },
  { path: '/refund.html', lastmod: '2026-06-19' },
  { path: '/refund-ko.html', lastmod: '2026-06-19' },
  { path: '/eula.html', lastmod: '2026-06-19' },
  { path: '/eula-ko.html', lastmod: '2026-06-19' },
]

/**
 * i18n 을 태우는 페이지 중 홈이 아닌 것들. 홈과 달리 내용이 자주 안 바뀌므로
 * DOCUMENTS 와 같은 이유로 명시 날짜를 쓴다 — 무관한 배포마다 lastmod 를 새로
 * 주장하지 않기 위해서다.
 *
 * 경로는 I18N_PAGES 에서 가져온다. 사이트맵에만 손으로 적어 두면 로케일이
 * 늘거나 경로가 바뀔 때 둘이 어긋난다.
 */
const EXTRA_PAGE_META = { 'affiliate/index.html': { lastmod: '2026-08-25', priority: '0.6' } }

function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * The locale pages are 34 translations of one page, so each entry carries the
 * full alternate set. The HTML already declares hreflang and that alone is
 * valid, but the blog's sitemap annotates too and matching it means one rule to
 * remember instead of two.
 */
function alternates(page) {
  const url = (l) => `${SITE}${page.path(l)}`
  return [
    ...localesFor(page).map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${LOCALE_META[l].hreflang}" href="${url(l)}" />`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LOCALE)}" />`,
  ].join('\n')
}

function buildSitemap() {
  const stamp = today()
  const [home, ...extraPages] = I18N_PAGES
  const homeAlt = alternates(home)

  const localeUrls = translatedLocales().map((l) =>
    [
      '  <url>',
      `    <loc>${localeUrl(l)}</loc>`,
      `    <lastmod>${stamp}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      `    <priority>${l === DEFAULT_LOCALE ? '1.0' : '0.8'}</priority>`,
      homeAlt,
      '  </url>',
    ].join('\n'),
  )

  const documentUrls = DOCUMENTS.map((d) =>
    [
      '  <url>',
      `    <loc>${SITE}${d.path}</loc>`,
      `    <lastmod>${d.lastmod}</lastmod>`,
      '    <changefreq>yearly</changefreq>',
      '    <priority>0.3</priority>',
      '  </url>',
    ].join('\n'),
  )

  // 홈이 아닌 i18n 페이지도 로케일 수만큼 URL 이 나온다. 각 URL 은 자기 페이지의
  // alternate 묶음을 단다 — 홈의 묶음을 달면 서로 다른 문서를 번역본이라 선언하는
  // 꼴이라 구글이 hreflang 을 통째로 무시한다.
  const pageUrls = extraPages.flatMap((page) => {
    const meta = EXTRA_PAGE_META[page.bundle]
    const alt = alternates(page)
    return localesFor(page).map((l) =>
      [
        '  <url>',
        `    <loc>${SITE}${page.path(l)}</loc>`,
        `    <lastmod>${meta.lastmod}</lastmod>`,
        '    <changefreq>monthly</changefreq>',
        `    <priority>${meta.priority}</priority>`,
        alt,
        '  </url>',
      ].join('\n'),
    )
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...localeUrls,
    ...pageUrls,
    ...documentUrls,
    '</urlset>',
    '',
  ].join('\n')
}

export default function sitemap() {
  return {
    name: 'havit-sitemap',
    // i18n-html decides which locales actually ship, so this has to run after it.
    enforce: 'post',

    /** Dev: serve the same file the build emits, so the two cannot disagree. */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req.url || '').split('?')[0] !== '/sitemap.xml') return next()
        res.setHeader('Content-Type', 'application/xml')
        res.end(buildSitemap())
      })
    },

    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap() })
    },
  }
}

export { buildSitemap, LOCALES }
