// 매일 생성분 미리보기를 Slack 으로 — 대표 지시(2026-10-24) "만들면 바로 슬랙으로".
// 한 언어(기본 ko)의 그날 게시물마다: 발행 시각·채널·판정 + 카드 이미지(S3 URL) + 본문·첫 댓글 전문.
//   node preview.mjs queue/2026-10-25 [lang]      SLACK_WEBHOOK_URL 이 없으면 콘솔에만 찍는다.
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';

const [dir, lang = process.env.SOCIAL_PREVIEW_LANG || 'ko'] = process.argv.slice(2);
if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) { console.error(`없는 폴더: ${dir}`); process.exit(1); }
const LABEL = { auto_approved: '✅ 자동 승인', human: '👀 사람 검토', revise: '✏️ 재작성', rejected: '⛔ 반려', paused: '⏸ 중지' };
const NAME = { instagram: '인스타', threads: 'Threads' };
const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const local = (iso, tz) => new Intl.DateTimeFormat('ko-KR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));

const drafts = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => readJson(path.join(dir, f)))
  .filter((d) => d.lang === lang).sort((a, b) => a.publish_at.localeCompare(b.publish_at));

async function post(body) {
  if (!process.env.SLACK_WEBHOOK_URL) return console.log(JSON.stringify(body).slice(0, 300));
  const r = await fetch(process.env.SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) console.log(`Slack ${r.status} ${await r.text()}`);
}

await post({ text: `*HAVIT SNS 미리보기 ${path.basename(dir)} · ${lang}* — ${drafts.length}건 (발행 전)` });
for (const d of drafts) {
  const s = d.decision?.status || (d.lint?.status === 'PASS' ? 'human' : 'rejected');
  const head = `*${local(d.publish_at, 'Asia/Seoul')} KST · ${NAME[d.channel] || d.channel} · ${d.format}* — ${LABEL[s] || s}`
    + (s !== 'auto_approved' && d.decision?.reasons?.length ? `\n_${cut(d.decision.reasons.join('; '), 300)}_` : '');
  const text = (d.posts || []).join('\n\n') + (d.first_reply ? `\n\n— 첫 댓글 —\n${d.first_reply}` : '');
  const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: head } },
    ...(d.media || []).slice(0, 10).map((url, i) => ({ type: 'image', image_url: url, alt_text: `${i + 1}장` })),
    { type: 'section', text: { type: 'mrkdwn', text: cut(text || '(본문 없음)', 2900) } },
    { type: 'divider' },
  ];
  await post({ text: head, blocks });
}
console.log(`미리보기 ${drafts.length}건 전송`);
