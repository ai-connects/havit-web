// 카테고리 목록 — 1쪽(/<lang>/category/<slug>)과 2쪽 이후(/<lang>/category/<slug>/page/<n>)가 같이 쓴다.
// 한 쪽 PAGE_SIZE 편. 예전에는 한 쪽에 카테고리 글 전부(최대 200편+, HTML 600KB+)를 그렸다.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCardV2 from '@/components/ArticleCardV2';
import { listArticlesForLang, isLangIndexable } from '@/lib/articles-v2';
import { localizedCategory } from '@/lib/category-labels';
import { toFullLang, toHreflangMap } from '@/lib/i18n';
import { ALL_CATEGORIES, categoryValueBySlug } from '@/lib/categories';
import { SITE } from '@/lib/site';
import { categoryMetaDescription } from '@/lib/meta-descriptions';
import { INDEXABLE_ROBOTS } from '@/lib/seo';
import { articleImage } from '@/lib/article-images';

export const CATEGORY_PAGE_SIZE = 24;
export const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
type RouteLang = (typeof ROUTE_LANGS)[number];

// Inline i18n (keeps lib/i18n.ts untouched, mirrors Footer.tsx pattern).
const LABEL_BLOG: Record<RouteLang, string> = {
  ko: '블로그', en: 'Blog', ja: 'ブログ', zh: '博客', 'zh-tw': '部落格', es: 'Blog',
  'pt-br': 'Blog', id: 'Blog', de: 'Blog', fr: 'Blog',
};
const LABEL_ITEMS: Record<RouteLang, string> = {
  ko: '건', en: 'articles', ja: '件', zh: '篇', 'zh-tw': '篇', es: 'artículos',
  'pt-br': 'artigos', id: 'artikel', de: 'Artikel', fr: 'articles',
};
const LABEL_ALL_ARTICLES: Record<RouteLang, string> = {
  ko: '전체 아티클', en: 'All articles', ja: '全記事', zh: '全部文章', 'zh-tw': '全部文章',
  es: 'Todos los artículos', 'pt-br': 'Todos os artigos', id: 'Semua artikel',
  de: 'Alle Artikel', fr: 'Tous les articles',
};


const LABEL_PAGE: Record<RouteLang, (n: number) => string> = {
  ko: (n) => `${n}쪽`, en: (n) => `Page ${n}`, ja: (n) => `${n}ページ`, zh: (n) => `第${n}页`,
  'zh-tw': (n) => `第${n}頁`, es: (n) => `Página ${n}`, 'pt-br': (n) => `Página ${n}`,
  id: (n) => `Halaman ${n}`, de: (n) => `Seite ${n}`, fr: (n) => `Page ${n}`,
};

export function categoryItems(lang: string, value: string) {
  return listArticlesForLang(lang).filter((i) => i.category === value);
}

export function categoryPageCount(lang: string, slug: string): number {
  const value = categoryValueBySlug(slug);
  if (!value) return 0;
  return Math.max(1, Math.ceil(categoryItems(lang, value).length / CATEGORY_PAGE_SIZE));
}

function pagePath(lang: string, slug: string, p: number) {
  return p > 1 ? `/${lang}/category/${slug}/page/${p}` : `/${lang}/category/${slug}`;
}

