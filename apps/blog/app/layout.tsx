import type { Metadata, Viewport } from 'next';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import GoogleAnalytics from '@/components/GoogleAnalytics';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* impact.com affiliate site verification (non-standard `value` attr required by impact.com) */}
        <meta {...{ name: 'impact-site-verification', value: 'cf5ec2a5-ad3b-4112-9e9a-c9451e7c7029' }} />
      </head>
      <body>
        <GoogleAnalytics />
        {children}
        <CookieConsent lang="en_us" />
      </body>
    </html>
  );
}
