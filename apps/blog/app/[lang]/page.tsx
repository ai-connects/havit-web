import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { listArticlesForLang, getAllArticles, resolveContent, isLangIndexable } from '@/lib/articles-v2';
import { localizedCategory } from '@/lib/category-labels';
import { toFullLang } from '@/lib/i18n';
import { categorySlug } from '@/lib/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import { ALL_CATEGORY_ICON } from '@/lib/category-icons';
import { articleImage } from '@/lib/article-images';
import { BRAND_SAME_AS } from '@/lib/team';
import { SITE } from '@/lib/site';

export const revalidate = 600;

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
type RouteLang = (typeof ROUTE_LANGS)[number];

export function generateStaticParams() {
  return ROUTE_LANGS.map((lang) => ({ lang }));
}

interface Props {
  params: { lang: string };
  searchParams: { q?: string; cat?: string; page?: string };
}

const HERO_TAGLINE: Record<RouteLang, string> = {
  ko: '습관, 수면, 영양, 운동에 관한 과학 기반 가이드.',
  en: 'Science-backed guides on habits, sleep, nutrition, and movement.',
  ja: '習慣・睡眠・栄養・運動に関する科学的根拠ベースのガイド。',
  zh: '关于习惯、睡眠、营养和运动的科学指南。',
  'zh-tw': '關於習慣、睡眠、營養和運動的科學指南。',
  es: 'Guías basadas en ciencia sobre hábitos, sueño, nutrición y movimiento.',
  'pt-br': 'Guias baseados em ciência sobre hábitos, sono, nutrição e movimento.',
  id: 'Panduan berbasis sains tentang kebiasaan, tidur, nutrisi, dan gerakan.',
  de: 'Wissenschaftlich fundierte Guides zu Gewohnheiten, Schlaf, Ernährung und Bewegung.',
  fr: 'Guides fondés sur la science pour les habitudes, le sommeil, la nutrition et le mouvement.',
};

const SEARCH_PLACEHOLDER: Record<RouteLang, string> = {
  ko: '검색...', en: 'Search...', ja: '検索...', zh: '搜索...', 'zh-tw': '搜尋...', es: 'Buscar...',
  'pt-br': 'Buscar...', id: 'Cari...', de: 'Suchen...', fr: 'Rechercher...',
};

const LABEL_ALL: Record<RouteLang, string> = {
  ko: '전체', en: 'All', ja: 'すべて', zh: '全部', 'zh-tw': '全部', es: 'Todo',
  'pt-br': 'Tudo', id: 'Semua', de: 'Alle', fr: 'Tout',
};

/* 히어로 캐러셀 캡션의 구간 라벨. */
const LABEL_LATEST_CONTENT: Record<RouteLang, string> = {
  ko: '최신 콘텐츠', en: 'Latest', ja: '最新コンテンツ', zh: '最新内容',
  'zh-tw': '最新內容', es: 'Lo más reciente', 'pt-br': 'Mais recentes',
  id: 'Terbaru', de: 'Neueste Beiträge', fr: 'Derniers contenus',
};

/* 히어로 캐러셀 화살표의 스크린리더 라벨. 화살표는 그림뿐이라 이름이 필요하다. */
const LABEL_PREV: Record<RouteLang, string> = {
  ko: '이전 추천 아티클', en: 'Previous featured article', ja: '前のおすすめ記事',
  zh: '上一篇推荐文章', 'zh-tw': '上一篇推薦文章', es: 'Artículo destacado anterior',
  'pt-br': 'Artigo destacado anterior', id: 'Artikel unggulan sebelumnya',
  de: 'Vorheriger empfohlener Artikel', fr: 'Article à la une précédent',
};

const LABEL_NEXT: Record<RouteLang, string> = {
  ko: '다음 추천 아티클', en: 'Next featured article', ja: '次のおすすめ記事',
  zh: '下一篇推荐文章', 'zh-tw': '下一篇推薦文章', es: 'Artículo destacado siguiente',
  'pt-br': 'Próximo artigo destacado', id: 'Artikel unggulan berikutnya',
  de: 'Nächster empfohlener Artikel', fr: 'Article à la une suivant',
};

