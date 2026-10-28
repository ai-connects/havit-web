#!/usr/bin/env node
/**
 * 지어낸 1인칭·지인 일화 걷어내기 — 「대학 시절 룸메이트는…」「코스트코에서 생수를 들고…제가」처럼
 * 실재하지 않는 사람의 경험을 사실처럼 쓴 문단만 찾아, 같은 요점을 일반화한 문장으로 바꾼다.
 *
 *   node scripts/fix-fabricated-anecdotes.mjs [--lang ja] [--limit 20] [--dry]
 *
 * 1) 언어별 정규식으로 1인칭·지인 표지가 있는 본문 문단만 후보로 고른다(제목·표·인용 제외).
 * 2) `claude -p`(구독)가 후보마다 「지어낸 일화인가」를 판정하고, 맞으면 고쳐 쓴 문단을 돌려준다.
 * 3) 숫자·링크·인용 출처가 원문과 같고 길이가 크게 달라지지 않은 것만 반영한다.
 * 바뀐 문단은 logs/anecdote-fixes.jsonl 에 원문과 함께 남긴다. 날짜(explicit_updated_at)는 건드리지 않는다.
 */
import { readFileSync, writeFileSync, readdirSync, appendFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIR = path.join(ROOT, 'data/articles');
const LOG = path.join(ROOT, 'logs/anecdote-fixes.jsonl');
const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null);
const ONLY = arg('--lang');
const LIMIT = Number(arg('--limit') || Infinity);
const DRY = process.argv.includes('--dry');
const CONC = Number(process.env.CONC || 8);
// 이전 실행 로그의 「실패 <파일> <언어>:」 줄만 다시 돌린다(성공한 글×언어는 판정 비용을 다시 쓰지 않게).
const RETRY = arg('--retry') && new Set(readFileSync(arg('--retry'), 'utf8').split('\n')
  .map((l) => l.match(/^실패 (\S+) (\S+):/)).filter(Boolean).map((m) => `${m[1]}|${m[2]}`));

const CUE = {
  en: /\b(I|I'm|I've|I'd|my|me)\b|roommate|a friend of mine|a client of mine|one of my/i,
  ko: /제가|저는|저도|나는|내가|제 친구|내 친구|룸메이트|제 지인|한 독자|제 동료/,
  ja: /私|僕|友人|ルームメイト|知人|同僚の|ある読者/,
  'zh-TW': /我(?!們)|朋友|室友|同事/,
  'zh-CN': /我(?!们)|朋友|室友|同事/,
  es: /\b(yo|mi amig[oa]|mi compañer[oa]|me pasó|recuerdo)\b/i,
  'pt-BR': /\b(eu|meu amigo|minha amiga|meu colega|lembro)\b/i,
  de: /\b(ich|mein Freund|meine Freundin|mein Mitbewohner|meine Kollegin|mein Kollege)\b/i,
  fr: /\b(je|j'|mon ami|mon amie|mon colocataire|ma collègue|mon collègue)\b/i,
  id: /\b(saya|aku|teman saya|teman sekamar)\b/i,
};
const NAME = { en: 'English', ko: 'Korean', ja: 'Japanese', 'zh-TW': 'Traditional Chinese', 'zh-CN': 'Simplified Chinese', es: 'Spanish', 'pt-BR': 'Brazilian Portuguese', de: 'German', fr: 'French', id: 'Indonesian' };

const SYSTEM = `You clean up health articles on a company blog. Some paragraphs contain FABRICATED anecdotes: the writer describing their own experience ("I", "my roommate", "a friend of mine", "a client", "a reader told me") as if it really happened. The blog has no such writer, so these are invented and must go.

For each candidate paragraph decide:
- fabricated = true ONLY if it narrates a specific personal experience of the writer or of a specific acquaintance as real.
- fabricated = false for: generic "you" scenarios, clearly hypothetical framing, quotes from studies or named experts, example questions a reader might ask, the word "I" inside a quoted user phrase, or first-person plural "we" about research.

If fabricated, rewrite that paragraph so the same point stands without the invented person: describe it as a common situation ("Some people… while others…", "If you have ever…"). Keep the original language, register, markdown, every number, every citation in parentheses, and every link exactly. Keep it about the same length. Do not add new facts. Do not change paragraphs that are not fabricated.

Return ONLY JSON: {"<id>": {"fabricated": true|false, "text": "<rewritten paragraph, only when fabricated>"}, ...}`;

const nums = (s) => (s.match(/\d+(?:[.,]\d+)?/g) || []).sort().join('|');
const links = (s) => (s.match(/\]\([^)]+\)|https?:\/\/\S+/g) || []).sort().join('|');
const cites = (s) => (s.match(/\([^()]*\d{4}[^()]*\)/g) || []).sort().join('|');

