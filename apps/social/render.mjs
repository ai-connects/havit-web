// 큐 초안 → 이미지(PNG 1080×1350). Instagram 은 슬라이드마다, 나머지 채널은 카드 1장.
//   node render.mjs queue/2026-10-26 [queue/...]
// 설치된 Chrome 의 헤드리스 스크린샷을 쓴다(추가 의존성 없음). 결과는 queue/<날짜>/img/<초안>/NN.png,
// 초안 JSON 의 images 에 경로를 기록한다. 이미지 속 글은 이미 lint 를 통과한 초안 문구만 쓴다.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSource, readJson } from './lib/source.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(ROOT, '../web/public');
const BLOG = path.resolve(ROOT, '../blog/data');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1080;
const H = 1350;

// 블로그 대표 사진: article-images.json(slug→파일명) + 카탈로그(파일명→URL)
const heroMap = readJson(path.join(BLOG, 'article-images.json')).map;
const catalogRows = readFileSync(path.join(BLOG, 'article-image-catalog.csv'), 'utf8').split('\n').slice(1).filter(Boolean);
const catalog = new Map();
const imgTitles = new Map();
for (const l of catalogRows) {
  const url = l.trim().split(',').pop();
  const fileName = url.split('/').pop();
  catalog.set(fileName, url);
  const title = l.split(',').slice(2, -1).join(',');
  imgTitles.set(fileName, `${imgTitles.get(fileName) || ''} ${title}`);
}
const STOP = new Set('the and for with your you how why what when does from into that this are is of to in on a an vs 2026 guide evidence tips best'.split(' '));
const words = (t) => new Set((t || '').toLowerCase().match(/[a-z]{4,}/g)?.filter((w) => !STOP.has(w)) || []);
/** 그 글의 대표 사진이 주제와 맞을 때만 쓴다(사진이 원래 붙은 글 제목들과 slug 핵심어가 2개 이상 겹침). 아니면 브랜드 표지. */
const heroUrl = (slug) => {
  const f = heroMap[slug];
  if (!f || !catalog.has(f)) return null;
  const a = words(slug.replace(/-/g, ' '));
  const b = words(imgTitles.get(f));
  const shared = [...a].filter((w) => [...b].some((x) => x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5))));
  return shared.length >= 2 ? catalog.get(f) : null;
};

const file = (p) => `file://${p}`;
import { TAGLINE } from './lib/brand.mjs';
const BADGES = path.resolve(ROOT, '../blog/public/badges');
const BADGE_DIR = { 'zh-tw': 'zh-tw', 'pt-br': 'pt-br' };
const badges = (lang) => {
  const dir = path.join(BADGES, BADGE_DIR[lang] || lang);
  const d = existsSync(dir) ? dir : path.join(BADGES, 'en');
  return `<div style="display:flex;gap:24px;margin-top:48px"><img src="${file(path.join(d, 'app-store.svg'))}" style="height:96px"><img src="${file(path.join(d, 'google-play.png'))}" style="height:96px"></div>`;
};
const CHAR = { knight: file(path.join(WEB, 'cta/knight.webp')), dino: file(path.join(WEB, 'cta/dino.webp')), peek: file(path.join(WEB, 'cta/peek.webp')) };
const LOGO_W = file(path.join(WEB, 'havit-logo-white.svg'));
const LOGO = file(path.join(WEB, 'havit-logo.svg'));
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nl = (s) => esc(s).replace(/\n+/g, '<br>');
// 퀴즈 카드의 O·X 를 크고 녹색으로(대표 시안 피드백 2026-10-25). 다른 글자와 붙지 않은 대문자 O·X 만(「O일까」도 해당).
const QUIZ = new Set(['app_quiz_carousel', 'app_quiz_post']);
// 정답 표시 O/X 만 강조. 포르투갈어 관사 「O cérebro」처럼 뒤에 소문자 낱말이 오는 O 는 글자다(2026-10-26 pt-br 오렌더).
// ① 「O ou X」「O/X」 같은 짝을 먼저 표시하고, ② 홀로 선 O/X(뒤가 끝·문장부호·이모지)를 표시한다.
const OX_PAIR = /(?<![\p{Script=Latin}\p{N}])([OX])(\s*(?:\/|·|or|o|ou|oder|atau|または|还是|還是|또는)\s*)([OX])(?![\p{Script=Latin}\p{N}])/gu;
const OX_ONE = /(?<![\p{Script=Latin}\p{N}\u0001])([OX])(?![\p{Script=Latin}\p{N}\u0002])(?!\s+\p{Ll})/gu;
const oxify = (html) => html
  .replace(OX_PAIR, '\u0001$1\u0002$2\u0001$3\u0002')
  .replace(OX_ONE, '\u0001$1\u0002')
  .replace(/\u0001([OX])\u0002/g, '<span class="ox">$1</span>');