const LABEL_LATEST: Record<RouteLang, string> = {
  ko: '최신', en: 'Latest', ja: '最新', zh: '最新', 'zh-tw': '最新', es: 'Recientes',
  'pt-br': 'Recentes', id: 'Terbaru', de: 'Neueste', fr: 'Récents',
};

const LABEL_NO_RESULTS: Record<RouteLang, string> = {
  ko: '검색 결과가 없습니다.', en: 'No results found.', ja: '結果が見つかりません.', zh: '没有找到结果.', 'zh-tw': '沒有找到結果.', es: 'No se encontraron resultados.',
  'pt-br': 'Nenhum resultado.', id: 'Tidak ada hasil.', de: 'Keine Ergebnisse.', fr: 'Aucun résultat.',
};

const LABEL_ITEMS: Record<RouteLang, string> = {
  ko: '건', en: 'articles', ja: '件', zh: '篇', 'zh-tw': '篇', es: 'artículos',
  'pt-br': 'artigos', id: 'artikel', de: 'Artikel', fr: 'articles',
};

const LABEL_LANGUAGES: Record<RouteLang, string> = {
  ko: '언어', en: 'languages', ja: '言語', zh: '语言', 'zh-tw': '語言', es: 'idiomas',
  'pt-br': 'idiomas', id: 'bahasa', de: 'Sprachen', fr: 'langues',
};

const LABEL_ALL_ARTICLES: Record<RouteLang, string> = {
  ko: '전체 아티클', en: 'All articles', ja: '全記事', zh: '全部文章', 'zh-tw': '全部文章',
  es: 'Todos los artículos', 'pt-br': 'Todos os artigos', id: 'Semua artikel',
  de: 'Alle Artikel', fr: 'Tous les articles',
};

const LABEL_MIN_READ: Record<RouteLang, string> = {
  ko: '분 분량', en: 'min read', ja: '分で読める', zh: '分钟阅读', 'zh-tw': '分鐘閱讀',
  es: 'min', 'pt-br': 'min de leitura', id: 'menit', de: 'Min. Lesezeit', fr: 'min de lecture',
};

const LABEL_BY_PUBLISHER: Record<RouteLang, string> = {
  ko: '주식회사 하비트 발행', en: 'Published by Havit Inc.',
  ja: 'Havit Inc. 発行', zh: '由 Havit Inc. 出版', 'zh-tw': '由 Havit Inc. 出版',
  es: 'Publicado por Havit Inc.', 'pt-br': 'Publicado por Havit Inc.',
  id: 'Diterbitkan oleh Havit Inc.', de: 'Herausgegeben von Havit Inc.',
  fr: 'Publié par Havit Inc.',
};

const OG_IMAGE_URL = `${SITE}/og-card.png`;

const HOME_TITLE: Record<RouteLang, string> = {
  ko: 'HAVIT 블로그 — 과학 기반 웰니스 가이드',
  en: 'HAVIT Blog — Science-Backed Wellness Guides',
  ja: 'HAVIT ブログ — 科学的根拠に基づくウェルネスガイド',
  zh: 'HAVIT 博客 — 科学循证健康指南',
  'zh-tw': 'HAVIT 部落格 — 科學循證健康指南',
  es: 'HAVIT Blog — Guías de Bienestar Basadas en Ciencia',
  'pt-br': 'HAVIT Blog — Guias de Bem-Estar com Base Científica',
  id: 'HAVIT Blog — Panduan Kesehatan Berbasis Sains',
  de: 'HAVIT Blog — Wissenschaftlich fundierte Wellness-Guides',
  fr: 'HAVIT Blog — Guides Bien-Être Fondés sur la Science',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) return { title: 'Not Found — HAVIT Blog' };
  const lang = params.lang as RouteLang;
  const title = HOME_TITLE[lang];
  const description = HERO_TAGLINE[lang];
  const url = `${SITE}/${lang}`;
  return {
    title,
    description,
    // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS).
    robots: isLangIndexable(lang)
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        ROUTE_LANGS.filter(isLangIndexable).map((l) => [l, `${SITE}/${l}`]),
      ),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'HAVIT Blog',
      url,
      locale: lang,
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: 'HAVIT Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE_URL],
    },
  };
}

