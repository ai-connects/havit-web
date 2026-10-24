import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAGLINE, withTagline } from '../lib/brand.mjs';

const disc = '※ 일반 정보이며 의학적 조언을 대신하지 않아요.';
test('키 카피는 면책 문구 바로 위에 한 번만', () => {
  const d = withTagline({ lang: 'ko', posts: [`본문\n\n${disc}`] }, disc);
  assert.equal(d.posts[0], `본문\n\n${TAGLINE.ko}\n\n${disc}`);
  assert.equal(withTagline(d, disc).posts[0], d.posts[0]); // 두 번 붙여도 한 번
});
test('면책 문구가 없으면(Threads 본문) 마지막 줄에', () => {
  assert.ok(withTagline({ lang: 'en', posts: ['a', 'b'] }, 'x').posts[1].endsWith(TAGLINE.en));
});
test('SNS 9개 언어 모두 키 카피가 있다', () => {
  for (const l of ['ko', 'ja', 'en', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr']) assert.ok(TAGLINE[l], l);
});
