/**
 * V2 article data layer — reads data/articles/*.json (the live content pipeline output).
 * Each JSON file is one article with 6-lang content + SEO/GEO fields.
 *
 * BLOG_AUTHORITY v1.0.0 (PRD §5.2.1 / §6.1 / §7.1 Step 1):
 *   - ArticleAuthor / ArticleReviewer interface 신규
 *   - ArticleV2.author / .reviewer 확장 (선택, default 런타임 주입)
 *   - DEFAULT_AUTHOR / DEFAULT_REVIEWER 상수 (HAVIT Editorial Team / Medical Advisory)
 *   - ALLOWED_CATEGORIES_V2 15-enum guard (E-004 — 빌드 차단)
 *   - YMYL_CATEGORIES_V2 10-set (T1 payload 분기 SSOT)
 *   - data/articles/*.json 파일 1바이트도 변경 없음 (P7 무손실, INV-006)
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { INDEXABLE_ROUTE_LANGS } from './i18n';
import mergedRedirects from './merged-redirects.json';

/**
 * 중복 통합으로 301(next.config redirects)이 걸린 슬러그.
 *
 * 이 슬러그의 JSON 은 남아 있지만 URL 은 keeper 로 영구 이동한다. loadAll() 이
 * 이들을 그대로 흘려보내면 사이트맵·RSS·목록·관련링크·정적경로가 전부 "308 로
 * 튕기는 URL" 을 정식 URL 로 선언한다 — 실측 327건이 사이트맵에 실려 있었고
 * GSC 가 "리디렉션이 포함된 페이지" 로 잡고 있었다. 크롤 예산을 왕복 요청으로
 * 태우고 사이트맵 신호를 희석한다.
 *
 * loadAll() 이 단일 소스이므로 여기서 한 번 걸러내면 전 계층이 정합해진다.
 * JSON 은 건드리지 않는다(P7 무손실) — 통합을 되돌리려면 merged-redirects.json
 * 에서 항목만 지우면 슬러그가 자동으로 되살아난다.
 */
const MERGED_AWAY = new Set<string>(
  (mergedRedirects as { from: string; to: string }[]).map((r) => r.from),
);

export interface ArticleV2LangContent {
  title: string;
  /**
   * Optional SEO-optimized short title used only for HTML <title> in Google
   * SERP. Should be ≤ ~50 chars and apply CTR best-practices (numbers,
   * brackets, power words). When absent, the full `title` is auto-truncated.
   * body H1, og:title, JSON-LD headline always use the full `title`.
   */
  short_title?: string;
  meta_description?: string;
  tldr?: string;
  body_md: string;
  key_stats?: Array<{ label: string; value: string; source?: string }>;
  comparison_table?: {
    title: string;
    headers: string[];
    rows: string[][];
    caption?: string;
  } | null;
  faq?: Array<{ question: string; answer: string }>;
  references?: Array<{ text: string; url?: string }> | string;
  last_updated?: string;
}

/** PRD §5.2.1 — 저자 메타 */
export interface ArticleAuthor {
  name: string;
  type: 'Organization' | 'Person';
  url?: string;
}

/** PRD §5.2.1 — 검수자 메타 */
export interface ArticleReviewer {
  name: string;
  credential: string;
  url?: string;
}

export interface ArticleV2 {
  article_id: string;
  slug: string;
  category: string;
  category_emoji?: string;
  type: string;
  reading_time_min?: number;
  primary_keyword_en?: string;
  primary_keyword_ko?: string;
  langs: Record<string, ArticleV2LangContent>;
  published_at?: string;
  updated_at?: string;
  /** 생성 파이프라인이 기록한 실제 생성 시각. 날짜 신호의 유일한 실측값 — articleDates() 참조. */
  generated_at?: string;
  /** JSON 에 직접 적힌 updated_at (loadAll 이 last_updated 로 채우기 전 값). */
  explicit_updated_at?: string;
  /** PRD §5.2.1 — 런타임 default 주입 (loadAll). JSON 파일에는 없음. */
  author?: ArticleAuthor;
  /** PRD §5.2.1 — 런타임 default 주입 (loadAll). JSON 파일에는 없음. */
  reviewer?: ArticleReviewer;
}

/** PRD §6.4 — DEFAULT_AUTHOR / DEFAULT_REVIEWER */
export const DEFAULT_AUTHOR: ArticleAuthor = {
  name: 'HAVIT Editorial Team',
  type: 'Organization',
};

export const DEFAULT_REVIEWER: ArticleReviewer = {
  name: 'HAVIT Medical Advisory',
  credential: 'Editorial Medical Review Board',
};

