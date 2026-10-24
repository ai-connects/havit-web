// 큐 초안을 사람이 검토하기 쉬운 마크다운 한 장으로.  node review.mjs <out.md> queue/<날짜>...
import { readdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';

const [out, ...dirs] = process.argv.slice(2);
const NAME = { threads: 'Threads', instagram: 'Instagram', facebook: 'Facebook', linkedin_company: 'LinkedIn 회사', linkedin_founder: 'LinkedIn 창업자' };
let md = '# SNS 초안 검토\n\n모든 초안은 approved:false — 사람이 승인한 것만 발행한다.\n';
for (const d of dirs.filter((x) => statSync(x).isDirectory()).sort()) {
  md += `\n## ${path.basename(d)}\n`;
  for (const f of readdirSync(d).filter((x) => x.endsWith('.json')).sort()) {
    const x = readJson(path.join(d, f));
    md += `\n### ${NAME[x.channel]} · ${x.lang} · ${x.format} — ${x.lint.status}${x.lint.warnings.length ? ' (경고 ' + x.lint.warnings.join(', ') + ')' : ''}\n`;
    md += `글: \`${x.slug}\` · 대상: ${x.segment}\n\n`;
    (x.posts || []).forEach((p, i) => { md += (x.posts.length > 1 ? `**[${i + 1}]**\n` : '') + p.split('\n').map((l) => `> ${l}`).join('\n') + '\n\n'; });
    if (x.slides?.length) md += '| 장 | 제목 | 내용 |\n|---|---|---|\n' + x.slides.map((s, i) => `| ${i + 1} | ${s.title} | ${(s.body || '').replace(/\n/g, ' ')} |`).join('\n') + '\n\n';
    if (x.first_reply) md += `첫 답글/댓글: ${x.first_reply.replace(/\n/g, ' / ')}\n\n`;
    if (x.hashtags?.length) md += `태그: ${x.hashtags.map((t) => '#' + t).join(' ')}\n`;
  }
}
writeFileSync(out, md);
console.log(out);
