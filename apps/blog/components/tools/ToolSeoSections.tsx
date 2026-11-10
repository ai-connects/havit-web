/**
 * 계산기 페이지 공통 FAQ 절 + 구조화 데이터(WebApplication·FAQPage).
 * FAQ 가 없어도 WebApplication 은 넣는다 — 검색 결과에서 무료 계산기임을 알린다.
 */
import { SITE } from '@/lib/site';

interface Props {
  slug: string;
  routeLang: string;
  name: string;
  description: string;
  faqHeader?: string;
  faq?: { q: string; a: string }[];
}

export default function ToolSeoSections({ slug, routeLang, name, description, faqHeader, faq }: Props) {
  const url = `${SITE}/${routeLang}/tools/${slug}`;
  const items = Array.isArray(faq) ? faq : [];
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebApplication',
      name,
      description,
      url,
      inLanguage: routeLang,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ];
  if (items.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      url,
      inLanguage: routeLang,
      mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }

  return (
    <>
      {items.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-3">{faqHeader}</h2>
          {items.map((f) => (
            <div key={f.q} className="mb-4">
              <h3 className="text-lg font-semibold mb-1">{f.q}</h3>
              <p className="text-gray-700 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </section>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }}
      />
    </>
  );
}