/**
 * PRD §6.1 — 15 카테고리 enum SSOT (실DB 1,086건 전수 카운트 기반).
 * E-004 빌드 차단: category가 이 set 외면 throw → 신규 카테고리 무허가 추가 방지.
 */
export const ALLOWED_CATEGORIES_V2: ReadonlySet<string> = new Set([
  'Tracking & Insights',
  'Mindset & Motivation',
  'Weight & Metabolism',
  'Lifestyle Habits',
  'Personalized Strategies',
  'Situational Tips',
  'Diet & Nutrition',
  'Hydration & Beverages',
  'Health & Conditions',
  'Medication Guide',
  'Sleep & Recovery',
  'Exercise & Activity',
  'Mental Health & Stress',
  'Gut Health & Microbiome',
  'Longevity & Healthy Aging',
]);

/**
 * PRD §6.1 / §6.4 — YMYL 10 카테고리 set.
 * JSON-LD T1 (Article + MedicalWebPage) 분기 SSOT.
 */
export const YMYL_CATEGORIES_V2: ReadonlySet<string> = new Set([
  'Weight & Metabolism',
  'Diet & Nutrition',
  'Hydration & Beverages',
  'Health & Conditions',
  'Medication Guide',
  'Sleep & Recovery',
  'Exercise & Activity',
  'Mental Health & Stress',
  'Gut Health & Microbiome',
  'Longevity & Healthy Aging',
]);

export function isYmylCategory(category: string): boolean {
  return YMYL_CATEGORIES_V2.has(category);
}

export const PRIMARY_LANGS = ['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'pt-BR', 'id', 'de', 'fr'] as const;
export type PrimaryLang = (typeof PRIMARY_LANGS)[number];

export const SHORT_LANG_TO_DATA: Record<string, PrimaryLang> = {
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-tw': 'zh-TW',
  es: 'es',
  'pt-br': 'pt-BR',
  pt: 'pt-BR',
  id: 'id',
  de: 'de',
  fr: 'fr',
};

const ARTICLES_DIR = path.join(process.cwd(), 'data', 'articles');

let _cache: ArticleV2[] | null = null;

function loadAll(): ArticleV2[] {
  if (_cache) return _cache;
  const out: ArticleV2[] = [];
  try {
    const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      try {
        const full = path.join(ARTICLES_DIR, f);
        const raw = readFileSync(full, 'utf-8');
        const parsed = JSON.parse(raw) as ArticleV2;
        parsed.explicit_updated_at = parsed.updated_at;
        if (!parsed.updated_at) {
          const fromContent =
            parsed.langs?.en?.last_updated ??
            parsed.langs?.ko?.last_updated ??
            null;
          parsed.updated_at = fromContent
            ? new Date(fromContent).toISOString()
            : statSync(full).mtime.toISOString();
        }
        if (!parsed.published_at) parsed.published_at = parsed.updated_at;
        // PRD §6.1 / E-004 — 15-enum guard (빌드 차단, 무허가 카테고리 추가 방지)
        if (!ALLOWED_CATEGORIES_V2.has(parsed.category)) {
          throw new Error(
            `Unknown category in ${f}: "${parsed.category}". ` +
              `Allowed: ${Array.from(ALLOWED_CATEGORIES_V2).join(', ')}`,
          );
        }
        // PRD §5.2.1 / §7.1 Step 1 — default author/reviewer 런타임 주입 (JSON 무수정)
        if (!parsed.author) parsed.author = DEFAULT_AUTHOR;
        if (!parsed.reviewer) parsed.reviewer = DEFAULT_REVIEWER;
        // 통합으로 301 이 걸린 슬러그는 노출 계층에서 제외 (MERGED_AWAY 주석 참조).
        if (MERGED_AWAY.has(parsed.slug)) continue;
        out.push(parsed);
      } catch {
        // skip malformed
      }
    }
  } catch {
    // articles dir missing — return empty
  }
  out.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
  _cache = out;
  return out;
}

export function getAllArticles(): ArticleV2[] {
  return loadAll();
}

// 블로그 최초 발행일. 이보다 이른 날짜는 존재할 수 없다.
const LAUNCH_FLOOR = '2026-05-23T00:00:00.000Z';

/**
 * 검색엔진에 내보내는 발행/수정 시각 (sitemap lastmod · JSON-LD · og · 본문 표시).
 *
 * `langs.*.last_updated` 는 생성 모델이 써 넣은 값이라 믿을 수 없다 — 1,091건 중
 * 1,069건이 generated_at 보다 앞서고 40건은 2025년(블로그 런칭 1년 전)이다. 그래서
 * slug 는 `-2026` 인데 JSON-LD 는 2025 를 말하는 모순이 생겼다. 실제로 기록된 시각은
 * generated_at 뿐이므로 그걸 쓴다. JSON 에 updated_at 을 명시하면(실제 수정 시)
 * 그 값이 수정 시각이 된다.
 */
