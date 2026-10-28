#!/usr/bin/env node
/**
 * 현지화 재작성 실험 — data/rewrite-experiment.json 의 rewrite 글만, 해당 언어 본문(body_md)·요약(tldr)을
 * 「번역투·AI 말투」를 걷어낸 원어민 편집본으로 다시 쓴다. control 글은 그대로 둔다.
 *
 *   node scripts/localize-rewrite.mjs [--lang ja] [--limit 3] [--dry]
 *
 * 사실은 바꾸지 않는다: 숫자·링크·인용 출처·표는 원문과 같아야 하고, 소제목 수도 같아야 반영한다.
 * 제목·메타 설명·날짜는 건드리지 않는다(본문 효과만 보려고). 결과 원문은 logs/localize-rewrite.jsonl.
 */
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIR = path.join(ROOT, 'data/articles');
const LOG = path.join(ROOT, 'logs/localize-rewrite.jsonl');
const EXP = JSON.parse(readFileSync(path.join(ROOT, 'data/rewrite-experiment.json'), 'utf8'));
const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null);
const ONLY = arg('--lang');
const LIMIT = Number(arg('--limit') || Infinity);
const DRY = process.argv.includes('--dry');
// 다른 정리 작업(fix-fabricated-anecdotes)이 같은 본문을 먼저 고쳤어도 재작성본으로 덮는다 — 재작성이 그 정리를 포함한다.
const APPLY_ONLY = process.argv.includes('--apply-only');
const CONC = Number(process.env.CONC || 8);

/** 블로그 URL 언어 → 아티클 JSON 키 · 편집 지침 */
const LANGS = {
  ko: { key: 'ko', guide: `Korean. Write like a Korean health editor at a domestic magazine: natural 해요/합니다 mix as in the original register, Korean sentence rhythm, no English-style dashes (—) — use commas, periods or parentheses. Prefer everyday Korean examples (편의점, 배달 음식, 출퇴근, 회식) over American scenes when the example is only illustrative.` },
  ja: { key: 'ja', guide: `Japanese. Write like a Japanese health-media editor: です・ます調, natural Japanese rhythm, no em dashes (—) — use 「、」「。」or（）. Avoid translated English rhetoric ("〜ですよね？", stacked rhetorical questions). Prefer everyday Japanese examples (コンビニ, 通勤電車, 定食, 飲み会) over American scenes when the example is only illustrative.` },
  'zh-tw': { key: 'zh-TW', guide: `Traditional Chinese for Taiwan. Write like a Taiwanese health-media editor: Taiwan vocabulary (例: 便利商店, 早餐店, 手搖飲, 捷運), natural sentence rhythm, use ——only rarely (at most once or twice per article), prefer commas/periods/括號. Avoid English idioms translated literally. Prefer everyday Taiwanese examples over American scenes when the example is only illustrative.` },
};

const SYSTEM = (guide) => `You are a native senior editor. Rewrite a health article section so it reads as if written by a native editor, not translated from English or written by an AI.

Target: ${guide}

Fix: translationese, AI tells (formulaic hooks, "Here's the thing", stacked rhetorical questions, excessive dashes, colon headlines like "X: Y" inside paragraphs, filler like "it's important to note"), unnatural word order, culturally foreign illustrative scenes, and any invented personal anecdote ("I", "my friend") — state such points generally instead.

Do NOT change: facts, claims, every number, every citation in parentheses, every link, every markdown table (copy tables byte-for-byte), the number and order of headings (you may reword heading text naturally), lists stay lists. Do not add new facts, studies, products or advice. Do not add superlatives. Keep length within ±15%.

Return ONLY JSON: {"tldr": "...", "body_md": "..."}`;

