import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleView from '@/components/ArticleView';
import HubArticleView from '@/components/HubArticleView';
import { getArticleBySlug, resolveContent, getAllArticles, PRIMARY_LANGS, isLangIndexable } from '@/lib/articles-v2';
import { articleImage } from '@/lib/article-images';
import { toFullLang } from '@/lib/i18n';
import { SITE } from '@/lib/site';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
type RouteLang = (typeof ROUTE_LANGS)[number];

interface Props {
  params: { lang: string; slug: string };
}

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const a of getAllArticles()) {
    for (const lang of ROUTE_LANGS) {
      const r = resolveContent(a, lang);
      if (r && !r.fallback) params.push({ lang, slug: a.slug });
    }
  }
  return params;
}

// Social preview used to be the HAVIT wordmark on every one of ~11k article
// URLs — identical thumbnails across the whole site. Each article now has its
// own photo (lib/article-images.ts), so share cards are distinct per article.
const OG_IMAGE_FALLBACK = `${SITE}/og-card.png`;
// HTML <title> CTR target: keep core keywords visible in Google SERP without a
// trailing " — HAVIT Blog" suffix (Google often appends site name automatically
// via og:site_name + Organization schema). 50 chars leaves room without cutoff.
const TITLE_MAX_LEN = 50;
const DESC_MAX_LEN = 158; // Google snippet ≈ 158 chars on desktop, 130 on mobile

/**
 * Truncate title for HTML <title> only — at a sentence/clause boundary if possible.
 * og:title and body H1 keep the full title.
 */
function truncateTitle(full: string, max = TITLE_MAX_LEN): string {
  if (full.length <= max) return full;
  // Prefer splitting at em-dash, colon, or " — " / " : "
  const splitters = [' — ', ' – ', ': ', ' | ', ' / '];
  for (const s of splitters) {
    const idx = full.indexOf(s);
    if (idx > 10 && idx <= max) return full.slice(0, idx).trim();
  }
  // Fallback — hard truncate at last space before max
  const cut = full.lastIndexOf(' ', max - 1);
  return (cut > 20 ? full.slice(0, cut) : full.slice(0, max - 1)).trimEnd() + '…';
}

/**
 * Truncate description for HTML meta only — break at sentence boundary.
 * og:description and JSON-LD description keep the full text.
 */
function truncateDescription(full: string | undefined, max = DESC_MAX_LEN): string | undefined {
  if (!full) return full;
  if (full.length <= max) return full;
  // Prefer sentence end (. ? !) within range
  for (const punct of ['. ', '? ', '! ']) {
    const idx = full.lastIndexOf(punct, max);
    if (idx > 60) return full.slice(0, idx + 1).trim();
  }
  // Fallback — last space before max
  const cut = full.lastIndexOf(' ', max - 1);
  return (cut > 40 ? full.slice(0, cut) : full.slice(0, max - 1)).trimEnd() + '…';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) return { title: 'Not Found — HAVIT Blog' };
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: 'Not Found — HAVIT Blog' };
  const r = resolveContent(article, params.lang);
  if (!r) return { title: 'Not Found — HAVIT Blog' };
  const { content } = r;
  const fullDescription = content.meta_description ?? content.tldr ?? undefined;
  const htmlDescription = truncateDescription(fullDescription);
  // Prefer hand-tuned short_title (high-CTR pattern) when available;
  // otherwise auto-truncate the full title. No brand suffix — Google often
  // appends site name via og:site_name + Organization schema, and the extra
  // characters get cut off in the SERP anyway.
  const htmlTitle = content.short_title?.trim() || truncateTitle(content.title);

  // SEO v1.2 — Fallback de-duplication strategy:
  // When this lang has no native translation and the user is being shown the
  // English fallback, instruct Google to:
  //   - noindex this page (stop duplicating EN content across 10 lang URLs)
  //   - canonical → /en/<slug> (consolidate authority to the original)
  //   - follow links (preserve internal link equity)
  // This addresses the GSC "Crawled — currently not indexed" cluster caused
  // by Google treating 10 lang URLs of the same EN body as duplicates.
  const isFallback = r.fallback === true;
  // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS). Non-
  // priority native pages stay noindex/follow until promoted; canonical remains
  // self (distinct language), only the index signal is gated.
  const indexable = !isFallback && isLangIndexable(params.lang);
  const canonicalUrl = isFallback
    ? `${SITE}/en/${params.slug}`
    : `${SITE}/${params.lang}/${params.slug}`;

  const ogImage = articleImage(params.slug, article.category) || OG_IMAGE_FALLBACK;

  return {
    title: htmlTitle,
    description: htmlDescription,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      canonical: canonicalUrl,
      // hreflang cluster lists only indexable (priority + native) langs, so every
      // alternate Google sees is itself indexable — no noindex/hreflang conflict.
      languages: Object.fromEntries(
        ROUTE_LANGS.filter((l) => {
          const rr = resolveContent(article, l);
          return rr && !rr.fallback && isLangIndexable(l);
        }).map((l) => [l, `${SITE}/${l}/${params.slug}`]),
      ),
    },
    openGraph: {
      title: content.title,
      description: fullDescription,
      type: 'article',
      url: `${SITE}/${params.lang}/${params.slug}`,
      siteName: 'HAVIT Blog',
      locale: params.lang,
      images: [
        {
          url: ogImage,
          alt: content.title,
        },
      ],
      publishedTime: article.published_at ?? content.last_updated ?? undefined,
      modifiedTime: content.last_updated ?? article.updated_at ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: fullDescription,
      images: [ogImage],
    },
  };
}

