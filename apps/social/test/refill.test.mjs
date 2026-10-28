import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../lib/source.mjs';
import { checkTopic, citationsIn, cleanEvidence, needsRefill, nextSlots, toEntries } from '../lib/refill.mjs';

const items = config('situations').items;
const sit = items.find((x) => x.series === 'survival' && !x.clinical_review);
const nag = items.find((x) => x.series === 'nag' && !x.clinical_review);
const titles = new Set(items.flatMap((x) => ['ko', 'en'].map((L) => x.langs[L].title.replace(/\s+/g, '').toLowerCase())));
const clone = (x, id, ko, en) => ({ ...structuredClone(x), id, langs: { ko: { ...structuredClone(x.langs.ko), title: ko }, en: { ...structuredClone(x.langs.en), title: en } } });

test('보충 필요: 마지막 편성이 오늘+28일 안이면', () => {
  const entries = [{ series: 'nag', channel: 'threads', date: '2026-12-01' }, { series: 'survival', channel: 'threads', date: '2027-02-05' }];
  assert.equal(needsRefill(entries, 'nag', '2026-11-10'), true);
  assert.equal(needsRefill(entries, 'survival', '2026-11-10'), false);
});

test('빈 칸: 생존 가이드는 월·금, 잔소리는 화·목 — 마지막 편성 다음부터', () => {
  const s = nextSlots([{ series: 'survival', channel: 'threads', date: '2027-02-05' }], 'survival', '2026-11-10', 4);
  assert.deepEqual(s.map((x) => x.date), ['2027-02-08', '2027-02-12', '2027-02-15', '2027-02-19']);
  const n = nextSlots([{ series: 'nag', channel: 'threads', date: '2026-12-01' }], 'nag', '2026-11-10', 2);
  assert.deepEqual(n.map((x) => x.date), ['2026-12-03', '2026-12-08']);
});

test('편성 항목: 잔소리 목요일 편은 다음 주 화요일 Instagram 으로도, 회차는 이어서', () => {
  const slots = nextSlots([{ series: 'nag', channel: 'threads', date: '2026-12-01' }], 'nag', '2026-11-10', 1); // 목 12-03
  const e = toEntries(slots, [{ id: 'nag-a01-x', local_hour: 22 }], 'nag', 22, []);
  assert.deepEqual(e.map((x) => [x.date, x.channel, x.series_no, x.format]), [['2026-12-03', 'threads', 22, 'nag_post'], ['2026-12-08', 'instagram', 22, 'nag_carousel']]);
});

test('주제 검사: 형식·금지 주제·중복을 막고, 안전 안내 속 「폭식」은 통과', () => {
  assert.deepEqual(checkTopic(clone(sit, 'sit-new', '새 주제', 'New topic'), sit, titles), []);
  assert.ok(checkTopic(clone(sit, 'sit-x', sit.langs.ko.title, 'Other'), sit, titles).some((e) => e.includes('중복')));
  const fast = clone(sit, 'sit-f', '단식 다음 날', 'Day after fasting');
  assert.ok(checkTopic(fast, sit, titles).some((e) => e.includes('금지')));
  const note = clone(nag, 'nag-n', '새 잔소리', 'New nag'); note.langs.ko.safety_note = '폭식이 반복되면 전문가와 상담하세요.';
  assert.deepEqual(checkTopic(note, nag, titles), []);
  const missing = clone(sit, 'sit-m', '빠짐', 'Missing'); delete missing.langs.en.tips;
  assert.ok(checkTopic(missing, sit, titles).some((e) => e.includes('en.tips')));
});

test('근거 인용: 처음 보는 인용이면 두 판 모두 비운다(지어낸 인용 차단)', () => {
  const known = citationsIn(items);
  const ok = clone(sit, 'sit-a', 'a', 'a');
  assert.ok(cleanEvidence(ok, known).langs.en.evidence);
  const fake = clone(sit, 'sit-b', 'b', 'b'); fake.langs.en.evidence = 'Snacking helps (Madeup Q et al., 2031).';
  const out = cleanEvidence(fake, known);
  assert.equal(out.langs.en.evidence, ''); assert.equal(out.langs.ko.evidence, '');
});
