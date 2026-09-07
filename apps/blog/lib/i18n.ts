/**
 * PRD §6.4 SUPPORTED_LANGS 35개 — 코드증거 1:1
 * 출처: havit_django/app/usecase/util/language_util.py:12-48
 */

export const SUPPORTED_LANGS = [
  'ko_kr', 'en_us', 'en_gb', 'ja_jp', 'zh_cn', 'zh_tw', 'th_th', 'vi_vn', 'id_id', 'ru_ru',
  'fr_fr', 'es_es', 'pt_pt', 'ar_ae', 'el_gr', 'nl_nl', 'de_de', 'tr_tr', 'it_it', 'sv_se',
  'pl_pl', 'nb_no', 'da_dk', 'ro_ro', 'ms_my', 'sk_sk', 'uk_ua', 'cs_cz', 'ca_es', 'hr_hr',
  'fi_fi', 'hu_hu', 'he_il', 'hi_in', 'uz_cyrl_uz',
] as const;

export type LangKey = (typeof SUPPORTED_LANGS)[number];

/** PRD §6.9 fallback policy (INV-005): en_us */
export const FALLBACK_LANG: LangKey = 'en_us';

/**
 * SEO SSOT — 색인/크롤 대상 route short-lang.
 * 이 배열 하나가 색인 게이팅(PRIORITY_INDEX_LANGS)·sitemap·hreflang·robots·
 * Header 언어 스위처를 모두 제어한다. (client·server 공용 — i18n.ts엔 fs 없음)
 *
 * 2026-09: 서빙 중인 10개 언어를 전부 되돌려 켰다.
 *
 * 앞서 en/ja/ko/zh-tw 4개만 남기고 나머지 6개를 410 으로 끊었던 이유는 크롤
 * 예산을 타겟에 몰아주자는 것이었는데, 두 달간 효과가 0 이었다 — GSC
 * "크롤링됨 — 미색인" 이 4,618 에서 4,740 으로 오히려 늘었다. 색인 슬롯을
 * 묶고 있던 건 URL 공급량이 아니라 링크 권위였다(외부 링크 265개가 전부
 * www 앞으로 들어오고 블로그로 오는 건 0). 그래서 언어를 조이는 축은 버리고,
 * 같은 릴리스에서 블로그를 www.aihavit.com/blog 로 옮겨 그 권위를 잇는다.
 *
 * ⚠️ 언어 재오픈과 서브디렉터리 이전은 반드시 한 릴리스로 나가야 한다.
 *    따로 내보내면 폐기 언어 URL 이 410 → 200 → 301 로 세 번 바뀌어
 *    Google 이 상태를 다시 배우는 데만 몇 주가 더 든다.
 */
export const INDEXABLE_ROUTE_LANGS = [
  'ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr',
] as const;

/** 블로그가 라우팅하는 전체 route short-lang (app/[lang] 세그먼트). */
export const SERVED_ROUTE_LANGS = [
  'ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr',
] as const;

/** short → full mapping (e.g. ko → ko_kr) */
const SHORT_TO_FULL: Record<string, LangKey> = {
  ko: 'ko_kr', en: 'en_us', ja: 'ja_jp', zh: 'zh_cn', th: 'th_th', vi: 'vi_vn',
  id: 'id_id', ru: 'ru_ru', fr: 'fr_fr', es: 'es_es', pt: 'pt_pt', ar: 'ar_ae',
  el: 'el_gr', nl: 'nl_nl', de: 'de_de', tr: 'tr_tr', it: 'it_it', sv: 'sv_se',
  pl: 'pl_pl', nb: 'nb_no', no: 'nb_no', da: 'da_dk', ro: 'ro_ro', ms: 'ms_my',
  sk: 'sk_sk', uk: 'uk_ua', cs: 'cs_cz', ca: 'ca_es', hr: 'hr_hr', fi: 'fi_fi',
  hu: 'hu_hu', he: 'he_il', hi: 'hi_in', uz: 'uz_cyrl_uz',
  // Hyphenated route segments were missing, so toFullLang('zh-tw') fell through
  // to FALLBACK_LANG (en_us) and every component that derives its language from
  // the LangKey rendered zh-tw pages in English — including a sitewide footer
  // whose article links then pointed at /en/. Round-trip must hold:
  // toShortLang(toFullLang(x)) === x for every served route lang.
  'zh-tw': 'zh_tw', 'zh-cn': 'zh_cn', 'pt-br': 'pt_pt', 'en-gb': 'en_gb',
};

