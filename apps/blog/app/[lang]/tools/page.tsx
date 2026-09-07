import type { Metadata } from 'next';
import { isLangIndexable } from '@/lib/articles-v2';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toFullLang } from '@/lib/i18n';
import { SITE } from '@/lib/site';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
type RouteLang = (typeof ROUTE_LANGS)[number];

interface Props {
  params: { lang: string };
}

export function generateStaticParams() {
  return ROUTE_LANGS.map((lang) => ({ lang }));
}

const PAGE_TITLE: Record<RouteLang, string> = {
  ko: '웰니스 계산기',
  en: 'Wellness Calculators',
  ja: 'ウェルネス計算機',
  zh: '健康计算器',
  'zh-tw': '健康計算機',
  es: 'Calculadoras de Bienestar',
  'pt-br': 'Calculadoras de Bem-estar',
  id: 'Kalkulator Kesehatan',
  de: 'Wellness-Rechner',
  fr: 'Calculatrices de Bien-être',
};

const PAGE_INTRO: Record<RouteLang, string> = {
  ko: '체중·근육·수면·영양 관련 의사결정에 필요한 정확한 숫자를 즉시 계산합니다. 출처 명시, 광고 없음.',
  en: 'Get precise numbers for weight, muscle, sleep, and nutrition decisions. Sources cited, no ads.',
  ja: '体重・筋肉・睡眠・栄養の意思決定に必要な正確な数値を即座に計算します。出典明記、広告なし。',
  zh: '即时计算体重、肌肉、睡眠和营养决策所需的精确数字。来源明确,无广告。',
  'zh-tw': '即時計算體重、肌肉、睡眠和營養決策所需的精確數字。來源明確,無廣告。',
  es: 'Obtén números precisos para decisiones sobre peso, músculo, sueño y nutrición. Con fuentes, sin anuncios.',
  'pt-br': 'Obtenha números precisos para decisões sobre peso, músculo, sono e nutrição. Com fontes, sem anúncios.',
  id: 'Dapatkan angka tepat untuk keputusan tentang berat badan, otot, tidur, dan nutrisi. Sumber tercantum, tanpa iklan.',
  de: 'Präzise Zahlen für Entscheidungen zu Gewicht, Muskeln, Schlaf und Ernährung. Mit Quellenangaben, ohne Werbung.',
  fr: 'Des chiffres précis pour vos décisions sur le poids, les muscles, le sommeil et la nutrition. Sources citées, sans publicité.',
};

const COMING_SOON: Record<RouteLang, string> = {
  ko: '곧 추가 예정',
  en: 'Coming soon',
  ja: '近日公開',
  zh: '即将推出',
  'zh-tw': '即將推出',
  es: 'Próximamente',
  'pt-br': 'Em breve',
  id: 'Segera hadir',
  de: 'Demnächst',
  fr: 'Bientôt disponible',
};

interface Tool {
  slug: string;
  emoji: string;
  title: Record<RouteLang, string>;
  desc: Record<RouteLang, string>;
  ready: boolean;
}

