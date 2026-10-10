import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCardV2 from '@/components/ArticleCardV2';
import { listArticlesForLang, isLangIndexable } from '@/lib/articles-v2';
import { localizedCategory } from '@/lib/category-labels';
import { toFullLang } from '@/lib/i18n';
import { ALL_CATEGORIES, categoryValueBySlug } from '@/lib/categories';
import { SITE } from '@/lib/site';
import { categoryMetaDescription } from '@/lib/meta-descriptions';

export const dynamicParams = false;
export const revalidate = 600;

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
type RouteLang = (typeof ROUTE_LANGS)[number];

export function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of ROUTE_LANGS) {
    for (const cat of ALL_CATEGORIES) {
      params.push({ lang, slug: cat.slug });
    }
  }
  return params;
}

interface Props {
  params: { lang: string; slug: string };
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) return { title: 'Not Found — HAVIT Blog' };
  const value = categoryValueBySlug(params.slug);
  if (!value) return { title: 'Not Found — HAVIT Blog' };
  const lang = params.lang as RouteLang;
  const name = localizedCategory(value, lang);
  const title = `${name} — HAVIT Blog`;
  const titles = listArticlesForLang(lang)
    .filter((i) => i.native && i.category === value)
    .map((i) => i.title);
  const description = categoryMetaDescription(lang, name, titles);
  const url = `${SITE}/${lang}/category/${params.slug}`;
  return {
    title,
    description,
    // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS).
    robots: isLangIndexable(lang)
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          ROUTE_LANGS.filter(isLangIndexable).map((l) => [l, `${SITE}/${l}/category/${params.slug}`]),
        ),
        'x-default': `${SITE}/en/category/${params.slug}`,
      },
    },
    openGraph: { title, description, type: 'website', siteName: 'HAVIT Blog', url, locale: lang },
  };
}

export default function CategoryPage({ params }: Props) {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) notFound();
  const value = categoryValueBySlug(params.slug);
  if (!value) notFound();

  const shortLang = params.lang;
  const lang = toFullLang(shortLang === 'zh-tw' ? 'zh-tw' : shortLang === 'zh' ? 'zh-cn' : shortLang);
  const name = localizedCategory(value, shortLang);

  const items = listArticlesForLang(shortLang).filter((i) => i.category === value);
  const basePath = `/${shortLang}`;

  const otherCategories = ALL_CATEGORIES.filter((c) => c.value !== value);

  return (
    <div className="min-h-screen flex flex-col">
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
            {items.length} {LABEL_ITEMS[shortLang as RouteLang]}
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
