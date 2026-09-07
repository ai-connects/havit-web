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