const tx = (d, t) => (QUIZ.has(d.format) ? oxify(nl(t)) : nl(t));

const FONT = {
  // 웹폰트가 늦거나 실패하면(러너에서 Noto Sans JP 가 반복 실패, 2026-10-25) 설치된 Noto CJK(fonts-noto-cjk)로 그린다.
  ko: "'Poppins','Noto Sans KR','Noto Sans CJK KR',sans-serif",
  ja: "'Poppins','Noto Sans JP','Noto Sans CJK JP',sans-serif",
  'zh-tw': "'Poppins','Noto Sans TC','Noto Sans CJK TC',sans-serif",
  zh: "'Poppins','Noto Sans SC','Noto Sans CJK SC',sans-serif",
};
const fontOf = (lang) => FONT[lang] || "'Poppins','Noto Sans',sans-serif";
const fit = (s, big, small, limit) => ([...String(s || '')].length > limit ? small : big);

function page(lang, inner) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Noto+Sans+KR:wght@500;700;900&family=Noto+Sans+JP:wght@500;700;900&family=Noto+Sans+TC:wght@500;700;900&family=Noto+Sans+SC:wght@500;700;900&family=Noto+Sans:wght@500;700;900&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:${fontOf(lang)};-webkit-font-smoothing:antialiased;line-break:strict;overflow-wrap:anywhere;word-break:${lang === 'ko' ? 'keep-all' : lang === 'ja' ? 'auto-phrase' : 'normal'}}
.ox{color:#22C55E;font-weight:900;font-size:1.9em;line-height:.8;display:inline-block;vertical-align:-.12em;margin:0 .04em;text-shadow:0 0 .25em rgba(34,197,94,.35)}
.s{position:relative;width:${W}px;height:${H}px;padding:96px 88px;display:flex;flex-direction:column}
.dark{background:#121212;color:#fff}.light{background:#F6F6F1;color:#121212}.lime{background:#D4FF50;color:#121212}
.logo{height:80px;width:auto;position:absolute;top:64px;left:88px}
.num{position:absolute;top:76px;right:88px;font:700 30px Poppins;opacity:.45}
.bar{width:96px;height:12px;background:#D4FF50;border-radius:6px;margin-bottom:40px}
.light .bar{background:#121212}
h1{font-weight:900;line-height:1.18;letter-spacing:-.02em;text-wrap:balance}
p{font-weight:500;line-height:1.5;letter-spacing:-.01em;text-wrap:pretty}
.body{position:absolute;left:88px;right:88px;top:170px;bottom:300px;display:flex;flex-direction:column;justify-content:center}
.src{position:absolute;left:88px;bottom:80px;font:500 26px/1.3 Poppins;opacity:.55;max-width:640px}
.char{position:absolute;right:72px;bottom:64px;width:210px;height:auto}
.hero{position:absolute;inset:0;background-size:cover;background-position:center}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,18,18,.15) 0%,rgba(18,18,18,.55) 45%,#121212 78%)}
.glow{position:absolute;left:-120px;bottom:-160px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(212,255,80,.45),rgba(0,200,255,0) 70%)}
</style><script>
// 렌더 품질 자동 검사: 글자가 캔버스 밖으로 넘치거나, 캐릭터와 겹치거나, 폰트·이미지가 안 불러와졌는지. 결과는 <title> 로 내보낸다.
window.addEventListener('load', async () => {
  await document.fonts.ready;
  const issues = [];
  const W = ${W}, H = ${H}, M = 40;
  const char = document.querySelector('.char')?.getBoundingClientRect();
  for (const el of document.querySelectorAll('h1,p,.src')) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    if (r.right > W - M || r.bottom > H - M || r.left < M - 1 || r.top < 0) issues.push('넘침:' + el.tagName + ':' + el.textContent.slice(0, 20));
    if (el.scrollWidth > el.clientWidth + 2) issues.push('가로넘침:' + el.textContent.slice(0, 20));
    if (char && !el.classList.contains('src') && r.right > char.left + 10 && r.bottom > char.top + 10 && r.left < char.right && r.top < char.bottom) issues.push('캐릭터겹침:' + el.textContent.slice(0, 20));
  }
  for (const img of document.images) if (!img.complete || !img.naturalWidth) issues.push('이미지실패:' + img.src.split('/').pop());
  // 그 언어 글자를 실제로 그릴 폰트가 로드됐는지(라틴 언어는 Poppins, CJK 는 각 Noto). 미로드면 대체 폰트(□·다른 모양)로 찍힌다.
  const SAMPLE = { ko: ['Noto Sans KR', '한글'], ja: ['Noto Sans JP', 'あア漢'], 'zh-tw': ['Noto Sans TC', '健康'], zh: ['Noto Sans SC', '健康'] };
  const [fam, txt] = SAMPLE[document.documentElement.lang] || ['Poppins', 'Abc'];
  // 웹폰트가 안 들어와도 같은 글꼴의 설치본(Noto CJK)이 있으면 통과 — 폭이 기본 고정폭과 다르면 설치돼 있는 것.
  const LOCAL = { ko: 'Noto Sans CJK KR', ja: 'Noto Sans CJK JP', 'zh-tw': 'Noto Sans CJK TC', zh: 'Noto Sans CJK SC' }[document.documentElement.lang];
  const hasLocal = (f) => { const c = document.createElement('canvas').getContext('2d'); c.font = '40px "' + f + '", monospace'; const a = c.measureText(txt).width; c.font = '40px monospace'; return a !== c.measureText(txt).width; };
  if (!document.fonts.check('900 40px "' + fam + '"', txt) && !(LOCAL && hasLocal(LOCAL))) issues.push('폰트미로드:' + fam);
  document.title = 'QA:' + JSON.stringify(issues);
});
</script></head><body>${inner}</body></html>`;
}

const len = (t) => [...String(t || '')].length;
/** 글자 수에 따라 3단계 크기. CJK 는 글자 폭이 넓어 기준을 줄인다. */
const tier = (t, lang, [big, mid, small], [a, b]) => {
  const k = ['ko', 'ja', 'zh-tw', 'zh'].includes(lang) ? 0.55 : 1;
  const n = len(t);
  return n <= a * k ? big : n <= b * k ? mid : small;
};

/** 초안에 정해진 사진(imagery.mjs): 라이브러리 URL 또는 AI 생성 파일. 없으면 null → 브랜드 디자인. */
let CURRENT_DIR = '';
const photoUrl = (d) => d.photo?.url || (d.photo?.path ? file(path.join(CURRENT_DIR, d.photo.path)) : null);

function cover(d, s) {
  const hero = photoUrl(d);
  // 주제와 맞는 사진이 없으면 사진 대신 브랜드 표지(라임 글로우 + 큰 HAVI) — 엉뚱한 사진보다 낫다.
  return page(d.lang, `<div class="s dark">
  ${hero ? `<img class="hero" src="${hero}" style="width:100%;height:100%;object-fit:cover"><div class="shade"></div><div style="position:absolute;left:0;right:0;top:0;height:260px;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,0))"></div>` : '<div class="glow" style="left:auto;right:-160px;bottom:-120px;width:900px;height:900px"></div>'}
  <img class="logo" src="${LOGO_W}">
  <div style="margin-top:auto;position:relative;padding-bottom:${hero ? 150 : 120}px;padding-right:${hero ? 250 : 340}px">
    <div class="bar"></div>
    <h1 style="font-size:${tier(s.title, d.lang, [108, 92, 78], [16, 28])}px;color:#D4FF50">${tx(d, s.title)}</h1>
    ${s.body ? `<p style="font-size:42px;margin-top:28px;opacity:.9">${tx(d, s.body)}</p>` : ''}
  </div>
  <img class="char" src="${CHAR.knight}" style="${hero ? '' : 'width:360px;right:64px;bottom:96px'}">
</div>`);
}

function content(d, s, i, n) {
  const src = (s.body || '').match(/\(([^()]*\b(19|20)\d\d)\)\s*$/);
  const body = src ? s.body.slice(0, src.index).trim() : s.body;
  return page(d.lang, `<div class="s light">
  <img class="logo" src="${LOGO}"><div class="num">${i + 1}/${n}</div>
  <div class="body">
    <div class="bar"></div>
    <h1 style="font-size:${tier(s.title, d.lang, [84, 74, 64], [18, 30])}px">${tx(d, s.title)}</h1>
    <p style="font-size:${tier(body, d.lang, [56, 50, 44], [70, 120])}px;margin-top:40px">${tx(d, body)}</p>
  </div>
  ${src ? `<div class="src">${esc(src[1])}</div>` : ''}
  <img class="char" src="${CHAR.peek}" style="width:170px">
</div>`);
}

function cta(d, s) {
  return page(d.lang, `<div class="s lime">
  <img class="logo" src="${LOGO}">
  <div style="margin:auto 0;padding-bottom:120px">
    <h1 style="font-size:${tier(s.title, d.lang, [104, 90, 78], [16, 26])}px">${tx(d, s.title)}</h1>
    ${s.body ? `<p style="font-size:46px;margin-top:32px">${tx(d, s.body)}</p>` : ''}
    ${/^(art|quiz|sit|nag)-/.test(d.slug || '') ? badges(d.lang) + (TAGLINE[d.lang] ? `<p style="font-size:34px;margin-top:36px;opacity:.75;max-width:640px">${TAGLINE[d.lang]}</p>` : '') : ''}
  </div>
  <img class="char" src="${CHAR.dino}" style="width:260px">
</div>`);
}

/** 카드 문구: 생성기가 쓴 card_text(짧은 후킹) → 없으면 첫 문장(70자 이내) → 그래도 길면 글 제목. 문장 중간에서 자르지 않는다. */
function cardText(d) {
  if (d.card_text) return d.card_text;
  const first = (d.posts?.[0] || '').replace(/\s+/g, ' ').trim();
  const sentence = first.match(/^.+?[.!?。！？](?=\s|$)/u)?.[0];
  if (sentence && len(sentence) <= 70) return sentence;
  try { return loadSource(d.slug, d.lang).title; } catch { return sentence || first; }
}

function card(d) {
  const head = cardText(d);
  const photo = photoUrl(d);
  // 출처는 "저널, 연도" 꼴일 때만(글 제목이 들어오는 경우 제외)
  const src = (d.evidence || []).map((e) => e.source).find((x) => /,\s*(19|20)\d\d$/.test(x || ''));
  if (photo) {
    return page(d.lang, `<div class="s dark" style="padding:0">
  <img src="${photo}" style="position:absolute;left:0;top:0;width:100%;height:62%;object-fit:cover">
  <div style="position:absolute;left:0;right:0;top:0;height:260px;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,0))"></div>
  <div style="position:absolute;left:0;right:0;top:52%;height:12%;background:linear-gradient(180deg,rgba(18,18,18,0),#121212)"></div>
  <img class="logo" src="${LOGO_W}" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))">
  <div style="position:absolute;left:88px;right:300px;top:64%;bottom:${src ? 120 : 80}px;display:flex;flex-direction:column;justify-content:center">
    <div class="bar" style="margin-bottom:28px"></div>
    <h1 style="font-size:${tier(head, d.lang, [78, 68, 58], [24, 44])}px">${tx(d, head)}</h1>
  </div>
  ${src ? `<div class="src" style="color:#fff;bottom:56px">${esc(src)}</div>` : ''}
  <img class="char" src="${CHAR.peek}" style="width:190px;bottom:48px">
