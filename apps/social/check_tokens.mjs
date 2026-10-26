// 매일: 등록부의 모든 계정 토큰이 살아 있고 그 계정 것인지 확인. 끊긴 게 있으면 SLACK_WEBHOOK_URL 로 알리고 실패로 끝낸다.
// 토큰 값은 로그·알림에 찍지 않는다.
import { readFileSync } from 'node:fs';
import { envKey, whoami } from './lib/meta.mjs';

const accounts = JSON.parse(readFileSync(new URL('./config/accounts.json', import.meta.url), 'utf8')).accounts
  .filter((a) => a.channel === 'instagram' || a.channel === 'threads');
const bad = [];
for (const a of accounts) {
  const name = `${a.channel === 'threads' ? 'THREADS' : 'IG'}_TOKEN_${envKey(a.lang)}`;
  const token = process.env[name];
  let why = null;
  if (!token) why = 'Secret 없음';
  else {
    try {
      const me = await whoami(a.channel, token);
      if (me.username !== a.handle) why = `다른 계정 토큰(@${me.username})`;
    } catch (e) {
      why = /session has been invalidated/.test(e.message) ? '세션 무효화(재발급 필요)'
        : /expired/i.test(e.message) ? '만료(재발급 필요)'
        : String(e.message).replace(/access_token=[^&\s"]+/g, 'access_token=[가림]').slice(0, 120);
    }
  }
  console.log(`${why ? '❌' : '✅'} ${a.channel}/${a.lang} @${a.handle}${why ? ` — ${why}` : ''}`);
  if (why) bad.push(`• ${a.channel === 'threads' ? '쓰레드' : '인스타'} @${a.handle} (${a.lang}) — ${why}`);
}
console.log(`정상 ${accounts.length - bad.length} · 문제 ${bad.length}`);
if (bad.length && process.env.SLACK_WEBHOOK_URL) {
  const text = `⚠️ SNS 토큰 점검: ${bad.length}개 계정 재발급 필요\n${bad.join('\n')}\n이 계정은 발행이 실패합니다. 토큰을 재발급해 주세요.`;
  const r = await fetch(process.env.SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
  if (!r.ok) console.log(`Slack 전송 실패 ${r.status}`);
}
process.exit(bad.length ? 1 : 0);
