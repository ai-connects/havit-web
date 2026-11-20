/**
 * Meta 픽셀 — 웹 방문자 리타겟팅용 PageView 만 보낸다.
 *
 * 환경 변수: NEXT_PUBLIC_META_PIXEL_ID. 값이 없으면 렌더링 안 함.
 * 쿠키 배너에서 「거부」(localStorage cookie_consent_v2 = denied)를 고른 방문자에게는 불러오지 않는다.
 * 글 URL 외의 건강 정보는 보내지 않는다(Meta 정책) — 맞춤 이벤트·파라미터 없음.
 */

import Script from 'next/script';

export default function MetaPixel() {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!PIXEL_ID) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        (function () {
          try { if (localStorage.getItem('cookie_consent_v2') === 'denied') return; } catch (e) {}
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        })();
      `}
    </Script>
  );
}
