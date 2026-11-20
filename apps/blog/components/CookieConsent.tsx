'use client';

import { useEffect, useState } from 'react';
import { type LangKey, t } from '@/lib/i18n';

/**
 * PRD §10.1 + §16.1 S-010.
 * 실제: EU/EEA/UK/CH 32개국에서만 노출 (Vercel Edge geo).
 * 프로토타입: localStorage 미설정 시 노출 + dev toggle (URL ?gdpr=force/skip).
 */
export default function CookieConsent({ lang }: { lang: LangKey }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent_v2');
    const url = new URL(window.location.href);
    const force = url.searchParams.get('gdpr');
    if (force === 'force') setOpen(true);
    else if (force === 'skip' || stored) setOpen(false);
    else {
      // 데모를 위해 기본 노출. 실제는 geo 체크.
      setOpen(true);
    }
  }, []);

  function consent(value: 'granted' | 'denied') {
    localStorage.setItem('cookie_consent_v2', value);
    setOpen(false);
    const v = value === 'granted' ? 'granted' : 'denied';
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('consent', 'update', {
      ad_storage: v,
      ad_user_data: v,
      ad_personalization: v,
      analytics_storage: v,
    });
  }

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label={t(lang, 'cookieTitle')}
      className="fixed bottom-4 inset-x-4 md:bottom-6 md:right-6 md:left-auto md:max-w-md z-40 p-5 rounded-2xl shadow-2xl border border-gray-200 bg-white"
    >
      <div className="font-bold text-base mb-1">🍪 {t(lang, 'cookieTitle')}</div>
      <p className="text-sm text-gray-600 mb-4">
        {t(lang, 'cookieDesc')}
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => consent('granted')} className="btn-primary flex-1">
          {t(lang, 'accept')}
        </button>
        <button type="button" onClick={() => consent('denied')} className="btn-secondary flex-1">
          {t(lang, 'decline')}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-3">
        Demo: shown to all visitors. Production: EU/EEA/UK/CH geo only (PRD §10.1).
      </p>
    </div>
  );
}
