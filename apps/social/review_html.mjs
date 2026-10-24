// 검토용 HTML(이미지 포함).  node review_html.mjs <out.html> queue/<날짜>...
import { readdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';

const [out, ...dirs] = process.argv.slice(2);
const NAME = { threads: 'Threads', instagram: 'Instagram', facebook: 'Facebook', linkedin_company: 'LinkedIn 회사', linkedin_founder: 'LinkedIn 창업자' };
const esc = (s) => String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
let h = `<!doctype html><meta charset="utf-8"><title>SNS 초안 검토</title><style>
body{font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;max-width:1200px;margin:24px auto;padding:0 16px;background:#fafafa;color:#121212}
.d{background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:16px;margin:16px 0}
.imgs{display:flex;gap:8px;overflow-x:auto}.imgs img{height:300px;border-radius:8px;border:1px solid #eee}
.t{white-space:pre-wrap;line-height:1.6;background:#f6f6f1;padding:12px;border-radius:8px;margin:8px 0}
.m{color:#666;font-size:13px}.pass{color:#2a8a2a;font-weight:700}.fail{color:#c00;font-weight:700}h2{margin-top:40px}</style>
<h1>SNS 초안 검토</h1><p class="m">모든 초안은 approved:false — 사람이 승인한 것만 발행한다.</p>`;
for (const d of dirs.filter((x) => statSync(x).isDirectory()).sort()) {
  h += `<h2>${path.basename(d)}</h2>`;
  for (const f of readdirSync(d).filter((x) => x.endsWith('.json')).sort()) {
    const x = readJson(path.join(d, f));
    h += `<div class="d"><b>${NAME[x.channel]} · ${x.lang} · ${x.format}</b> <span class="${x.lint.status === 'PASS' ? 'pass' : 'fail'}">${x.lint.status}</span>
<div class="m">${esc(x.slug)} · 대상: ${esc(x.segment)}${x.lint.warnings.length ? ' · 경고: ' + esc(x.lint.warnings.join(', ')) : ''}</div>
<div class="imgs">${(x.images || []).map((i) => `<img src="${path.resolve(d, i)}">`).join('')}</div>
${(x.posts || []).map((p) => `<div class="t">${esc(p)}</div>`).join('')}
${x.first_reply ? `<div class="m">첫 답글/댓글: ${esc(x.first_reply)}</div>` : ''}
${x.hashtags?.length ? `<div class="m">태그: ${x.hashtags.map((t) => '#' + esc(t)).join(' ')}</div>` : ''}</div>`;
  }
}
writeFileSync(out, h);
console.log(out);
