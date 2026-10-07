import { SITE } from '@/lib/site';
import { INDEXABLE_LANGS, entriesForLang, newestLastmod } from '@/lib/sitemap-entries';

/**
 * 사이트맵 색인. 예전엔 9,723 URL + hreflang 10만 줄을 한 파일(16.2MB)로 냈는데,
 * 네이버 서치어드바이저가 제출을 거부했고(2026-10-07) 크롤러마다 매번 16MB 를 받아야
 * 했다. 언어별 파일(~1.6MB)로 나누고 이 주소는 색인으로 바꾼다 — GSC/네이버/robots 에
 * 등록된 URL 이 그대로라 재제출이 필요 없다.
 */
export const dynamic = 'force-static';

export function GET() {
  const items = INDEXABLE_LANGS.map((lang) => {
    const lm = newestLastmod(entriesForLang(lang));
    return `<sitemap><loc>${SITE}/sitemaps/${lang}.xml</loc>${lm ? `<lastmod>${lm}</lastmod>` : ''}</sitemap>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
