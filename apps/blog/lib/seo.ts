/**
 * PRD §6.2 + §6.3 + §6.4 SEO 빌더 (Metadata + JSON-LD + hreflang).
 */

import type { Metadata } from 'next';
import type { Article, ArticleContent } from './types';
import { type LangKey, SUPPORTED_LANGS, toBcp47, toShortLang, FALLBACK_LANG } from './i18n';

const SITE = 'https://www.aihavit.com';

export function buildArticleUrl(article: Article, lang: LangKey): string {
  return `${SITE}/blog/${toShortLang(lang)}/${article.slug}`;
}

export function buildOgImageUrl(article: Article): string {
  if (article.image_group_id) {
    return `${SITE}/og?id=${encodeURIComponent(article.image_group_id)}`;
  }
  return `${SITE}/og-default.png`;
}

/** PRD §6.4 hreflang map — 35개 + x-default */
export function buildHreflangMap(article: Article): Record<string, string> {
  const map: Record<string, string> = {};
  for (const langKey of SUPPORTED_LANGS) {
    const c = article.langs[langKey];
    const hasContent = !!(c && c.title);
    if (hasContent || langKey === FALLBACK_LANG) {
      map[toBcp47(langKey)] = `${SITE}/blog/${toShortLang(langKey)}/${article.slug}`;
    }
  }
  map['x-default'] = `${SITE}/blog/en/${article.slug}`;
  return map;
}

/** PRD §6.2 buildArticleMeta */
export function buildArticleMeta(
  article: Article,
  lang: LangKey,
  content: ArticleContent
): Metadata {
  const title = `${content.title} — HAVIT`;
  // SEO 우선순위: meta_description (SEO 전용 150~160자) > summary > title
  const description = (content.meta_description ?? content.summary ?? content.title ?? '').slice(0, 160);
  const keywords = [
    content.primary_keyword,
    ...(content.secondary_keywords ?? []),
    article.category,
    ...article.solution_codes.split(','),
  ].filter(Boolean).join(', ');
  const url = buildArticleUrl(article, lang);
  const imageUrl = buildOgImageUrl(article);
  const alternateLocales = SUPPORTED_LANGS.filter((l) => l !== lang).map(toBcp47);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildHreflangMap(article),
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'HAVIT',
      locale: toBcp47(lang),
      alternateLocale: alternateLocales,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: content.title }],
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: ['HAVIT Editorial'],
      section: article.category,
      tags: [article.category, ...article.solution_codes.split(',')],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      // PRD §6.2 VERIFY-5 fallback: TWITTER_HANDLE env 부재 시 site 라인 자동 누락
      ...(process.env.TWITTER_HANDLE ? { site: process.env.TWITTER_HANDLE } : {}),
    },
    keywords,
    robots: { index: true, follow: true },
  };
}

/** PRD §6.3 buildJsonLd */
export function buildJsonLd(article: Article, lang: LangKey, content: ArticleContent) {
  const url = buildArticleUrl(article, lang);
  const imageUrl = buildOgImageUrl(article);
  const baseArticle: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.summary ?? '',
    image: [imageUrl],
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: 'HAVIT', url: SITE },
    publisher: {
      '@type': 'Organization',
      name: 'HAVIT',
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
    },
    inLanguage: toBcp47(lang),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: article.category,
    keywords: [article.category, ...article.solution_codes.split(',')].join(', '),
  };

  // PRD §6.3 헬스 카테고리 → MedicalWebPage (HealthTopicContent는 v1 보류)
  const HEALTH_CATEGORIES = ['Health & Conditions', 'Medication Guide'];
  if (HEALTH_CATEGORIES.includes(article.category)) {
    return {
      ...baseArticle,
      '@type': ['Article', 'MedicalWebPage'],
      specialty: { '@type': 'MedicalSpecialty', name: 'PublicHealth' },
      lastReviewed: article.updated_at,
    };
  }
  return baseArticle;
}

/** FAQ JSON-LD (PAA 타겟 — Phase 3 신규) */
export function buildFaqJsonLd(content: ArticleContent) {
  if (!content.faq || content.faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

/** Category page meta */
export function buildCategoryMeta(categoryName: string, lang: LangKey, page: number): Metadata {
  const title = `${categoryName} — HAVIT Blog`;
  const description = `Latest articles about ${categoryName} from HAVIT.`;
  const shortLang = toShortLang(lang);
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE}/blog/${shortLang}/c/${categoryName.toLowerCase().replace(/\s+/g, '-')}${page > 1 ? `?page=${page}` : ''}`,
    },
    openGraph: { title, description, type: 'website', siteName: 'HAVIT' },
    robots: { index: true, follow: true },
  };
}

/**
 * 색인 대상 페이지 robots. 검색 결과에 큰 썸네일(모바일 노출 ~70%)·긴 설명·동영상 미리보기를
 * 허용한다 — 기본값은 표준 크기 썸네일만 쓰게 될 수 있어 CTR 이 낮아진다.
 */
export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  'max-image-preview': 'large',
  'max-snippet': -1,
  'max-video-preview': -1,
} as const;
