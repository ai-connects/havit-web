'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { asset } from '@/lib/site';

export interface FeaturedSlide {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
}

/** 자동 전환 간격. 두 줄 발췌를 읽을 시간은 주되 지루하지 않은 값. */
const INTERVAL_MS = 6000;

/**
 * 히어로의 최신 콘텐츠 캐러셀.
 *
 * 디자인(Figma node 3513-415481)은 오른쪽에 사진만 두고 왼쪽 아래에 ‹ › 를
 * 놓았는데, 사진만 바뀌면 화살표가 무엇을 넘기는지 보이지 않는다. 사진 위에
 * 제목과 발췌 두 줄을 얹어 넘기는 대상이 드러나게 했다. 240px 높이와 36px
 * 라운드는 디자인 그대로다.
 *
 * 슬라이드 5장을 **모두** DOM 에 렌더한다. 활성 슬라이드만 보이지만 링크
 * 다섯 개가 HTML 에 남아 크롤 경로가 된다 — 지금 이 도메인은 "발견됨 – 크롤
 * 안 됨" 이 2,000건 넘는 상태라 내부 링크를 줄일 이유가 없다. 같은 이유로
 * URL 쿼리(?f=2)는 쓰지 않는다. 같은 내용의 URL 변형이 생긴다.
 *
 * 자동 전환은 마우스가 올라가거나 키보드 포커스가 들어오면 멈추고,
 * prefers-reduced-motion 이면 처음부터 돌지 않는다.
 */
export default function FeaturedCarousel({
  slides,
  basePath,
  eyebrow,
  prevLabel,
  nextLabel,
  children,
}: {
  slides: FeaturedSlide[];
  basePath: string;
  /** "최신 콘텐츠" 같은 구간 라벨. */
  eyebrow: string;
  prevLabel: string;
  nextLabel: string;
  /** 좌측 컬럼 상단의 정적 문구(제목·설명·검색). */
  children: ReactNode;
}) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (n < 2 || paused || reduced.current) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), INTERVAL_MS);
    return () => clearInterval(t);
  }, [n, paused]);

  const go = (d: number) => setI((p) => (p + d + n) % n);

  return (
    <>
      <div className="blog-featured__text">
        <div className="blog-featured__copy">{children}</div>

        {n > 1 && (
          <div className="blog-featured__nav">
            <button
              type="button"
              className="carousel-arrow"
              onClick={() => go(-1)}
              aria-label={prevLabel}
              aria-controls="featured-carousel"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset('/icons/ui/arrow-left.svg')} alt="" width={36} height={36} />
            </button>
            <button
              type="button"
              className="carousel-arrow"
              onClick={() => go(1)}
              aria-label={nextLabel}
              aria-controls="featured-carousel"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset('/icons/ui/arrow-right.svg')} alt="" width={36} height={36} />
            </button>
          </div>
        )}
      </div>

      {n > 0 && (
        <div
          id="featured-carousel"
          className="blog-featured__deck"
          aria-roledescription="carousel"
          aria-label={eyebrow}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {slides.map((s, idx) => (
            <Link
              key={s.slug}
              className={`blog-featured__media ${idx === i ? 'is-active' : ''}`}
              href={`${basePath}/${s.slug}`}
              aria-hidden={idx !== i}
              tabIndex={idx === i ? undefined : -1}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                sizes="(max-width: 960px) 100vw, 530px"
                priority={idx === 0}
                className="object-cover"
              />
              <div className="blog-featured__caption">
                <span className="blog-featured__eyebrow">{eyebrow}</span>
                <strong className="blog-featured__caption-title">{s.title}</strong>
                {s.excerpt && <span className="blog-featured__caption-text">{s.excerpt}</span>}
              </div>
            </Link>
          ))}

          {n > 1 && (
            <div className="blog-featured__dots" aria-hidden>
              {slides.map((s, idx) => (
                <span key={s.slug} className={idx === i ? 'is-active' : undefined} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