const PAGE_SIZE = 12;

export default function BlogIndexPage({ params, searchParams }: Props) {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) notFound();
  const shortLang = params.lang;
  const lang = toFullLang(shortLang === 'zh-tw' ? 'zh-tw' : shortLang === 'zh' ? 'zh-cn' : shortLang);
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  const query = (searchParams.q ?? '').trim().toLowerCase();
  const category = searchParams.cat ?? '';

  let items = listArticlesForLang(shortLang);
  if (category) items = items.filter((i) => i.category === category);
  if (query) {
    items = items.filter((i) =>
      i.title.toLowerCase().includes(query) ||
      (i.tldr ?? '').toLowerCase().includes(query) ||
      (i.meta_description ?? '').toLowerCase().includes(query),
    );
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  const allArticles = getAllArticles();
  const categoryCounts = new Map<string, { count: number }>();
  for (const a of allArticles) {
    const r = resolveContent(a, shortLang);
    if (!r) continue;
    const prev = categoryCounts.get(a.category) ?? { count: 0 };
    categoryCounts.set(a.category, { count: prev.count + 1 });
  }
  const categories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1].count - a[1].count);

  const basePath = `/${shortLang}`;

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('cat', category);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // SEO v1.3 — WebSite + Organization JSON-LD on home page (sitelinks search
  // box + Knowledge Graph signals). Single object as @graph for compactness.
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'HAVIT Blog',
        description: HERO_TAGLINE[shortLang as RouteLang],
        inLanguage: shortLang,
        publisher: { '@id': `${SITE}/#publisher` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE}/${shortLang}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#publisher`,
        name: 'Havit Inc.',
        url: 'https://www.aihavit.com',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE}/havit-logo.png`,
          width: 1600,
          height: 988,
        },
        sameAs: BRAND_SAME_AS,
      },
    ],
  };

  // The featured slot is the newest article, and it is the page's LCP element —
  // so its photo gets `priority`. Suppressed while searching/filtering, where a
  // large unrelated hero above the results would just be in the way.
  // 디자인의 히어로는 화살표로 넘기는 추천 캐러셀이다. 검색·필터 중에는 결과와
  // 무관한 큰 히어로가 방해만 되므로 그때는 비운다(기존 동작 유지).
  const featuredSlides =
    !query && !category
      ? items.slice(0, 5).map((it) => ({
          slug: it.slug,
          title: it.title,
          excerpt: it.tldr ?? it.meta_description ?? '',
          image: articleImage(it.slug, it.category),
        }))
      : [];
  const featuredSlugs = new Set(featuredSlides.map((f) => f.slug));
  const listItems = featuredSlides.length
    ? pageItems.filter((i) => !featuredSlugs.has(i.slug))
    : pageItems;

  const pageNumbers: number[] = [];
  {
    const from = Math.max(1, Math.min(safePage - 2, totalPages - 4));
    const to = Math.min(totalPages, from + 4);
    for (let p = from; p <= to; p++) pageNumbers.push(p);
  }

  const heading = query
    ? `"${query}" — ${total} ${LABEL_ITEMS[shortLang as RouteLang]}`
    : category
      ? `${localizedCategory(category, shortLang)} · ${total}`
      : LABEL_ALL_ARTICLES[shortLang as RouteLang];

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang} />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />

        {/* FEATURED — mirrors .blog-featured on aihavit.com/blog/ */}
        <section className="blog-featured">
          <div className="hv-container blog-featured__inner">
            <FeaturedCarousel
              slides={featuredSlides}
              basePath={basePath}
              eyebrow={LABEL_LATEST_CONTENT[shortLang as RouteLang]}
              prevLabel={LABEL_PREV[shortLang as RouteLang]}
              nextLabel={LABEL_NEXT[shortLang as RouteLang]}
            >
              <h1 className="text-heading-2">
                HAVIT <span className="text-primary-700">Blog</span>
              </h1>
              <p className="blog-featured__tldr">{HERO_TAGLINE[shortLang as RouteLang]}</p>

              <form method="get" action={basePath}>
                <div className="relative">
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder={SEARCH_PLACEHOLDER[shortLang as RouteLang]}
                    className="w-full px-5 py-3.5 pr-12 rounded-full border text-[15px] focus:outline-none"
                    style={{
                      background: 'var(--hv-surface)',
                      borderColor: 'var(--hv-border)',
                      color: 'var(--hv-fg)',
                    }}
                  />
                  {category && <input type="hidden" name="cat" value={category} />}
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 carousel-arrow"
                    aria-label="Search"
                    style={{ width: 38, height: 38 }}
                  >
                    🔍
                  </button>
                </div>
              </form>
            </FeaturedCarousel>
          </div>
        </section>

        {/* LIST — .blog-list: category rail + post rows */}
        <section className="blog-list">
          <div className="hv-container blog-list__inner">
            {/* SEO crawl-path: category chips are real links to indexable
                /category/<slug> hubs, not an in-page ?cat= filter. */}
            <nav className="blog-categories" aria-label="Article categories">
              <Link
                href={query ? `${basePath}?q=${encodeURIComponent(query)}` : basePath}
                className={`blog-categories__item ${!category ? 'is-active' : ''}`}
              >
                <CategoryIcon src={ALL_CATEGORY_ICON} className="blog-categories__icon" />
                <span className="text-body-medium">{LABEL_ALL[shortLang as RouteLang]}</span>
              </Link>
              {categories.map(([cat, info]) => (
                <Link
                  key={cat}
                  href={`${basePath}/category/${categorySlug(cat)}`}
                  className="blog-categories__item"
                >
                  <CategoryIcon category={cat} className="blog-categories__icon" />
                  <span className="text-body-medium">{localizedCategory(cat, shortLang)}</span>
                </Link>
              ))}
            </nav>

            <div className="blog-list__main">
              <h2 className="text-heading-2 mb-8">{heading}</h2>

              {listItems.length === 0 ? (
                <div
                  className="p-12 text-center rounded-3xl border"
                  style={{ borderColor: 'var(--hv-border)', color: 'var(--hv-fg-subtle)' }}
                >
                  {LABEL_NO_RESULTS[shortLang as RouteLang]}
                </div>
              ) : (
                <div className="post-list">
                  {listItems.map((item, i) => (
                    <Link key={item.slug} className="post-list__item" href={`${basePath}/${item.slug}`}>
                      <div className="post-list__item-text">
                        <h3 className="text-title-large">{item.title}</h3>
                        <p className="text-body-medium line-clamp-2">
                          {item.tldr ?? item.meta_description}
                        </p>
                      </div>
                      <div className="post-list__media">
                        <Image
                          src={articleImage(item.slug, item.category)}
                          alt=""
                          fill
                          sizes="140px"
                          loading={i < 3 ? 'eager' : 'lazy'}
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Pagination">
                  <Link
                    href={pageHref(Math.max(1, safePage - 1))}
                    className="carousel-arrow"
                    aria-label="Previous page"
                    aria-disabled={safePage === 1}
                  >
                    ‹
                  </Link>
                  {pageNumbers.map((p) => (
                    <Link
                      key={p}
                      href={pageHref(p)}
                      className={`pagination__page ${p === safePage ? 'is-active' : ''}`}
                      aria-current={p === safePage ? 'page' : undefined}
                    >
                      {p}
                    </Link>
                  ))}
                  <Link
                    href={pageHref(Math.min(totalPages, safePage + 1))}
                    className="carousel-arrow"
                    aria-label="Next page"
                    aria-disabled={safePage === totalPages}
                  >
                    ›
                  </Link>
                </nav>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
