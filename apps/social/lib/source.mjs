// 블로그 아티클 JSON → SNS 생성용 소스 묶음. 검증된 글(config/sources.json)만 연다.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.resolve(ROOT, '../blog/data/articles');
// SNS 언어 코드 = 블로그 라우트 코드. 블로그 데이터 키는 zh-CN / zh-TW / pt-BR 로 다르다.
const DATA_LANG = { ko: 'ko', ja: 'ja', en: 'en', zh: 'zh-CN', 'zh-tw': 'zh-TW', es: 'es', 'pt-br': 'pt-BR', id: 'id', de: 'de', fr: 'fr' };

export function hasLang(slug, lang) {
  if (isSituation(slug)) return Boolean(situation(slug).langs[lang === 'ko' ? 'ko' : 'en']?.title);
  if (isQuiz(slug)) return Boolean(quiz(slug).langs[lang]);
  if (isAppArticle(slug)) return Boolean(appArticle(slug).langs[lang]?.title);
  return Boolean(readJson(path.join(ARTICLES, `${slug}.json`)).langs[DATA_LANG[lang]]);
}

export const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const config = (name) => readJson(path.join(ROOT, 'config', `${name}.json`));

// 앱 퀴즈 라이브러리(config/quizzes.json, scripts/export_quizzes.sh) — slug 가 quiz- 로 시작한다. 원문 그대로 쓴다.
export const isQuiz = (slug) => slug.startsWith('quiz-');
let QUIZZES = null;
const quiz = (id) => {
  QUIZZES ||= new Map(config('quizzes').quizzes.map((q) => [q.id, q]));
  const q = QUIZZES.get(id);
  if (!q) throw new Error(`퀴즈 라이브러리에 없다: ${id}`);
  return q;
};
export const quizSlugs = () => config('quizzes').quizzes.map((q) => q.id);

// 퀴즈의 원본 앱 아티클(config/app_articles.json, scripts/export_app_articles.sh) — slug 가 art- 로 시작. 퀴즈와 같은 주제의 콘텐츠 소스.
export const isAppArticle = (slug) => /^art-\d+$/.test(slug);
let APP_ARTICLES = null;
const appArticle = (id) => {
  APP_ARTICLES ||= new Map(config('app_articles').articles.map((a) => [a.id, a]));
  const a = APP_ARTICLES.get(id);
  if (!a) throw new Error(`앱 아티클에 없다: ${id}`);
  return a;
};
function loadAppArticle(slug, lang) {
  const L = appArticle(slug).langs[lang];
  if (!L?.title) throw new Error(`${slug} 에 ${lang} 판이 없다`);
  return {
    slug, lang, category: appArticle(slug).category, kind: 'app_article',
    title: L.title, summary: L.summary, science: L.science,
    steps: (L.action?.items || []).map((i) => `${i.title}: ${i.description}`),
    mission: L.mission, reference: L.reference,
    key_stats: [], faq: [], h2: [],
    url: 'https://app.aihavit.com/', // 블로그 글 없음 → 앱 다운로드(기기 OS 에 맞는 스토어로 보냄)
    _text: JSON.stringify(L),
  };
}

// 상황별 시리즈(config/situations.json) — 「하비의 상황별 생존 가이드」(sit-) · 「AI 잔소리가 필요할 때」(nag-).
// 원문은 전문가 패널 노하우(ko·en 두 판). ko 외 언어는 en 판을 원문으로 그 언어 원어민처럼 쓴다(숫자는 두 판이 같다).
export const isSituation = (slug) => /^(sit|nag)-/.test(slug);
// 자동 보충(series_refill.mjs)이 기획한 주제·편성은 레포가 아니라 큐(S3 social-queue/series/)에 쌓인다 — 설정과 합쳐 읽는다.
const AUTO = path.join(ROOT, 'queue', 'series');
const autoJson = (name) => { try { return readJson(path.join(AUTO, `${name}.json`)); } catch { return null; } };
export const situationItems = () => [...config('situations').items, ...(autoJson('auto_situations')?.items || [])];
export const seriesCalendar = () => {
  const c = config('series_calendar');
  return { ...c, entries: [...c.entries, ...(autoJson('auto_calendar')?.entries || [])] };
};
let SITUATIONS = null;
export const situation = (id) => {
  SITUATIONS ||= new Map(situationItems().map((x) => [x.id, x]));
  const s = SITUATIONS.get(id);
  if (!s) throw new Error(`상황 시리즈에 없다: ${id}`);
  return s;
};
function loadSituation(slug, lang) {
  const s = situation(slug);
  const L = s.langs[lang === 'ko' ? 'ko' : 'en'];
  if (!L?.title) throw new Error(`${slug} 에 원문이 없다`);
  const { title, tips, tip, ...rest } = L;
  return {
    slug, lang, category: s.series, kind: s.series === 'nag' ? 'app_nag' : 'app_situation',
    title, ...rest,
    steps: tips || (tip ? [tip] : []),
    cta: s.cta,
    ...(s.series === 'nag' ? { spicy_allowed: !s.risk } : {}),
    key_stats: [], faq: [], h2: [],
    url: 'https://app.aihavit.com/', // 블로그 글 없음 → 앱 다운로드
    _text: JSON.stringify(s.langs),
  };
}

