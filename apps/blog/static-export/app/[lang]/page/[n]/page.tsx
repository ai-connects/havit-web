// 블로그 홈의 2쪽 이후 — 정적 내보내기(STATIC_EXPORT=1) 전용.
// apps/static-site/scripts/build.mjs 가 정적 빌드 동안만 app/[lang]/page/[n]/ 로 복사한다
// (Vercel 앱에는 없다 — 그쪽은 홈이 ?page=N 을 요청마다 렌더한다).
// 메타데이터(canonical = /<lang>)는 홈과 같다 — 운영의 ?page=N 과 같은 신호.
import BlogIndexPage, { generateMetadata as homeMetadata } from '../../page';
import { listArticlesForLang } from '@/lib/articles-v2';
import { STATIC_SEARCH_PARAMS } from '@/lib/static-export/search-params';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'];
const PAGE_SIZE = 12; // app/[lang]/page.tsx 와 같아야 한다.

export const dynamicParams = false;

export function generateStaticParams() {
  if (process.env.STATIC_EXPORT !== '1') return [];
  return ROUTE_LANGS.flatMap((lang) => {
    const pages = Math.ceil(listArticlesForLang(lang).length / PAGE_SIZE);
    return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ lang, n: String(i + 2) }));
  });
}

type Props = { params: { lang: string; n: string } };

export function generateMetadata({ params }: Props) {
  return homeMetadata({ params: { lang: params.lang }, searchParams: {} });
}

export default function BlogIndexPageN({ params }: Props) {
  const searchParams = { page: params.n };
  STATIC_SEARCH_PARAMS.add(searchParams);
  return BlogIndexPage({ params: { lang: params.lang }, searchParams });
}
