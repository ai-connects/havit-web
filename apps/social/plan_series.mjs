// 상황별 시리즈 발행 계획: config/series_calendar.json(날짜·채널·현지 시각이 정해진 편성표)의 그날 항목 × 9개 언어.
// 퀴즈 커리큘럼 계획(plan.mjs → plan-<date>.json)과 따로 plan-series-<date>.json 에 쓴다 — 미리 만든 날짜에도 매일 생성이 그대로 돈다.
//   node plan_series.mjs 2026-11-02        → 그날 하루
//   node plan_series.mjs 2026-11-02 7      → 그날부터 7일
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, hasLang, isDrugTopic } from './lib/source.mjs';
import { localToUtc } from './lib/time.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const QUEUE = path.join(ROOT, 'queue');
const [start = new Date().toISOString().slice(0, 10), days = '1'] = process.argv.slice(2);

const ch = config('channels');
const CAL = config('series_calendar');
const dayIndex = (d) => Math.floor(Date.parse(`${d}T00:00:00Z`) / 864e5);

for (let i = 0; i < Number(days); i++) {
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + i);
  const date = d.toISOString().slice(0, 10);
  const file = path.join(QUEUE, `plan-series-${date}.json`);
  if (existsSync(file)) continue; // 재실행 안전
  const entries = [];
  CAL.entries.filter((x) => x.date === date).forEach((slot, si) => {
    if (isDrugTopic(slot.slug)) throw new Error(`편성표에 약물 주제: ${slot.slug}`);
    const rule = ch.channels[slot.channel];
    if (!rule?.enabled) return;
    for (const lang of rule.langs) {
      if (!hasLang(slot.slug, lang)) throw new Error(`${slot.slug} 에 ${lang} 원문 없음`);
      const L = ch.langs[lang];
      entries.push({
        date, channel: slot.channel, lang, slug: slot.slug, format: slot.format,
        theme: slot.series, series_no: slot.series_no,
        segment: ch.segments[lang][(dayIndex(date) + si) % ch.segments[lang].length],
        publish_at: localToUtc(date, slot.hour, L.tz || 'UTC'),
      });
    }
  });
  if (!entries.length) continue;
  mkdirSync(QUEUE, { recursive: true });
  writeFileSync(file, JSON.stringify({ start: date, entries }, null, 2) + '\n');
  console.log(`${date}: ${entries.length}건`);
}
