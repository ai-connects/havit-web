'use client';

import type { ToolLang } from '@/lib/tool-labels';
import { TOOL_CTA } from '@/lib/tool-cta';
import type { ToolSlug } from '@/lib/tool-seo';
import { localizedShot } from '@/lib/site';
import { appLinkFor, destinationOf, trackGaEvent, useMobileOS } from '@/lib/download-links';

const PLACEMENT = 'blog_tool_section';

export default function HavitToolSection({ lang, tool }: { lang: ToolLang; tool: ToolSlug }) {
  const c = TOOL_CTA[lang];
  const os = useMobileOS();
  if (!c) return null;
  return (
    <section className="mt-12 p-6 md:p-8 rounded-2xl bg-gray-50 border border-gray-200">
      <p className="text-sm font-semibold text-gray-500 mb-1">{c.sectionKicker}</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">{c.sectionTitle}</h2>
      <p className="text-gray-700 leading-relaxed mb-6">{c.sectionIntro}</p>
      <ol className="grid gap-4 mb-6">
        {c.steps.map((s) => (
          <li key={s.label} className={`p-5 rounded-xl bg-white border border-gray-200 ${s.shots.length > 2 ? '' : 'md:flex md:gap-5 md:items-center'}`}>
            <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-500 text-gray-900 whitespace-nowrap shrink-0">{s.label}</span>
              <span className="font-bold text-lg">{s.title}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-2.5">{s.body}</p>
            <ul className="grid gap-1 md:grid-cols-2 text-sm text-gray-800">
              {s.items.map((it) => (
                <li key={it} className="flex gap-1.5"><span aria-hidden>✓</span><span>{it}</span></li>
              ))}
            </ul>
            </div>
            <div className={s.shots.length > 2 ? 'mt-4 grid grid-cols-2 gap-3 md:flex md:justify-center md:gap-2' : 'mt-4 md:mt-0 flex gap-2 justify-center shrink-0'}>
              {s.shots.map((sh) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={sh.file} src={localizedShot(lang, `/havit/${sh.file}`)} alt={sh.alt} loading="lazy" className={`${s.shots.length > 2 ? 'w-full h-44 object-contain md:w-auto md:h-48' : 'h-56 md:h-64 w-auto'} rounded-xl shrink-0 min-w-0`} />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="p-5 rounded-xl bg-white border border-gray-200 mb-6">
        <div className="font-bold mb-3">{c.proofTitle}</div>
        <div className="grid gap-4 md:grid-cols-2">
          {c.proof.map((p) => (
            <div key={p.value}>
              <div className="text-3xl font-bold">{p.value}</div>
              <div className="text-sm text-gray-700">{p.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">{c.proofNote}</p>
      </div>
      <a
        href={appLinkFor(os, PLACEMENT)}
        onClick={() => trackGaEvent('start_free_click', { link_location: PLACEMENT, destination: destinationOf(os), tool })}
        target="_blank"
        rel="noopener"
        className="inline-block px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold transition-colors">
        {c.sectionButton}
      </a>
      <p className="text-xs text-gray-500 mt-3">{c.disclaimer}</p>
    </section>
  );
}
