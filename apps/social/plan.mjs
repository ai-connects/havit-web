// 하루치 발행 계획: config/calendar.json(84일 편성표)을 따라 켜진 채널×슬롯마다 1건 — 9개 언어 모두 같은 콘텐츠·같은 포맷, 시각만 현지. 글은 그 계정에서 가장 오래 안 쓴 검증 글, 포맷은 날짜로 돌린다.
//   node plan.mjs 2026-10-26            → queue/plan-2026-10-26.json (그날 하루)
//   node plan.mjs 2026-10-26 7          → 그날부터 7일
// 발행 시각(publish_at, UTC)은 config/channels.json 의 langs.*.tz / post_hours(현지 시각).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, hasLang, isDrugTopic } from './lib/source.mjs';

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

const ch = config('channels');
const CAL = config('calendar');
const calDay = (date) => CAL.days[(((dayIndex(date) - dayIndex(CAL.start)) % CAL.days.length) + CAL.days.length) % CAL.days.length];
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
  const cal = calDay(date);
  let a = 0;
  for (const [channel, rule] of Object.entries(ch.channels)) {
    if (!rule.enabled) continue;
    const slots = [{ pick: rule.pick }, ...(rule.extra_slots || [])];
    const used = new Set();
    slots.forEach((slot, si) => {
      const slug = cal[slot.pick];
      if (!slug) throw new Error(`편성표에 ${slot.pick} 없음: ${date}`);
      if (isDrugTopic(slug)) throw new Error(`편성표에 약물 주제: ${slug}`);
      // 포맷은 날짜로 돌리되 언어와 무관(전 언어 동일). 같은 계정 같은 날 포맷 중복 없음.
      const format = pickFormat(slot.formats || rule.formats, (dayIndex(date) + si) % (slot.formats || rule.formats).length, slug, used);
      used.add(format);
      for (const lang of rule.langs) {
        if (!hasLang(slug, lang)) throw new Error(`${slug} 에 ${lang} 판 없음`);
        const L = ch.langs[lang];
        entries.push({
          date, channel, lang, slug, format,
          theme: cal.theme,
          segment: ch.segments[lang][(dayIndex(date) + a) % ch.segments[lang].length],
          publish_at: localToUtc(date, L.post_hours?.[slot.hour_key || channel] ?? 12, L.tz || 'UTC'),
          ...(slot.share ? { share: slot.share } : {}),
        });
      }
      a++;
    });
  }
  mkdirSync(QUEUE, { recursive: true });
  const day = entries.filter((e) => e.date === date);
  writeFileSync(path.join(QUEUE, `plan-${date}.json`), JSON.stringify({ start: date, entries: day }, null, 2) + '\n');
  console.log(`${date}: ${day.length}건`);
}