const FULL_TO_SHORT: Record<LangKey, string> = {
  ko_kr: 'ko', en_us: 'en', en_gb: 'en-gb', ja_jp: 'ja', zh_cn: 'zh', zh_tw: 'zh-tw',
  th_th: 'th', vi_vn: 'vi', id_id: 'id', ru_ru: 'ru', fr_fr: 'fr', es_es: 'es',
  pt_pt: 'pt-br', ar_ae: 'ar', el_gr: 'el', nl_nl: 'nl', de_de: 'de', tr_tr: 'tr',
  it_it: 'it', sv_se: 'sv', pl_pl: 'pl', nb_no: 'nb', da_dk: 'da', ro_ro: 'ro',
  ms_my: 'ms', sk_sk: 'sk', uk_ua: 'uk', cs_cz: 'cs', ca_es: 'ca', hr_hr: 'hr',
  fi_fi: 'fi', hu_hu: 'hu', he_il: 'he', hi_in: 'hi', uz_cyrl_uz: 'uz',
};

export function toFullLang(short: string): LangKey {
  return SHORT_TO_FULL[short.toLowerCase()] ?? FALLBACK_LANG;
}

export function toShortLang(full: LangKey): string {
  return FULL_TO_SHORT[full] ?? 'en';
}

/** Schema.org / OG locale BCP47 */
export function toBcp47(full: LangKey): string {
  const [lang, region] = full.split('_');
  if (full === 'uz_cyrl_uz') return 'uz-Cyrl-UZ';
  // 블로그의 포르투갈어 원고는 브라질(data key `pt-BR`)이고 라우트도 `pt-br` 인데,
  // LangKey 만 앱 SSOT 를 따라 `pt_pt` 다. 파생값을 유럽 포르투갈어로 내보내면
  // JSON-LD inLanguage 가 실제 본문과 어긋난다.
  if (full === 'pt_pt') return 'pt-BR';
  return `${lang}-${region.toUpperCase()}`;
}

/** RTL 언어 (PRD §16.5 i18n 폰트) */
export const RTL_LANGS: LangKey[] = ['ar_ae', 'he_il'];
export function isRtl(lang: LangKey): boolean {
  return RTL_LANGS.includes(lang);
}

/** 언어 native 이름 (LanguageSelector S-008) */
export const LANG_NATIVE: Record<LangKey, string> = {
  ko_kr: '한국어', en_us: 'English (US)', en_gb: 'English (UK)', ja_jp: '日本語',
  zh_cn: '中文 (简)', zh_tw: '中文 (繁)', th_th: 'ไทย', vi_vn: 'Tiếng Việt',
  id_id: 'Bahasa Indonesia', ru_ru: 'Русский', fr_fr: 'Français', es_es: 'Español',
  pt_pt: 'Português', ar_ae: 'العربية', el_gr: 'Ελληνικά', nl_nl: 'Nederlands',
  de_de: 'Deutsch', tr_tr: 'Türkçe', it_it: 'Italiano', sv_se: 'Svenska',
  pl_pl: 'Polski', nb_no: 'Norsk', da_dk: 'Dansk', ro_ro: 'Română',
  ms_my: 'Bahasa Melayu', sk_sk: 'Slovenčina', uk_ua: 'Українська',
  cs_cz: 'Čeština', ca_es: 'Català', hr_hr: 'Hrvatski', fi_fi: 'Suomi',
  hu_hu: 'Magyar', he_il: 'עברית', hi_in: 'हिन्दी', uz_cyrl_uz: 'Ўзбекча',
};

/** 12 카테고리 + 슬러그 (PRD §5.1.2) */
export const CATEGORIES = [
  { id: 'c01', value: 'Tracking & Insights', slug: 'tracking-and-insights' },
  { id: 'c02', value: 'Mindset & Motivation', slug: 'mindset-and-motivation' },
  { id: 'c03', value: 'Weight & Metabolism', slug: 'weight-and-metabolism' },
  { id: 'c04', value: 'Lifestyle Habits', slug: 'lifestyle-habits' },
  { id: 'c05', value: 'Personalized Strategies', slug: 'personalized-strategies' },
  { id: 'c06', value: 'Situational Tips', slug: 'situational-tips' },
  { id: 'c07', value: 'Diet & Nutrition', slug: 'diet-and-nutrition' },
  { id: 'c08', value: 'Hydration & Beverages', slug: 'hydration-and-beverages' },
  { id: 'c09', value: 'Health & Conditions', slug: 'health-and-conditions' },
  { id: 'c10', value: 'Medication Guide', slug: 'medication-guide' },
  { id: 'c11', value: 'Sleep & Recovery', slug: 'sleep-and-recovery' },
  { id: 'c12', value: 'Exercise & Activity', slug: 'exercise-and-activity' },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]['value'];
