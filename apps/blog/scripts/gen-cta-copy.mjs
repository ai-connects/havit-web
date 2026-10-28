#!/usr/bin/env node
/**
 * 글별 맞춤 설치 문구 생성 — data/cta-experiment.json 의 test 글만.
 *   node scripts/gen-cta-copy.mjs            # 없는 것만 생성
 *   node scripts/gen-cta-copy.mjs --force    # 전부 다시
 *
 * 글이 다룬 문제 → 그걸 돕는 하비트 기능 하나로 잇는 제목 한 줄 + 버튼 문구.
 * 기능 사실은 홈페이지 문구(apps/web/src/i18n/<lang>.json)에서만 가져온다 — 없는 기능·수치·의학 표현을
 * 지어내지 않게 하려고. 생성은 구독(`claude -p`)으로 돌리고, 결과는 lint 를 통과한 것만 저장한다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const WEB_I18N = path.resolve(ROOT, '../web/src/i18n');
const EXP = JSON.parse(readFileSync(path.join(ROOT, 'data/cta-experiment.json'), 'utf8'));
const OUT = path.join(ROOT, 'data/cta-copy.json');
const force = process.argv.includes('--force');
const out = existsSync(OUT) && !force ? JSON.parse(readFileSync(OUT, 'utf8')) : {};

/** 블로그 URL 언어 → 아티클 JSON 언어 키 · 홈 i18n 파일 */
const LANGS = {
  ko: { article: 'ko', web: 'ko', name: 'Korean', brand: '하비트', title: 32, button: 14 },
  ja: { article: 'ja', web: 'ja', name: 'Japanese', brand: 'HAVIT', title: 34, button: 14 },
  'zh-tw': { article: 'zh-TW', web: 'zh-tw', name: 'Traditional Chinese (Taiwan)', brand: 'HAVIT', title: 28, button: 10 },
};

/** 홈에서 기능을 설명하는 문구만 — 후기·임상 수치·약관은 뺀다(CTA 에 수치를 싣지 않는다). */
const FACT_KEYS = [
  'havit-connects-ai-body-composition', 'use-a-photo-to-receive', 'get-personalized-recommendations-meal-feedback',
  'meals-hydration-workouts-sleep-steps', 'follow-estimated-body-composition-and', 'turn-healthy-intentions-into-small',
  'condition-sleep-appetite-mood', 'guided-meditation-for-craving', 'running-coach-desc', 'havit-connects-what-you-log',
  'you-can-track-meals-calories', 'the-ai-coach-uses-the',
];

const BANNED = {
  ko: /진단|치료|처방|완치|보장|최고|1위|No\.?1|기적|확실히|무조건/i,
  ja: /診断|治療|処方|完治|保証|最高|No\.?1|奇跡|必ず|絶対/i,
  'zh-tw': /診斷|治療|處方|治癒|保證|最好|第一|No\.?1|奇蹟|一定|絕對/i,
};

function facts(web) {
  const d = JSON.parse(readFileSync(path.join(WEB_I18N, `${web}.json`), 'utf8'));
  return FACT_KEYS.map((k) => d[k]).filter(Boolean).map((s) => `- ${s.replace(/<[^>]+>/g, '')}`).join('\n');
}

function lint(lang, c) {
  const L = LANGS[lang];
  const errs = [];
  if (!c || typeof c.title !== 'string' || typeof c.button !== 'string') return ['형식'];
  if ([...c.title].length > L.title) errs.push(`제목 ${[...c.title].length}자 > ${L.title}`);
  if ([...c.button].length > L.button) errs.push(`버튼 ${[...c.button].length}자 > ${L.button}`);
  if (/\d/.test((c.title + c.button).replace(/GLP-1/g, ''))) errs.push('숫자');
  if (BANNED[lang].test(c.title + c.button)) errs.push('금지어');
  if (lang === 'ko' && /하빗|Havit\b/.test(c.title + c.button)) errs.push('브랜드 표기');
  return errs;
}

function claude(system, user) {
  return new Promise((resolve, reject) => {
    const cp = spawn('claude', ['-p', '--model', 'claude-sonnet-5-5', '--system-prompt', system, '--tools', '',
      '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence', '--output-format', 'json'],
    { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, ANTHROPIC_API_KEY: '' } });
    let o = '';
    cp.stdout.on('data', (b) => { o += b; });
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

const SYSTEM = (lang) => {
  const L = LANGS[lang];
  return `You write the install call-to-action that sits inside a health article on the HAVIT blog.
The reader has just read the article. Connect the specific problem the article is about to ONE thing the HAVIT app does, so tapping feels like the natural next step.

Write in ${L.name}. Brand name: ${L.brand}.

What HAVIT actually does (use ONLY these capabilities — do not invent features):
${facts(L.web)}

Rules:
- title: one sentence, at most ${L.title} characters. Name the reader's situation from the article, then what HAVIT does about it. Concrete, not generic ("start your journey" style lines are not allowed).
- button: an action phrase saying what they get when they tap, at most ${L.button} characters (e.g. "내 식단 분석받기", not "시작하기").
- No numbers or digits. No statistics. No medical claims: never diagnose, treat, cure, prescribe, guarantee, or promise results. No superlatives (best, No.1).
- No medication advice. For medication articles, only say the app helps you keep a record/routine alongside your care.
- Natural, native phrasing; polite register that matches the blog.

Return ONLY JSON: {"<slug>": {"title": "...", "button": "..."}, ...} for every slug you receive.`;
};

async function main() {
  const jobs = [];
  for (const [lang, g] of Object.entries(EXP.groups)) {
    const todo = g.test.filter((s) => !out[s]?.[lang]);
    for (let i = 0; i < todo.length; i += 10) jobs.push({ lang, slugs: todo.slice(i, i + 10) });
  }
  console.log(`생성 묶음 ${jobs.length}개`);
  let n = 0;
  const run = async (job, retry = 0) => {
    const L = LANGS[job.lang];
    const items = job.slugs.map((s) => {
      const a = JSON.parse(readFileSync(path.join(ROOT, 'data/articles', `${s}.json`), 'utf8'));
      const l = a.langs[L.article];
      return { slug: s, category: a.category, title: l.title, summary: String(l.tldr || l.meta_description || '').slice(0, 400) };
    });
    let res = {};
    try { res = await claude(SYSTEM(job.lang), JSON.stringify(items, null, 1)); } catch (e) { console.error('실패', e.message); }
    const bad = [];
    for (const s of job.slugs) {
      const errs = lint(job.lang, res[s]);
      if (errs.length) { bad.push(s); console.error(`  ✗ ${job.lang} ${s}: ${errs.join(', ')}`); continue; }
      (out[s] ||= {})[job.lang] = { title: res[s].title.trim(), button: res[s].button.trim() };
    }
    if (bad.length && retry < 2) await run({ lang: job.lang, slugs: bad }, retry + 1);
    writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
    console.log(`… ${++n}/${jobs.length}`);
  };
  const q = [...jobs];
  await Promise.all(Array.from({ length: 6 }, async () => { while (q.length) await run(q.shift()); }));
  const count = Object.values(out).reduce((a, v) => a + Object.keys(v).length, 0);
  console.log(`완료 — ${count}건 (${OUT})`);
}

main();
