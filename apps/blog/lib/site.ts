/**
 * SEO SSOT — 사이트 정본 오리진과 경로 접두.
 *
 * 블로그는 2026-09 에 `blog.aihavit.com` 서브도메인에서 `www.aihavit.com/blog`
 * 서브디렉터리로 이전했다. 이유는 링크 권위다 — GSC 기준 외부 링크 265개가
 * 전부 www 앞으로 들어오는데, 서브도메인은 Google 에게 별개 사이트라 그 권위를
 * 한 톨도 물려받지 못했다. 색인률이 en 1,038 URL 중 7건(0.7%)에 머문 상태에서
 * 옮기는 비용이 가장 싸다.
 *
 * 이 파일 하나가 canonical·hreflang·sitemap·RSS·JSON-LD 의 절대 URL 을 모두
 * 결정한다. 도메인 리터럴을 다른 파일에 다시 적지 말 것.
 */

/** 라우팅 접두. next.config.js 의 basePath 와 반드시 같아야 한다. */
export const BASE_PATH = '/blog';

/** 호스트 오리진 (경로 없음). 쿠키·GA·cross-origin 판정용. */
export const SITE_ORIGIN = 'https://www.aihavit.com';

/**
 * 절대 URL 을 만들 때 쓰는 정본 접두. 끝에 슬래시 없음 —
 * `${SITE}/${lang}/${slug}` 형태로 이어붙인다.
 */
export const SITE = `${SITE_ORIGIN}${BASE_PATH}`;

/**
 * metadataBase 전용. Next 는 이 값을 URL 로 해석해 상대 metadata 를 붙이는데,
 * 끝 슬래시가 없으면 마지막 세그먼트(`/blog`)가 잘려나가 `/og-card.png` 가
 * 루트로 해석된다. 그래서 여기만 슬래시를 붙인다.
 */
export const METADATA_BASE = new URL(`${SITE}/`);

/** 이전 전 서브도메인. 301 원본과 마이그레이션 검증에만 쓴다. */
export const LEGACY_ORIGIN = 'https://blog.aihavit.com';

/**
 * public/ 에셋의 경로를 basePath 아래로 옮긴다.
 *
 * next/link·next/image 는 basePath 를 자동으로 붙이지만 원시 `<img src>`,
 * `<a href>`, 그리고 metadata 의 `icons` 는 붙지 않는다. 서브도메인 시절엔
 * 루트가 곧 블로그라 티가 안 났는데, www.aihavit.com 아래로 들어오면서
 * `/havit-logo.svg` 같은 경로가 www 프로젝트의 동명 파일로 조용히 바뀌거나
 * (로고·파비콘) 그냥 404 가 된다(뱃지·카테고리 아이콘).
 */
export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

// 블로그 언어 → 마케팅 사이트 로케일 디렉터리. 이름이 다른 둘만 적는다
// (apps/web/plugins/i18n-html.js 의 BLOG_LANG_OF 역방향).
const WWW_LOCALE_OF: Record<string, string> = { zh: 'zh-cn', 'pt-br': 'pt' };

/**
 * 이 블로그 언어에 맞는 마케팅 사이트 홈. 루트(/)로 보내면 middleware 가
 * Accept-Language 로 302 한 번 더 태우고, 크롤러는 언어 헤더가 없어 /ko 블로그에서도
 * 영어 홈으로 간다. 영어만 루트가 정본이다.
 */
export function mainSiteHome(shortLang: string): string {
  const main = process.env.NEXT_PUBLIC_MAIN_URL ?? SITE_ORIGIN;
  if (shortLang === 'en') return `${main}/`;
  return `${main}/${WWW_LOCALE_OF[shortLang] ?? shortLang}/`;
}
