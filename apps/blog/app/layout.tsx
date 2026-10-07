import type { Metadata, Viewport } from 'next';
import './globals.css';
import { METADATA_BASE, SITE, asset } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  title: {
    default: 'HAVIT Blog — Science-backed wellness guidance',
    template: '%s',
  },
  description:
    'Evidence-based guides on habits, sleep, nutrition, and movement. From the HAVIT wellness team.',
  applicationName: 'HAVIT',
  authors: [{ name: 'HAVIT Editorial' }],
  keywords: ['wellness', 'habits', 'nutrition', 'sleep', 'exercise', 'health', 'HAVIT'],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      // SVG first for the browsers that take one; every file below is the same
      // fixed tile (white ground, black wordmark) and none adapt to the OS theme.
      { url: asset('/favicon.svg'), type: 'image/svg+xml' },
      { url: asset('/favicon.ico') },
      { url: asset('/favicon-16.png'), sizes: '16x16', type: 'image/png' },
      { url: asset('/favicon-32.png'), sizes: '32x32', type: 'image/png' },
      { url: asset('/favicon-192.png'), sizes: '192x192', type: 'image/png' },
      { url: asset('/favicon-512.png'), sizes: '512x512', type: 'image/png' },
    ],
    apple: asset('/apple-touch-icon.png'),
  },
  verification: {
    other: {
      'naver-site-verification': '0533a1862dda218c0632edc4109743f9138bf2ad',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'HAVIT Blog',
    url: SITE,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

/**
 * <html>/<body> 는 여기서 그리지 않는다 — 루트 레이아웃은 params 를 못 받아서
 * 여기 두면 10개 언어 전부 `<html lang="en">` 으로 고정된다(2026-10-07 감사).
 * 언어 라우트는 app/[lang]/layout.tsx 가, 404 는 app/not-found.tsx 가 각자
 * components/DocumentShell 로 문서를 연다. (next-intl 의 표준 패턴, 정적 생성 유지)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
