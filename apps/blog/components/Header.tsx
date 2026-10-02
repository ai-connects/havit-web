'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { type LangKey, toShortLang, t, INDEXABLE_ROUTE_LANGS } from '@/lib/i18n';
import { asset } from '@/lib/site';
import { appLinkFor, destinationOf, trackGaEvent, useMobileOS } from '@/lib/download-links';

// 블로그가 실제 서빙하는 10개 언어의 native 이름 lookup (현재 언어 이름 표시용).
const TOGGLE_LANGS: { route: string; native: string }[] = [
  { route: 'ko', native: '한국어' },
  { route: 'en', native: 'English' },
  { route: 'ja', native: '日本語' },
  { route: 'zh', native: '简体中文' },
  { route: 'zh-tw', native: '繁體中文' },
  { route: 'es', native: 'Español' },
  { route: 'pt-br', native: 'Português' },
  { route: 'id', native: 'Bahasa Indonesia' },
  { route: 'de', native: 'Deutsch' },
  { route: 'fr', native: 'Français' },
];

// SEO: 색인 대상(타겟) 언어만 스위처에 노출한다. noindex 언어로 내부링크가 새어
// Googlebot이 ~6,200개 noindex 페이지를 반복 재크롤하며 크롤 예산을 낭비하는 것을 차단.
// 노출 언어 집합은 lib/i18n.ts 의 INDEXABLE_ROUTE_LANGS(SSOT)를 따른다.
const VISIBLE_LANGS = TOGGLE_LANGS.filter((l) =>
  (INDEXABLE_ROUTE_LANGS as readonly string[]).includes(l.route)
);

function currentNative(shortLang: string): string {
  return TOGGLE_LANGS.find((l) => l.route === shortLang)?.native ?? 'English';
}

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://www.aihavit.com';

const LABEL_START_FREE: Record<string, string> = {
  en: 'Start Free', ko: '무료로 시작', ja: '無料で始める', zh: '免费开始', 'zh-tw': '免費開始',
  es: 'Empezar gratis', 'pt-br': 'Começar grátis', id: 'Mulai gratis', de: 'Kostenlos starten',
  fr: 'Commencer',
};

interface Props {
  lang: LangKey;
  currentSlug?: string | null;
  currentCategorySlug?: string | null;
  availableLangs?: LangKey[];
}

export default function Header({ lang, currentSlug, currentCategorySlug }: Props) {
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const os = useMobileOS();

  // Marketing-site nav behaviour: the bar is transparent over the top of the
  // page and gains its border + shadow only once content scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function langHrefShort(short: string): string {
    if (currentSlug) return `/${short}/${currentSlug}`;
    if (currentCategorySlug) return `/${short}/c/${currentCategorySlug}`;
    return `/${short}`;
  }

  const shortLang = toShortLang(lang);
  const startFree = LABEL_START_FREE[shortLang] ?? LABEL_START_FREE.en;
  const onStartFreeClick = (placement: string) => () =>
    trackGaEvent('start_free_click', { link_location: placement, destination: destinationOf(os) });

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav__inner">
        <a href={MAIN_SITE} className="nav__logo" aria-label="HAVIT">
          {/* Same brand mark the marketing site uses (apps/web/public). The nav
              band is light, so this is the dark-wordmark asset. */}
          <img src={asset('/havit-logo.svg')} alt="HAVIT" width={264} height={163} />
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href={MAIN_SITE}>HAVIT</a>
          <a href={`${MAIN_SITE}/#features`}>Features</a>
          <Link href={`/${shortLang}`} className="is-active">
            {t(lang, 'blog')}
          </Link>
          <Link href={`/${shortLang}/tools`}>Tools</Link>
          <a href={`${MAIN_SITE}/#faq`}>FAQ</a>
        </nav>

        <div className="flex items-center gap-1">
          {/* Language selector S-008 — PRD §16.4 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn-ghost"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label={t(lang, 'language')}
            >
              <span aria-hidden>🌐</span>
              <span className="ml-1.5 hidden lg:inline text-sm">{currentNative(shortLang)}</span>
            </button>
            {/* 닫혔을 때도 DOM 에 남긴다(hidden). 조건부 렌더면 SSR HTML 에 언어 링크가
                아예 없어서, 아티클 페이지의 언어 바를 걷어낸 뒤 크롤러가 다른 언어판으로
                갈 앵커가 사라진다. hreflang 과 이 링크 둘 다 있는 편이 안전하다. */}
            {(
              <div
                className={`absolute right-0 mt-2 w-56 max-h-[60vh] overflow-y-auto rounded-2xl border shadow-lg p-1.5 z-50 ${open ? '' : 'hidden'}`}
                style={{ background: 'var(--hv-surface)', borderColor: 'var(--hv-border)' }}
                role="listbox"
              >
                <div className="px-3 py-2 text-xs" style={{ color: 'var(--hv-fg-subtle)' }}>
                  {t(lang, 'language')}
                </div>
                {VISIBLE_LANGS.map((opt) => {
                  const active = opt.route === shortLang;
                  return (
                    <Link
                      key={opt.route}
                      href={langHrefShort(opt.route)}
                      onClick={() => setOpen(false)}
                      className={`flex justify-between items-center px-3 py-2 rounded-xl hover:bg-gray-100 ${
                        active ? 'bg-gray-100 font-semibold' : ''
                      }`}
                      role="option"
                      aria-selected={active}
                    >
                      <span className="text-sm">{opt.native}</span>
                      <span className="text-xs" style={{ color: 'var(--hv-fg-subtle)' }}>
                        {active ? '●' : ''}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <a href={appLinkFor(os, 'blog_nav')} onClick={onStartFreeClick('blog_nav')} className="btn btn--primary btn--sm hidden md:inline-flex">
            {startFree}
          </a>

          <button
            type="button"
            onClick={() => setMobileMenu((v) => !v)}
            className="btn-ghost md:hidden"
            aria-label="Menu"
            aria-expanded={mobileMenu}
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenu && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-3"
          style={{ borderColor: 'var(--hv-border)', background: 'var(--hv-surface)' }}
        >
          <a href={MAIN_SITE} className="py-1">HAVIT</a>
          <Link href={`/${shortLang}`} className="py-1">{t(lang, 'blog')}</Link>
          <Link href={`/${shortLang}/articles`} className="py-1">Articles</Link>
          <Link href={`/${shortLang}/tools`} className="py-1">Tools</Link>
          <a href="https://app.aihavit.com/" target="_blank" rel="noopener" className="py-1">App</a>
          <a href={appLinkFor(os, 'blog_nav_menu')} onClick={onStartFreeClick('blog_nav_menu')} className="btn btn--primary btn--sm self-start mt-1">
            {startFree}
          </a>
        </div>
      )}
    </header>
  );
}