// 같은 수치를 몇 번 반복하느냐는 문장 정리로 바뀔 수 있다 — 등장하는 수치의 집합만 같으면 된다(새 수치·빠진 수치는 거부).
const nums = (s) => [...new Set(s.match(/\d+(?:[.,]\d+)?/g) || [])].sort().join('|');
const links = (s) => (s.match(/\]\([^)]+\)|https?:\/\/[^\s)]+/g) || []).sort().join('|');
const cites = (s) => (s.match(/\([^()]*\d{4}[^()]*\)/g) || []).sort().join('|');
const tables = (s) => s.split('\n').filter((l) => l.trimStart().startsWith('|')).join('\n');
const heads = (s) => s.split('\n').filter((l) => /^#{1,6} /.test(l)).length;
const dashes = (s) => (s.match(/—/g) || []).length;

function check(o, n) {
  if (!n?.body_md || typeof n.tldr !== 'string') return 'empty';
  const r = [...n.body_md].length / [...o.body_md].length;
  if (r < 0.8 || r > 1.2) return `length ${r.toFixed(2)}`;
  if (nums(o.body_md) !== nums(n.body_md)) return 'numbers';
  if (links(o.body_md) !== links(n.body_md)) return 'links';
  if (cites(o.body_md) !== cites(n.body_md)) return 'citations';
  if (tables(o.body_md) !== tables(n.body_md)) return 'tables';
  if (heads(o.body_md) !== heads(n.body_md)) return 'headings';
  if (nums(String(o.tldr || '')) !== nums(n.tldr)) return 'tldr numbers';
  return null;
}

function claude(system, user) {
  return new Promise((resolve, reject) => {
    const cp = spawn(process.env.CLAUDE_BIN || 'claude', ['-p', '--model', 'claude-opus-5-5', '--system-prompt', system, '--tools', '',
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

mkdirSync(path.dirname(LOG), { recursive: true });
const done = new Set((() => { try { return readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => { const j = JSON.parse(l); return `${j.slug}|${j.lang}`; }); } catch { return []; } })());
const jobs = Object.entries(EXP.groups).filter(([l]) => !ONLY || l === ONLY)
  .flatMap(([lang, g]) => g.rewrite.map((slug) => ({ lang, slug }))).filter((j) => !done.has(`${j.slug}|${j.lang}`)).slice(0, LIMIT);
console.log(`재작성 ${jobs.length}건`);
const stat = { ok: 0, rejected: 0, failed: 0 };

async function run(j, attempt = 0) {
  const L = LANGS[j.lang];
  const d = JSON.parse(readFileSync(path.join(DIR, `${j.slug}.json`), 'utf8'));
  const o = d.langs[L.key];
  let n;
  try {
    n = await claude(SYSTEM(L.guide), JSON.stringify({ title: o.title, tldr: o.tldr, body_md: o.body_md }));
  } catch (e) { stat.failed++; console.error(`실패 ${j.lang} ${j.slug}: ${String(e.message).slice(0, 120)}`); return; }
  const bad = check(o, n);
  if (bad) {
    if (attempt < 1) return run(j, attempt + 1);
    stat.rejected++; console.error(`  ✗ ${j.lang} ${j.slug}: ${bad}`); return;
  }
  appendFileSync(LOG, JSON.stringify({ slug: j.slug, lang: j.lang, dashes: [dashes(o.body_md), dashes(n.body_md)], before: { tldr: o.tldr, body_md: o.body_md }, after: n }) + '\n');
  stat.ok++;
  console.log(`  ✓ ${j.lang} ${j.slug} (— ${dashes(o.body_md)}→${dashes(n.body_md)})`);
}

const q = APPLY_ONLY ? [] : [...jobs];
await Promise.all(Array.from({ length: CONC }, async () => { while (q.length) await run(q.shift()); }));
console.log(`생성 끝 ${JSON.stringify(stat)}`);

// 반영은 마지막에 한 번 — 같은 파일을 동시에 쓰지 않게.
if (!DRY) {
  let applied = 0;
  for (const line of readFileSync(LOG, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(line);
    const p = path.join(DIR, `${r.slug}.json`);
    const raw = readFileSync(p, 'utf8');
    const d = JSON.parse(raw);
    const c = d.langs[LANGS[r.lang].key];
    c.body_md = r.after.body_md;
    c.tldr = r.after.tldr;
    writeFileSync(p, JSON.stringify(d, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
    applied++;
  }
  console.log(`반영 ${applied}건`);
}