const TOOLS: Tool[] = [
  {
    slug: 'bmr',
    emoji: '🔥',
    ready: true,
    title: {
      ko: 'BMR + TDEE 계산기',
      en: 'BMR + TDEE Calculator',
      ja: 'BMR + TDEE 計算機',
      zh: 'BMR + TDEE 计算器',
      'zh-tw': 'BMR + TDEE 計算機',
      es: 'Calculadora BMR + TDEE',
      'pt-br': 'Calculadora BMR + TDEE',
      id: 'Kalkulator BMR + TDEE',
      de: 'BMR + TDEE Rechner',
      fr: 'Calculatrice BMR + TDEE',
    },
    desc: {
      ko: '기초대사량과 일일 칼로리 소비. 다이어트/근육 증량 목표 설정.',
      en: 'Basal metabolic rate + daily calorie burn. The baseline for any cut, maintain, or bulk plan.',
      ja: '基礎代謝量と1日の消費カロリー。減量・増量目標の基準値。',
      zh: '基础代谢率和每日消耗。减脂、维持、增肌目标的基准。',
      'zh-tw': '基礎代謝率與每日消耗。減脂、維持、增肌目標的基準。',
      es: 'Tasa metabólica basal + gasto diario. La base de cualquier plan.',
      'pt-br': 'Taxa metabólica basal e gasto calórico diário. Base para qualquer plano de cutting/manutenção/bulking.',
      id: 'Tingkat metabolisme basal & pembakaran kalori harian. Dasar untuk rencana defisit/maintenance/surplus.',
      de: 'Grundumsatz und täglicher Kalorienverbrauch. Basis für jeden Cut-, Maintain- oder Bulk-Plan.',
      fr: 'Métabolisme de base et dépense calorique quotidienne. Base de tout plan déficit/maintien/surplus.',
    },
  },
  { slug: 'protein', emoji: '🥚', ready: true, title: { ko: '단백질 필요량', en: 'Protein Needs', ja: 'たんぱく質必要量', zh: '蛋白质需求', 'zh-tw': '蛋白質需求', es: 'Necesidad de Proteína', 'pt-br': 'Necessidade de Proteína', id: 'Kebutuhan Protein', de: 'Proteinbedarf', fr: 'Besoin en Protéines' }, desc: { ko: '체중·목표·연령별 일일 단백질 g.', en: 'Daily protein g by weight, goal, age.', ja: '体重・目標・年齢別の1日たんぱく質g。', zh: '按体重、目标、年龄计算每日蛋白质克数。', 'zh-tw': '按體重、目標、年齡計算每日蛋白質克數。', es: 'Gramos diarios de proteína por peso, objetivo y edad.', 'pt-br': 'Gramas diárias de proteína por peso, objetivo e idade.', id: 'Gram protein harian berdasarkan berat, target, dan usia.', de: 'Tägliches Protein in Gramm nach Gewicht, Ziel und Alter.', fr: 'Grammes de protéines par jour selon poids, objectif et âge.' } },
  { slug: 'water', emoji: '💧', ready: true, title: { ko: '수분 섭취량', en: 'Water Intake', ja: '水分摂取量', zh: '水分摄入量', 'zh-tw': '水分攝取量', es: 'Hidratación', 'pt-br': 'Consumo de Água', id: 'Asupan Air', de: 'Wasseraufnahme', fr: 'Hydratation' }, desc: { ko: '체중·활동·기후 기반 일일 수분.', en: 'Daily water by weight, activity, climate.', ja: '体重・活動・気候別の1日水分。', zh: '基于体重、活动、气候的每日水分。', 'zh-tw': '基於體重、活動、氣候的每日水分。', es: 'Agua diaria por peso, actividad y clima.', 'pt-br': 'Água diária por peso, atividade e clima.', id: 'Air harian berdasarkan berat, aktivitas, dan iklim.', de: 'Täglicher Wasserbedarf nach Gewicht, Aktivität, Klima.', fr: 'Eau quotidienne selon poids, activité et climat.' } },
  { slug: 'caffeine', emoji: '☕', ready: true, title: { ko: '카페인 한계', en: 'Caffeine Limit', ja: 'カフェイン限界', zh: '咖啡因极限', 'zh-tw': '咖啡因極限', es: 'Límite de Cafeína', 'pt-br': 'Limite de Cafeína', id: 'Batas Kafein', de: 'Koffein-Limit', fr: 'Limite de Caféine' }, desc: { ko: '반감기 시뮬레이션으로 수면 안 방해 마지막 시간.', en: 'Half-life simulation: last cup before bedtime.', ja: '半減期シミュレーションで就寝前の最終杯。', zh: '半衰期模拟,睡前最后一杯的时间。', 'zh-tw': '半衰期模擬,睡前最後一杯的時間。', es: 'Simulación de vida media: última taza antes de dormir.', 'pt-br': 'Simulação de meia-vida: última xícara antes de dormir.', id: 'Simulasi waktu paruh: cangkir terakhir sebelum tidur.', de: 'Halbwertszeit-Simulation: letzte Tasse vor dem Schlaf.', fr: 'Simulation de demi-vie : dernière tasse avant le coucher.' } },
  { slug: 'sleep-cycle', emoji: '😴', ready: true, title: { ko: '수면 사이클', en: 'Sleep Cycle', ja: '睡眠サイクル', zh: '睡眠周期', 'zh-tw': '睡眠週期', es: 'Ciclo de Sueño', 'pt-br': 'Ciclo do Sono', id: 'Siklus Tidur', de: 'Schlafzyklus', fr: 'Cycle de Sommeil' }, desc: { ko: '6:30에 일어나려면 몇 시에 자야?', en: 'To wake at 6:30, what time to sleep?', ja: '6:30に起きるには何時に寝る?', zh: '6:30 起床该几点睡?', 'zh-tw': '6:30 起床該幾點睡?', es: '¿A qué hora dormir para despertar a las 6:30?', 'pt-br': 'Para acordar às 6:30, a que horas dormir?', id: 'Untuk bangun jam 6:30, kapan harus tidur?', de: 'Um 6:30 aufwachen — wann ins Bett?', fr: 'Pour se réveiller à 6h30, à quelle heure se coucher ?' } },
  { slug: 'exercise-calories', emoji: '💪', ready: true, title: { ko: '운동 칼로리 소모', en: 'Exercise Calorie Burn', ja: '運動カロリー消費', zh: '运动卡路里消耗', 'zh-tw': '運動卡路里消耗', es: 'Calorías por Ejercicio', 'pt-br': 'Calorias por Exercício', id: 'Kalori per Olahraga', de: 'Sport-Kalorienverbrauch', fr: 'Calories par Exercice' }, desc: { ko: 'METs 기반 운동별 정확한 칼로리.', en: 'METs-based accurate burn by activity.', ja: 'MET基準で運動別の正確なカロリー。', zh: '基于MET的运动卡路里精确计算。', 'zh-tw': '基於MET的運動卡路里精確計算。', es: 'Quema precisa por actividad basada en METs.', 'pt-br': 'Queima precisa por atividade baseada em METs.', id: 'Pembakaran akurat per aktivitas berdasarkan MET.', de: 'Genauer Kalorienverbrauch nach Aktivität basierend auf METs.', fr: 'Dépense précise par activité basée sur les METs.' } },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) return { title: 'Not Found' };
  const lang = params.lang as RouteLang;
  return {
    title: `${PAGE_TITLE[lang]} — HAVIT`,
    description: PAGE_INTRO[lang],
    // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS).
    robots: isLangIndexable(params.lang)
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      canonical: `${SITE}/${lang}/tools`,
      languages: Object.fromEntries(ROUTE_LANGS.filter(isLangIndexable).map((l) => [l, `${SITE}/${l}/tools`])),
    },
    openGraph: {
      title: PAGE_TITLE[lang],
      description: PAGE_INTRO[lang],
      type: 'website',
      url: `${SITE}/${lang}/tools`,
      siteName: 'HAVIT Blog',
      locale: lang,
      images: [{ url: `${SITE}/og-card.png`, width: 1200, height: 630, alt: 'HAVIT Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_TITLE[lang],
      description: PAGE_INTRO[lang],
      images: [`${SITE}/og-card.png`],
    },
  };
}

