// GitHub Actions: 장기 토큰 갱신 → `gh secret set` 으로 덮어쓰기. 토큰 값은 로그에 찍지 않는다(stdin 으로만 전달).
import { execFileSync } from 'node:child_process';
import { refreshToken } from './lib/meta.mjs';

const repo = process.env.GITHUB_REPOSITORY;
let ok = 0, fail = 0;
for (const [name, value] of Object.entries(process.env)) {
  const m = name.match(/^(IG|THREADS)_TOKEN_[A-Z_]+$/);
  if (!m || !value) continue;
  try {
    const r = await refreshToken(m[1] === 'IG' ? 'instagram' : 'threads', value);
    execFileSync('gh', ['secret', 'set', name, '--repo', repo], { input: r.access_token, stdio: ['pipe', 'ignore', 'inherit'] });
    console.log(`🔄 ${name} 갱신(만료 ${Math.round(r.expires_in / 864e2)}일)`); ok++;
  } catch (e) { console.log(`❌ ${name} — ${String(e.message).slice(0, 120)}`); fail++; }
}
console.log(`갱신 ${ok} · 실패 ${fail}`);
process.exit(fail ? 1 : 0);
