import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config, hasLang, isDrugTopic, loadSource } from '../lib/source.mjs';
import { buildPrompt } from '../lib/prompt.mjs';
import { mustEscalate } from '../lib/gate.mjs';
import { lint } from '../lib/lint.mjs';

const items = config('situations').items;
const cal = config('series_calendar');
const langs = config('channels').channels.threads.langs;

test('상황 시리즈 원문: 9개 언어 모두 열리고 약물 주제 없음', () => {
  for (const x of items) {
    assert.ok(!isDrugTopic(x.id), x.id);
    for (const l of langs) {
      assert.ok(hasLang(x.id, l), `${x.id} ${l}`);
      const s = loadSource(x.id, l);
      assert.ok(s.kind.startsWith('app_') && s.steps.length >= 1, x.id);
    }
  }
});

test('편성표: 임상 미승인 주제 없음 · 슬러그 실재 · 포맷 안내 있음 · 같은 계정 같은 날 같은 시각 없음', () => {
  const byId = new Map(items.map((x) => [x.id, x]));
  const seen = new Set();
  for (const e of cal.entries) {
    const x = byId.get(e.slug);
    assert.ok(x, e.slug);
    assert.ok(!x.clinical_review || x.clinical_approved_by, `임상 미승인 편성: ${e.slug}`);
    const { system } = buildPrompt({ ...e, lang: 'ko', segment: 's' }, loadSource(e.slug, 'ko'), 'https://app.aihavit.com/');
    assert.match(system, /Format guidance: \S/, e.format);
    assert.doesNotMatch(system, /\{series\}|\{opener\}|\{n\}/, e.format);
    const k = `${e.date} ${e.channel} ${e.hour}`;
    assert.ok(!seen.has(k), k);
    seen.add(k);
  }
});

test('임상 검토 주제는 사람 검토로', () => {
  const x = items.find((i) => i.clinical_review);
  const d = { channel: 'threads', lang: 'ko', slug: x.id, posts: ['x'], first_reply: '' };
  assert.ok(mustEscalate(d, '2026-11-20', [{ channel: 'threads', lang: 'ko', handle: 'h' }]).some((r) => r.startsWith('임상 검토')));
});

test('회차 번호(EP.12)는 원문에 없어도 숫자 검사 통과', () => {
  const e = cal.entries.find((x) => x.channel === 'threads' && x.series_no > 10);
  const src = loadSource(e.slug, 'ko');
  const d = { ...e, lang: 'ko', posts: [`${src.hook}\n\nEP.${e.series_no}`], first_reply: `https://app.aihavit.com/`, hashtags: [], slides: [] };
  assert.ok(!lint(d, src).errors.some((m) => m.includes(String(e.series_no))), lint(d, src).errors.join(';'));
});
