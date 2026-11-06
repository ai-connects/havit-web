// 정적 내보내기 전용 next/link 대체(next.config.static.js 의 webpack alias).
// 같은 href·속성의 <a> 를 내되 클라이언트 라우팅·프리페치를 하지 않는다.
// 정적 호스팅에 RSC 페이로드(.txt)를 올리지 않기 때문이다.
import { createElement, forwardRef } from 'react';

const BASE = '/blog';

function toHref(href) {
  if (href && typeof href === 'object') {
    let s = href.pathname || '';
    if (href.query) {
      const q = new URLSearchParams(href.query).toString();
      if (q) s += `?${q}`;
    }
    if (href.hash) s += `#${String(href.hash).replace(/^#/, '')}`;
    href = s;
  }
  if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
    return href === '/' ? BASE : BASE + href;
  }
  return href;
}

const Link = forwardRef(function Link(props, ref) {
  // eslint-disable-next-line no-unused-vars
  const { href, as, prefetch, replace, scroll, shallow, passHref, legacyBehavior, locale, ...rest } = props;
  return createElement('a', { ...rest, href: toHref(as ?? href), ref });
});

export default Link;
