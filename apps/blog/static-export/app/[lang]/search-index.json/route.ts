// 블로그 홈 검색(?q=)용 색인 — 정적 내보내기(STATIC_EXPORT=1) 전용.
// components/StaticSearch.tsx 가 검색할 때만 받아 간다. 정적 빌드 동안만 app/ 로
// 복사된다(apps/static-site/scripts/build.mjs). Vercel 에서는 홈이 서버에서 직접 검색한다.
import { listArticlesForLang } from '@/lib/articles-v2';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'];

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return process.env.STATIC_EXPORT === '1' ? ROUTE_LANGS.map((lang) => ({ lang })) : [];
}

export function GET(_req: Request, { params }: { params: { lang: string } }) {
  const items = listArticlesForLang(params.lang).map((i) => ({
    s: i.slug,
    t: i.title,
    d: i.tldr ?? i.meta_description ?? '',
  }));
  return Response.json(items);
}