export function categoryMetadata(params: { lang: string; slug: string }, page: number): Metadata {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) return { title: 'Not Found — HAVIT Blog' };
  const value = categoryValueBySlug(params.slug);
  if (!value) return { title: 'Not Found — HAVIT Blog' };
  const lang = params.lang as RouteLang;
  const name = localizedCategory(value, lang);
  const title = page > 1 ? `${name} · ${LABEL_PAGE[lang](page)} — HAVIT Blog` : `${name} — HAVIT Blog`;
  const titles = listArticlesForLang(lang)
    .filter((i) => i.native && i.category === value)
    .map((i) => i.title);
  const description = categoryMetaDescription(lang, name, titles);
  const url = `${SITE}${pagePath(lang, params.slug, page)}`;
  const image = articleImage('', value);
  return {
    title,
    description,
    // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS).
    robots: isLangIndexable(lang)
      ? INDEXABLE_ROBOTS
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      // 2쪽 이후는 자기 자신이 정본이다(1쪽으로 모으면 그 쪽 글 링크를 Google 이 버린다).
      // 언어마다 글 수·쪽 수가 달라 hreflang 은 1쪽에만 단다.
      canonical: url,
      ...(page === 1
        ? {
            languages: toHreflangMap({
              ...Object.fromEntries(
                ROUTE_LANGS.filter(isLangIndexable).map((l) => [l, `${SITE}/${l}/category/${params.slug}`]),
              ),
              'x-default': `${SITE}/en/category/${params.slug}`,
            }),
          }
        : {}),
    },
    openGraph: { title, description, type: 'website', siteName: 'HAVIT Blog', url, locale: lang, images: [{ url: image, alt: name }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export function CategoryListing({ params, page }: { params: { lang: string; slug: string }; page: number }) {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) notFound();
  const value = categoryValueBySlug(params.slug);
  if (!value) notFound();

  const shortLang = params.lang;
  const lang = toFullLang(shortLang === 'zh-tw' ? 'zh-tw' : shortLang === 'zh' ? 'zh-cn' : shortLang);
  const name = localizedCategory(value, shortLang);

  const all = categoryItems(shortLang, value);
  const totalPages = Math.max(1, Math.ceil(all.length / CATEGORY_PAGE_SIZE));
  if (page < 1 || page > totalPages) notFound();
  const items = all.slice((page - 1) * CATEGORY_PAGE_SIZE, page * CATEGORY_PAGE_SIZE);
  const basePath = `/${shortLang}`;
  const href = (p: number) => pagePath(shortLang, params.slug, p);
  const pageNumbers: number[] = [];
  {
    const from = Math.max(1, Math.min(page - 2, totalPages - 4));
    const to = Math.min(totalPages, from + 4);
    for (let p = from; p <= to; p++) pageNumbers.push(p);
  }

  const otherCategories = ALL_CATEGORIES.filter((c) => c.value !== value);
  const pageUrl = `${SITE}${href(page)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        url: pageUrl,
        name,
        inLanguage: shortLang,
        isPartOf: { '@id': `${SITE}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: (page - 1) * CATEGORY_PAGE_SIZE + i + 1,
            url: `${SITE}${basePath}/${it.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: LABEL_BLOG[shortLang as RouteLang], item: `${SITE}${basePath}` },
          { '@type': 'ListItem', position: 2, name, item: `${SITE}${href(1)}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header lang={lang} />
      <main className="flex-1">
        <section className="hv-container pt-10 md:pt-14 pb-8">
          <nav className="text-body-small mb-3" aria-label="Breadcrumb">
            <Link href={basePath} className="hover:text-primary-700">
              {LABEL_BLOG[shortLang as RouteLang]}
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: 'var(--hv-fg)' }}>{name}</span>
          </nav>
          <h1 className="text-heading-2 mb-3">{name}</h1>
          <p className="text-body-small mb-2">
            {all.length} {LABEL_ITEMS[shortLang as RouteLang]}
            {totalPages > 1 && ` · ${LABEL_PAGE[shortLang as RouteLang](page)} / ${totalPages}`}
          </p>
          <Link
            href={`${basePath}/articles`}
            className="text-body-small text-primary-700 hover:underline"
          >
            {LABEL_ALL_ARTICLES[shortLang as RouteLang]} →
          </Link>
        </section>

        <section className="hv-container pb-12">
          {items.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border" style={{ borderColor: 'var(--hv-border)' }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {items.map((item, i) => (
                <ArticleCardV2 key={item.slug} item={item} shortLang={shortLang} featured={false} priority={i < 4} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav className="pagination mt-10" aria-label="Pagination">
              <Link href={href(Math.max(1, page - 1))} className="carousel-arrow" aria-label="Previous page" aria-disabled={page === 1}>
                ‹
              </Link>
              {pageNumbers.map((p) => (
                <Link
                  key={p}
                  href={href(p)}
                  className={`pagination__page ${p === page ? 'is-active' : ''}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </Link>
              ))}
              <Link href={href(Math.min(totalPages, page + 1))} className="carousel-arrow" aria-label="Next page" aria-disabled={page === totalPages}>
                ›
              </Link>
            </nav>
          )}
        </section>

        <section className="hv-container pb-20">
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                href={`${basePath}/category/${c.slug}`}
                className="blog-categories__item"
              >
                {localizedCategory(c.value, shortLang)}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
