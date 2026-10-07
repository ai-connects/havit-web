import Link from 'next/link';
import { listArticlesForLang } from '@/lib/articles-v2';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCardV2 from '@/components/ArticleCardV2';
import type { Metadata } from 'next';
import DocumentShell from '@/components/DocumentShell';

// 404 should never be indexed (page also returns HTTP 404).
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function NotFound() {
  const recommended = listArticlesForLang('en', 6);

  // 루트 레이아웃이 <html> 을 그리지 않으므로 404 는 자기 문서를 직접 연다.
  return (
    <DocumentShell lang="en">
    <div className="min-h-screen flex flex-col">
      <Header lang="en_us" />
      <main className="flex-1 mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🔍</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Page Not Found</h1>
          <p className="text-base md:text-lg text-gray-600 mb-6">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
          <Link href="/en" className="btn-primary">
            ← Back to Blog
          </Link>
        </div>
        {recommended.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">You might like these</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {recommended.map((item) => (
                <ArticleCardV2 key={item.slug} item={item} shortLang="en" />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer lang="en_us" />
    </div>
    </DocumentShell>
  );
}
