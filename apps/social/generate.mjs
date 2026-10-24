// 계획의 슬롯을 Claude 로 초안 생성 → 자동 검사 → queue/<date>/ 에 저장(사람 승인 대기).
//   node generate.mjs queue/plan-2026-10-26.json [--date 2026-10-26] [--dry]
// 환경 변수: ANTHROPIC_API_KEY (필수, --dry 제외), SOCIAL_MODEL (기본 claude-sonnet-5-5)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSource, readJson, withUtm } from './lib/source.mjs';
import { buildPrompt } from './lib/prompt.mjs';
import { lint } from './lib/lint.mjs';
import { withTagline } from './lib/brand.mjs';
import { config } from './lib/source.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const planPath = args.find((a) => a.endsWith('.json'));
const onlyDate = args.includes('--date') ? args[args.indexOf('--date') + 1] : null;
const dry = args.includes('--dry');
const MODEL = process.env.SOCIAL_MODEL || 'claude-sonnet-5-5';

const plan = readJson(path.resolve(planPath));
const entries = plan.entries.filter((e) => !onlyDate || e.date === onlyDate);

let client = null;
if (!dry) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  client = new Anthropic();
}

function parseJson(text) {
  const s = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(s);
}

let pass = 0;
for (const e of entries) {
  // 이미 쓴 초안은 다시 쓰지 않는다(중간 단계 실패 후 재실행 때 비용 0). 다시 쓰려면 --force.
  const out = path.join(ROOT, 'queue', e.date, `${e.channel}-${e.lang}-${e.slug}.json`);
  if (!dry && !args.includes('--force') && existsSync(out)) { pass++; continue; }
  const source = loadSource(e.slug, e.lang);
  const link = withUtm(source.url, e);
  const { system, user } = buildPrompt(e, source, link);
  if (dry) {
    console.log(`--- ${e.date} ${e.channel}/${e.lang} ${e.slug} [${e.format}]\n${system}\n\n${user.slice(0, 600)}…\n`);
    continue;
  }
  let draft;
  let result;
  // 검사 실패 시 실패 사유를 붙여 1회만 재생성한다. 그래도 실패하면 FAIL 로 저장해 사람이 본다.
  for (let attempt = 0; attempt < 2; attempt++) {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 16000, // 모델이 먼저 생각(thinking)에 토큰을 쓰므로 넉넉히 — 4000 이면 본문이 잘렸다
      system,
      messages: [{ role: 'user', content: attempt === 0 ? user : `${user}\n\nYour previous draft failed these checks — fix them:\n${result.errors.join('\n')}` }],
    });
    try {
      draft = withTagline({ ...parseJson(msg.content.map((c) => c.text || '').join('')), ...e, link }, config('channels').langs[e.lang].disclaimer);
      result = lint(draft, source);
    } catch (err) {
      // 응답이 잘렸거나 JSON 이 아니면 그 건만 실패로 두고 재시도(다른 건은 계속 생성)
      draft = { ...e, link, posts: [] };
      result = { status: 'FAIL', errors: [`응답 JSON 파싱 실패(${msg.stop_reason}): ${String(err.message).slice(0, 80)}`], warnings: [] };
    }
    if (result.status === 'PASS') break;
  }
  const dir = path.join(ROOT, 'queue', e.date);
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${e.channel}-${e.lang}-${e.slug}.json`);
  writeFileSync(file, JSON.stringify({ ...draft, lint: result, approved: false }, null, 2) + '\n');
  if (result.status === 'PASS') pass++;
  console.log(`${result.status} ${path.relative(ROOT, file)}${result.errors.length ? ' — ' + result.errors.join('; ') : ''}`);
}
if (!dry) console.log(`\nPASS ${pass}/${entries.length} — 전부 approved:false 상태. 사람 승인 후에만 발행한다.`);
