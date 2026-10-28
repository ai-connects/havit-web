// 상황별 시리즈 미리 만들기 요약: 날짜 폴더 전체의 sit-·nag- 초안 판정 집계. SLACK_WEBHOOK_URL 이 있으면 Slack 으로 보낸다.
//   node series_digest.mjs queue
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'queue';
const LABEL = { auto_approved: '✅ 자동 승인', human: '👀 사람 검토', revise: '✏️ 재작성 대기', rejected: '⛔ 반려', paused: '⏸ 중지', none: '… 판정 전' };
const count = {};
const issues = [];
let first = null, last = null;
for (const day of readdirSync(root).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort()) {
  for (const f of readdirSync(path.join(root, day)).filter((x) => /-(sit|nag)-.*\.json$/.test(x))) {
    const d = JSON.parse(readFileSync(path.join(root, day, f), 'utf8'));
    const series = d.slug.startsWith('nag-') ? 'AI 잔소리' : '생존 가이드';
    const s = d.decision?.status || 'none';
    count[series] ||= {};
    count[series][s] = (count[series][s] || 0) + 1;
    first ||= day; last = day;
    if (s === 'rejected' || s === 'human') issues.push(`${day} ${d.channel}/${d.lang} ${d.slug} — ${LABEL[s]}: ${(d.decision?.reasons || []).slice(0, 2).join(', ')}`);
  }
}
let text = `*HAVIT SNS 상황별 시리즈 미리 만들기* (${first} ~ ${last})\n`;
for (const [series, c] of Object.entries(count)) text += `\n*${series}* ` + Object.entries(c).map(([k, v]) => `${LABEL[k] || k} ${v}`).join(' · ');
if (issues.length) text += `\n\n확인 필요 ${issues.length}건 (앞 30건)\n` + issues.slice(0, 30).map((l) => `• ${l}`).join('\n');
if (process.env.SLACK_WEBHOOK_URL) {
  const r = await fetch(process.env.SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
  console.log(`Slack ${r.status}`);
}
console.log(text);
