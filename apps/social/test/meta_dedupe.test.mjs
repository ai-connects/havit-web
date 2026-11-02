// 중복 발행 차단: media_publish 가 오류를 줘도 실제로 올라갔으면 성공으로, 이미 올라간 글은 다시 올리지 않는다(2026-11-02).
import test from 'node:test';
import assert from 'node:assert/strict';
import { publishInstagram, sameCaption } from '../lib/meta.mjs';

const CAP = 'One dumbbell and your hormones — does it really help? O or X';
function fakeMeta({ recent = [], publishFails = false, appearsAfterError = false }) {
  const calls = [];
  let posted = false;
  globalThis.fetch = async (url, opt = {}) => {
    const u = new URL(url); const m = opt.method || 'GET';
    calls.push(`${m} ${u.pathname}`);
    const ok = (j) => ({ ok: true, json: async () => j });
    if (u.pathname.endsWith('/me')) return ok({ user_id: '1' });
    if (m === 'GET' && u.pathname.endsWith('/1/media')) {
      const now = new Date().toISOString();
      return ok({ data: [...recent, ...(posted ? [{ id: 'p9', caption: CAP, permalink: 'https://ig/p9', timestamp: now }] : [])] });
    }
    if (m === 'POST' && u.pathname.endsWith('/media_publish')) {
      if (publishFails) { if (appearsAfterError) posted = true; return { ok: false, json: async () => ({ error: { message: 'Application request limit reached', code: 4 } }) }; }
      posted = true; return ok({ id: 'p1' });
    }
    if (m === 'POST' && u.pathname.endsWith('/media')) return ok({ id: 'c1' });
    if (m === 'GET') return ok({ status_code: 'FINISHED', permalink: 'https://ig/p1' });
    return ok({});
  };
  return calls;
}

test('같은 캡션 비교는 공백 차이를 무시하고 짧은 글은 비교하지 않는다', () => {
  assert.ok(sameCaption('a  b c d e f g h i', 'a b c d e f g h i'));
  assert.ok(!sameCaption('짧음', '짧음'));
});

test('이미 올라간 글이면 컨테이너를 만들지 않고 그 게시물을 돌려준다', async () => {
  const calls = fakeMeta({ recent: [{ id: 'old', caption: CAP, permalink: 'https://ig/old', timestamp: new Date().toISOString() }] });
  const r = await publishInstagram({ token: 't', imageUrls: ['https://x/1.jpg'], caption: CAP });
  assert.equal(r.url, 'https://ig/old');
  assert.ok(!calls.some((c) => c.startsWith('POST')));
});

test('media_publish 가 오류여도 실제로 올라갔으면 성공(재시도 없음)', { timeout: 30000 }, async () => {
  fakeMeta({ publishFails: true, appearsAfterError: true });
  const r = await publishInstagram({ token: 't', imageUrls: ['https://x/1.jpg'], caption: CAP });
  assert.equal(r.url, 'https://ig/p9');
  assert.equal(r.recovered, true);
});

test('정말 안 올라갔으면 오류를 그대로 던진다', { timeout: 30000 }, async () => {
  fakeMeta({ publishFails: true });
  await assert.rejects(publishInstagram({ token: 't', imageUrls: ['https://x/1.jpg'], caption: CAP }), /request limit/);
});
