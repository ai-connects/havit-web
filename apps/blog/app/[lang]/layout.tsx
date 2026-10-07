import DocumentShell from '@/components/DocumentShell';
import { toBcp47, toFullLang } from '@/lib/i18n';

/** 라우트 언어 → <html lang>. og:locale · JSON-LD inLanguage 와 같은 변환을 쓴다. */
function htmlLang(shortLang: string): string {
  const s = shortLang.toLowerCase();
  return toBcp47(toFullLang(s === 'zh-tw' ? 'zh-tw' : s === 'zh' ? 'zh-cn' : s));
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
