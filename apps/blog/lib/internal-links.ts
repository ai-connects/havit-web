/**
 * 본문 마크다운의 블로그 내부 링크를 렌더 시점에 바로잡는다 (데이터는 그대로).
 *
 * 1) 현지화 — 원고가 `/en/<slug>` 로 적혀 있어도, 지금 보는 언어에 그 글의 원고가
 *    있으면(폴백이 아니면) 그 언어 경로로 보낸다. 번역 원고가 영어 원문의 링크를 그대로
 *    물려받아 es 페이지가 en 페이지로 링크하던 문제다. 원고가 없으면 링크에 적힌 언어,
 *    그것도 없으면 en 으로 보낸다(폴백 페이지는 noindex 라 링크 대상으로 쓰지 않는다).
 * 2) basePath 정규화 — `/es/…`(basePath 빠짐), `/blog/es/…`, `https://www.aihavit.com/blog/es/…`
 *    를 모두 같은 앱 내부 경로로 맞춘다. next/link 는 basePath 를 스스로 붙이므로
 *    `path` 는 basePath 없이 돌려주고, 일반 `<a>` 용으로 `href`(basePath 포함)도 준다.
 * 3) 깨진 링크 — 없는 slug 는 병합 리다이렉트 표(merged-redirects.json)에 있으면 대상
 *    slug 로, 없으면 링크를 걷고 텍스트만 남긴다(`dead: true`).
 *
 * 블로그 밖(www 홈페이지·외부 사이트·앵커)은 손대지 않는다.
 */
import mergedRedirects from './merged-redirects.json';
import { getArticleBySlug, resolveContent } from './articles-v2';
import { BASE_PATH } from './site';
import { SERVED_ROUTE_LANGS } from './i18n';

const ROUTE_LANGS = new Set<string>(SERVED_ROUTE_LANGS);
/** 원고에 라우트가 아닌 언어 코드로 적힌 링크(`/pt/…` — 라우트는 `pt-br`). */
const LANG_ALIAS: Record<string, string> = { pt: 'pt-br', 'zh-cn': 'zh', 'zh-hans': 'zh', 'zh-hant': 'zh-tw' };
const routeLang = (seg: string): string | null => {
  const l = seg.toLowerCase();
  const r = LANG_ALIAS[l] ?? l;
  return ROUTE_LANGS.has(r) ? r : null;
};
const MERGED = new Map<string, string>(
  (mergedRedirects as { from: string; to: string }[]).map((r) => [r.from, r.to]),
);

/** 글이 아닌 블로그 고정 경로. 모든 언어에 있다. */
const STATIC_ROUTE = /^(|articles|about|editorial-policy|rss\.xml|tools(\/[a-z-]+)?|category\/[a-z0-9-]+)$/;

export type ResolvedLink =
  | { kind: 'external' }
  | { kind: 'internal'; path: string; href: string; localized: boolean; redirected: boolean }
  | { kind: 'dead' };

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * `href` 가 블로그 내부 경로면 `{lang, rest, suffix}` 로 쪼갠다. 아니면 null.
 * rest 는 lang 뒤의 경로(앞뒤 슬래시 없음), suffix 는 `?…`/`#…`.
 */
function parseBlogPath(href: string): { lang: string; rest: string; suffix: string } | null {
  let p = href;
  if (/^https?:\/\//i.test(p)) {
    const host = hostOf(p);
    if (host !== 'www.aihavit.com' && host !== 'aihavit.com' && host !== 'blog.aihavit.com') return null;
    const u = new URL(p);
    p = u.pathname + u.search + u.hash;
    // www 의 블로그 바깥(홈·제품 페이지)은 블로그 링크가 아니다. 구 서브도메인은 전부 블로그.
    // 예외: `/blog` 만 빠진 `www…/es/<글 slug>` 는 블로그 글 링크로 본다.
    if (host !== 'blog.aihavit.com' && !(p === BASE_PATH || p.startsWith(`${BASE_PATH}/`))) {
      const seg = (p.split(/[?#]/)[0] ?? '').replace(/^\/+|\/+$/g, '').split('/');
      const isArticle =
        seg.length === 2 && !!routeLang(seg[0]) && (!!getArticleBySlug(seg[1]) || MERGED.has(seg[1]));
      if (!isArticle) return null;
    }
  }
  if (!p.startsWith('/')) return null;
  const m = p.match(/^([^?#]*)([?#].*)?$/);
  let path = m?.[1] ?? p;
  const suffix = m?.[2] ?? '';
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) path = path.slice(BASE_PATH.length);
  const seg = path.replace(/^\/+|\/+$/g, '').split('/');
  const lang = routeLang(seg[0] ?? '');
  if (!lang) return null;
  return { lang, rest: seg.slice(1).join('/'), suffix };
}

const native = (slug: string, lang: string): boolean => {
  const a = getArticleBySlug(slug);
  if (!a) return false;
  const r = resolveContent(a, lang);
  return !!r && !r.fallback;
};

/**
 * @param href 원고에 적힌 링크
 * @param pageLang 지금 렌더 중인 페이지의 라우트 언어(`es`, `zh-tw` …)
 * @param currentSlug 지금 페이지의 slug. 병합 리다이렉트를 따라가 자기 자신이 되는 링크
 *   (`foundayo-tracker` → `orforglipron-tracker` 본문 안)는 걷는다 — 자기 페이지로 가는 링크다.
 */
export function resolveBlogLink(
  href: string | undefined,
  pageLang: string,
  currentSlug?: string,
): ResolvedLink {
  if (!href) return { kind: 'external' };
  const parsed = parseBlogPath(href);
  if (!parsed) return { kind: 'external' };
  const { lang, rest, suffix } = parsed;

  if (STATIC_ROUTE.test(rest)) {
    const path = `/${lang}${rest ? `/${rest}` : ''}${suffix}`;
    return { kind: 'internal', path, href: `${BASE_PATH}${path}`, localized: false, redirected: false };
  }
  if (rest.includes('/')) return { kind: 'dead' };

  let slug = rest;
  let redirected = false;
  if (!getArticleBySlug(slug) && MERGED.has(slug)) {
    slug = MERGED.get(slug)!;
    redirected = true;
  }
  if (!getArticleBySlug(slug)) return { kind: 'dead' };
  if (redirected && slug === currentSlug) return { kind: 'dead' };

  const page = pageLang.toLowerCase();
  const target = [page, lang, 'en'].find((l) => native(slug, l));
  if (!target) return { kind: 'dead' };
  const path = `/${target}/${slug}${suffix}`;
  return {
    kind: 'internal',
    path,
    href: `${BASE_PATH}${path}`,
    localized: target !== lang,
    redirected,
  };
}
