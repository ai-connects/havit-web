import { asset } from './site';
/**
 * 카테고리 아이콘 — Figma 디자인 시스템에서 내려온 SVG.
 *
 * 이전에는 아티클 JSON 의 `category_emoji` 를 그대로 썼는데, 그 값이 카테고리가
 * 아니라 **아티클마다** 붙어 있어서 같은 카테고리가 화면마다 다른 그림으로
 * 보였다. 실측하면 Diet & Nutrition 이 🥗 와 📱 둘 다, Exercise & Activity 가
 * 🏃 와 💪, Lifestyle Habits 는 🧊 🌿 🌏 세 개를 갖고 있었다. 사이드바가 어떤
 * 아이콘을 쓸지는 "그 카테고리에서 먼저 스캔된 아티클" 이 정하는 구조였다.
 *
 * 카테고리 → 아이콘을 여기서 1:1 로 고정한다.
 *
 * 출처: HAVIT 2.1 Design System, node 3513-415481 (Blog Desktop).
 * SVG 는 public/icons/category/ 에 커밋돼 있다 — Figma 에셋 URL 은 7일 뒤 만료되므로
 * 링크로 두지 않는다.
 */

/** 디자인의 24px 컨테이너 규격. SVG 는 자기 크기대로 그 안에 중앙 정렬된다. */
export const CATEGORY_ICON_BOX = 24;

const BASE = asset('/icons/category');

/**
 * 디자인에 정의된 12개 카테고리.
 *
 * 블로그는 15개를 쓰고 있어 3개(Gut Health & Microbiome, Longevity & Healthy
 * Aging, Mental Health & Stress)는 디자인에 아이콘이 없다. 없는 그림을 새로
 * 그리면 디자인 시스템 밖의 자산이 생기므로, 뜻이 가장 가까운 기존 아이콘을
 * 임시로 쓰고 아래 NEEDS_DESIGN 에 남겨 둔다.
 */
const ICONS: Record<string, string> = {
  'Diet & Nutrition': `${BASE}/diet-nutrition.svg`,
  'Mindset & Motivation': `${BASE}/mindset-motivation.svg`,
  'Personalized Strategies': `${BASE}/personalized-strategies.svg`,
  'Exercise & Activity': `${BASE}/exercise-activity.svg`,
  'Medication Guide': `${BASE}/medication-guide.svg`,
  'Hydration & Beverages': `${BASE}/hydration-beverages.svg`,
  'Sleep & Recovery': `${BASE}/sleep-recovery.svg`,
  'Situational Tips': `${BASE}/situational-tips.svg`,
  'Tracking & Insights': `${BASE}/tracking-insights.svg`,
  'Weight & Metabolism': `${BASE}/weight-metabolism.svg`,
  'Health & Conditions': `${BASE}/health-conditions.svg`,
  'Lifestyle Habits': `${BASE}/lifestyle-habits.svg`,

  // ── 디자인 미정의. 전용 아이콘이 나오면 위 블록으로 옮긴다. ──
  // 장 건강은 소화·식이와 같은 계열이라 Diet 아이콘을 쓴다.
  'Gut Health & Microbiome': `${BASE}/diet-nutrition.svg`,
  // 정신 건강은 Mindset 과 같은 뇌 아이콘이 의미상 가장 가깝다.
  'Mental Health & Stress': `${BASE}/mindset-motivation.svg`,
  // 항노화는 건강 상태 전반에 걸쳐 있어 Health & Conditions 를 쓴다.
  'Longevity & Healthy Aging': `${BASE}/health-conditions.svg`,
};

/** 디자이너에게 전용 아이콘을 요청해야 하는 카테고리. */
export const NEEDS_DESIGN = [
  'Gut Health & Microbiome',
  'Mental Health & Stress',
  'Longevity & Healthy Aging',
] as const;

/** 전체 목록 pill 에 쓰는 아이콘. */
export const ALL_CATEGORY_ICON = `${BASE}/all.svg`;

/**
 * 카테고리의 아이콘 경로. 목록에 없는 카테고리가 새로 생기면 null 을 돌려주고,
 * 호출부는 아이콘을 생략한다 — 아무 그림이나 붙이는 것보다 없는 편이 낫다.
 */
export function categoryIcon(category?: string | null): string | null {
  if (!category) return null;
  return ICONS[category] ?? null;
}
