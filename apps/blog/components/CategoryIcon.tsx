import { CATEGORY_ICON_BOX, categoryIcon } from '@/lib/category-icons';

/**
 * 카테고리 아이콘 한 개.
 *
 * 디자인은 24px 정사각 컨테이너 안에 SVG 를 중앙 정렬한다. Figma 에서 내려온
 * SVG 는 크기가 제각각(24×24, 12.11×16, 17.06×17.5 …)인데, 그건 원본 프레임에서
 * inset 퍼센트로 잡혀 있던 값이 그대로 나온 것이다. 그래서 SVG 를 늘리지 않고
 * 자기 크기대로 두고 컨테이너만 24px 로 고정하면 디자인과 정확히 같아진다.
 * (예: inset 16.67% → 24 × 0.667 = 16px = diet-nutrition.svg 의 높이)
 *
 * 장식 요소라서 aria-hidden 이다 — 옆에 카테고리 이름이 글자로 있다.
 */
export function CategoryIcon({
  category,
  src,
  className,
}: {
  /** 카테고리명. src 를 직접 주면 무시된다. */
  category?: string | null;
  /** 전체 목록 pill 처럼 카테고리가 없는 자리에 쓸 직접 경로. */
  src?: string;
  className?: string;
}) {
  const url = src ?? categoryIcon(category);
  if (!url) return null;

  return (
    <span
      aria-hidden
      className={className}
      style={{
        width: CATEGORY_ICON_BOX,
        height: CATEGORY_ICON_BOX,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* next/image 를 쓰지 않는다 — 24px SVG 는 최적화할 여지가 없고,
          /_next/image 를 거치면 오히려 요청이 하나 늘어난다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" width={CATEGORY_ICON_BOX} height={CATEGORY_ICON_BOX} loading="lazy" decoding="async"
           style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }} />
    </span>
  );
}
