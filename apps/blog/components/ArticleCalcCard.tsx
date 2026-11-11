import Link from 'next/link';
import { toToolLang, BMR_LABELS, PROTEIN_LABELS, WATER_LABELS, CAFFEINE_LABELS, SLEEP_CYCLE_LABELS, EXERCISE_CAL_LABELS } from '@/lib/tool-labels';
import { ARTICLE_CTA, articleTool } from '@/lib/article-cta';

const NAMES = { bmr: BMR_LABELS, protein: PROTEIN_LABELS, water: WATER_LABELS, caffeine: CAFFEINE_LABELS, 'sleep-cycle': SLEEP_CYCLE_LABELS, 'exercise-calories': EXERCISE_CAL_LABELS } as const;

/** 글 주제와 이어지는 계산기로 보내는 카드. 계산기 페이지가 다시 앱 분석으로 이어진다. */
export default function ArticleCalcCard({ shortLang, slug, primaryKeywordEn }: { shortLang: string; slug: string; primaryKeywordEn?: string }) {
  const tl = toToolLang(shortLang);
  const a = ARTICLE_CTA[tl];
  const tool = articleTool(slug, primaryKeywordEn);
  if (!a || !tool) return null;
  const name = NAMES[tool][tl].pageTitle;
  return (
    <aside className="not-prose mt-10 p-5 rounded-2xl border border-gray-200 bg-white flex flex-col md:flex-row md:items-center gap-3" aria-label={name}>
      <div className="text-3xl" aria-hidden>🧮</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold mb-1">{a.calcTitle}</p>
        <p className="text-sm text-gray-700">{a.calcBody.replace('{tool}', name)}</p>
      </div>
      <Link href={`/${shortLang}/tools/${tool}`} className="inline-block text-center px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm no-underline shrink-0">
        {a.calcButton}
      </Link>
    </aside>
  );
}
