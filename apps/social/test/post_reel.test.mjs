// 릴스 게시: 컨테이너 형식, 중복 차단, 게시 오류 복구, 입력 검사.
import test from 'node:test';
import assert from 'node:assert/strict';
import { publishInstagramReel } from '../lib/meta.mjs';
import { reelInputErrors } from '../post_reel.mjs';

const CAP = '식단, 운동, 체성분까지. 앱 하나면 됩니다.';
const VIDEO = 'https://cdn.example.com/reel.mp4';

function fakeMeta({ recent = [], publishFails = false, appearsAfterError = false, statuses = ['FINISHED'] } = {}) {
  const calls = [];
  let posted = false;
  let status = 0;
  globalThis.fetch = async (url, opt = {}) => {
    const u = new URL(url);
    const m = opt.method || 'GET';
    const body = opt.body ? Object.fromEntries(opt.body) : {};
    calls.push({ m, path: u.pathname, body });
    const ok = (j) => ({ ok: true, json: async () => j });
    if (u.pathname.endsWith('/me')) return ok({ user_id: '1', username: 'havit_app' });
    if (m === 'GET' && u.pathname.endsWith('/1/media')) {
      const now = new Date().toISOString();
      return ok({ data: [...recent, ...(posted ? [{ id: 'p9', caption: CAP, permalink: 'https://ig/p9', timestamp: now }] : [])] });
    }
    if (m === 'POST' && u.pathname.endsWith('/media_publish')) {
      if (publishFails) {
        if (appearsAfterError) posted = true;
        return { ok: false, json: async () => ({ error: { message: 'limit' } }) };
      }
      posted = true;
      return ok({ id: 'p1' });
    }
    if (m === 'POST' && u.pathname.endsWith('/media')) return ok({ id: 'c1' });
    if (u.searchParams.get('fields') === 'status_code') return ok({ status_code: statuses[Math.min(status++, statuses.length - 1)] });
    return ok({ permalink: 'https://ig/p1' });
  };
  return calls;
}

test('릴스 컨테이너를 REELS 형식으로 만들고 게시한다', async () => {
  const calls = fakeMeta();
  const r = await publishInstagramReel({ token: 't', videoUrl: VIDEO, caption: CAP });
  const create = calls.find((c) => c.m === 'POST' && c.path.endsWith('/media'));
  assert.equal(create.body.media_type, 'REELS');
  assert.equal(create.body.video_url, VIDEO);
  assert.equal(create.body.caption, CAP);
  assert.equal(create.body.share_to_feed, 'true');
  assert.equal(r.url, 'https://ig/p1');
});

test('이미 올라간 캡션이면 다시 올리지 않는다', async () => {
  const calls = fakeMeta({ recent: [{ id: 'old', caption: CAP, permalink: 'https://ig/old', timestamp: new Date().toISOString() }] });
  const r = await publishInstagramReel({ token: 't', videoUrl: VIDEO, caption: CAP });
  assert.equal(r.url, 'https://ig/old');
  assert.ok(!calls.some((c) => c.m === 'POST'));
});

test('영상 처리 오류면 게시하지 않고 실패한다', async () => {
  const calls = fakeMeta({ statuses: ['ERROR'] });
  await assert.rejects(publishInstagramReel({ token: 't', videoUrl: VIDEO, caption: CAP }), /컨테이너 오류/);
  assert.ok(!calls.some((c) => c.path.endsWith('/media_publish')));
});

test('게시 오류여도 실제로 올라갔으면 성공으로 둔다', { timeout: 30000 }, async () => {
  fakeMeta({ publishFails: true, appearsAfterError: true });
  const r = await publishInstagramReel({ token: 't', videoUrl: VIDEO, caption: CAP });
  assert.equal(r.url, 'https://ig/p9');
  assert.equal(r.recovered, true);
});

test('입력 검사: 정상 입력은 오류 없음', () => {
  assert.deepEqual(reelInputErrors({ lang: 'ko', videoUrl: VIDEO, caption: CAP, token: 't' }), []);
});

test('입력 검사: 토큰·주소·캡션 문제를 모두 알려 준다', () => {
  const errors = reelInputErrors({ lang: 'ja', videoUrl: 'http://x/a.mp4', caption: ' ', token: undefined });
  assert.equal(errors.length, 3);
  assert.match(errors[0], /IG_TOKEN_JA/);
  assert.equal(reelInputErrors({ lang: 'ko', videoUrl: VIDEO, caption: 'a'.repeat(2201), token: 't' }).length, 1);
});
