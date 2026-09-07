import { NextResponse } from 'next/server';
import { getAllArticles, resolveContent } from '@/lib/articles-v2';
import { SITE } from '@/lib/site';


export const revalidate = 600;

export function GET() {
  const items = getAllArticles()
    .slice(0, 50)
    .map((a) => {
      const r = resolveContent(a, 'en');
      if (!r) return null;
      const url = `${SITE}/en/${a.slug}`;
      const summary = r.content.tldr ?? r.content.meta_description ?? '';
      return `
    <item>
      <title><![CDATA[${escapeXml(r.content.title)}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(a.published_at ?? a.updated_at ?? Date.now()).toUTCString()}</pubDate>
      <category>${escapeXml(a.category)}</category>
      <description><![CDATA[${escapeXml(summary)}]]></description>
    </item>`;
    })
    .filter(Boolean)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HAVIT Blog</title>
    <link>${SITE}</link>
    <description>Evidence-based wellness guides on habits, sleep, nutrition, and movement.</description>
    <language>en-US</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] ?? c);
}
