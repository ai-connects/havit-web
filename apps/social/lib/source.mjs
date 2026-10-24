// 블로그 아티클 JSON → SNS 생성용 소스 묶음. 검증된 글(config/sources.json)만 연다.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.resolve(ROOT, '../blog/data/articles');
// SNS 언어 코드 = 블로그 라우트 코드. 블로그 데이터 키는 zh-CN / zh-TW / pt-BR 로 다르다.
const DATA_LANG = { ko: 'ko', ja: 'ja', en: 'en', zh: 'zh-CN', 'zh-tw': 'zh-TW', es: 'es', 'pt-br': 'pt-BR', id: 'id', de: 'de', fr: 'fr' };

export function hasLang(slug, lang) {
  if (isQuiz(slug)) return Boolean(quiz(slug).langs[lang]);
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

/** 발행물이 나온 원문 위치(사람 검토·Slack 링크용). */
export const originLabel = (d) =>
  isQuiz(d.slug) ? `앱 퀴즈 ${d.slug}` : `https://www.aihavit.com/blog/${d.lang}/${d.slug}`;

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
    url: `https://www.aihavit.com/blog/${config('channels').langs[lang].route}`,
    _text: [L.title, L.quiz_text, L.explanation, L.reference].join('\n'),
  };
}

export function verifiedSlugs() {
  return config('sources').sources.map((s) => s.slug);
}

export function loadSource(slug, lang) {
  if (isQuiz(slug)) return loadQuiz(slug, lang);
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
  u.searchParams.set('utm_campaign', u.pathname.split('/').pop());
  u.searchParams.set('utm_content', `${lang}-${format}`);
  return u.toString();
}
