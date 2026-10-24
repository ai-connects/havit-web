import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config, hasLang, isQuiz, loadSource, quizSlugs } from '../lib/source.mjs';
import { numbers } from '../lib/lint.mjs';

test('앱 퀴즈는 SNS 전 언어 판이 있다', () => {
  const langs = config('channels').channels.instagram.langs;
  for (const id of quizSlugs()) for (const lang of langs) assert.ok(hasLang(id, lang), `${id} ${lang}`);
});

test('퀴즈 소스: 정답·해설·출처를 싣고, 숫자 허용 목록은 퀴즈 원문에서 나온다', () => {
  const id = quizSlugs()[0];
  assert.ok(isQuiz(id));
  const s = loadSource(id, 'ko');
  assert.equal(s.kind, 'app_quiz');
  assert.match(s.answer, /^[OX]$/);
  assert.ok(s.quiz_statement && s.explanation && s.reference);
  for (const n of numbers(s.explanation)) assert.ok(numbers(s._text).includes(n));
});

test('없는 퀴즈 id 는 거부', () => {
  assert.throws(() => loadSource('quiz-s99-art-0000', 'ko'), /퀴즈 라이브러리에 없다/);
});
