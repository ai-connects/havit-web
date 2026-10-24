// 큐 초안 → 이미지(PNG 1080×1350). Instagram 은 슬라이드마다, 나머지 채널은 카드 1장.
//   node render.mjs queue/2026-10-26 [queue/...]
// 설치된 Chrome 의 헤드리스 스크린샷을 쓴다(추가 의존성 없음). 결과는 queue/<날짜>/img/<초안>/NN.png,
// 초안 JSON 의 images 에 경로를 기록한다. 이미지 속 글은 이미 lint 를 통과한 초안 문구만 쓴다.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson } from './lib/source.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(ROOT, '../web/public');
const BLOG = path.resolve(ROOT, '../blog/data');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1080;
const H = 1350;

// 블로그 대표 사진: article-images.json(slug→파일명) + 카탈로그(파일명→URL)
const heroMap = readJson(path.join(BLOG, 'article-images.json')).map;
const catalog = new Map(readFileSync(path.join(BLOG, 'article-image-catalog.csv'), 'utf8').split('\n').slice(1)
  .map((l) => l.trim().split(',').pop()).filter(Boolean).map((u) => [u.split('/').pop(), u]));
const heroUrl = (slug) => catalog.get(heroMap[slug]) || null;

const file = (p) => `file://${p}`;
const CHAR = { knight: file(path.join(WEB, 'cta/knight.webp')), dino: file(path.join(WEB, 'cta/dino.webp')), peek: file(path.join(WEB, 'cta/peek.webp')) };
const LOGO_W = file(path.join(WEB, 'havit-logo-white.svg'));
const LOGO = file(path.join(WEB, 'havit-logo.svg'));
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nl = (s) => esc(s).replace(/\n+/g, '<br>');

const FONT = {
  ko: "'Poppins','Noto Sans KR',sans-serif",
  ja: "'Poppins','Noto Sans JP',sans-serif",
  'zh-tw': "'Poppins','Noto Sans TC',sans-serif",
  zh: "'Poppins','Noto Sans SC',sans-serif",
};
const fontOf = (lang) => FONT[lang] || "'Poppins','Noto Sans',sans-serif";
const fit = (s, big, small, limit) => ([...String(s || '')].length > limit ? small : big);

