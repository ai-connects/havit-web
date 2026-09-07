import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

// PRD §6.7
//
// SEO v1.6 — robots.txt:
//   - Block /_next/data/ (Next.js JSON RSC payloads, useless for search)
//   - Block /_next/image (Next.js image-optimizer endpoint, not the asset)
//   - Block /api/ and /admin/ as before
//   - DO NOT block /_next/static/ (CSS/JS chunks) — Googlebot needs to fetch
//     these to render the page for visual quality + Core Web Vitals signals.
//     Previously the broad /_next/ block caught CSS files and surfaced in GSC
//     as "Blocked by robots.txt", and more importantly degraded Google's
//     rendered-page evaluation of every article.
// ⚠️ 이 파일은 이제 /blog/robots.txt 로 서빙된다. 크롤러는 호스트 루트의
// robots.txt 만 읽으므로 여기 규칙은 **적용되지 않는다**. 실제로 적용되는 곳은
// apps/web/public/robots.txt 이고, 아래 Disallow 는 거기에 /blog 접두를 붙여
// 옮겨두었다. 둘을 함께 고쳐야 한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/data/', '/_next/image', '/admin/'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
