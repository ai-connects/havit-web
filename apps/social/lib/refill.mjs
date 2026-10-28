// 상황별 시리즈 자동 보충의 순수 함수: 빈 편성 칸 계산 · AI 가 기획한 주제 검사 · 근거 인용 정리. (series_refill.mjs 가 쓴다)
import { config } from './source.mjs';

const DAY = 864e5;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const dow = (d) => new Date(`${d}T00:00:00Z`).getUTCDay(); // 0=일 … 6=토
const addDays = (d, n) => iso(Date.parse(`${d}T00:00:00Z`) + n * DAY);

// 보충 편성(대표 결정 2026-10-28: 상황별은 주 2건씩, 미리 만든 게 끝나면 자동 생성)
//   생존 가이드: 월 07시·금 15시, 매번 Instagram+Threads(채널별 주 2건)
//   AI 잔소리: Threads 화·목(에피소드 local_hour, 없으면 21시) + 목요일 편을 다음 주 화요일 20시 Instagram 캐러셀로
export const SLOTS = {
  survival: [{ dow: 1, hour: 7, channels: ['instagram', 'threads'] }, { dow: 5, hour: 15, channels: ['instagram', 'threads'] }],
  nag: [{ dow: 2, hour: 21, channels: ['threads'] }, { dow: 4, hour: 21, channels: ['threads'], igNextTue: true }],
};
const FORMAT = { survival: { instagram: 'situation_playbook', threads: 'situation_post' }, nag: { instagram: 'nag_carousel', threads: 'nag_post' } };

/** 그 시리즈의 마지막 편성일(없으면 null). 주 채널 Threads 기준 — 잔소리 Instagram 은 Threads 며칠 뒤 재게시라 더 늦다. */
export const lastDate = (entries, series) => entries.filter((e) => e.series === series && e.channel === 'threads').map((e) => e.date).sort().pop() || null;

/** 보충이 필요한가: 마지막 편성일이 오늘 + horizon 일보다 앞이면. */
export const needsRefill = (entries, series, today, horizon = 28) => {
  const last = lastDate(entries, series);
  return !last || last < addDays(today, horizon);
};

/** 마지막 편성일 다음(또는 내일) 이후의 빈 칸 n 개 = 주제 n 개 자리. 같은 계정의 기존 시각과 겹치면 한 시간씩 민다. */
export function nextSlots(entries, series, today, n) {
  const last = lastDate(entries, series);
  let d = addDays(last && last > today ? last : today, 1);
  const out = [];
  while (out.length < n) {
    for (const s of SLOTS[series]) if (dow(d) === s.dow && out.length < n) out.push({ date: d, ...s });
    d = addDays(d, 1);
  }
  return out;
}

/** 칸 + 주제 → 편성 항목(설정 편성표와 같은 모양). */
export function toEntries(slots, items, series, startNo, allEntries) {
  const taken = takenHours();
  const used = new Map(); // date|channel → 시각들
  for (const e of allEntries) used.set(`${e.date}|${e.channel}`, new Set([...(used.get(`${e.date}|${e.channel}`) || []), e.hour]));
  const free = (date, ch, h) => {
    const busy = new Set([...taken[ch], ...(used.get(`${date}|${ch}`) || [])]);
    for (const step of [0, 1, -1, 2, -2, 3, -3]) if (h + step >= 6 && h + step <= 23 && !busy.has(h + step)) return h + step;
    throw new Error(`${date} ${ch} 빈 시각 없음`);
  };
  const out = [];
  const add = (date, ch, item, hour, no) => {
    const h = free(date, ch, hour);
    used.set(`${date}|${ch}`, new Set([...(used.get(`${date}|${ch}`) || []), h]));
    out.push({ date, channel: ch, hour: h, slug: item.id, series, series_no: no, format: FORMAT[series][ch], auto: true });
  };
  slots.forEach((s, i) => {
    const item = items[i];
    if (!item) return;
    const hour = series === 'nag' ? Number(item.local_hour) || s.hour : s.hour;
    for (const ch of s.channels) add(s.date, ch, item, hour, startNo + i);
    if (s.igNextTue) add(addDays(s.date, 5), 'instagram', item, 20, startNo + i);
  });
  return out;
}

