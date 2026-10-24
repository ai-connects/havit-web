// 토큰 관리. 대표님이 **본인 터미널(Terminal 앱)** 에서 실행한다 — 토큰은 화면에 출력하지 않고 .env 에만 저장한다.
//   node tokens.mjs threads <lang>   Threads 로그인 → 장기 토큰 저장 (브라우저 인가 후 주소창 URL 을 붙여넣기)
//   node tokens.mjs th <lang>        앱 대시보드 Threads「사용자 토큰 생성기」에서 만든 토큰을 붙여넣어 저장(가장 간단)
//   node tokens.mjs ig <lang>        앱 대시보드에서 생성한 Instagram 토큰을 붙여넣어 저장
//   node tokens.mjs check            저장된 토큰이 어느 계정인지·만료일 확인(토큰 값은 안 보여줌)
//   node tokens.mjs refresh          만료 전 일괄 갱신(60일 장기 토큰, 발급 24시간 뒤부터 가능)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { config } from './lib/source.mjs';
import { envKey, refreshToken, threadsExchange, whoami } from './lib/meta.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENV = path.join(ROOT, '.env');
try { process.loadEnvFile(ENV); } catch { /* 처음 */ }
const REDIRECT = process.env.THREADS_REDIRECT_URI || 'https://www.aihavit.com/';

function setEnv(updates) {
  const lines = existsSync(ENV) ? readFileSync(ENV, 'utf8').split('\n').filter(Boolean) : [];
  const map = new Map(lines.map((l) => [l.split('=')[0], l]));
  for (const [k, v] of Object.entries(updates)) { map.set(k, `${k}=${v}`); process.env[k] = v; }
  writeFileSync(ENV, [...map.values()].join('\n') + '\n', { mode: 0o600 });
}
const expiry = (sec) => new Date(Date.now() + sec * 1000).toISOString().slice(0, 10);
const ask = async (q) => { const rl = createInterface({ input: process.stdin, output: process.stdout }); const a = await rl.question(q); rl.close(); return a.trim(); };
const langs = () => config('channels').channels.instagram.langs;

const [cmd, lang] = process.argv.slice(2);
if (cmd === 'threads') {
  if (!process.env.THREADS_APP_ID || !process.env.THREADS_APP_SECRET) throw new Error('.env 에 THREADS_APP_ID / THREADS_APP_SECRET 먼저 넣기(앱 설정 → 기본 설정의 Threads 앱 ID·시크릿)');
  const url = `https://threads.net/oauth/authorize?${new URLSearchParams({ client_id: process.env.THREADS_APP_ID, redirect_uri: REDIRECT, scope: 'threads_basic,threads_content_publish,threads_manage_replies', response_type: 'code', state: lang })}`;
  console.log(`\n1) 브라우저에서 ${lang} 계정으로 Threads 에 로그인된 상태로 아래 주소를 여세요:\n\n${url}\n\n2) 허용 후 aihavit.com 으로 이동되면, 주소창의 전체 URL 을 복사해 붙여넣으세요.`);
  const back = await ask('\nURL: ');
  const code = new URL(back).searchParams.get('code')?.replace(/#_$/, '');
  if (!code) throw new Error('URL 에 code 가 없습니다');
  const t = await threadsExchange(code, REDIRECT);
  const me = await whoami('threads', t.access_token);
  setEnv({ [`THREADS_TOKEN_${envKey(lang)}`]: t.access_token, [`THREADS_TOKEN_${envKey(lang)}_EXPIRES`]: expiry(t.expires_in) });
  console.log(`✅ 저장: Threads ${lang} = @${me.username} (만료 ${expiry(t.expires_in)})`);
} else if (cmd === 'th') {
  const token = await ask(`${lang} Threads 토큰 붙여넣기(앱 대시보드 → 이용 사례 → Threads 맞춤 설정 → 설정 → 사용자 토큰 생성기): `);
  const me = await whoami('threads', token);
  setEnv({ [`THREADS_TOKEN_${envKey(lang)}`]: token, [`THREADS_TOKEN_${envKey(lang)}_EXPIRES`]: expiry(60 * 864e2) });
  console.log(`✅ 저장: Threads ${lang} = @${me.username}`);
} else if (cmd === 'ig') {
  const token = await ask(`${lang} Instagram 토큰 붙여넣기(앱 대시보드 → Instagram 로그인으로 API 설정 → 토큰 생성): `);
  const me = await whoami('instagram', token);
  setEnv({ [`IG_TOKEN_${envKey(lang)}`]: token, [`IG_TOKEN_${envKey(lang)}_EXPIRES`]: expiry(60 * 864e2) });
  console.log(`✅ 저장: Instagram ${lang} = @${me.username}`);
} else if (cmd === 'check') {
  for (const l of langs()) {
    for (const [ch, key] of [['instagram', `IG_TOKEN_${envKey(l)}`], ['threads', `THREADS_TOKEN_${envKey(l)}`]]) {
      const t = process.env[key];
      if (!t) { console.log(`· ${ch.padEnd(9)} ${l.padEnd(5)} 토큰 없음`); continue; }
      try { const me = await whoami(ch, t); console.log(`✅ ${ch.padEnd(9)} ${l.padEnd(5)} @${me.username} 만료 ${process.env[`${key}_EXPIRES`] || '?'}`); }
      catch (e) { console.log(`❌ ${ch.padEnd(9)} ${l.padEnd(5)} ${String(e.message).slice(0, 120)}`); }
    }
  }
} else if (cmd === 'refresh') {
  for (const l of langs()) {
    for (const [ch, key] of [['instagram', `IG_TOKEN_${envKey(l)}`], ['threads', `THREADS_TOKEN_${envKey(l)}`]]) {
      if (!process.env[key]) continue;
      try { const r = await refreshToken(ch, process.env[key]); setEnv({ [key]: r.access_token, [`${key}_EXPIRES`]: expiry(r.expires_in) }); console.log(`🔄 ${ch} ${l} 만료 ${expiry(r.expires_in)}`); }
      catch (e) { console.log(`❌ ${ch} ${l} 갱신 실패 — ${String(e.message).slice(0, 120)}`); }
    }
  }
} else {
  console.log('사용법: node tokens.mjs th <lang> | ig <lang> | threads <lang> | check | refresh');
}
