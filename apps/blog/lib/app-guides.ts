/**
 * 「앱을 찾는 검색」을 받는 글 — 앱 추천·대안·비교.
 *
 * 왜: 이 글들은 "칼로리 계산 앱 추천", "<경쟁앱> alternative" 처럼 설치 직전의
 * 검색을 받는데, 관련글 알고리즘(주제 유사도)으로는 서로끼리만 묶이고 블로그
 * 메인·사이트 전역에서 오는 링크가 거의 없었다. 블로그 메인의 고정 섹션과
 * 사이트 전역 푸터(lib/footer-links.ts 의 appGuides)가 여기 목록을 쓴다.
 *
 * 규칙: 그 언어 원고가 없는 글은 그 언어에서 링크하지 않는다. 번역이 없으면
 * 블로그가 영어 본문을 폴백으로 띄우며 noindex + canonical→en 을 달기 때문에,
 * 그 URL 로 보내는 링크는 색인 신호가 되지 못한다(관련글과 같은 규칙).
 *
 * 글 추가: 슬러그를 배열에 넣으면 끝. 없는 슬러그·통합된 슬러그는 렌더 시 건너뛴다.
 */

import { getArticleBySlug, resolveContent, type ArticleV2LangContent } from './articles-v2';

/** 「<분야> 앱 추천」 — 블로그 메인에 전부 노출. */
export const APP_PICK_SLUGS: string[] = [
  'best-calorie-counter-apps',
  'best-diet-apps',
  'best-glp-1-tracker-apps',
  'best-food-tracker-for-glp-1',
  'best-food-logging-apps',
  'best-ai-health-coach-apps',
  'best-body-composition-apps',
  'best-habit-tracker-weight-loss',
];

/** 「<경쟁앱> 대안」·앱 비교 — 많이 찾는 앱 순. 허브 목록이 없어 섹션 안에 전부 노출. */
export const APP_ALTERNATIVE_SLUGS: string[] = [
  'myfitnesspal-alternative-glp-1',
  'noom-glp-1-alternative',
  'weightwatchers-glp-1-alternative',
  'lose-it-alternative',
  'cronometer-alternative-glp-1',
  'macrofactor-alternative',
  'cal-ai-alternative-glp-1',
  'shotsy-alternative',
  'glapp-alternative',
  'phaze-alternative',
  'pep-alternative',
  'meagain-alternative',
  'pillyze-alternative',
  'glp-1-tracker-app-alternatives',
  'havit-vs-myfitnesspal-noom-simple-2026',
];

/** 표시 폭 — CJK 글자는 라틴 글자의 약 2배. Footer.tsx shortLabel 과 같은 기준. */
function displayWidth(t: string): number {
  return [...t].reduce(
    (n, ch) => n + (/[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠]/.test(ch) ? 2 : 1),
    0,
  );
}

const LABEL_MAX = 56;
/** 제목의 「훅: 설명」 구분자. 쉼표는 약한 구분자라 길 때만 쓴다. */
const STRONG_SEPARATORS = /\s*(?:[:：｜|—–?？]|\s-\s)\s*/;
const WEAK_SEPARATORS = /\s*[,，、]\s*/;

/**
 * 링크용 짧은 앵커. SERP 용 short_title(없으면 title)에서 연도를 떼고 첫 구분자
 * 앞(훅)만 남긴다 — "2026 칼로리 계산 앱 추천 — 앱별로…" → "칼로리 계산 앱 추천".
 * 여러 앱 비교 글(「HAVIT vs A vs B」)은 그 조각을 쓴다
 * ("BMI 시대의 종말: HAVIT vs …" 의 훅에는 앱 이름이 없다).
 * 연도를 빼는 이유: 앵커는 사이트 전역에 박혀 해가 바뀌어도 남는다(슬러그에서
 * 연도를 뺀 #111 과 같은 이유).
 *
 * apps/web/scripts/build-footer-articles.mjs 에 같은 규칙이 복제돼 있다 — 고치면 같이 고칠 것.
 */
export function appGuideLabel(content: Pick<ArticleV2LangContent, 'title' | 'short_title'>): string {
  const raw = content.short_title || content.title;
  const t = raw
    .replace(/[（(]\s*2026\s*[)）]/g, '')
    .replace(/\s*(?:\b(?:in|en|em|di|im)\s+)?2026\s*(?:年版|年)?\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const parts = t.split(STRONG_SEPARATORS).map((x) => x.trim()).filter(Boolean);
  // 여러 앱을 나란히 비교하는 글(「HAVIT vs A vs B」)만 비교 조각을 쓴다. 「<앱> 대안」 글의
  // 「HAVIT vs <앱>」 조각은 쓰지 않는다 — 사람들이 검색하는 말은 「<앱> 대안」 쪽이다.
  const multiVs = parts.find((x) => (x.match(/\bvs\b/gi) ?? []).length >= 2);
  let label = multiVs ?? parts[0] ?? t;
  if (displayWidth(label) > LABEL_MAX) {
    const head = label.split(WEAK_SEPARATORS)[0].trim();
    if (head && displayWidth(head) <= LABEL_MAX) label = head;
  }
  if (displayWidth(label) <= LABEL_MAX) return label;
  let out = '';
  for (const ch of label) {
    if (displayWidth(out + ch) > LABEL_MAX - 1) break;
    out += ch;
  }
  return `${out.trimEnd()}…`;
}

export interface AppGuideLink {
  slug: string;
  label: string;
}

/** 이 언어에 원고가 있는 글만, 짧은 앵커와 함께. 폴백·없는 글은 빠진다. */
export function appGuideLinks(slugs: string[], shortLang: string): AppGuideLink[] {
  const out: AppGuideLink[] = [];
  for (const slug of slugs) {
    const article = getArticleBySlug(slug);
    if (!article) continue;
    const r = resolveContent(article, shortLang);
    if (!r || r.fallback) continue;
    out.push({ slug, label: appGuideLabel(r.content) });
  }
  return out;
}
