// 1회 설정 — 대표님이 **본인 Terminal 앱**에서 실행한다(채팅에서 `!` 로 실행하지 말 것: 입력값이 대화에 남음).
//   cd ~/Havit-Workspace/havit-social/apps/social && git pull && node setup.mjs
// 하는 일: 토큰·키를 하나씩 붙여넣으면 검증 후 GitHub Secrets 에 바로 저장(화면·파일에 남기지 않음).
//   1) Threads 토큰 9개(앱 대시보드 사용자 토큰 생성기)  2) Instagram 토큰 9개  3) Anthropic API 키
//   4) AWS 업로드 전용 IAM 키(aws login 상태면 자동 생성 — image/sns/·social-queue/ 만 허용)
//   5) 토큰 자동 갱신용 GitHub 토큰(PAT)  6) Slack Webhook(선택)
// 이미 저장된 항목은 Enter 로 건너뛴다.
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { config } from './lib/source.mjs';
import { envKey, whoami } from './lib/meta.mjs';

const REPO = 'ai-connects/havit-web';
const BUCKET = 'havit-prod-us-east';
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = async (q) => (await rl.question(q)).trim();
const setSecret = (name, value) => execFileSync('gh', ['secret', 'set', name, '--repo', REPO], { input: value, stdio: ['pipe', 'ignore', 'inherit'] });
const existing = new Set(execFileSync('gh', ['secret', 'list', '--repo', REPO, '--json', 'name', '-q', '.[].name'], { encoding: 'utf8' }).split('\n').filter(Boolean));
const HANDLE = Object.fromEntries(config('accounts').accounts.filter((a) => a.channel === 'instagram').map((a) => [a.lang, a.handle]));
const langs = config('channels').channels.instagram.langs;

console.log('\n=== HAVIT SNS 1회 설정 ===\n토큰은 Meta 앱 대시보드(HAVIT Social Publisher)에서 복사합니다. 붙여넣은 값은 화면에 남지 않게 바로 저장됩니다.\n');

for (const [ch, label, where] of [
  ['threads', 'Threads', '이용 사례 → Threads 맞춤 설정 → 설정 → 사용자 토큰 생성기 → 액세스 토큰 생성하기'],
  ['instagram', 'Instagram', '이용 사례 → Instagram 맞춤 설정 → Instagram 로그인으로 API 설정 → 액세스 토큰 생성'],
]) {
  console.log(`\n[${label} 토큰] 위치: ${where}`);
  for (const lang of langs) {
    const name = `${ch === 'threads' ? 'THREADS' : 'IG'}_TOKEN_${envKey(lang)}`;
    const t = await ask(`  ${HANDLE[lang]} (${lang})${existing.has(name) ? ' [저장됨 — Enter 로 건너뛰기]' : ''}: `);
    if (!t) continue;
    try {
      const me = await whoami(ch, t);
      if (me.username !== HANDLE[lang]) { console.log(`  ⚠️ 다른 계정 토큰(@${me.username}) — 다시 붙여넣기 필요`); continue; }
      setSecret(name, t); console.log(`  ✅ @${me.username} 저장`);
    } catch (e) { console.log(`  ❌ 토큰 확인 실패: ${String(e.message).slice(0, 100)}`); }
  }
}

for (const [name, q] of [
  ['ANTHROPIC_API_KEY', 'Anthropic API 키(console.anthropic.com → API Keys)'],
  ['SLACK_WEBHOOK_URL', 'Slack Webhook URL(선택 — 매일 요약 받을 곳)'],
  ['SOCIAL_SECRETS_PAT', 'GitHub 토큰(토큰 자동 갱신용: github.com/settings/personal-access-tokens → ai-connects/havit-web, Secrets: Read and write)'],
]) {
  const v = await ask(`\n${q}${existing.has(name) ? ' [저장됨 — Enter]' : ''}: `);
  if (v) { setSecret(name, v); console.log(`  ✅ ${name} 저장`); }
}

if (!existing.has('AWS_ACCESS_KEY_ID') && (await ask('\nAWS 업로드 전용 키를 지금 만들까요? (먼저 `aws login`) [y/N]: ')).toLowerCase() === 'y') {
  const user = 'havit-social-publisher';
  const policy = JSON.stringify({ Version: '2012-10-17', Statement: [
    { Effect: 'Allow', Action: ['s3:PutObject'], Resource: `arn:aws:s3:::${BUCKET}/image/sns/*` },
    { Effect: 'Allow', Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'], Resource: `arn:aws:s3:::${BUCKET}/social-queue/*` },
    { Effect: 'Allow', Action: ['s3:ListBucket'], Resource: `arn:aws:s3:::${BUCKET}`, Condition: { StringLike: { 's3:prefix': ['social-queue/*', 'image/sns/*'] } } },
  ] });
  const aws = (...a) => execFileSync('aws', a, { encoding: 'utf8' });
  try { aws('iam', 'create-user', '--user-name', user); } catch { /* 이미 있음 */ }
  aws('iam', 'put-user-policy', '--user-name', user, '--policy-name', 'social-s3', '--policy-document', policy);
  const key = JSON.parse(aws('iam', 'create-access-key', '--user-name', user)).AccessKey;
  setSecret('AWS_ACCESS_KEY_ID', key.AccessKeyId);
  setSecret('AWS_SECRET_ACCESS_KEY', key.SecretAccessKey);
  console.log('  ✅ AWS 키 생성·저장(값은 표시하지 않음)');
}
rl.close();
const now = new Set(execFileSync('gh', ['secret', 'list', '--repo', REPO, '--json', 'name', '-q', '.[].name'], { encoding: 'utf8' }).split('\n').filter(Boolean));
const need = [...langs.flatMap((l) => [`THREADS_TOKEN_${envKey(l)}`, `IG_TOKEN_${envKey(l)}`]), 'ANTHROPIC_API_KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'SOCIAL_SECRETS_PAT'];
const missing = need.filter((n) => !now.has(n));
console.log(missing.length ? `\n남은 항목 ${missing.length}개: ${missing.join(', ')}\n다시 실행하면 남은 것만 물어봅니다.` : '\n🎉 설정 완료 — 이제 매일 자동으로 돌아갑니다. Claude 에게 "설정 끝"이라고 알려주세요.');
