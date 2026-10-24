// 매일 요약: 자동 승인·사람 검토 대기·수정 필요·거절 건수와 목록. SLACK_WEBHOOK_URL 이 있으면 Slack 으로 보낸다.
//   node digest.mjs queue/2026-11-02
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';

const dir = process.argv[2];
if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) { console.error(`없는 폴더: ${dir}`); process.exit(1); }
const LABEL = { auto_approved: '✅ 자동 승인', human: '👀 사람 검토 필요', revise: '✏️ 재작성 필요', rejected: '⛔ 기계 검사 FAIL', paused: '⏸ 중지됨' };
const groups = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const d = readJson(path.join(dir, f));
  const s = d.decision?.status || (d.lint?.status === 'PASS' ? 'human' : 'rejected');
  (groups[s] ||= []).push(`${d.channel}/${d.lang} · ${d.slug}${d.decision?.reasons?.length ? ' — ' + d.decision.reasons.join(', ') : ''}`);
}
const order = ['human', 'revise', 'rejected', 'paused', 'auto_approved'];
let text = `*HAVIT SNS ${path.basename(dir)}*\n` + order.filter((k) => groups[k]).map((k) => `${LABEL[k]} ${groups[k].length}건`).join(' · ');
for (const k of order.filter((x) => x !== 'auto_approved' && groups[x])) text += `\n\n${LABEL[k]}\n` + groups[k].map((l) => `• ${l}`).join('\n');
if (process.env.SLACK_WEBHOOK_URL) {
  const r = await fetch(process.env.SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
  console.log(`Slack ${r.status}`);
}
console.log(text);
