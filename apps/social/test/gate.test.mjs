import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide, mustEscalate } from '../lib/gate.mjs';

const base = { channel: 'threads', lang: 'ko', posts: ['야식 생각이 날 때 5분만 지켜봐요.'], first_reply: '', lint: { status: 'PASS', errors: [] } };
const ok = { verdict: 'approve', confidence: 0.95, issues: [] };
const accounts = [{ channel: 'threads', lang: 'ko', handle: 'havit_app', first_post_date: '2026-11-01' }];

test('계정 미등록이면 반려', () => {
  assert.equal(decide(base, ok, '2026-11-20', { accounts: [] }).status, 'rejected');
});
test('GLP-1 등 약 이름은 반려(다국어)', () => {
  for (const p of ['위고비 맞는 분들께', 'マンジャロを使っている方へ', 'Si usas un medicamento GLP-1', '正在使用司美格鲁肽', 'metformin users']) {
    assert.equal(decide({ ...base, posts: [p] }, ok, '2026-11-20', { accounts }).status, 'rejected', p);
  }
});
test('인슐린 저항성·약 복용 시 상담 안내는 막지 않는다(2026-10-27 오탐)', () => {
  for (const p of ['내장지방은 인슐린 저항성과 연결돼요', 'linked to insulin resistance', 'インスリン抵抗性', 'la résistance à l\'insuline', '약을 복용 중이면 의료진과 상담하세요', 'Jika memakai obat diabetes, ikuti saran dokter']) {
    assert.equal(decide({ ...base, posts: [p] }, ok, '2026-11-20', { accounts }).status, 'auto_approved', p);
  }
});
test('사람 대기열은 없다: 리뷰어 human 은 반려, 리뷰 없음도 반려', () => {
  assert.equal(decide(base, { verdict: 'human', confidence: 0.6, issues: ['x'] }, '2026-11-20', { accounts }).status, 'rejected');
  assert.equal(decide(base, null, '2026-11-20', { accounts }).status, 'rejected');
});
test('기계 검사 FAIL 은 거절', () => {
  assert.equal(decide({ ...base, lint: { status: 'FAIL', errors: ['x'] } }, ok).status, 'rejected');
});
test('리뷰어 revise 는 재작성', () => {
  assert.equal(decide(base, { verdict: 'revise', confidence: 0.9, issues: ['어색함'] }, '2026-11-20', { accounts }).status, 'revise');
});

test('등록 계정·7일 경과·리뷰 통과면 자동 승인', () => {
  assert.equal(decide(base, ok, '2026-11-20', { accounts }).status, 'auto_approved');
});
test('새 계정도 리뷰 통과면 자동 승인(첫 7일 규칙 끔)', () => {
  assert.equal(decide(base, ok, '2026-11-03', { accounts }).status, 'auto_approved');
});
test('확신도 0.5 이상 approve 는 자동 승인, 미만은 고쳐 쓰기', () => {
  assert.equal(decide(base, { ...ok, confidence: 0.6 }, '2026-11-20', { accounts }).status, 'auto_approved');
  assert.equal(decide(base, { ...ok, confidence: 0.4 }, '2026-11-20', { accounts }).status, 'revise');
});
test('긴급 중지 스위치가 켜지면 전부 중지', () => {
  assert.equal(decide(base, ok, '2026-11-20', { accounts, control: { publishing_paused: true } }).status, 'paused');
});

test('리뷰어 revise 는 2번까지 고쳐 쓰고, 그 뒤엔 반려', () => {
  const rv = { verdict: 'revise', confidence: 0.9, issues: ['x'] };
  assert.equal(decide({ ...base, revision: 1 }, rv, '2026-11-20', { accounts }).status, 'revise');
  assert.equal(decide({ ...base, revision: 2 }, rv, '2026-11-20', { accounts }).status, 'rejected');
});
