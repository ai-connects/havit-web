// 정적 내보내기(S3 + CloudFront 이전용) 설정. STATIC_EXPORT=1 일 때만 쓰인다.
// Vercel 빌드(next build, 이 변수 없음)는 next.config.js 의 원래 객체를 그대로 쓴다.
//
// - output: 'export' — 10개 언어 전 페이지를 HTML 로 찍는다(out/).
// - redirects() 없음 — 정적 호스팅에서는 동작하지 않는다. 같은 규칙을
//   apps/static-site/scripts/rules.mjs 가 이 파일의 redirects() 를 불러 CloudFront Function 으로 옮긴다.
// - next/image → 커스텀 로더. 빌드 뒤 apps/static-site 가 실제 쓰인 (원본, 폭)
//   조합만 AVIF·WebP 로 미리 줄여 /blog/_img/ 아래에 둔다(원본 0.3–3.9 MB 를 그대로
//   내보내지 않기 위해). 바이트는 지금 Vercel 이미지 최적화와 거의 같다.
// - next/link → 평범한 <a>. 정적 판은 RSC 페이로드(.txt, 1.1만 개·약 1 GB)를 올리지 않는다.
//   링크는 전체 페이지 이동이 된다.
const path = require('path');

module.exports = function toStaticConfig(base) {
  // eslint-disable-next-line no-unused-vars
  const { redirects, images, ...rest } = base;
  return {
    ...rest,
    output: 'export',
    images: {
      loader: 'custom',
      loaderFile: './lib/static-export/image-loader.js',
      // Next 기본값에서 2048·3840 과 128 이하를 뺐다. 원본이 대부분 1920 보다 작고,
      // 블로그의 sizes 는 최소 140px 이라 128 이하는 어떤 화면에서도 골리지 않는다.
      // 나머지 폭은 같으므로 브라우저가 고르는 폭, 즉 페이지 무게가 지금과 같다.
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [256, 384],
    },
    webpack(config, ctx) {
      const out = typeof rest.webpack === 'function' ? rest.webpack(config, ctx) : config;
      out.resolve.alias = {
        ...out.resolve.alias,
        'next/link$': path.join(__dirname, 'lib/static-export/link.js'),
      };
      return out;
    },
  };
};
