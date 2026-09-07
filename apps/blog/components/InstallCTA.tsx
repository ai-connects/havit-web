'use client';

import { type LangKey, t } from '@/lib/i18n';
import { asset } from '@/lib/site';

interface Props {
  lang: LangKey;
  articleId: string;
  variant?: 'inline' | 'sticky';
}

/**
 * PRD §16.2 — Button.primary 정량 spec.
 * inline: 화면당 1개. sticky: mobile only (md:hidden), 화면당 1개. 합계 ≤ 2.
 */
export default function InstallCTA({ lang, articleId, variant = 'inline' }: Props) {
  const universalLink = 'https://app.aihavit.com/';

  function handleClick() {
    // PRD §10.3 GA4 click_install_cta — mock
    if (typeof window !== 'undefined') {
      console.log('[mock] GA4 click_install_cta', {
        lang, article_id: articleId, variant,
      });
    }
  }

  if (variant === 'sticky') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur border-t border-gray-200">
        <a
          href={universalLink}
          onClick={handleClick}
          className="btn-primary w-full"
        >
          📱 {t(lang, 'installCta')}
        </a>
      </div>
    );
  }

  return (
    /* 아티클 하단 전환 블록.
       종전에는 라임→올리브 그라디언트 박스에 "📱 App Store / Play Store" 라는
       텍스트 버튼 하나였다. 이모지가 스토어 배지를 대신하고 있어서 실제 배포
       채널로 읽히지 않았고, 색도 브랜드 라임(#d4ff50)과 다르게 보였다.
       마케팅 사이트(aihavit.com)의 final-cta 와 같은 구성으로 맞춘다 —
       플랫 라임 + 실제 스토어 배지 + 앱 화면. */
    <div className="install-cta">
      <div className="install-cta__text">
        {/* 판이 브랜드 라임(#d4ff50)인데 마크의 그라디언트 바도 같은 #D4FF50 에서
            시작한다. 그냥 올리면 바 왼쪽과 점이 배경에 묻혀 마크가 잘려 보이므로,
            이메일 헤더(apps/web/public/email)와 같은 흰 칩을 깔아 분리한다. */}
        <span className="install-cta__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset('/havit-logo.svg')} alt="HAVIT" width={264} height={163} />
        </span>
        <p className="install-cta__title">{t(lang, 'installCta')}</p>
        <p className="install-cta__sub">{t(lang, 'installCtaSub')}</p>
        <div className="install-cta__badges">
          <a href={universalLink} onClick={handleClick} className="install-cta__badge" aria-label="App Store">
            {/* 5~6KB 고정 크기 PNG 라 next/image 최적화 이득이 없다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/badge-appstore.png')} alt="Download on the App Store" width={168} height={56} />
          </a>
          <a href={universalLink} onClick={handleClick} className="install-cta__badge" aria-label="Google Play">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/badge-googleplay.png')} alt="Get it on Google Play" width={189} height={56} />
          </a>
        </div>
      </div>
      <div className="install-cta__shot" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset('/app-preview.webp')} alt="" width={330} height={670} loading="lazy" />
      </div>
    </div>
  );
}