export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function categoryByValue(value: string) {
  return CATEGORIES.find((c) => c.value === value);
}

/** UI 문자열 (간이 i18n — 데모용 3개 언어만, 나머지는 en fallback) */
const UI_STRINGS: Record<string, Record<string, string>> = {
  ko_kr: {
    blog: '블로그',
    home: '홈',
    category: '카테고리',
    search: '검색',
    searchPlaceholder: '아티클 검색...',
    relatedArticles: '관련 아티클',
    installCta: '앱에서 더 보기',
    installCtaSub: '나만의 웰니스 데이터로 더 깊이 있게',
    mission: '오늘의 미션',
    action: '실천 가이드',
    science: '과학적 근거',
    deepDive: '심층 분석',
    reference: '참고문헌',
    darkMode: '다크모드',
    language: '언어',
    next: '다음',
    prev: '이전',
    page: '페이지',
    of: '/',
    fallbackBanner: '이 콘텐츠는 영어로만 제공됩니다.',
    cookieTitle: '쿠키 사용 안내',
    cookieDesc: 'HAVIT은 분석 목적으로 쿠키를 사용합니다.',
    accept: '동의',
    decline: '거부',
    bookmark: '북마크',
    like: '좋아요',
    disabled: '(앱에서 사용)',
    readMore: '더 읽기',
    minRead: '분 소요',
    publishedOn: '게시일',
    backToList: '목록으로',
    noResults: '검색 결과가 없습니다.',
    showingResults: '검색 결과',
    items: '건',
  },
  en_us: {
    blog: 'Blog',
    home: 'Home',
    category: 'Category',
    search: 'Search',
    searchPlaceholder: 'Search articles...',
    relatedArticles: 'Related Articles',
    installCta: 'Continue in the App',
    installCtaSub: 'Personalized wellness with your own data',
    mission: "Today's Mission",
    action: 'Action Guide',
    science: 'The Science',
    deepDive: 'Deep Dive',
    reference: 'References',
    darkMode: 'Dark Mode',
    language: 'Language',
    next: 'Next',
    prev: 'Previous',
    page: 'Page',
    of: 'of',
    fallbackBanner: 'This content is available in English only.',
    cookieTitle: 'Cookie Notice',
    cookieDesc: 'HAVIT uses cookies for analytics purposes.',
    accept: 'Accept',
    decline: 'Decline',
    bookmark: 'Bookmark',
    like: 'Like',
    disabled: '(In-app only)',
    readMore: 'Read more',
    minRead: 'min read',
    publishedOn: 'Published on',
    backToList: 'Back to list',
    noResults: 'No results found.',
    showingResults: 'Showing',
    items: 'items',
  },
  ja_jp: {
    blog: 'ブログ',
    home: 'ホーム',
    category: 'カテゴリー',
    search: '検索',
    searchPlaceholder: '記事を検索...',
    relatedArticles: '関連記事',
    installCta: 'アプリで続きを読む',
    installCtaSub: 'あなたのデータでパーソナライズ',
    mission: '今日のミッション',
    action: '実践ガイド',
    science: '科学的根拠',
    deepDive: '深掘り',
    reference: '参考文献',
    darkMode: 'ダークモード',
    language: '言語',
    next: '次',
    prev: '前',
    page: 'ページ',
    of: '/',
    fallbackBanner: 'このコンテンツは英語のみで提供されます。',
    cookieTitle: 'クッキー通知',
    cookieDesc: 'HAVITは分析目的でクッキーを使用します。',
    accept: '同意',
    decline: '拒否',
    bookmark: 'ブックマーク',
    like: 'いいね',
    disabled: '(アプリのみ)',
    readMore: '続きを読む',
    minRead: '分',
    publishedOn: '公開日',
    backToList: '一覧に戻る',
    noResults: '結果が見つかりません。',
    showingResults: '検索結果',
    items: '件',
  },
};

export function t(lang: LangKey, key: string): string {
  return UI_STRINGS[lang]?.[key] ?? UI_STRINGS.en_us[key] ?? key;
}