function page(lang, inner) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Noto+Sans+KR:wght@500;700;900&family=Noto+Sans+JP:wght@500;700;900&family=Noto+Sans+TC:wght@500;700;900&family=Noto+Sans+SC:wght@500;700;900&family=Noto+Sans:wght@500;700;900&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:${fontOf(lang)};-webkit-font-smoothing:antialiased;line-break:strict;overflow-wrap:anywhere;word-break:${lang === 'ko' ? 'keep-all' : 'normal'}}
.s{position:relative;width:${W}px;height:${H}px;padding:96px 88px;display:flex;flex-direction:column}
.dark{background:#121212;color:#fff}.light{background:#F6F6F1;color:#121212}.lime{background:#D4FF50;color:#121212}
.logo{height:40px;width:auto;position:absolute;top:72px;left:88px}
.num{position:absolute;top:76px;right:88px;font:700 30px Poppins;opacity:.45}
.bar{width:96px;height:12px;background:#D4FF50;border-radius:6px;margin-bottom:40px}
.light .bar{background:#121212}
h1{font-weight:900;line-height:1.18;letter-spacing:-.02em}
p{font-weight:500;line-height:1.55;letter-spacing:-.01em}
.src{position:absolute;left:88px;bottom:80px;font:500 26px/1.3 Poppins;opacity:.55;max-width:640px}
.char{position:absolute;right:72px;bottom:64px;width:210px;height:auto}
.hero{position:absolute;inset:0;background-size:cover;background-position:center}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,18,18,.15) 0%,rgba(18,18,18,.55) 45%,#121212 78%)}
.glow{position:absolute;left:-120px;bottom:-160px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(212,255,80,.45),rgba(0,200,255,0) 70%)}
</style></head><body>${inner}</body></html>`;
}

function cover(d, s) {
  const hero = heroUrl(d.slug);
  return page(d.lang, `<div class="s dark">
  ${hero ? `<div class="hero" style="background-image:url('${hero}')"></div><div class="shade"></div>` : '<div class="glow"></div>'}
  <img class="logo" src="${LOGO_W}">
  <div style="margin-top:auto;position:relative;padding-bottom:180px">
    <div class="bar"></div>
    <h1 style="font-size:${fit(s.title, 104, 84, 18)}px;color:#D4FF50">${nl(s.title)}</h1>
    ${s.body ? `<p style="font-size:40px;margin-top:28px;opacity:.9">${nl(s.body)}</p>` : ''}
  </div>
  <img class="char" src="${CHAR.knight}">
</div>`);
}

function content(d, s, i, n) {
  const src = (s.body || '').match(/\(([^()]*\b(19|20)\d\d)\)\s*$/);
  const body = src ? s.body.slice(0, src.index).trim() : s.body;
  return page(d.lang, `<div class="s light">
  <img class="logo" src="${LOGO}"><div class="num">${i + 1}/${n}</div>
  <div style="margin-top:150px">
    <div class="bar"></div>
    <h1 style="font-size:${fit(s.title, 76, 62, 22)}px">${nl(s.title)}</h1>
    <p style="font-size:${fit(body, 46, 38, 120)}px;margin-top:40px">${nl(body)}</p>
  </div>
  ${src ? `<div class="src">${esc(src[1])}</div>` : ''}
  <img class="char" src="${CHAR.peek}" style="width:170px">
</div>`);
}

function cta(d, s) {
  return page(d.lang, `<div class="s lime">
  <img class="logo" src="${LOGO}">
  <div style="margin:auto 0">
    <h1 style="font-size:${fit(s.title, 96, 76, 20)}px">${nl(s.title)}</h1>
    ${s.body ? `<p style="font-size:44px;margin-top:32px">${nl(s.body)}</p>` : ''}
  </div>
  <img class="char" src="${CHAR.dino}" style="width:240px">
</div>`);
}

// 텍스트 채널 카드: 첫 포스트의 첫 문단(최대 90자)을 크게, 근거가 있으면 출처 1줄.
function card(d) {
  const first = (d.posts?.[0] || '').split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
  // 90자를 넘으면 문장 끝(없으면 공백)에서 자른다 — 단어 중간에서 끊지 않는다.
  let head = first;
  if ([...first].length > 90) {
    const cut = [...first].slice(0, 90).join('');
    const end = Math.max(...['. ', '? ', '! ', '。', '？', '！', '다. ', '요. '].map((p) => cut.lastIndexOf(p.trim())));
    head = end > 30 ? cut.slice(0, end + 1) : cut.slice(0, Math.max(cut.lastIndexOf(' '), 60)) + '…';
  }
  // 출처는 "저널, 연도" 꼴일 때만(글 제목이 들어오는 경우 제외)
  const src = (d.evidence || []).map((e) => e.source).find((x) => /,\s*(19|20)\d\d$/.test(x || ''));
  return page(d.lang, `<div class="s dark">
  <div class="glow"></div><img class="logo" src="${LOGO_W}">
  <div style="margin:auto 0;position:relative">
    <div class="bar"></div>
    <h1 style="font-size:${fit(head, 80, 64, 50)}px">${nl(head)}</h1>
  </div>
  ${src ? `<div class="src" style="color:#fff">${esc(src)}</div>` : ''}
  <img class="char" src="${CHAR.peek}">
</div>`);
}

function shoot(html, out) {
  const tmp = out.replace(/\.png$/, '.html');
  writeFileSync(tmp, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${W},${H}`, '--virtual-time-budget=8000', `--screenshot=${out}`, file(tmp)], { stdio: 'ignore' });
  if (!existsSync(out)) throw new Error(`렌더 실패: ${out}`);
}

const dirs = process.argv.slice(2).filter((p) => statSync(p).isDirectory()).map((p) => path.resolve(p));
let n = 0;
for (const dir of dirs) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    const outDir = path.join(dir, 'img', f.replace(/\.json$/, ''));
    mkdirSync(outDir, { recursive: true });
    const pages = d.slides?.length
      ? d.slides.map((s, i, a) => (i === 0 ? cover(d, s) : i === a.length - 1 ? cta(d, s) : content(d, s, i, a.length)))
      : [card(d)];
    d.images = pages.map((html, i) => {
      const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`);
      shoot(html, out);
      n++;
      return path.relative(dir, out);
    });
    writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
    console.log(`${d.images.length}장 ${path.relative(ROOT, p)}`);
  }
}
console.log(`\n총 ${n}장`);
