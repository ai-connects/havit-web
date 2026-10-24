// 하루치 발행 계획: 켜진 채널(enabled)×언어마다 1건. 글은 그 계정에서 가장 오래 안 쓴 검증 글, 포맷은 날짜로 돌린다.
//   node plan.mjs 2026-10-26            → queue/plan-2026-10-26.json (그날 하루)
//   node plan.mjs 2026-10-26 7          → 그날부터 7일
// 발행 시각(publish_at, UTC)은 config/channels.json 의 langs.*.tz / post_hours(현지 시각).
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, hasLang, readJson, verifiedSlugs } from './lib/source.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const QUEUE = path.join(ROOT, 'queue');
const [start = new Date().toISOString().slice(0, 10), days = '1'] = process.argv.slice(2);

/** 현지 날짜·시각(tz) → UTC ISO. 실행 서버의 시간대와 무관(Intl 로 tz 오프셋 계산, DST 포함). */
function tzOffsetMin(ms, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms) / 6e4;
}
export function localToUtc(date, hour, tz) {
  const [y, m, d] = date.split('-').map(Number);
  const wall = Date.UTC(y, m - 1, d, hour);
  let ms = wall - tzOffsetMin(wall, tz) * 6e4;
  ms = wall - tzOffsetMin(ms, tz) * 6e4; // DST 경계 보정
  return new Date(ms).toISOString();
}

// 계정별로 각 글을 마지막으로 쓴 날짜(계획 파일 기준) — 가장 오래 안 쓴 글부터 고른다.
const lastUsed = new Map();
if (existsSync(QUEUE)) {
  for (const f of readdirSync(QUEUE).filter((x) => /^plan-.*\.json$/.test(x))) {
    for (const e of readJson(path.join(QUEUE, f)).entries) {
      const k = `${e.channel}:${e.lang}:${e.slug}`;
      if (!lastUsed.has(k) || lastUsed.get(k) < e.date) lastUsed.set(k, e.date);
    }
  }
}

const ch = config('channels');
const slugs = verifiedSlugs();
const dayIndex = (d) => Math.floor(Date.parse(`${d}T00:00:00Z`) / 864e5);
const entries = [];
for (let i = 0; i < Number(days); i++) {
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + i);
  const date = d.toISOString().slice(0, 10);
  if (existsSync(path.join(QUEUE, `plan-${date}.json`))) continue; // 이미 계획된 날은 건너뜀(재실행 안전)
  let a = 0;
  for (const [channel, rule] of Object.entries(ch.channels)) {
    if (!rule.enabled) continue;
    for (const lang of rule.langs) {
      const pool = slugs.filter((s) => hasLang(s, lang));
      // 가장 오래 안 쓴 글(안 쓴 글 우선). 같은 날 같은 언어의 IG·Threads 가 같은 글을 쓰지 않게 계정마다 시작점을 비튼다.
      const ranked = pool
        .map((s, j) => ({ s, used: lastUsed.get(`${channel}:${lang}:${s}`) || '', tie: (j + a * 7 + dayIndex(date)) % pool.length }))
        .sort((x, y) => x.used.localeCompare(y.used) || x.tie - y.tie);
      const slug = ranked[0].s;
      lastUsed.set(`${channel}:${lang}:${slug}`, date);
      const L = ch.langs[lang];
      entries.push({
        date,
        channel,
        lang,
        slug,
        format: rule.formats[(dayIndex(date) + a) % rule.formats.length],
        segment: ch.segments[lang][(dayIndex(date) + a) % ch.segments[lang].length],
        publish_at: localToUtc(date, L.post_hours?.[channel] ?? 12, L.tz || 'UTC'),
      });
      a++;
    }
  }
  mkdirSync(QUEUE, { recursive: true });
  const day = entries.filter((e) => e.date === date);
  writeFileSync(path.join(QUEUE, `plan-${date}.json`), JSON.stringify({ start: date, entries: day }, null, 2) + '\n');
  console.log(`${date}: ${day.length}건`);
}