// 약물 주제(GLP-1·오젬픽·마운자로 등)는 SNS 에 내지 않는다(대표 결정 2026-10-24: 승인 부담 0 + 의약품 광고 규제).
// 블로그에는 남는다. 판정은 ko·en 판의 제목·요약(퀴즈는 전문).
const DRUG_TOPIC = /glp-?1|semaglutide|tirzepatide|liraglutide|orforglipron|retatrutide|ozempic|wegovy|mounjaro|zepbound|saxenda|rybelsus|metformin|levothyroxine|rapamycin|세마글루타이드|터제파타이드|티르제파타이드|오젬픽|위고비|마운자로|젭바운드|삭센다|메트포르민|레보티록신|주사제|비만 ?주사|처방약/i;
export function isDrugTopic(slug) {
  if (isSituation(slug)) return DRUG_TOPIC.test(JSON.stringify(situation(slug).langs));
  if (isQuiz(slug)) return ['ko', 'en'].some((l) => DRUG_TOPIC.test(Object.values(quiz(slug).langs[l] || {}).join(' ')));
  if (isAppArticle(slug)) return ['ko', 'en'].some((l) => DRUG_TOPIC.test(`${appArticle(slug).langs[l]?.title} ${JSON.stringify(appArticle(slug).langs[l]?.summary)}`));
  const L = readJson(path.join(ARTICLES, `${slug}.json`)).langs;
  return ['ko', 'en'].some((l) => L[l] && DRUG_TOPIC.test(`${L[l].title} ${L[l].tldr || ''}`));
}

/** 발행물이 나온 원문 위치(사람 검토·Slack 링크용). */
export const originLabel = (d) =>
  isSituation(d.slug) ? `상황 시리즈 ${d.slug}(config/situations.json)` : isQuiz(d.slug) ? `앱 퀴즈 ${d.slug}` : isAppArticle(d.slug) ? `앱 아티클 ${d.slug}` : `https://www.aihavit.com/blog/${d.lang}/${d.slug}`;

function loadQuiz(slug, lang) {
  const q = quiz(slug);
  const L = q.langs[lang];
  if (!L) throw new Error(`${slug} 에 ${lang} 판이 없다`);
  return {
    slug,
    lang,
    category: 'quiz',
    kind: 'app_quiz',
    title: L.title,
    quiz_statement: L.quiz_text,
    answer: q.answer, // O = 맞다, X = 틀리다
    explanation: L.explanation,
    reference: L.reference,
    key_stats: [],
    faq: [],
    h2: [],
    steps: [],
    url: 'https://app.aihavit.com/', // 블로그 글 없음 → 앱 다운로드(기기 OS 에 맞는 스토어로 보냄)
    _text: [L.title, L.quiz_text, L.explanation, L.reference].join('\n'),
  };
}

export function verifiedSlugs() {
  return config('sources').sources.map((s) => s.slug);
}

export function loadSource(slug, lang) {
  if (isSituation(slug)) return loadSituation(slug, lang);
  if (isQuiz(slug)) return loadQuiz(slug, lang);
  if (isAppArticle(slug)) return loadAppArticle(slug, lang);
  if (!verifiedSlugs().includes(slug)) {
    throw new Error(`검증되지 않은 글은 SNS 소스로 쓸 수 없다: ${slug} (config/sources.json)`);
  }
  const article = readJson(path.join(ARTICLES, `${slug}.json`));
  const L = article.langs[DATA_LANG[lang]];
  if (!L) throw new Error(`${slug} 에 ${lang} 판이 없다`);
  const body = L.body_md || '';
  return {
    slug,
    lang,
    category: article.category,
    title: L.title,
    tldr: L.tldr,
    key_stats: (L.key_stats || []).filter((k) => k.source),
    faq: (L.faq || []).slice(0, 4),
    h2: body.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3)),
    steps: body.split('\n').filter((l) => /^\s*(\d+\.|[-*])\s/.test(l)).slice(0, 12).map((l) => l.trim()),
    url: `https://www.aihavit.com/blog/${config('channels').langs[lang].route}/${slug}`,
    // 린트가 숫자 허용 목록을 만들 때 쓰는 원문 전체(같은 언어판).
    _text: [L.title, L.tldr, body, JSON.stringify(L.key_stats || []), JSON.stringify(L.faq || [])].join('\n'),
  };
}

export function withUtm(url, { channel, lang, format }) {
  const u = new URL(url);
  u.searchParams.set('utm_source', channel);
  u.searchParams.set('utm_medium', 'social');
  u.searchParams.set('utm_campaign', u.pathname.split('/').pop() || 'havit_app'); // 앱 링크는 경로가 비어 있다
  if (u.hostname === 'app.aihavit.com') {
    // 앱 설치 귀속(AppsFlyer) — 블로그 CTA(c=homepage, af_channel=blog)와 같은 방식
    u.searchParams.set('c', 'sns');
    u.searchParams.set('af_channel', channel);
    u.searchParams.set('af_adset', `${lang}-${format}`);
  }
  u.searchParams.set('utm_content', `${lang}-${format}`);
  return u.toString();
}