export function articleDates(a: ArticleV2): { published: string; modified: string } {
  const now = new Date().toISOString();
  const clamp = (iso: string) => (iso < LAUNCH_FLOOR ? LAUNCH_FLOOR : iso > now ? now : iso);
  const valid = (raw?: string) => {
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : clamp(d.toISOString());
  };
  const published = valid(a.generated_at) ?? valid(a.published_at) ?? LAUNCH_FLOOR;
  const explicit = valid(a.explicit_updated_at);
  const modified = explicit && explicit > published ? explicit : published;
  return { published, modified };
}

export function getArticleBySlug(slug: string): ArticleV2 | null {
  return loadAll().find((a) => a.slug === slug) ?? null;
}

export function resolveContent(
  article: ArticleV2,
  shortLang: string,
): { content: ArticleV2LangContent; usedLang: PrimaryLang; fallback: boolean } | null {
  const target = SHORT_LANG_TO_DATA[shortLang.toLowerCase()] ?? 'en';
  const primary = article.langs[target];
  if (primary && primary.title && primary.body_md) {
    return { content: primary, usedLang: target, fallback: false };
  }
  const en = article.langs['en'];
  if (en && en.title && en.body_md) {
    return { content: en, usedLang: 'en', fallback: true };
  }
  return null;
}

export function getRelatedArticles(article: ArticleV2, limit = 4): ArticleV2[] {
  return loadAll()
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, limit);
}

// SEO staging — index priority languages first to escape "Crawled — currently
// not indexed". A new domain pushing ~10k AI-generated URLs across 10 langs gets
// index-throttled by Google; concentrating crawl/index budget on a few languages
// builds authority, then the rest are promoted by editing this one set.
// SEO SSOT — 색인 대상 언어는 lib/i18n.ts 의 INDEXABLE_ROUTE_LANGS 한 곳에서만 관리.
// 언어 승격은 그 배열에 추가(여기 수정 불필요) → sitemap·hreflang·robots·Header 스위처 자동 반영.
export const PRIORITY_INDEX_LANGS = new Set<string>(INDEXABLE_ROUTE_LANGS);

/** Whether pages in this route short lang should be indexable now (SEO staging). */
export function isLangIndexable(shortLang: string): boolean {
  return PRIORITY_INDEX_LANGS.has(shortLang.toLowerCase());
}

export interface RelatedArticleLink {
  slug: string;
  title: string;
  /** 아이콘이 카테고리로 결정되므로 함께 넘긴다(같은 카테고리 안이라 항상 동일). */
  category: string;
  category_emoji?: string;
}

/**
 * Same-category articles with NATIVE (non-fallback) content in `shortLang`,
 * excluding the current one. Powers in-article internal linking so every article
 * is reachable from its siblings — kills orphan pages and improves crawl depth,
 * a direct lever against "Crawled/Discovered — currently not indexed".
 */
export function getRelatedForLang(
  article: ArticleV2,
  shortLang: string,
  limit = 4,
): RelatedArticleLink[] {
  const out: RelatedArticleLink[] = [];
  for (const a of loadAll()) {
    if (a.slug === article.slug || a.category !== article.category) continue;
    const r = resolveContent(a, shortLang);
    if (!r || r.fallback) continue;
    out.push({ slug: a.slug, title: r.content.title, category: a.category, category_emoji: a.category_emoji });
    if (out.length >= limit) break;
  }
  return out;
}

export function getArticlesByCategory(category: string): ArticleV2[] {
  return loadAll().filter((a) => a.category === category);
}

export interface ArticleListItem {
  slug: string;
  category: string;
  category_emoji?: string;
  reading_time_min?: number;
  updated_at: string;
  title: string;
  tldr?: string;
  meta_description?: string;
}

export function listArticlesForLang(shortLang: string, limit?: number): ArticleListItem[] {
  const items: ArticleListItem[] = [];
  for (const a of loadAll()) {
    const r = resolveContent(a, shortLang);
    if (!r) continue;
    items.push({
      slug: a.slug,
      category: a.category,
      category_emoji: a.category_emoji,
      reading_time_min: a.reading_time_min,
      updated_at: a.updated_at ?? '',
      title: r.content.title,
      tldr: r.content.tldr,
      meta_description: r.content.meta_description,
    });
    if (limit && items.length >= limit) break;
  }
  return items;
}
