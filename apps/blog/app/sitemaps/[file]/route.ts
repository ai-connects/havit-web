import { notFound } from 'next/navigation';
import { INDEXABLE_LANGS, entriesForLang, renderUrlset } from '@/lib/sitemap-entries';

/** 언어별 사이트맵 — /blog/sitemaps/<lang>.xml. 색인은 app/sitemap.xml/route.ts. */
export const dynamicParams = false;

export function generateStaticParams() {
  return INDEXABLE_LANGS.map((lang) => ({ file: `${lang}.xml` }));
}

export function GET(_req: Request, { params }: { params: { file: string } }) {
  const lang = params.file.replace(/\.xml$/, '');
  if (!(INDEXABLE_LANGS as readonly string[]).includes(lang) || !params.file.endsWith('.xml')) notFound();
  return new Response(renderUrlset(entriesForLang(lang)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
