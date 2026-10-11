/**
 * Locale SSOT for the marketing site.
 *
 * This table used to live in plugins/i18n-html.js. It moved here because two
 * very different consumers need it and only one of them can run Node:
 *
 *   - plugins/i18n-html.js / plugins/sitemap.js — build time, Node, reads files
 *   - middleware.js — Vercel Routing Middleware, edge runtime, no `node:fs`
 *
 * i18n-html.js reads footer-articles.json with readFileSync at module scope, so
 * importing it from the middleware would drag `node:fs` into the edge bundle.
 * Keeping the table in a dependency-free module lets both sides import the same
 * list instead of the middleware carrying a second copy that silently drifts.
 *
 * SSOT above this file is the app's own locale set
 * (havit-wellness-app/app/assets/localization, 35 ARB files). en_US is the root
 * page and en_GB folds into it, leaving the 33 localized paths below.
 *
 * Adding a locale: add the entry here AND src/i18n/<locale>.json in the same
 * change. The build only emits a locale page once its JSON exists
 * (translatedLocales() in i18n-html.js), but the middleware routes on this
 * table alone — an entry without a translation file means it would 302 a
 * visitor to a page that was never emitted.
 */

export const DEFAULT_LOCALE = 'en'

/** locale → { htmlLang, hreflang, native, dir } */
export const LOCALE_META = {
  en: { htmlLang: 'en', hreflang: 'en', native: 'English' },
  ar: { htmlLang: 'ar', hreflang: 'ar', native: 'العربية', dir: 'rtl' },
  ca: { htmlLang: 'ca', hreflang: 'ca', native: 'Català' },
  cs: { htmlLang: 'cs', hreflang: 'cs', native: 'Čeština' },
  da: { htmlLang: 'da', hreflang: 'da', native: 'Dansk' },
  de: { htmlLang: 'de', hreflang: 'de', native: 'Deutsch' },
  el: { htmlLang: 'el', hreflang: 'el', native: 'Ελληνικά' },
  es: { htmlLang: 'es', hreflang: 'es', native: 'Español' },
  fi: { htmlLang: 'fi', hreflang: 'fi', native: 'Suomi' },
  fr: { htmlLang: 'fr', hreflang: 'fr', native: 'Français' },
  he: { htmlLang: 'he', hreflang: 'he', native: 'עברית', dir: 'rtl' },
  hi: { htmlLang: 'hi', hreflang: 'hi', native: 'हिन्दी' },
  hr: { htmlLang: 'hr', hreflang: 'hr', native: 'Hrvatski' },
  hu: { htmlLang: 'hu', hreflang: 'hu', native: 'Magyar' },
  id: { htmlLang: 'id', hreflang: 'id', native: 'Bahasa Indonesia' },
  it: { htmlLang: 'it', hreflang: 'it', native: 'Italiano' },
  ja: { htmlLang: 'ja', hreflang: 'ja', native: '日本語' },
  ko: { htmlLang: 'ko', hreflang: 'ko', native: '한국어' },
  ms: { htmlLang: 'ms', hreflang: 'ms', native: 'Bahasa Melayu' },
  nb: { htmlLang: 'nb', hreflang: 'nb', native: 'Norsk bokmål' },
  nl: { htmlLang: 'nl', hreflang: 'nl', native: 'Nederlands' },
  pl: { htmlLang: 'pl', hreflang: 'pl', native: 'Polski' },
  pt: { htmlLang: 'pt', hreflang: 'pt', native: 'Português' },
  ro: { htmlLang: 'ro', hreflang: 'ro', native: 'Română' },
  ru: { htmlLang: 'ru', hreflang: 'ru', native: 'Русский' },
  sk: { htmlLang: 'sk', hreflang: 'sk', native: 'Slovenčina' },
  sv: { htmlLang: 'sv', hreflang: 'sv', native: 'Svenska' },
  th: { htmlLang: 'th', hreflang: 'th', native: 'ไทย' },
  tr: { htmlLang: 'tr', hreflang: 'tr', native: 'Türkçe' },
  uk: { htmlLang: 'uk', hreflang: 'uk', native: 'Українська' },
  uz: { htmlLang: 'uz', hreflang: 'uz', native: 'Oʻzbekcha' },
  vi: { htmlLang: 'vi', hreflang: 'vi', native: 'Tiếng Việt' },
  'zh-cn': { htmlLang: 'zh-Hans-CN', hreflang: 'zh-Hans', native: '简体中文' },
  'zh-tw': { htmlLang: 'zh-Hant-TW', hreflang: 'zh-Hant', native: '繁體中文' },
}

export const LOCALES = Object.keys(LOCALE_META)

/**
 * 제휴 모집 페이지(/affiliate/)가 번역된 로케일.
 *
 * 홈은 34개 전부지만 이 페이지는 집합이 다르다. 번역이 없는 로케일에 페이지를
 * 찍으면 그 언어 내비게이션에 영어 본문인 문서가 나가고, hreflang 이 "그 언어판"
 * 이라고 거짓을 선언한다 — 페이지가 없는 것보다 나쁘다.
 *
 * **미들웨어와 빌드가 같은 목록을 봐야 한다.** 여기만 두는 이유다. 미들웨어는
 * 엣지 런타임이라 src/i18n/*.json 을 읽을 수 없어서 사전에서 추론할 수 없고,
 * 목록이 갈라지면 `/affiliate/` 가 존재하지 않는 `/ru/affiliate/` 로 302 를
 * 쏘면서 404 가 된다. 실제로 그렇게 깨졌었다.
 *
 * scripts/check-affiliate-locales.mjs 가 이 목록과 실제 번역을 대조한다.
 * 언어를 추가할 때는 src/i18n/<locale>.json 에 aff-* 키를 넣고 여기 한 줄 추가.
 *
 * 현재 집합은 블로그가 서빙하는 10개 언어와 같다.
 */
export const AFFILIATE_LOCALES = [
  'en', 'ko', 'ja', 'zh-cn', 'zh-tw', 'es', 'pt', 'id', 'de', 'fr',
]
