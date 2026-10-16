import DocumentShell from '@/components/DocumentShell';
import { toHtmlLang } from '@/lib/i18n';

/**
 * 라우트 언어 → <html lang>. 중국어는 hreflang 과 같은 zh-Hans / zh-Hant(스크립트),
 * 나머지는 og:locale · JSON-LD inLanguage 와 같은 BCP47 변환. lib/i18n.ts toHtmlLang 참조.
 */
function htmlLang(shortLang: string): string {
  return toHtmlLang(shortLang);
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return <DocumentShell lang={htmlLang(params.lang)}>{children}</DocumentShell>;
}
