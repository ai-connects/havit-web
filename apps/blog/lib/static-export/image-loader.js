// 정적 내보내기 전용 next/image 로더(next.config.static.js 에서만 쓴다).
// (원본, 폭) → /blog/_img/<호스트>/<경로>/<폭>.avif
// 경로를 그대로 담아 두어 빌드 뒤 스크립트가 HTML 만 보고 원본을 되찾는다.
const BASE = '/blog';
const SAFE = /^[A-Za-z0-9._/-]+$/;

export default function staticImageLoader({ src, width }) {
  let key;
  if (/^https?:\/\//.test(src)) {
    const u = new URL(src);
    key = u.hostname + u.pathname;
    if (u.search) key += '/__q/' + u.search.slice(1);
  } else {
    // 로컬 자산은 asset() 이 이미 /blog 를 붙여 준다.
    key = '_local' + (src.startsWith(BASE + '/') ? src.slice(BASE.length) : src);
  }
  if (!SAFE.test(key)) {
    throw new Error(`static image loader: unsupported characters in image src ${src}`);
  }
  return `${BASE}/_img/${key}/${width}.avif`;
}
