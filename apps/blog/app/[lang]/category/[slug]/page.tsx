import type { Metadata } from 'next';
import { ALL_CATEGORIES } from '@/lib/categories';
import { CategoryListing, categoryMetadata, ROUTE_LANGS } from '@/components/CategoryListing';

export const dynamicParams = false;
export const revalidate = 600;

export function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of ROUTE_LANGS) {
    for (const cat of ALL_CATEGORIES) {
      params.push({ lang, slug: cat.slug });
    }
  }
  return params;
}

interface Props {
  params: { lang: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, 1);
}

export default function CategoryPage({ params }: Props) {
  return <CategoryListing params={params} page={1} />;
}
