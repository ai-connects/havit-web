// CloudFront Function (cloudfront-js-2.0, viewer-request) — www.aihavit.com 정적 사이트의 라우팅.
//
// 지금 Vercel 이 하는 일을 같은 순서로 한다:
//   1. 호스트: blog.aihavit.com(옛 서브도메인) · aihavit.com(apex) → www 로 308
//   2. apps/web/vercel.json redirects (308)
//   3. apps/web/middleware.js — /blog 빠진 블로그 URL 301, 첫 방문 언어 302(쿠키 hv_lang, Vary)
//   4. apps/blog/next.config.js redirects — 끝 찌꺼기 정규식 308, 병합 slug 308(KeyValueStore)
//   5. 깨끗한 URL → S3 키 (/blog/ko/x → blog/ko/x.html, /ko/ → ko/index.html)
//
// 이 런타임은 ES5.1 + 일부(const/let, 화살표, 템플릿 문자열, async/await, 나머지 매개변수)만 된다.
// Set·Map·구조분해·?.·?? 를 쓰지 말 것. 빌드(scripts/build-edge.mjs)가 __DATA__ 를 채우고
// 공백·주석을 줄인다(크기 한도 10 KB). 병합 slug 표(160개)는 크기 때문에 KeyValueStore(`m:<옛 slug>`)에 둔다.
import cf from 'cloudfront';

const D = __DATA__;
const kvs = cf.kvs(D.kvsId);
const WWW = 'https://www.aihavit.com';

function has(list, v) {
  return list.indexOf(v) !== -1;
}

function qs(q) {
  const out = [];
  Object.keys(q || {}).forEach((k) => {
    const e = q[k];
    const vals = e.multiValue ? e.multiValue.map((m) => m.value) : [e.value];
    vals.forEach((v) => out.push(v === '' ? k : `${k}=${v}`));
  });
  return out.length ? `?${out.join('&')}` : '';
}

function go(status, location, extra) {
  const r = { statusCode: status, statusDescription: D.text[status], headers: { location: { value: location } } };
  if (extra) Object.assign(r, extra);
  return r;
}

async function merged(slug) {
  try {
    return await kvs.get(`m:${slug}`);
  } catch (e) {
    return null;
  }
}

// ── apps/web/middleware.js 이식(scripts/test-edge.mjs 가 원본과 결과를 대조한다) ──
function toLocale(tag) {
  if (has(D.locales, tag)) return tag;
  if (D.alias[tag]) return D.alias[tag];
  const base = tag.split('-')[0];
  if (base === 'zh') return /(^|-)(hant|tw|hk|mo)(-|$)/.test(tag) ? 'zh-tw' : 'zh-cn';
  if (D.alias[base]) return D.alias[base];
  return has(D.locales, base) ? base : null;
}

function pickLocale(header) {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part, i) => {
      const bits = part.trim().split(';');
      const q = bits.slice(1).map((p) => p.trim()).find((p) => p.startsWith('q='));
      const w = q === undefined ? 1 : Number.parseFloat(q.slice(2));
      return { tag: bits[0].trim().toLowerCase(), q: Number.isFinite(w) ? w : 0, i: i };
    })
    .filter((e) => e.tag && e.tag !== '*' && e.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (let k = 0; k < ranked.length; k++) {
    const l = toLocale(ranked[k].tag);
    if (l) return l;
  }
  return null;
}

function toBlogLang(l) {
  return has(D.blogLangs, l) ? l : D.blogAlias[l] || D.def;
}

function langRedirect(to, locale, setCookie) {
  const extra = { headers: { location: { value: to }, 'cache-control': { value: 'no-store' }, vary: { value: 'Accept-Language, Cookie' } } };
  if (setCookie) extra.cookies = { hv_lang: { value: locale, attributes: 'Path=/; Max-Age=31536000; SameSite=Lax; Secure' } };
  return go(302, to, extra);
}

async function strayTarget(path) {
  const m = /^\/([a-z]{2}(?:-[a-z]{2})?)(?:\/(.*))?$/.exec(path);
  if (!m || !has(D.blogLangs, m[1])) return null;
  const lang = m[1];
  const parts = (m[2] || '').split('/').filter(Boolean);
  if (parts.length === 0) return has(D.blogOnly, lang) ? `/blog/${lang}` : null;
  if (parts[0] === 'index.html' || parts[0] === 'affiliate') return null;
  // CloudFront 런타임은 함수 인자·템플릿 안의 await 를 못 읽는다(SyntaxError) — 먼저 변수에 받는다.
  if (parts.length === 1) {
    const to = await merged(parts[0]);
    return `/blog/${lang}/${to || parts[0]}`;
  }
  if (parts.length === 2 && (parts[0] === 'tools' || parts[0] === 'category' || parts[0] === 'page')) return `/blog/${lang}/${parts.join('/')}`;
  return null;
}

// apps/web/middleware.js 의 config.matcher 와 같다(test-edge.mjs 가 대조).
function inMatcher(p) {
  return (
    p === '/' || p === '/blog' || p === '/blog/' || p === '/affiliate/' ||
    /^\/[^/]+\/affiliate\/$/.test(p) || /^\/(en|zh|pt-br)\/?$/.test(p) ||
    /^\/(ko|en|ja|zh|zh-tw|es|pt-br|id|de|fr)\/.+$/.test(p)
  );
}

