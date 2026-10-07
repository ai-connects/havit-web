import { getAllArticles, resolveContent, articleDates } from '@/lib/articles-v2';
import { toBcp47, toFullLang } from '@/lib/i18n';
import { SITE } from '@/lib/site';

const CHANNEL_TITLE: Record<string, string> = {
  en: 'HAVIT Blog', ko: 'HAVIT 블로그', ja: 'HAVIT ブログ', zh: 'HAVIT 博客', 'zh-tw': 'HAVIT 部落格',
  es: 'Blog de HAVIT', 'pt-br': 'Blog da HAVIT', id: 'Blog HAVIT', de: 'HAVIT Blog', fr: 'Blog HAVIT',
};

const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] ?? c);

/**
 * 언어별 RSS. 예전 /rss.xml 은 영어 50편뿐이라 네이버(한국어)에 제출해도 한국어 글이
 * 하나도 전달되지 않았고, pubDate 가 생성 모델이 지어낸 last_updated 기반이었다.
 * 이제 그 언어에 실제 번역이 있는 글만, 실제 생성 시각(articleDates) 최신순으로 낸다.
 */
export function buildRss(lang: string, selfPath: string): string {
  const items = getAllArticles()
    .map((a) => ({ a, r: resolveContent(a, lang), d: articleDates(a) }))
    .filter((x) => x.r && !x.r.fallback)
    .sort((x, y) => y.d.published.localeCompare(x.d.published))
    .slice(0, 50)
    .map(({ a, r, d }) => {
      const url = `${SITE}/${lang}/${a.slug}`;
      const summary = r!.content.tldr ?? r!.content.meta_description ?? '';
      return `
    <item>
      <title>${cdata(r!.content.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(d.published).toUTCString()}</pubDate>
      <category>${esc(a.category)}</category>
      <description>${cdata(summary)}</description>
    </item>`;
    })
    .join('');
  const s = lang.toLowerCase();
  const language = toBcp47(toFullLang(s === 'zh-tw' ? 'zh-tw' : s === 'zh' ? 'zh-cn' : s));
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(CHANNEL_TITLE[lang] ?? 'HAVIT Blog')}</title>
    <link>${SITE}/${lang}</link>
    <description>Evidence-based wellness guides on habits, sleep, nutrition, and movement.</description>
    <language>${language}</language>
    <atom:link href="${SITE}${selfPath}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;
}

export const RSS_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
};
