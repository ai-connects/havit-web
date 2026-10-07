import { notFound } from 'next/navigation';
import { INDEXABLE_LANGS } from '@/lib/sitemap-entries';
import { buildRss, RSS_HEADERS } from '@/lib/rss';

/** /blog/<lang>/rss.xml — 네이버 서치어드바이저엔 /blog/ko/rss.xml 을 제출한다. */
export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return INDEXABLE_LANGS.map((lang) => ({ lang }));
}

export function GET(_req: Request, { params }: { params: { lang: string } }) {
  if (!(INDEXABLE_LANGS as readonly string[]).includes(params.lang)) notFound();
  return new Response(buildRss(params.lang, `/${params.lang}/rss.xml`), { headers: RSS_HEADERS });
}
