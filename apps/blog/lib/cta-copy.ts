import copy from '@/data/cta-copy.json';

/**
 * 글별 맞춤 설치 문구(본문 중간·하단 블록) — data/cta-experiment.json 의 test 글에만 있다.
 * 없으면 null 이고, 호출부는 기본 문구(기능 제목·「무료로 시작」)를 쓴다.
 * 문구는 scripts/gen-cta-copy.mjs 가 홈페이지 기능 설명만 근거로 만든다.
 */
export interface CtaCopy { title: string; button: string }

const COPY = copy as Record<string, Record<string, CtaCopy>>;

export function contextualCta(slug: string, shortLang: string): CtaCopy | null {
  return COPY[slug]?.[shortLang] ?? null;
}
