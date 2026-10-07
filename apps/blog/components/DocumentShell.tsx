import CookieConsent from '@/components/CookieConsent';
import GoogleAnalytics from '@/components/GoogleAnalytics';

/** <html>/<body> 골격. app/layout.tsx 주석 참조 — 언어별 lang 을 넣으려고 루트에서 내렸다. */
export default function DocumentShell({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning>
      {/* App Router 문서 골격이라 next/head 대상 아님 — 규칙은 pages/ 용이다. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
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