export default function ToolsIndexPage({ params }: Props) {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) notFound();
  const lang = params.lang as RouteLang;
  const fullLang = toFullLang(lang === 'zh-tw' ? 'zh-tw' : lang === 'zh' ? 'zh-cn' : lang);

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={fullLang} />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 md:px-6 py-8 md:py-12">
        <header className="mb-8 md:mb-10">
          <h1 className="font-bold text-3xl md:text-5xl xl:text-6xl leading-tight mb-3">
            {PAGE_TITLE[lang]}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-prose">
            {PAGE_INTRO[lang]}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {TOOLS.map((tool) => {
            const card = (
              <div className={`p-5 md:p-6 rounded-2xl border h-full flex flex-col gap-2 transition-colors ${tool.ready ? 'border-gray-200 hover:border-primary-500 hover:shadow-md bg-white' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                <div className="text-4xl mb-1">{tool.emoji}</div>
                <h2 className="font-bold text-lg md:text-xl">{tool.title[lang]}</h2>
                <p className="text-sm text-gray-600 flex-1">{tool.desc[lang]}</p>
                {!tool.ready && (
                  <span className="inline-block text-xs uppercase tracking-wider text-gray-500 mt-2">
                    {COMING_SOON[lang]}
                  </span>
                )}
              </div>
            );
            return tool.ready ? (
              <Link key={tool.slug} href={`/${lang}/tools/${tool.slug}`} className="block">
                {card}
              </Link>
            ) : (
              <div key={tool.slug}>{card}</div>
            );
          })}
        </div>
      </main>
      <Footer lang={fullLang} />
    </div>
  );
}
