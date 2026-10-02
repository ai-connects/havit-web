'use client';

import { useEffect, useState } from 'react';

/**
 * 다운로드 CTA 목적지 SSOT — 마케팅 사이트(apps/web/src/main.js)와 같은 목적지(app.aihavit.com).
 *
 * OneLink 를 어떻게 만들지(매체·캠페인 판정, PC 는 QR)는 app.aihavit.com(app-link 레포) 한 곳에서 정하고,
 * 여기서는 그 페이지가 AppsFlyer 에 실을 값만 넘긴다. 모바일은 c=homepage + af_channel=blog 로 홈페이지와
 * 구분하고(OneLink 고정 링크 시절과 같은 값 — 리포트 연속성), af_adset 으로 버튼 위치를 남긴다.
 * PC 는 값 없이 APP_URL — af_adset 을 붙이면 app.aihavit.com 이 QR 에 desktop_qr 을 남기지 않아 PC → QR
 * 설치를 구분할 수 없다. 스토어 배지는 PC 에선 각 스토어 직링크다.
 */
export const APP_URL = 'https://app.aihavit.com/';
export const APP_STORE_URL = 'https://apps.apple.com/us/app/havit-glp-1-weight-loss-coach/id6755166023';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.aiconnects.havitWellness';

export type MobileOS = 'ios' | 'android';

/** os 가 null(PC·판정 전)이면 값 없는 APP_URL — 위 desktop_qr 규칙을 호출부마다 지키지 않아도 되게 여기서 가른다. */
export function appLinkFor(os: MobileOS | null, placement: string): string {
  if (!os) return APP_URL;
  return `${APP_URL}?c=homepage&af_channel=blog&af_adset=${encodeURIComponent(placement)}`;
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

/** start_free_click 의 destination — PC 는 웹앱. */
export function destinationOf(os: MobileOS | null): 'app_store' | 'google_play' | 'web' {
  return os ? storeOf(os) : 'web';
}

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void;

/** 이벤트 이름·파라미터는 마케팅 사이트와 같게 둬서 GA4 에서 한 보고서로 본다. */
export function trackGaEvent(name: string, params: Record<string, unknown>): void {
  (window as unknown as { gtag?: Gtag }).gtag?.('event', name, params);
}