function takenHours() {
  const ph = config('channels').langs.ko.post_hours; // 전 언어 같은 현지 시각
  return Object.fromEntries(['instagram', 'threads'].map((ch) => [ch, new Set(Object.entries(ph).filter(([k]) => k.split('_')[0] === ch).map(([, h]) => h))]));
}

// SNS 에 내지 않는 주제: 약물(대표 결정 2026-10-24) · 임상 검토가 필요한 주제(단식·과식 보상·보충제 등 — 사람 임상 승인 없이는 편성 안 함)
const BANNED = /glp-?1|semaglutide|tirzepatide|ozempic|wegovy|mounjaro|zepbound|saxenda|metformin|insulin|medication|prescri|supplement|diet pill|laxative|diuretic|detox|cleanse|fasting|intermittent|purg|vomit|binge|compensat|starv|keto|calorie deficit of|약물|처방|보충제|다이어트 ?약|변비약|이뇨제|디톡스|단식|간헐적|폭식|구토|굶|보상 운동|케토/i;

/** 기획된 주제 하나 검사 → 문제 목록(빈 배열이면 통과). 형식은 같은 시리즈의 기존 주제(예시)와 같은 키를 요구한다. */
export function checkTopic(item, example, existingTitles) {
  const errs = [];
  for (const k of ['id', 'series', 'langs']) if (!item[k]) errs.push(`${k} 없음`);
  if (item.series !== example.series) errs.push('series 불일치');
  for (const L of ['ko', 'en']) {
    const want = Object.keys(example.langs[L]);
    const got = item.langs?.[L] || {};
    for (const k of want) if (!(k in got)) errs.push(`${L}.${k} 없음`);
    if (!got.title) errs.push(`${L}.title 비어 있음`);
  }
  // 안전 안내(「폭식이 반복되면 전문가와」)는 금지어 검사에서 뺀다 — 주제 자체(제목·장면·팁)만 본다
  const body = ['ko', 'en'].map((L) => { const { safety_note: _s, ...rest } = item.langs?.[L] || {}; return JSON.stringify(rest); }).join(' ');
  if (BANNED.test(body)) errs.push('금지 주제(약물·단식·폭식 보상 등)');
  const norm = (t) => String(t || '').replace(/\s+/g, '').toLowerCase();
  if (existingTitles.has(norm(item.langs?.ko?.title)) || existingTitles.has(norm(item.langs?.en?.title))) errs.push('기존 주제와 제목 중복');
  return errs;
}

// 「저자 et al., 연도」「A & B, 연도」꼴 인용
const CITE = /[A-Z][\p{L}'-]+(?: [A-Z]{1,3})?(?: et al\.| & [A-Z][\p{L}'-]+)?,? \d{4}/gu;
/** 근거 인용은 기존 주제에 이미 쓰인(검증된) 것만 남긴다 — 하나라도 처음 보는 인용이면 근거 문장을 비운다(지어낸 인용 차단). */
export function cleanEvidence(item, knownCitations) {
  for (const L of ['ko', 'en']) {
    const ev = item.langs?.[L]?.evidence;
    if (!ev) continue;
    const cites = ev.replace(/ 등,/g, ' et al.,').match(CITE) || []; // ko 판은 「Zheng Y 등, 2015」
    if (!cites.length || cites.some((c) => !knownCitations.has(c))) item.langs[L].evidence = '';
  }
  if (!item.langs.ko.evidence || !item.langs.en.evidence) { item.langs.ko.evidence = ''; item.langs.en.evidence = ''; } // 두 판이 같아야 한다
  return item;
}

export const citationsIn = (items) => new Set(items.flatMap((x) => ['ko', 'en'].flatMap((L) => x.langs?.[L]?.evidence?.replace(/ 등,/g, ' et al.,').match(CITE) || [])));
