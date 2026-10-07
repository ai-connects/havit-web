/**
 * MedicalArticleJsonLd — JSON-LD schema injection (PRD §6.3 / INV-003).
 *
 * 분기 (PRD §6.1):
 *   - YMYL category → T1 payload (@type: ["Article", "MedicalWebPage"] + specialty)
 *   - non-YMYL category → T2 payload (@type: "Article", specialty 없음, reviewedBy 유지)
 *
 * 위치: ArticleView 맨 끝 (§7.3 — </article> 직전, InstallCTA sticky 다음).
 * 출력: <script type="application/ld+json">{JSON}</script> (invisible).
 *
 * YMYL set SSOT: lib/articles-v2.ts:YMYL_CATEGORIES_V2 (10개) 재활용 (§6.4).
 *   — 인라인 자체포함 패턴은 lib/i18n.ts 미사용을 위한 것이므로
 *     articles-v2.ts import는 허용 (P0-#2 lib/i18n.ts 미변경 요건 충족).
 */

import type { ArticleV2, ArticleV2LangContent } from '@/lib/articles-v2';
import { isYmylCategory, articleDates } from '@/lib/articles-v2';
import { toBcp47, toFullLang } from '@/lib/i18n';
import { PUBLISHER_ORG, DEFAULT_AUTHOR, DEFAULT_REVIEWER, entitySchema } from '@/lib/team';
import { articleImage } from '@/lib/article-images';
import { SITE } from '@/lib/site';

interface Props {
  article: ArticleV2;
  content: ArticleV2LangContent;
  shortLang: string;
}


// publisher Organization (incl. sameAs) is centralized in lib/team.ts (PUBLISHER_ORG).
// NOTE: this used to be `${SITE}/og-default.png`, a file that does not exist in
// public/ — so every article advertised an unfetchable image to Google, which
// disqualifies Article rich results. Articles now carry a real photo, so the
// schema points at that; the fallback is a file that is actually deployed.
const OG_IMAGE_FALLBACK = `${SITE}/og-card.png`;

interface JsonLdPayload {
  '@context': 'https://schema.org';
  '@type': string | string[];
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified: string;
  inLanguage: string;
  mainEntityOfPage: { '@type': 'WebPage'; '@id': string };
  articleSection: string;
  author: Record<string, unknown>;
  reviewedBy: Record<string, unknown>;
  lastReviewed: string;
  publisher: typeof PUBLISHER_ORG;
  specialty?: { '@type': 'MedicalSpecialty'; name: string };
}

function buildPayload(article: ArticleV2, content: ArticleV2LangContent, shortLang: string): JsonLdPayload {
  const ymyl = isYmylCategory(article.category);
  // 날짜 SSOT = articleDates() — content.last_updated 는 생성 모델이 지어낸 값(2025 등)이다.
  const { published: datePublished, modified: dateModified } = articleDates(article);
  const lastReviewed = dateModified;

  const fullLang = toFullLang(shortLang === 'zh-tw' ? 'zh-tw' : shortLang === 'zh' ? 'zh-cn' : shortLang);
  const inLanguage = toBcp47(fullLang);

  const payload: JsonLdPayload = {
    '@context': 'https://schema.org',
    '@type': ymyl ? ['Article', 'MedicalWebPage'] : 'Article',
    headline: content.title,
    description: content.meta_description ?? content.tldr ?? '',
    image: [articleImage(article.slug, article.category) || OG_IMAGE_FALLBACK],
    datePublished,
    dateModified,
    inLanguage,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE}/${shortLang}/${article.slug}`,
    },
    articleSection: article.category,
    author: entitySchema(DEFAULT_AUTHOR, shortLang),
    reviewedBy: entitySchema(DEFAULT_REVIEWER, shortLang),
    lastReviewed,
    publisher: PUBLISHER_ORG,
  };

  if (ymyl) {
    // PRD §6.3 T1 — specialty (YMYL 한정)
    payload.specialty = {
      '@type': 'MedicalSpecialty',
      name: 'PublicHealth',
    };
  }

  return payload;
}

export default function MedicalArticleJsonLd({ article, content, shortLang }: Props) {
  const payload = buildPayload(article, content, shortLang);
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 결과는 사용자 입력 미포함 (article JSON 정적 파일 출처) — XSS 위험 없음
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
