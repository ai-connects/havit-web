// 상황별 시리즈 자동 보충: 미리 만든 편성이 4주 안에 끝나면 AI 가 새 상황 주제를 기획 → 임상 영양사 관점 검수 → 통과분만 편성에 붙인다.
//   node series_refill.mjs [--today 2026-11-30] [--horizon 28] [--weeks 4] [--dry]
// 결과는 레포가 아니라 queue/series/auto_situations.json · auto_calendar.json (S3 social-queue/series/) — lib/source.mjs 가 설정과 합쳐 읽는다.
// 붙인 주들은 social-series-batch 가 9개 언어로 생성·렌더·리뷰한다(GITHUB_OUTPUT 의 start·weeks). 사람 검토 단계는 없다.
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seriesCalendar, situationItems } from './lib/source.mjs';
import { createClient } from './lib/llm.mjs';
import { checkTopic, citationsIn, cleanEvidence, lastDate, needsRefill, nextSlots, toEntries } from './lib/refill.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const AUTO = path.join(ROOT, 'queue', 'series');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const today = opt('--today', new Date().toISOString().slice(0, 10));
const horizon = Number(opt('--horizon', 28));
const weeks = Number(opt('--weeks', 4));
const dry = args.includes('--dry');
const PLAN_MODEL = process.env.SOCIAL_PLAN_MODEL || 'claude-opus-5-5';
const PER_WEEK = { survival: 2, nag: 2 };
const NAMES = { survival: "「하비의 상황별 생존 가이드」 — a real everyday diet situation, the common mistake, and 3–4 practical expert tips", nag: "「AI 잔소리가 필요할 때」 — a tempting moment, the user's inner excuse, HAVI's warm nudge and one real tip" };

const readAuto = (name, key) => (existsSync(path.join(AUTO, `${name}.json`)) ? JSON.parse(readFileSync(path.join(AUTO, `${name}.json`), 'utf8')) : { [key]: [] });
const json = (t) => JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
const text = (msg) => msg.content.map((c) => c.text || '').join('');

const cal = seriesCalendar();
const items = situationItems();
const todo = ['survival', 'nag'].filter((s) => needsRefill(cal.entries, s, today, horizon));
console.log(`오늘 ${today} · 마지막 편성 생존 ${lastDate(cal.entries, 'survival')} · 잔소리 ${lastDate(cal.entries, 'nag')} · 보충 대상 ${todo.join(', ') || '없음'}`);
if (!todo.length) process.exit(0);

const client = dry ? null : await createClient();
const autoItems = readAuto('auto_situations', 'items');
const autoCal = readAuto('auto_calendar', 'entries');
const titles = new Set(items.flatMap((x) => ['ko', 'en'].map((L) => String(x.langs[L]?.title || '').replace(/\s+/g, '').toLowerCase())));
const known = citationsIn(items);
const added = [];

