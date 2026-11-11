'use client';

import type { LangKey } from '@/lib/i18n';
import { toToolLang } from '@/lib/tool-labels';
import { TOOL_CTA } from '@/lib/tool-cta';
import { ARTICLE_CTA, FOCUS_SHOT, articleFocus } from '@/lib/article-cta';
import { localizedShot } from '@/lib/site';
import { appLinkFor, destinationOf, trackGaEvent, useMobileOS } from '@/lib/download-links';
import MidArticleCTA from './MidArticleCTA';

const PLACEMENT = 'blog_mid';

interface Props { lang: LangKey; shortLang: string; articleId: string; slug: string; category?: string }

/** 글 중간 설치 블록 — 분석·숫자 목표 메시지. 문구가 없는 언어는 기존 MidArticleCTA. */
export default function ArticleHavitCta(props: Props) {
  const { lang, shortLang, articleId, slug, category } = props;
  const os = useMobileOS();
  const tl = toToolLang(shortLang);
  const a = ARTICLE_CTA[tl];
  const c = TOOL_CTA[tl];
  if (!a || !c) return <MidArticleCTA {...props} />;
  const focus = articleFocus(slug, category);
  const f = a.focus[focus];
  return (
    <aside className="not-prose my-10 p-5 md:p-6 rounded-2xl border-2 border-primary-500 bg-primary-50 flex gap-5 items-center" aria-label="HAVIT">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 mb-1">{c.sectionKicker}</p>
        <p className="font-bold text-lg mb-2 leading-snug">{a.midTitle}</p>
        <p className="text-sm text-gray-600 mb-1.5 leading-relaxed">{f.limit}</p>
        <p className="text-sm text-gray-900 font-medium mb-4 leading-relaxed">{f.havit}</p>
        <a
          href={appLinkFor(os, PLACEMENT)}
          onClick={() => trackGaEvent('start_free_click', { lang, article_id: articleId, link_location: PLACEMENT, destination: destinationOf(os), feature: focus, cta_variant: 'value_prop' })}
          target="_blank"
          rel="noopener"
          className="inline-block px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold text-sm transition-colors no-underline">
          {a.midButton}
        </a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={localizedShot(shortLang, `/havit/${FOCUS_SHOT[focus]}`)} alt="" loading="lazy" className="hidden md:block h-48 w-auto rounded-xl shrink-0" />
    </aside>
  );
}
