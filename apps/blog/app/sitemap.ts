import type { MetadataRoute } from 'next';
import { getAllArticles, resolveContent, isLangIndexable, articleDates } from '@/lib/articles-v2';
import { ALL_CATEGORIES } from '@/lib/categories';
import { SITE } from '@/lib/site';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
// SEO staging — sitemap lists only indexable (priority) langs so it never submits
// a noindex URL (which GSC flags). Promote a lang via PRIORITY_INDEX_LANGS.
const INDEXABLE_LANGS = ROUTE_LANGS.filter(isLangIndexable);

// lastmod 는 "정확할 때만" 의미가 있다. Google 은 사이트 단위로 lastmod 를 검증해서
// 틀린 값이 섞이면 전부 무시한다. 그래서:
//  - 아티클 = articleDates() 의 실측 시각 (생성 모델이 지어낸 last_updated 아님)
//  - 목록/카테고리 허브 = 그 안 아티클 중 가장 최근 시각 (새 글이 붙을 때만 바뀜)
//  - tools/about/editorial-policy = lastmod 생략. 예전엔 빌드 시각(now)을 찍어서
//    배포할 때마다 260개 URL 이 "방금 바뀜" 을 주장했다.
// 2026-10-07 GSC URL 검사 표본: 미색인의 대부분이 "발견됨 — 미색인"(크롤 대기)이라
// 무엇을 먼저 크롤할지 알려주는 이 신호가 지금 가장 쓸모 있다.

/** hreflang alternates for a path template present in all indexable langs (incl. x-default). */
function langAlternates(pathFor: (lang: string) => string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of INDEXABLE_LANGS) out[l] = pathFor(l);
  out['x-default'] = pathFor('en');
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const articles = getAllArticles();
  const modifiedOf = new Map(articles.map((a) => [a.slug, articleDates(a).modified]));
  const newest = (list: typeof articles) =>
    list.reduce<string | undefined>((m, a) => {
      const d = modifiedOf.get(a.slug)!;
      return !m || d > m ? d : m;
    }, undefined);
  const newestAll = newest(articles);
  const newestByCategory = new Map(
    ALL_CATEGORIES.map((c) => [c.slug, newest(articles.filter((a) => a.category === c.value))]),
  );

  for (const lang of INDEXABLE_LANGS) {
    entries.push({
      url: `${SITE}/${lang}`,
      lastModified: newestAll,
      changeFrequency: 'daily',
      priority: lang === 'en' ? 1.0 : 0.9,
    });
    entries.push({
      url: `${SITE}/${lang}/tools`,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
    for (const tool of ['bmr', 'protein', 'water', 'caffeine', 'sleep-cycle', 'exercise-calories']) {
      entries.push({
        url: `${SITE}/${lang}/tools/${tool}`,
          changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  // BLOG_AUTHORITY v1.0.0 (PRD §13.2.3 / §7.1 Step 5 / INV-007) —
  // 12 신규 entry (about×6 lang + editorial-policy×6 lang). 각 entry는
  // 6 lang hreflang alternates 포함 (entry 카운트 아님 — sub-element).
  // 총 sitemap entry = 6,536 (기존) + 12 (신규) = 6,548.
  for (const lang of INDEXABLE_LANGS) {
    const aboutAlternates: Record<string, string> = {};
    const policyAlternates: Record<string, string> = {};
    for (const other of INDEXABLE_LANGS) {
      aboutAlternates[other] = `${SITE}/${other}/about`;
      policyAlternates[other] = `${SITE}/${other}/editorial-policy`;
    }
    aboutAlternates['x-default'] = `${SITE}/en/about`;
    policyAlternates['x-default'] = `${SITE}/en/editorial-policy`;

    entries.push({
      url: `${SITE}/${lang}/about`,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: aboutAlternates },
    });
    entries.push({
      url: `${SITE}/${lang}/editorial-policy`,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: policyAlternates },
    });
  }

  // SEO crawl-path: article archive + category hub pages (present in all 10 langs).
  // These give Google a shallow path to every article (fixes "Discovered — not indexed").
  for (const lang of INDEXABLE_LANGS) {
    entries.push({
      url: `${SITE}/${lang}/articles`,
      lastModified: newestAll,
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: { languages: langAlternates((l) => `${SITE}/${l}/articles`) },
    });
    for (const cat of ALL_CATEGORIES) {
      entries.push({
        url: `${SITE}/${lang}/category/${cat.slug}`,
        lastModified: newestByCategory.get(cat.slug),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: langAlternates((l) => `${SITE}/${l}/category/${cat.slug}`) },
      });
    }
  }

  for (const a of articles) {
    for (const lang of INDEXABLE_LANGS) {
      const r = resolveContent(a, lang);
      if (!r || r.fallback) continue;
      const alternates: Record<string, string> = {};
      for (const other of INDEXABLE_LANGS) {
        const rr = resolveContent(a, other);
        if (rr && !rr.fallback) {
          alternates[other] = `${SITE}/${other}/${a.slug}`;
        }
      }
      // en 원문이 없는 아티클(5건)까지 x-default 를 달면 404 를 가리킨다.
      // Google 은 클러스터 구성원 하나가 죽으면 그 hreflang 묶음을 통째로 버린다.
      if (alternates['en']) alternates['x-default'] = `${SITE}/en/${a.slug}`;
      entries.push({
        url: `${SITE}/${lang}/${a.slug}`,
        lastModified: modifiedOf.get(a.slug),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