function check(orig, next) {
  if (!next || typeof next !== 'string') return 'empty';
  const r = [...next].length / [...orig].length;
  if (r < 0.5 || r > 1.6) return `length ${r.toFixed(2)}`;
  if (nums(orig) !== nums(next)) return 'numbers';
  if (links(orig) !== links(next)) return 'links';
  if (cites(orig) !== cites(next)) return 'citations';
  return null;
}

function claude(user) {
  return new Promise((resolve, reject) => {
    const cp = spawn(process.env.CLAUDE_BIN || 'claude', ['-p', '--model', 'claude-sonnet-5-5', '--system-prompt', SYSTEM, '--tools', '',
      '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence', '--output-format', 'json'],
    { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, ANTHROPIC_API_KEY: '' } });
    let o = '';
    cp.stdout.on('data', (b) => { o += b; });
    cp.on('error', reject);
    cp.on('close', () => {
      try {
        const j = JSON.parse(o);
        if (j.is_error) return reject(new Error(String(j.result).slice(0, 200)));
        const t = j.result;
        resolve(JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)));
      } catch (e) { reject(e); }
    });
    cp.stdin.end(user);
  });
}

// 후보 모으기: 글×언어 단위. 문단 = 빈 줄로 나눈 덩어리(제목·표·인용·목록 제외).
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const jobs = [];
for (const f of files) {
  const d = JSON.parse(readFileSync(path.join(DIR, f), 'utf8'));
  for (const [lang, re] of Object.entries(CUE)) {
    if (ONLY && lang !== ONLY) continue;
    if (RETRY && !RETRY.has(`${f}|${lang}`)) continue;
    const body = d.langs?.[lang]?.body_md;
    if (!body) continue;
    const paras = body.split('\n\n');
    const idx = paras.map((p, i) => i).filter((i) => {
      const p = paras[i].trimStart();
      return p && !/^(#|\||>|[-*] |\d+\. )/.test(p) && re.test(p);
    });
    if (idx.length) jobs.push({ file: f, lang, title: d.langs[lang].title, idx });
  }
}
const todo = jobs.slice(0, LIMIT);
console.log(`후보 글×언어 ${jobs.length} (처리 ${todo.length}), 문단 ${todo.reduce((a, j) => a + j.idx.length, 0)}`);
mkdirSync(path.dirname(LOG), { recursive: true });

// 같은 파일을 여러 언어가 동시에 고치지 않도록 파일 단위로 묶어 순서대로 처리한다.
const byFile = new Map();
for (const j of todo) (byFile.get(j.file) || byFile.set(j.file, []).get(j.file)).push(j);
const queue = [...byFile.values()];
const stat = { fixed: 0, kept: 0, rejected: 0, failed: 0 };
let done = 0;

async function runFile(group) {
  const p = path.join(DIR, group[0].file);
  const raw = readFileSync(p, 'utf8');
  const d = JSON.parse(raw);
  let changed = false;
  for (const j of group) {
    const paras = d.langs[j.lang].body_md.split('\n\n');
    const ctx = j.idx.map((i) => ({ id: String(i), before: (paras[i - 1] || '').slice(-200), paragraph: paras[i], after: (paras[i + 1] || '').slice(0, 200) }));
    let res;
    try {
      res = await claude(`Language: ${NAME[j.lang]}\nArticle title: ${j.title}\n\nCandidates:\n${JSON.stringify(ctx, null, 1)}`);
    } catch (e) { stat.failed += j.idx.length; console.error(`실패 ${j.file} ${j.lang}: ${String(e.message).slice(0, 120)}`); continue; }
    for (const i of j.idx) {
      const r = res[String(i)];
      if (!r?.fabricated) { stat.kept++; continue; }
      const bad = check(paras[i], r.text);
      if (bad) { stat.rejected++; console.error(`  ✗ ${j.file} ${j.lang} #${i}: ${bad}`); continue; }
      appendFileSync(LOG, JSON.stringify({ file: j.file, lang: j.lang, para: i, before: paras[i], after: r.text }) + '\n');
      paras[i] = r.text;
      stat.fixed++;
      changed = true;
    }
    d.langs[j.lang].body_md = paras.join('\n\n');
  }
  if (changed && !DRY) writeFileSync(p, JSON.stringify(d, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
  if (++done % 25 === 0) console.log(`… ${done}/${queue.length} 글 · ${JSON.stringify(stat)}`);
}

await Promise.all(Array.from({ length: CONC }, async () => { while (queue.length) await runFile(queue.shift()); }));
console.log(`완료 ${JSON.stringify(stat)}${DRY ? ' (dry — 파일 미변경)' : ''}`);