</div>`);
  }
  return page(d.lang, `<div class="s dark">
  <div class="glow"></div><img class="logo" src="${LOGO_W}">
  <div style="margin:auto 0;position:relative;padding-bottom:120px">
    <div class="bar"></div>
    <h1 style="font-size:${tier(head, d.lang, [96, 84, 70], [28, 50])}px">${tx(d, head)}</h1>
  </div>
  ${src ? `<div class="src" style="color:#fff">${esc(src)}</div>` : ''}
  <img class="char" src="${CHAR.peek}">
</div>`);
}

function shoot(html, out) {
  const tmp = out.replace(/\.png$/, '.html');
  writeFileSync(tmp, html);
  const base = [CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${W},${H}`, '--virtual-time-budget=8000'];
  const dom = execFileSync(base[0], [...base.slice(1), '--dump-dom', file(tmp)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  execFileSync(base[0], [...base.slice(1), `--screenshot=${out}`, file(tmp)], { stdio: 'ignore' });
  if (!existsSync(out)) throw new Error(`렌더 실패: ${out}`);
  const m = dom.match(/<title>QA:(.*?)<\/title>/s);
  return m ? JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')) : ['QA 결과 없음'];
}

const dirs = process.argv.slice(2).filter((p) => !p.startsWith('--')).filter((p) => statSync(p).isDirectory()).map((p) => path.resolve(p));
let n = 0, bad = 0;
for (const dir of dirs) {
  CURRENT_DIR = dir;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    if (d.share === 'link') continue; // 블로그 링크 미리보기로 발행 — 카드 이미지 없음
    if (process.argv.includes('--pending') && d.decision) continue; // 이미 판정된 초안은 다시 그리지 않음(고쳐 쓴 초안만)
    const outDir = path.join(dir, 'img', f.replace(/\.json$/, ''));
    mkdirSync(outDir, { recursive: true });
    const pages = d.slides?.length
      ? d.slides.map((s, i, a) => (i === 0 ? cover(d, s) : i === a.length - 1 ? cta(d, s) : content(d, s, i, a.length)))
      : [card(d)];
    const issues = [];
    d.images = pages.map((html, i) => {
      const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`);
      let got = shoot(html, out);
      // 웹폰트 로딩 실패는 일시적이라 최대 2번 다시 찍는다(실패를 반려로 넘기지 않게)
      for (let t = 0; t < 2 && got.some((x) => x.startsWith('폰트미로드')); t++) got = shoot(html, out);
      for (const x of got) issues.push(`${i + 1}장 ${x}`);
      n++;
      return path.relative(dir, out);
    });
    d.image_qa = { status: issues.length ? 'FAIL' : 'PASS', issues };
    writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
    if (issues.length) bad++;
    console.log(`${issues.length ? '⚠️' : '✅'} ${d.images.length}장 ${path.relative(ROOT, p)}${issues.length ? ' — ' + issues.join('; ') : ''}`);
  }
}
console.log(`\n총 ${n}장 · 이미지 문제 ${bad}건`);
