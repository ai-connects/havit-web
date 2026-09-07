/**
 * BreadcrumbJsonLd — Schema.org BreadcrumbList JSON-LD injection.
 *
 * Google rich-result: shows breadcrumb trail in search result (above title)
 * instead of raw URL. Cleaner SERP appearance + higher trust signal.
 *
 * Trail: Home → Category → Article
 */

import type { ArticleV2 } from '@/lib/articles-v2';
import { categoryByValue } from '@/lib/i18n';
import { SITE } from '@/lib/site';

interface Props {
  article: ArticleV2;
  content: { title: string };
  shortLang: string;
}


export default function BreadcrumbJsonLd({ article, content, shortLang }: Props) {
  const cat = categoryByValue(article.category);

  const items: { '@type': 'ListItem'; position: number; name: string; item: string }[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'HAVIT Blog',
      item: `${SITE}/${shortLang}`,
    },
  ];

  if (cat) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: cat.value,
      item: `${SITE}/${shortLang}/category/${cat.slug}`,
    });
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: content.title,
      item: `${SITE}/${shortLang}/${article.slug}`,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: content.title,
      item: `${SITE}/${shortLang}/${article.slug}`,
    });
  }

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
