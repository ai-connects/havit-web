'use client';

import { APP_CTA, type ToolLang } from '@/lib/tool-labels';
import { TOOL_CTA } from '@/lib/tool-cta';
import type { ToolSlug } from '@/lib/tool-seo';
import { localizedShot } from '@/lib/site';
import { appLinkFor, destinationOf, trackGaEvent, useMobileOS } from '@/lib/download-links';

const PLACEMENT = 'blog_tool';

export default function AppCtaBanner({ lang, tool }: { lang: ToolLang; tool: ToolSlug }) {
  const c = TOOL_CTA[lang];
  const old = APP_CTA[lang];
  const os = useMobileOS();
  return (
    <div className="mt-6 p-5 rounded-2xl border-2 border-gray-900 bg-primary-50 flex gap-4 items-center">
      <div className="flex-1 min-w-0">
      <div className="font-bold text-base mb-1.5">{c ? c.bannerTitle : old.title}</div>
      {c ? (
        <>
          <p className="text-sm text-gray-600 mb-1.5 leading-relaxed">{c.banner[tool].limit}</p>
          <p className="text-sm text-gray-900 font-medium mb-3 leading-relaxed">{c.banner[tool].havit}</p>
        </>
      ) : (
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{old.body}</p>
      )}
      <a
        href={appLinkFor(os, PLACEMENT)}
        onClick={() => trackGaEvent('start_free_click', { link_location: PLACEMENT, destination: destinationOf(os), tool })}
        target="_blank"
        rel="noopener"
        className="inline-block px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-sm transition-colors">
        {c ? c.bannerButton : old.button}
      </a>
      </div>
      {c?.bannerShot?.[tool] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={localizedShot(lang, `/havit/${c.bannerShot[tool]!.file}`)} alt={c.bannerShot[tool]!.alt} loading="lazy" className="hidden md:block h-40 w-auto rounded-xl shrink-0" />
      )}
    </div>
  );
}
