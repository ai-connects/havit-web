/**
 * Open Graph tags and JSON-LD for every locale.
 *
 * The site shipped with only og:image/og:site_name/og:type and no structured
 * data at all, while the blog next door annotates every article. That left the
 * company's main page as the one page search engines had to infer everything
 * about — including the six FAQ answers that were already sitting in the markup
 * as plain text, ineligible for a rich result purely for want of a wrapper.
 *
 * Everything here is derived from index.html and the locale dictionaries rather
 * than hand-written per locale, so the schema can never drift from what the page
 * actually says. Add an FAQ item to the markup and it appears in the schema.
 */

const SITE = 'https://www.aihavit.com'
const APP_STORE = 'https://apps.apple.com/us/app/havit-glp-1-weight-loss-coach/id6755166023'
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.aiconnects.havitWellness'
// 블로그는 2026-09 에 www.aihavit.com/blog 로 들어왔다(서브도메인은 링크
// 권위를 물려받지 못해 옮겼다). 같은 오리진이므로 절대 URL 대신 경로를 쓴다.
// schema.org 의 sameAs·url 은 절대 URL 이어야 한다. 링크용 상대경로와 달리
// 여기서는 호스트를 붙인다.
const BLOG = `${SITE}/blog/en`
const APP = 'https://app.aihavit.com/'

/**
 * The social card. Swap this file and every locale's preview changes.
 *
 * It used to point at havit-logo.png — a 1600×753 wordmark on white, which made
 * a shared link look like a stray logo file. This one carries the page's own
 * headline and the app screen at the 1.91:1 ratio the platforms crop to.
 */
const OG_IMAGE = `${SITE}/og-card.png`
const OG_IMAGE_W = 1200
const OG_IMAGE_H = 630

/**
 * og:locale wants language_TERRITORY, which cannot be derived from a bare
 * language code — "pt" alone is ambiguous and Facebook rejects invented pairs.
 * Listed explicitly so each one is a decision rather than a guess.
 */
const OG_LOCALE = {
  en: 'en_US', ar: 'ar_AR', ca: 'ca_ES', cs: 'cs_CZ', da: 'da_DK', de: 'de_DE',
  el: 'el_GR', es: 'es_ES', fi: 'fi_FI', fr: 'fr_FR', he: 'he_IL', hi: 'hi_IN',
  hr: 'hr_HR', hu: 'hu_HU', id: 'id_ID', it: 'it_IT', ja: 'ja_JP', ko: 'ko_KR',
  ms: 'ms_MY', nb: 'nb_NO', nl: 'nl_NL', pl: 'pl_PL', pt: 'pt_PT', ro: 'ro_RO',
  ru: 'ru_RU', sk: 'sk_SK', sv: 'sv_SE', th: 'th_TH', tr: 'tr_TR', uk: 'uk_UA',
  uz: 'uz_UZ', vi: 'vi_VN', 'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW',
}

/** Plain text for a JSON string: drop markup, resolve entities, collapse space. */
function plain(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Escape for an HTML attribute value. */
function attr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/**
 * English strings live in index.html itself rather than a dictionary, so the
 * default locale needs the markup read back out to resolve a key.
 */
function baseStrings(baseHtml) {
  const out = {}
  const re = /<([a-z0-9]+)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi
  let m
  while ((m = re.exec(baseHtml))) out[m[3]] = m[4]
  return out
}

/**
 * The FAQ question/answer key pairs, read from the markup in document order.
 *
 * Hard-coding the twelve keys would mean a seventh FAQ silently missing from the
 * schema; scanning means the two can only ever agree.
 */
function faqKeys(baseHtml) {
  const section = /<section[^>]*id="faq"[\s\S]*?<\/section>/i.exec(baseHtml)
  if (!section) return []
  const pairs = []
  for (const item of section[0].split(/(?=class="faq__item)/).slice(1)) {
    const keys = [...item.matchAll(/data-i18n="([^"]+)"/g)].map((k) => k[1])
    if (keys.length >= 2) pairs.push([keys[0], keys[1]])
  }
  return pairs
}

/**
 * The hero <h1>'s i18n key, read from the markup.
 *
 * The slogan below has to be the headline the page actually shows, in the
 * page's own language — so it is looked up rather than hard-coded. Reading the
 * key out of the markup also survives the key being renamed: it is still named
 * `lost-weight-keep-muscle` from a tagline the site dropped in #89, and a
 * literal here would silently return '' the day someone fixes that.
 */
function heroKey(baseHtml) {
  const m = /<h1[^>]*\sdata-i18n="([^"]+)"/i.exec(baseHtml)
  return m ? m[1] : null
}

/**
 * Build the whole head block for one locale.
 *
 * `title`/`description` are passed in already resolved because translateHead has
 * them at hand — re-deriving them here would duplicate the fallback rules.
 */
export function renderSeoHead({ locale, dict, baseHtml, title, description, url, localeMeta }) {
  const strings = baseStrings(baseHtml)
  const t = (key) => plain(dict[key] ?? strings[key] ?? '')

  const hk = heroKey(baseHtml)
  const slogan = hk ? t(hk) : ''

  const faq = faqKeys(baseHtml)
    .map(([q, a]) => ({ q: t(q), a: t(a) }))
    .filter((x) => x.q && x.a)

  const og = [
    ['og:title', title],
    ['og:description', description],
    ['og:url', url],
    ['og:locale', OG_LOCALE[locale] ?? 'en_US'],
    ['og:image:width', OG_IMAGE_W],
    ['og:image:height', OG_IMAGE_H],
    ['og:image:alt', title],
  ]
    .map(([p, c]) => `    <meta property="${p}" content="${attr(c)}" />`)
    .join('\n')

  const twitter = [
    ['twitter:title', title],
    ['twitter:description', description],
    ['twitter:image', OG_IMAGE],
  ]
    .map(([n, c]) => `    <meta name="${n}" content="${attr(c)}" />`)
    .join('\n')

  const lang = localeMeta.htmlLang

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Havit Inc.',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon-512.png`, width: 512, height: 512 },
      sameAs: [APP_STORE, PLAY_STORE, BLOG],
      // The hero headline, in this locale's language. Korean deliberately says
      // something else (it leads with the Juvis Diet provenance), so this is
      // read from the page rather than translated from the English line.
      ...(slogan ? { slogan } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'HAVIT',
      url: SITE,
      inLanguage: lang,
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: lang,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#app` },
    },
    {
      // Two listings, one product — MobileApplication with both operating
      // systems keeps it a single entity rather than two competing ones.
      '@type': 'MobileApplication',
      '@id': `${SITE}/#app`,
      name: 'HAVIT',
      description,
      url: APP,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'iOS, Android',
      inLanguage: lang,
      publisher: { '@id': `${SITE}/#organization` },
      installUrl: [APP_STORE, PLAY_STORE],
      // Free to download with in-app purchases, exactly as the page states.
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ]

  // Omitted deliberately: aggregateRating. The 4.8 on the page is our own
  // figure, and self-serving ratings are a structured-data violation unless
  // they carry a real review source. Add it only alongside store review counts.

  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: lang,
      mainEntity: faq.map((x) => ({
        '@type': 'Question',
        name: x.q,
        acceptedAnswer: { '@type': 'Answer', text: x.a },
      })),
    })
  }

  const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    // A literal </script> inside JSON would close the tag early.
    .replace(/</g, '\\u003c')

  return [
    og,
    twitter,
    `    <script type="application/ld+json">${jsonld}</script>`,
  ].join('\n')
}
