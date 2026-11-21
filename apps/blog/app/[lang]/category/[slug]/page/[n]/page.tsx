// 카테고리 2쪽 이후 — /<lang>/category/<slug>/page/<n>. 1쪽은 ../../page.tsx.
import type { Metadata } from 'next';
import { ALL_CATEGORIES } from '@/lib/categories';
import { CategoryListing, categoryMetadata, categoryPageCount, ROUTE_LANGS } from '@/components/CategoryListing';

export const dynamicParams = false;
export const revalidate = 600;

export function generateStaticParams() {
  const params: { lang: string; slug: string; n: string }[] = [];
  for (const lang of ROUTE_LANGS) {
    for (const cat of ALL_CATEGORIES) {
      const pages = categoryPageCount(lang, cat.slug);
      for (let p = 2; p <= pages; p++) params.push({ lang, slug: cat.slug, n: String(p) });
    }
  }
  return params;
}

interface Props {
  params: { lang: string; slug: string; n: string };
}

function pageOf(n: string) {
  return /^[1-9][0-9]*$/.test(n) ? Number(n) : 0;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, pageOf(params.n));
}

export default function CategoryPageN({ params }: Props) {
  const page = pageOf(params.n);
  // 1쪽은 /page/1 이 아니라 /category/<slug> 하나만 있다(generateStaticParams 가 2부터).
  return <CategoryListing params={params} page={page < 2 ? 0 : page} />;
}
