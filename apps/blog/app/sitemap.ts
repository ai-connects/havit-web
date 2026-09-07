import type { MetadataRoute } from 'next';
import { getAllArticles, resolveContent, isLangIndexable } from '@/lib/articles-v2';
import { ALL_CATEGORIES } from '@/lib/categories';
import { SITE } from '@/lib/site';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
// SEO staging — sitemap lists only indexable (priority) langs so it never submits
// a noindex URL (which GSC flags). Promote a lang via PRIORITY_INDEX_LANGS.
const INDEXABLE_LANGS = ROUTE_LANGS.filter(isLangIndexable);

// 블로그 최초 발행일(2026-05). 일부 아티클 updated_at 이 langs.*.last_updated(2025) 로
// 채워져 런칭 이전(불가능) lastmod 가 새어나가던 문제 → 하한(floor)으로 클램프.
const LAUNCH_FLOOR = new Date('2026-05-23T00:00:00.000Z');
/** lastmod 안전화: 파싱불가/런칭이전 → floor, 미래 → now 로 클램프. */
function safeLastMod(raw: string | undefined, now: Date): Date {
  const d = raw ? new Date(raw) : now;
  if (Number.isNaN(d.getTime()) || d < LAUNCH_FLOOR) return LAUNCH_FLOOR;
  if (d > now) return now;
  return d;
}

/** hreflang alternates for a path template present in all indexable langs (incl. x-default). */
function langAlternates(pathFor: (lang: string) => string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of INDEXABLE_LANGS) out[l] = pathFor(l);
  out['x-default'] = pathFor('en');
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const lang of INDEXABLE_LANGS) {
    entries.push({
      url: `${SITE}/${lang}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: lang === 'en' ? 1.0 : 0.9,
    });
    entries.push({
      url: `${SITE}/${lang}/tools`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
    for (const tool of ['bmr', 'protein', 'water', 'caffeine', 'sleep-cycle', 'exercise-calories']) {
      entries.push({
        url: `${SITE}/${lang}/tools/${tool}`,
        lastModified: now,
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
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: aboutAlternates },
    });
    entries.push({
      url: `${SITE}/${lang}/editorial-policy`,
      lastModified: now,
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
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: { languages: langAlternates((l) => `${SITE}/${l}/articles`) },
    });
    for (const cat of ALL_CATEGORIES) {
      entries.push({
        url: `${SITE}/${lang}/category/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: langAlternates((l) => `${SITE}/${l}/category/${cat.slug}`) },
      });
    }
  }

  for (const a of getAllArticles()) {
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
      alternates['x-default'] = `${SITE}/en/${a.slug}`;
      entries.push({
        url: `${SITE}/${lang}/${a.slug}`,
        lastModified: safeLastMod(a.updated_at, now),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