for (const series of todo) {
  const n = PER_WEEK[series] * weeks;
  const slots = nextSlots(cal.entries, series, today, n);
  const example = items.find((x) => x.series === series && !x.clinical_review);
  const existing = items.filter((x) => x.series === series).map((x) => `- ${x.langs.ko.title} / ${x.langs.en.title}`).join('\n');
  if (dry) { console.log(`[dry] ${series}: ${n}편 기획 → ${slots[0].date} ~ ${slots.at(-1).date}`); continue; }

  // 1) 기획: 기존 주제와 겹치지 않는 새 상황 n+3 개(검수 탈락 여유)
  const ask = `You plan new topics for HAVIT's SNS series ${NAMES[series]}. HAVIT is an AI diet coach app built by Juvis Diet alumni.
Write ${n + 3} NEW situations that do not overlap the existing ones below. Everyday, relatable, specific (a time, a place, a feeling). Mix work, home, social, travel and seasons around ${slots[0].date}–${slots.at(-1).date}.
Hard rules: no medication, GLP-1, supplements, diet pills, fasting protocols, detox, "make up for overeating", calorie targets, or body-shaming. Never tell anyone to eat less than they need. Advice must be widely accepted dietitian practice.
Numbers: only plain everyday ones (10 minutes, 1 plate). No statistics.
"evidence": cite ONLY studies from this list, word for word, or leave it "": ${[...known].join('; ')}.
Each item has the exact same keys as this example (ko = natural Korean 해요체, en = natural English; same meaning and same numbers in both):
${JSON.stringify(example, null, 1)}
Use "id": "${series === 'nag' ? 'nag' : 'sit'}-<short-english-kebab>", omit "topic"/"episode"/"priority", "clinical_review": false. ${series === 'nag' ? 'Set "weekday": "any" unless the scene needs a day.' : ''}
EXISTING (do not repeat):
${existing}
Return ONLY JSON: {"items": [...]}`;
  const proposed = json(text(await client.messages.create({ model: PLAN_MODEL, max_tokens: 32000, messages: [{ role: 'user', content: ask }] }))).items || [];

  // 2) 기계 검사(형식·금지 주제·중복) + 근거 인용 정리
  const pass = [];
  for (const it of proposed) {
    const errs = checkTopic(it, example, titles);
    if (errs.length) { console.log(`✗ ${it.id}: ${errs.join(', ')}`); continue; }
    pass.push(cleanEvidence(it, known));
  }

  // 3) 임상 영양사 관점 검수 — 통과한 것만 편성
  const review = json(text(await client.messages.create({ model: PLAN_MODEL, max_tokens: 8000, messages: [{ role: 'user', content:
    `You are a registered dietitian and an obesity-medicine physician reviewing proposed social-media topics for a diet app before anything is written from them.
Reject a topic if any of these hold: it needs clinical judgement (fasting, eating disorders, medical conditions, medication, pregnancy, minors), any tip is not widely accepted practice or could harm someone with an eating disorder, it shames bodies or food, a number or claim is not well established, or the ko and en versions differ in meaning or numbers.
Topics:\n${JSON.stringify(pass.map((x) => ({ id: x.id, langs: x.langs })), null, 1)}
Return ONLY JSON: {"verdicts": [{"id": "...", "ok": true|false, "reason": "short"}]}` }] })));
  const ok = new Set((review.verdicts || []).filter((v) => v.ok).map((v) => v.id));
  for (const v of review.verdicts || []) if (!v.ok) console.log(`✗ ${v.id}: 검수 탈락 — ${v.reason}`);

  // 4) id·코드 매기고 편성에 붙인다(마지막 편성 뒤로만 — 기존 편성은 건드리지 않는다)
  const base = Math.max(0, ...autoItems.items.filter((x) => x.series === series).map((x) => Number(String(x.topic || x.episode).slice(1)) || 0));
  const chosen = pass.filter((x) => ok.has(x.id)).slice(0, n).map(({ evidence: _e, ...x }, i) => { // 근거는 langs 안에만(맨 위 evidence 는 모델이 덧붙인 것)
    const code = `A${String(base + i + 1).padStart(2, '0')}`;
    const slug = String(x.id).replace(/^(sit|nag)-/, '').replace(/[^a-z0-9-]/g, '').slice(0, 40);
    return { ...x, id: `${series === 'nag' ? 'nag' : 'sit'}-${code.toLowerCase()}-${slug}`, ...(series === 'nag' ? { episode: code } : { topic: code }), priority: 100 + base + i, clinical_review: false, auto_planned: today };
  });
  const startNo = Math.max(0, ...cal.entries.filter((e) => e.series === series && e.channel === 'threads').map((e) => e.series_no)) + 1;
  const entries = toEntries(slots, chosen, series, startNo, cal.entries);
  autoItems.items.push(...chosen);
  autoCal.entries.push(...entries);
  cal.entries.push(...entries);
  added.push(...entries);
  console.log(`${series}: 기획 ${proposed.length} → 기계 검사 ${pass.length} → 검수 ${ok.size} → 편성 ${chosen.length}편 (${entries[0]?.date} ~ ${entries.at(-1)?.date})`);
}

if (!dry && added.length) {
  mkdirSync(AUTO, { recursive: true });
  writeFileSync(path.join(AUTO, 'auto_situations.json'), JSON.stringify({ _note: 'series_refill.mjs 자동 기획 주제(검수 통과분). 형식은 config/situations.json 과 같다.', items: autoItems.items }, null, 1) + '\n');
  autoCal.entries.sort((a, b) => (a.date + a.hour + a.channel).localeCompare(b.date + b.hour + b.channel));
  writeFileSync(path.join(AUTO, 'auto_calendar.json'), JSON.stringify({ _note: 'series_refill.mjs 자동 편성(설정 편성표 뒤에 붙는다).', entries: autoCal.entries }, null, 1) + '\n');
  // 생성할 주: 붙인 첫 날이 든 주의 월요일부터
  const first = added.map((e) => e.date).sort()[0];
  const last = added.map((e) => e.date).sort().pop();
  const monday = new Date(`${first}T00:00:00Z`); monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const span = Math.floor((Date.parse(`${last}T00:00:00Z`) - monday.getTime()) / (7 * 864e5)) + 1;
  const start = monday.toISOString().slice(0, 10);
  console.log(`생성할 주: ${start}부터 ${span}주`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `start=${start}\nweeks=${span}\n`);
}
