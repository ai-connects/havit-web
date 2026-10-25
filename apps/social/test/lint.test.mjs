import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSource, withUtm } from '../lib/source.mjs';
import { lint, numbers } from '../lib/lint.mjs';

const slug = 'meditation-for-food-cravings-5-minute-practice-2026';
const src = loadSource(slug, 'ko');
const entry = { channel: 'threads', lang: 'ko', format: 'question', slug };
const link = withUtm(src.url, entry);
const disclaimer = '※ 일반 정보이며 의학적 조언을 대신하지 않아요. 섭식 문제나 질환이 있다면 전문가와 상담하세요.';
const good = () => ({ ...entry, link, posts: ['밤 10시, 야식 생각이 올라오면 5분만 지켜봐요. 오늘은 어떤 음식이 떠올랐나요?'], slides: [], first_reply: `전체 가이드 👉 ${link}`, hashtags: ['다이어트'], evidence: [], keywords: ['야식'] });

test('숫자 토큰 정규화', () => {
  assert.deepEqual(numbers('1,350명 20–30% 4.5kg'), ['1350', '20', '30', '4.5']);
});
test('정상 초안은 PASS', () => {
  const r = lint(good(), src);
  assert.equal(r.status, 'PASS', r.errors.join('; '));
});
test('원문에 없는 숫자는 FAIL', () => {
  const d = good(); d.posts = ['이 방법으로 87%가 야식을 줄였어요. 여러분은요?'];
  assert.match(lint(d, src).errors.join(), /87/);
});
test('금지어는 FAIL', () => {
  const d = good(); d.posts = ['무조건 살 빠지는 5분 명상이에요?'];
  assert.match(lint(d, src).errors.join(), /금지어/);
});
test('Threads 본문 링크는 FAIL', () => {
  const d = good(); d.posts = [`5분 명상 가이드 ${link}`];
  assert.match(lint(d, src).errors.join(), /본문에 링크/);
});
test('Threads 는 면책 문구를 넣으면 FAIL(프로필 소개에 있음)', () => {
  const d = good(); d.first_reply = `${link}\n${disclaimer}`;
  assert.match(lint(d, src).errors.join(), /면책/);
});
test('검증 안 된 글은 소스로 못 쓴다', () => {
  assert.throws(() => loadSource('best-diet-apps', 'ko'), /검증되지 않은/);
});
test('영어 금지어는 단어 경계로만(secure 는 통과)', () => {
  const s = loadSource(slug, 'en');
  const e = { channel: 'threads', lang: 'en', format: 'question', slug };
  const l = withUtm(s.url, e);
  const d = { ...e, link: l, posts: ['Feel secure about cravings for 5 minutes. What helps you?'], first_reply: l, hashtags: [], evidence: [], keywords: ['cravings'] };
  assert.equal(lint(d, s).status, 'PASS', lint(d, s).errors.join());
});

test('스페인어 금지어도 단어 단위(segura 는 통과, cura 는 FAIL)', () => {
  const s = loadSource(slug, 'es');
  const e = { channel: 'threads', lang: 'es', format: 'question', slug };
  const l = withUtm(s.url, e);
  const disc = 'Información general, no es consejo médico. Si tienes problemas con la alimentación o una condición de salud, consulta a un profesional.';
  const base = { ...e, link: l, first_reply: l, hashtags: [], evidence: [], keywords: ['antojo'] };
  assert.equal(lint({ ...base, posts: ['Una forma segura de pasar 5 minutos con un antojo. ¿Lo probarías?'] }, s).status, 'PASS');
  assert.match(lint({ ...base, posts: ['Esta meditación cura los antojos.'] }, s).errors.join(), /금지어/);
});
test('중국어 번체 소스 — 면책 없이 PASS', () => {
  const s = loadSource(slug, 'zh-tw');
  const e = { channel: 'threads', lang: 'zh-tw', format: 'question', slug };
  const l = withUtm(s.url, e);
  const d = { ...e, link: l, posts: ['嘴饞的時候，先給自己5分鐘看看那股衝動。你最常想吃什麼？'], first_reply: l, hashtags: [], evidence: [] };
  assert.doesNotMatch(lint(d, s).errors.join(), /면책/);
});

test('한국어 브랜드 표기는 하비트(하빗은 FAIL)', () => {
  const d = good(); d.posts = ['하빗 앱에서 5분 명상을 해봐요. 어떤 음식이 떠올랐나요?'];
  assert.match(lint(d, src).errors.join(), /금지어: 하빗/);
});

test('대표 검색 키워드가 없으면 FAIL', () => {
  const { keywords, ...d } = good();
  assert.match(lint(d, src).errors.join(), /keywords/);
});

test('링크 공유 글: URL 이 본문·답글에 있으면 FAIL, 없으면 PASS', () => {
  const ok = { ...good(), share: 'link', first_reply: '' };
  assert.equal(lint(ok, src).status, 'PASS');
  const bad = { ...ok, first_reply: link };
  assert.match(lint(bad, src).errors.join(), /링크 공유/);
});

test('한국어 금지어는 낱말 앞쪽 경계로(정기적·주기적은 통과, 기적은 FAIL)', () => {
  const ok = good(); ok.posts = ['정기적으로 체중을 재 보세요. 주기적으로 기록하면 좋아요. 어떤 시간이 편한가요?'];
  assert.doesNotMatch(lint(ok, src).errors.join(), /금지어: 기적/);
  const bad = good(); bad.posts = ['기적 같은 변화가 생겨요. 어떤 음식이 떠올랐나요?'];
  assert.match(lint(bad, src).errors.join(), /금지어: 기적/);
});