const LANG_LABELS: Record<RouteLang, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '简体中文',
  'zh-tw': '繁體中文',
  es: 'Español',
  'pt-br': 'Português',
  id: 'Indonesia',
  de: 'Deutsch',
  fr: 'Français',
};

const LANG_SWITCHER_LABEL: Record<RouteLang, string> = {
  ko: '언어',
  en: 'Language',
  ja: '言語',
  zh: '语言',
  'zh-tw': '語言',
  es: 'Idioma',
  'pt-br': 'Idioma',
  id: 'Bahasa',
  de: 'Sprache',
  fr: 'Langue',
};

export default function ArticlePage({ params }: Props) {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) notFound();
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();
  const r = resolveContent(article, params.lang);
  if (!r) notFound();

  const fullLang = toFullLang(params.lang === 'zh-tw' ? 'zh-tw' : params.lang === 'zh' ? 'zh-cn' : params.lang);

  const availability: Record<RouteLang, boolean> = {
    ko: false, en: false, ja: false, zh: false, 'zh-tw': false, es: false,
    'pt-br': false, id: false, de: false, fr: false,
  };
  for (const l of ROUTE_LANGS) {
    const rr = resolveContent(article, l);
    availability[l] = !!(rr && !rr.fallback);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={fullLang} currentSlug={params.slug} availableLangs={['en_us', 'ko_kr', 'ja_jp', 'zh_cn', 'zh_tw', 'es_es']} />
      <main className="flex-1">
        {/* 언어 전환 바 제거 — 헤더 우측 🌐 선택기와 완전히 중복이었다.
            크롤 경로는 잃지 않는다: (a) <head> 의 hreflang alternates 가 그대로이고
            (b) Header 의 언어 드롭다운을 SSR 에 남겨 <a> 링크가 HTML 에 존재한다. */}

        {/* GLP-1 SEO 허브 61건은 헤드 키워드를 받는 훑어보기용이라 전용 레이아웃을
            쓴다(목차 · 짧은 문단 · 카드/스텝 · 섹션 사진). 나머지 1,035건은 기존
            ArticleView 그대로. 분기는 JSON 의 layout 필드 하나로만 한다. */}
        {(article as { layout?: string }).layout === 'hub' ? (
          <HubArticleView article={article} content={r.content} shortLang={params.lang} fallback={r.fallback} />
        ) : (
          <ArticleView article={article} content={r.content} shortLang={params.lang} fallback={r.fallback} />
        )}
      </main>
      <Footer lang={fullLang} />
    </div>
  );
}
