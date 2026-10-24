// 하루치 발행 계획: 켜진 채널(enabled)×언어×슬롯마다 1건. 퀴즈 슬롯(source: 'quiz')은 앱 퀴즈 라이브러리를 쓴다. 글은 그 계정에서 가장 오래 안 쓴 검증 글, 포맷은 날짜로 돌린다.
//   node plan.mjs 2026-10-26            → queue/plan-2026-10-26.json (그날 하루)
//   node plan.mjs 2026-10-26 7          → 그날부터 7일
// 발행 시각(publish_at, UTC)은 config/channels.json 의 langs.*.tz / post_hours(현지 시각).
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, hasLang, quizSlugs, readJson, verifiedSlugs } from './lib/source.mjs';

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
// 레시피 같은 포맷은 해당 표시(sources.json)가 있는 글에만 — 아니면 다음 포맷으로.
const REQUIRES = ch.format_requires || {};
const FLAGS = new Map(config('sources').sources.map((x) => [x.slug, x]));
const pickFormat = (formats, i, slug, used = new Set()) => {
  for (let k = 0; k < formats.length; k++) {
    const f = formats[(i + k) % formats.length];
    if (!used.has(f) && (!REQUIRES[f] || FLAGS.get(slug)?.[REQUIRES[f]])) return f;
  }
  return formats[i];
};
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
    // 기본 슬롯 + 추가 슬롯(예: Threads 블로그 링크 글). 추가 슬롯은 다른 글을 쓴다.
    const slots = [{}, ...(rule.extra_slots || [])];
    const today = new Map();
    const usedToday = (c, l) => today.get(`${c}:${l}`) || today.set(`${c}:${l}`, new Set()).get(`${c}:${l}`);
    slots.forEach((slot, si) => {
      const formats = slot.formats || rule.formats;
      rule.langs.forEach((lang, li) => {
        // source: 'quiz' 슬롯은 앱 퀴즈 라이브러리에서, 나머지는 검증된 블로그 글에서 고른다.
        const pool = (slot.source === 'quiz' ? quizSlugs() : slugs).filter((s) => hasLang(s, lang));
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
          // 같은 계정의 같은 날 슬롯끼리 포맷이 겹치지 않게(날짜×슬롯 수 + 슬롯 + 언어)
          format: pickFormat(formats, (dayIndex(date) * slots.length + si + li) % formats.length, slug, usedToday(channel, lang)),
          segment: ch.segments[lang][(dayIndex(date) + a) % ch.segments[lang].length],
          publish_at: localToUtc(date, L.post_hours?.[slot.hour_key || channel] ?? 12, L.tz || 'UTC'),
          ...(slot.share ? { share: slot.share } : {}),
        });
        usedToday(channel, lang).add(entries.at(-1).format);
        a++;
      });
    });
  }
  mkdirSync(QUEUE, { recursive: true });
  const day = entries.filter((e) => e.date === date);
  writeFileSync(path.join(QUEUE, `plan-${date}.json`), JSON.stringify({ start: date, entries: day }, null, 2) + '\n');
  console.log(`${date}: ${day.length}건`);
}
