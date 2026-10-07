import { buildRss, RSS_HEADERS } from '@/lib/rss';

// 영어판 RSS (기존 주소 유지). 언어별은 app/[lang]/rss.xml/route.ts.
export const revalidate = 600;

export function GET() {
  return new Response(buildRss('en', '/rss.xml'), { headers: RSS_HEADERS });
}
