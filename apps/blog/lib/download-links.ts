'use client';

import { useEffect, useState } from 'react';

/**
 * 다운로드 CTA 목적지 SSOT — 마케팅 사이트(apps/web/src/main.js)와 같은 규칙.
 *
 * 스토어 직링크로 나가면 설치가 AppsFlyer 에 오가닉으로 잡혀 웹 유입이 사라진다.
 * 모바일은 OneLink 로 보내 설치를 웹에 귀속시키고(c=blog 로 홈페이지와 구분,
 * af_adset 으로 버튼 위치), PC 는 직링크 — OneLink 데스크톱 리다이렉트는 하나뿐이라
 * Google Play 배지도 App Store 로 보내게 되고, app.aihavit.com 은 AppsFlyer
 * redirect allowlist 에 없다.
 */
export const APP_URL = 'https://app.aihavit.com/';
export const APP_STORE_URL = 'https://apps.apple.com/us/app/havit-glp-1-weight-loss-coach/id6755166023';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.aiconnects.havitWellness';
const ONELINK = 'https://havit.onelink.me/crNQ/website';

export type MobileOS = 'ios' | 'android';

export function oneLinkFor(placement: string): string {
  return `${ONELINK}?c=blog&af_adset=${encodeURIComponent(placement)}`;
}

/** iPadOS 는 UA 가 Mac 으로 나오므로 터치 포인트로 가른다. */
function detectMobileOS(): MobileOS | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return null;
}

/** SSR·첫 렌더는 null(PC 직링크) — 하이드레이션 불일치를 피하려고 마운트 후에 판정한다. */
export function useMobileOS(): MobileOS | null {
  const [os, setOs] = useState<MobileOS | null>(null);
  useEffect(() => setOs(detectMobileOS()), []);
  return os;
}

export function storeOf(os: MobileOS): 'app_store' | 'google_play' {
  return os === 'ios' ? 'app_store' : 'google_play';
}

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void;

/** 이벤트 이름·파라미터는 마케팅 사이트와 같게 둬서 GA4 에서 한 보고서로 본다. */
export function trackGaEvent(name: string, params: Record<string, unknown>): void {
  (window as unknown as { gtag?: Gtag }).gtag?.('event', name, params);
}
