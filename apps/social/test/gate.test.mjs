import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide, mustEscalate } from '../lib/gate.mjs';

const base = { channel: 'threads', lang: 'ko', posts: ['야식 생각이 날 때 5분만 지켜봐요.'], first_reply: '', lint: { status: 'PASS', errors: [] } };
const ok = { verdict: 'approve', confidence: 0.95, issues: [] };

test('계정 미등록이면 사람 검토', () => {
  assert.equal(decide(base, ok, '2026-11-20', { accounts: [] }).status, 'human');
});
test('약물 언급은 무조건 사람 검토(다국어)', () => {
  for (const p of ['위고비 맞는 분들께', 'マンジャロを使っている方へ', 'Si usas un medicamento GLP-1', '正在使用司美格鲁肽', 'Ask your prescriber before changing medication']) {
    assert.ok(mustEscalate({ ...base, posts: [p] }).includes('약물 언급'), p);
  }
});
test('기계 검사 FAIL 은 거절', () => {
  assert.equal(decide({ ...base, lint: { status: 'FAIL', errors: ['x'] } }, ok).status, 'rejected');
});
test('리뷰어 revise 는 재작성', () => {
  assert.equal(decide(base, { verdict: 'revise', confidence: 0.9, issues: ['어색함'] }).status, 'revise');
});

const accounts = [{ channel: 'threads', lang: 'ko', handle: 'havit_app', first_post_date: '2026-11-01' }];
test('등록 계정·7일 경과·리뷰 통과면 자동 승인', () => {
  assert.equal(decide(base, ok, '2026-11-20', { accounts }).status, 'auto_approved');
});
test('새 계정도 리뷰 통과면 자동 승인(첫 7일 규칙 끔)', () => {
  assert.equal(decide(base, ok, '2026-11-03', { accounts }).status, 'auto_approved');
});
test('리뷰어 확신 0.85 미만이면 사람 검토', () => {
  assert.equal(decide(base, { ...ok, confidence: 0.7 }, '2026-11-20', { accounts }).status, 'human');
});
test('긴급 중지 스위치가 켜지면 전부 중지', () => {
  assert.equal(decide(base, ok, '2026-11-20', { accounts, control: { publishing_paused: true } }).status, 'paused');
});

test('리뷰어 revise 는 2번까지 고쳐 쓰고, 그 뒤엔 반려', () => {
  const rv = { verdict: 'revise', confidence: 0.9, issues: ['x'] };
  assert.equal(decide({ ...base, revision: 1 }, rv).status, 'revise');
  assert.equal(decide({ ...base, revision: 2 }, rv).status, 'rejected');
});
