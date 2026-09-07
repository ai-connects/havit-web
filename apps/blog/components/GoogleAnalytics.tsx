/**
 * Google Analytics 4 — cross-domain tracking enabled.
 *
 * 환경 변수: NEXT_PUBLIC_GA_ID (예: G-XXXXXXXXXX)
 *   값이 없으면 렌더링 안 함 (개발 환경 안전).
 *
 * 블로그가 www.aihavit.com/blog 로 들어오면서 앱(app.aihavit.com)만이
 * 남은 다른 서브도메인이다 — _ga 쿠키가 .aihavit.com 에 심기므로 그대로 이어진다.
 */

import Script from 'next/script';

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* linker(교차 도메인 측정)는 두지 않는다.
          여기 걸려 있던 목록은 aihavit.com 과 그 서브도메인(www/blog/app)이었는데,
          GA4 는 _ga 쿠키를 .aihavit.com 에 심어 서브도메인끼리 이미 같은 사용자로
          잇는다. 설정이 있으나 마나 집계 결과는 같고, 링크마다 ?_gl=... 만 붙어
          주소가 지저분해졌다. aiconnects.me 도 이제 전 경로가 301 로 넘어와
          그 도메인에 머무는 사용자가 없다.
          GA4 관리자(데이터 스트림 → 태그 설정 구성 → 도메인 구성)의 같은 설정도
          함께 비웠다 — 한쪽만 지우면 다른 쪽이 계속 붙인다. */}
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
