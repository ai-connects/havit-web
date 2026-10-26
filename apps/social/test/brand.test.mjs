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

test('첫 댓글 서비스 소개는 링크 줄 바로 위에 한 번', async () => {
  const { INTRO, withIntro } = await import('../lib/brand.mjs');
  const d = withIntro({ lang: 'ko', first_reply: '정답은 O예요.\n\n무료 하비트 앱 👉 https://app.aihavit.com/' });
  assert.equal(d.first_reply, `정답은 O예요.\n\n${INTRO.ko}\n무료 하비트 앱 👉 https://app.aihavit.com/`);
  assert.equal(withIntro(d).first_reply, d.first_reply);
  assert.ok(withIntro({ lang: 'en', first_reply: 'O or X? Tell us below 👇' }).first_reply.endsWith(INTRO.en));
});

test('모델이 바꿔 쓴 키 카피 줄은 지우고 정본 한 줄만(fr 중복 반려)', () => {
  const d = withTagline({ lang: 'fr', posts: ["Corps.\n\nHAVIT, ton coach minceur IA conçu par d'anciens membres de Juvis Diet"],
    first_reply: "Réponse : Vrai.\nHAVIT, ton coach minceur IA conçu par d'anciens experts de Juvis Diet\nL'app gratuite est via le lien en bio." }, 'x');
  assert.equal(d.posts[0], `Corps.\n\n${TAGLINE.fr}`);
  assert.equal(d.first_reply, "Réponse : Vrai.\nL'app gratuite est via le lien en bio.");
});
test('쥬비스를 말해도 긴 본문 줄과 첫 댓글 서비스 소개는 남긴다', async () => {
  const { INTRO } = await import('../lib/brand.mjs');
  const long = '쥬비스 다이어트에서 수천 명을 코칭하며 배운 건, 체중은 하루 이틀이 아니라 몇 주의 흐름으로 봐야 한다는 거예요. 그래서 오늘은 기록부터.';
  const d = withTagline({ lang: 'ko', posts: [long], first_reply: `정답은 O예요.\n${INTRO.ko}` }, 'x');
  assert.ok(d.posts[0].startsWith(long));
  assert.equal(d.first_reply, `정답은 O예요.\n${INTRO.ko}`);
});
