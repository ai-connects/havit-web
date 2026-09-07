import type { Metadata } from 'next';
import { isLangIndexable } from '@/lib/articles-v2';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExerciseCaloriesCalculator from '@/components/tools/ExerciseCaloriesCalculator';
import { EXERCISE_CAL_LABELS, type ToolLang, toToolLang } from '@/lib/tool-labels';
import { toFullLang } from '@/lib/i18n';
import { SITE } from '@/lib/site';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
interface Props { params: { lang: string } }

export function generateStaticParams() { return ROUTE_LANGS.map((lang) => ({ lang })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!ROUTE_LANGS.includes(params.lang as ToolLang)) return { title: 'Not Found' };
  const L = EXERCISE_CAL_LABELS[toToolLang(params.lang)];
  return {
    title: `${L.pageTitle} — HAVIT`,
    description: L.pageIntro,
    // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS).
    robots: isLangIndexable(params.lang)
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      canonical: `${SITE}/${params.lang}/tools/exercise-calories`,
      languages: Object.fromEntries(ROUTE_LANGS.filter(isLangIndexable).map((l) => [l, `${SITE}/${l}/tools/exercise-calories`])),
    },
    openGraph: {
      title: L.pageTitle,
      description: L.pageIntro,
      type: 'website',
      url: `${SITE}/${params.lang}/tools/exercise-calories`,
      siteName: 'HAVIT Blog',
      locale: params.lang,
      images: [{ url: `${SITE}/og-card.png`, width: 1200, height: 630, alt: 'HAVIT Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: L.pageTitle,
      description: L.pageIntro,
      images: [`${SITE}/og-card.png`],
    },
  };
}

export default function ExerciseCaloriesPage({ params }: Props) {
  if (!ROUTE_LANGS.includes(params.lang as ToolLang)) notFound();
  const lang = toToolLang(params.lang);
  const fullLang = toFullLang(lang === 'zh-tw' ? 'zh-tw' : lang === 'zh' ? 'zh-cn' : lang);
  const L = EXERCISE_CAL_LABELS[lang];

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={fullLang} />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 md:px-6 py-8 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="font-bold text-3xl md:text-4xl xl:text-5xl leading-tight mb-3">{L.pageTitle}</h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">{L.pageIntro}</p>
        </header>
        <ExerciseCaloriesCalculator labels={L} lang={lang} />
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-3">{L.aboutHeader}</h2>
          <p className="text-gray-700 leading-relaxed">{L.aboutBody}</p>
        </section>
      </main>
      <Footer lang={fullLang} />
    </div>
  );
}
