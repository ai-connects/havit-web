// SEO dedup: 301 near-duplicate articles merged into a canonical keeper.
// Slug-level map (lib/merged-redirects.json); applied across all langs via :lang.
const mergedRedirects = require('./lib/merged-redirects.json');

// lib/site.ts 와 같은 값이어야 한다. 여기는 CJS 라 TS 상수를 못 읽어 중복해 둔다.
const BASE_PATH = '/blog';
const SITE = `https://www.aihavit.com${BASE_PATH}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 블로그를 www.aihavit.com/blog 아래로 마운트한다. www 프로젝트가 이 경로를
  // 이 배포로 rewrite(프록시)하므로 사용자에게는 www 한 호스트만 보인다.
  // _next 정적 자산도 함께 /blog 아래로 내려가 www 쪽 경로와 충돌하지 않는다.
  basePath: BASE_PATH,
  async redirects() {
    const merged = mergedRedirects.map((r) => ({
      source: `/:lang/${r.from}`,
      destination: `/:lang/${r.to}`,
      permanent: true,
    }));

    // 구 서브도메인(blog.aihavit.com)에 남아 있는 URL 을 새 정본으로 넘긴다.
    // basePath:false 라 source 가 basePath 없이 원본 경로에 매칭된다.
    //
    // ⚠️ /blog 로 시작하는 경로는 반드시 제외한다. 그건 basePath 아래의 실제
    //    페이지이자 www 프록시가 때리는 바로 그 경로여서, 잡으면 요청이
    //    www → 오리진 → www 로 도는 무한 루프가 된다.
    // basePath 루트(/blog) → 기본 언어. app/page.tsx 의 permanentRedirect 로
    // 처리하던 것을 옮겼다 — 그쪽은 Location 헤더 없는 308 을 내보내
    // 크롤러 입장에서 막다른 길이었다(본문만 37KB 짜리 308).
    const root = [
      { source: '/', destination: '/ko', permanent: true },
    ];

    const legacyHost = [
      {
        source: '/',
        destination: `${SITE}/ko`,
        permanent: true,
        basePath: false,
      },
      {
        source: '/:path((?!blog$|blog/).*)',
        destination: `${SITE}/:path`,
        permanent: true,
        basePath: false,
      },
    ];

    return [...root, ...merged, ...legacyHost];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.aihavit.com' },
      // Article hero photos — the HAVIT app's own article library (see
      // lib/article-images.ts). Originals are 0.3–3.9 MB, so they are always
      // rendered through next/image, never linked raw.
      {
        protocol: 'https',
        hostname: 'havit-prod-us-east.s3.us-east-1.amazonaws.com',
        pathname: '/image/**',
      },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // 289 distinct sources — a long TTL keeps the optimizer from re-fetching
    // multi-MB originals as pages revalidate on the 600s ISR window.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // PRD §6.1 INV-011: ISR revalidate 600s (10분)
  experimental: {
    // Next 14 App Router default
  },
};

module.exports = nextConfig;
