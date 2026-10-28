'use client';

import featureData from '@/data/havit-features.json';
import { type LangKey, t } from '@/lib/i18n';
import { asset, localizedShot } from '@/lib/site';
import { appLinkFor, destinationOf, trackGaEvent, useMobileOS } from '@/lib/download-links';
import { contextualCta } from '@/lib/cta-copy';

/**
 * 본문 중간 설치 블록 — 글 주제에 맞는 앱 기능 하나를 보여준다.
 *
 * 2026-10-27 GA4(9/29~10/26): 블로그 방문자 47,518명 중 설치 클릭 214회(0.45%), 홈페이지는 약 7%.
 * 조회 상위 10개 글은 평균 1~3분을 읽고도 「무료로 시작」이 1회뿐이었다 — 설치 블록이 FAQ·회사 소개 뒤
 * 맨 끝에만 있어 대부분 거기까지 내려가지 않는다. 그래서 읽는 도중, 글 주제와 이어지는 기능으로 한 번 권한다.
 *
 * 문구는 새로 쓰지 않는다: 기능 제목은 홈 #features(data/havit-features.json), 설명 줄은 브랜드 키 카피
 * (installCtaSub = apps/social/lib/brand.mjs TAGLINE), 버튼은 홈 「start-free」. 화면 이미지도 홈 언어판.
 */

type Feature = (typeof featureData.features)[number];
const FEATURES = featureData.features as Feature[];
const COPY = featureData.copy as Record<string, Record<string, string>>;

const GLP1 = /glp|ozempic|wegovy|mounjaro|zepbound|tirzepatide|semaglutide|saxenda|liraglutide|rybelsus|retatrutide|orforglipron/;

/** 카테고리 → 홈 기능(eyebrow_key). 없는 카테고리는 AI 코치. */
const BY_CATEGORY: Record<string, string> = {
  'Diet & Nutrition': 'nutrition',
  'Hydration & Beverages': 'nutrition',
  'Gut Health & Microbiome': 'nutrition',
  'Exercise & Activity': 'running-coach',
  'Weight & Metabolism': 'body-insights',
  'Tracking & Insights': 'body-insights',
  'Longevity & Healthy Aging': 'body-insights',
  'Personalized Strategies': 'body-insights',
  'Sleep & Recovery': 'mind-and-recovery',
  'Mindset & Motivation': 'mind-and-recovery',
  'Mental Health & Stress': 'mind-and-recovery',
  'Lifestyle Habits': 'daily-missions',
};

function featureFor(slug: string, category: string | undefined): Feature {
  const key = GLP1.test(slug) || category === 'Medication Guide'
    ? 'track-everything'
    : (category && BY_CATEGORY[category]) || 'ai-coach';
  return FEATURES.find((f) => f.eyebrow_key === key) ?? FEATURES[0];
}

interface Props {
  lang: LangKey;
  shortLang: string;
  articleId: string;
  slug: string;
  category?: string;
}

export default function MidArticleCTA({ lang, shortLang, articleId, slug, category }: Props) {
  const os = useMobileOS();
  const f = featureFor(slug, category);
  const copy = COPY[shortLang] ?? COPY.en;
  // 실험 대상 글이면 글 주제에 맞춘 제목·버튼(lib/cta-copy.ts), 아니면 홈 기능 제목·「무료로 시작」.
  const ctx = contextualCta(slug, shortLang);
  const placement = 'blog_mid';
  return (
    <aside className="mid-cta not-prose" aria-label="HAVIT">
      <span className="mid-cta__shot" aria-hidden>
        {/* 홈과 같은 언어판 앱 화면. 수십 KB 라 next/image 최적화 이득이 작고, 비율이 기능마다 달라 원본 크기를 쓴다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={'localized' in f && f.localized ? localizedShot(shortLang, f.image) : asset(f.image)} alt="" width={f.width} height={f.height} loading="lazy" />
      </span>
      <div className="mid-cta__text">
        <p className="mid-cta__eyebrow">HAVIT · {copy[f.eyebrow_key]}</p>
        <p className="mid-cta__title">{ctx?.title ?? copy[f.title_key]}</p>
        <p className="mid-cta__sub">{t(lang, 'installCtaSub')}</p>
        <a
          href={appLinkFor(os, placement)}
          onClick={() => trackGaEvent('start_free_click', {
            lang, article_id: articleId, link_location: placement, destination: destinationOf(os), feature: f.eyebrow_key, cta_variant: ctx ? 'contextual' : 'default',
          })}
          className="mid-cta__btn"
        >
          {ctx?.button ?? t(lang, 'installCta')}
        </a>
      </div>
    </aside>
  );
}