async function middleware(path, search, langParam, cookie, acceptLanguage) {
  const stray = await strayTarget(path);
  if (stray) return go(301, stray + search);
  const isBlogRoot = path === '/blog' || path === '/blog/';
  const aff = /^\/(?:([a-z-]+)\/)?affiliate\/?$/.exec(path);
  if (path !== '/' && !isBlogRoot && !aff) return null;
  const pathFor = (l) => {
    if (aff) {
      const s = has(D.affLocales, l) ? l : D.def;
      return s === D.def ? '/affiliate/' : `/${s}/affiliate/`;
    }
    return l === D.def ? '/' : `/${l}/`;
  };
  const requested = langParam ? langParam.toLowerCase() : '';
  if (requested) {
    const l = toLocale(requested);
    if (l) return langRedirect(isBlogRoot ? `/blog/${toBlogLang(l)}` : pathFor(l), l, true);
  }
  if (isBlogRoot) {
    const l = (cookie && toLocale(cookie.toLowerCase())) || pickLocale(acceptLanguage) || D.def;
    return langRedirect(`/blog/${toBlogLang(l)}`, l, false);
  }
  if (aff && aff[1]) return null;
  const goOrStay = (l, setCookie) => {
    const to = pathFor(l);
    if (to === path || (aff && to === '/affiliate/' && !aff[1])) return null;
    return langRedirect(to, l, setCookie);
  };
  if (cookie) {
    const l = toLocale(cookie.toLowerCase());
    if (!l || l === D.def) return null;
    return goOrStay(l, false);
  }
  const l = pickLocale(acceptLanguage);
  if (!l || l === D.def) return null;
  return goOrStay(l, true);
}

// ── apps/blog/next.config.js redirects (basePath /blog) ──
async function blogRedirect(path) {
  for (let i = 0; i < D.junk.length; i++) {
    const m = new RegExp(D.junk[i][0], 'i').exec(path);
    if (m) return D.junk[i][1].replace(/\$(\d)/g, (_, n) => m[n]);
  }
  const m = /^\/blog\/([^/]+)\/([^/]+)$/.exec(path);
  if (m) {
    const to = await merged(m[2]);
    if (to) return `/blog/${m[1]}/${to}`;
  }
  return null;
}

// next.config.js legacyMerged · legacyHost (basePath:false). /blog 아래는 이전 뒤 www 로 보낸다.
async function legacy(path, search) {
  if (path === '/') return `${WWW}/blog/ko${search}`;
  if (path === '/blog' || path.startsWith('/blog/')) return WWW + path + search;
  const m = /^\/([^/]+)\/([^/]+)$/.exec(path);
  if (m) {
    const to = await merged(m[2]);
    if (to) return `${WWW}/blog/${m[1]}/${to}${search}`;
  }
  return `${WWW}/blog${path}${search}`;
}

// W2AC 광고 링크(/open, /open/<target>) — 앱 미설치자에게 보이는 랜딩. 리디렉트하지 않고 언어판 파일로
// 리라이트만 한다(광고 심사는 최종 URL 이 200 실제 페이지여야 통과). 언어: ?lang → hv_lang 쿠키 → Accept-Language → 영어.
// 파일은 apps/web/plugins/i18n-html.js LANDING_PAGES 가 찍는다. 문서: docs/w2ac-open-link.md
function openLanding(req) {
  const q = req.querystring && req.querystring.lang;
  let l = q ? toLocale(String(q.multiValue ? q.multiValue[0].value : q.value).toLowerCase()) : null;
  const c = req.cookies && req.cookies.hv_lang;
  if (!l && c) l = toLocale(c.value.toLowerCase());
  if (!l) {
    const al = req.headers['accept-language'];
    l = pickLocale(al ? al.value : '');
  }
  return !l || l === D.def ? '/open/index.html' : `/_open/${l}.html`;
}

async function handler(event) {
  const req = event.request;
  const host = req.headers.host ? req.headers.host.value.toLowerCase() : '';
  const path = req.uri;
  const search = qs(req.querystring);

  if (host === D.legacyHost) {
    const loc = await legacy(path, search);
    return go(308, loc);
  }
  if (host === D.apexHost) return go(308, WWW + path + search);

  // 2. vercel.json redirects
  const exact = D.exact[path];
  if (exact) return go(308, exact + search);
  for (let i = 0; i < D.patterns.length; i++) {
    const m = new RegExp(D.patterns[i][0]).exec(path);
    if (m) return go(308, D.patterns[i][1].replace(/\$(\d)/g, (_, n) => m[n]) + search);
  }

  // 3. middleware
  if (inMatcher(path)) {
    const lang = req.querystring && req.querystring.lang;
    let langParam = lang ? (lang.multiValue ? lang.multiValue[0].value : lang.value) : '';
    try {
      langParam = decodeURIComponent(langParam.replace(/\+/g, ' '));
    } catch (e) {}
    const c = req.cookies && req.cookies.hv_lang;
    const al = req.headers['accept-language'];
    const r = await middleware(path, search, langParam, c ? c.value : '', al ? al.value : '');
    if (r) return r;
  }

  // 4. blog redirects, 5. S3 키
  if (path.startsWith('/blog/')) {
    const to = await blogRedirect(path);
    if (to) return go(308, to + search);
    const last = path.slice(path.lastIndexOf('/') + 1);
    if (path.endsWith('.html')) req.uri = '/blog/__not_found__';
    else if (last.indexOf('.') === -1 && !has(D.extensionless, path)) req.uri = `${path}.html`;
    return req;
  }
  if (path === '/open' || path.startsWith('/open/')) {
    req.uri = openLanding(req);
    return req;
  }
  if (has(D.extensionless, path)) return req;
  if (path.endsWith('/')) req.uri = `${path}index.html`;
  else if (path.slice(path.lastIndexOf('/') + 1).indexOf('.') === -1) req.uri = `${path}/index.html`;
  return req;
}
