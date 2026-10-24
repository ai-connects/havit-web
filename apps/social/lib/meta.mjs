// Meta 직접 발행: Instagram API(Instagram 로그인) + Threads API.
// 토큰은 .env 의 IG_TOKEN_<언어> / THREADS_TOKEN_<언어> (언어 코드 대문자, '-' → '_': ZH_TW, PT_BR).
// 문서: developers.facebook.com/documentation/instagram-platform/content-publishing , /docs/threads
const IG = `https://graph.instagram.com/${process.env.IG_API_VERSION || 'v23.0'}`;
const TH = 'https://graph.threads.net/v1.0';

export const envKey = (lang) => lang.toUpperCase().replace(/-/g, '_');
export const igToken = (lang) => process.env[`IG_TOKEN_${envKey(lang)}`];
export const threadsToken = (lang) => process.env[`THREADS_TOKEN_${envKey(lang)}`];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(base, method, path, params, token) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const url = method === 'GET' ? `${base}${path}?${body}` : `${base}${path}`;
  const res = await fetch(url, method === 'GET' ? {} : { method, body });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${method} ${path}: ${JSON.stringify(json.error || json)}`);
  return json;
}

// 컨테이너가 FINISHED 가 될 때까지 기다린다(이미지 처리). 문서 권장: 게시 전 상태 확인.
async function waitReady(base, id, token, fields = 'status_code') {
  for (let i = 0; i < 20; i++) {
    const s = await call(base, 'GET', `/${id}`, { fields }, token);
    if (s.status_code === 'FINISHED' || s.status === 'FINISHED') return;
    if (s.status_code === 'ERROR' || s.status === 'ERROR') throw new Error(`컨테이너 오류 ${id}: ${JSON.stringify(s)}`);
    await sleep(3000);
  }
  throw new Error(`컨테이너 시간 초과 ${id}`);
}

export async function whoami(channel, token) {
  return channel === 'threads'
    ? call(TH, 'GET', '/me', { fields: 'id,username' }, token)
    : call(IG, 'GET', '/me', { fields: 'user_id,username' }, token);
}

/** Instagram 캐러셀(이미지 2~10장) 또는 단일 이미지. imageUrls 는 공개 JPEG URL. */
export async function publishInstagram({ token, imageUrls, caption }) {
  const me = await whoami('instagram', token);
  const uid = me.user_id || me.id;
  let creation;
  if (imageUrls.length === 1) {
    creation = (await call(IG, 'POST', `/${uid}/media`, { image_url: imageUrls[0], caption }, token)).id;
  } else {
    const children = [];
    for (const u of imageUrls.slice(0, 10)) {
      children.push((await call(IG, 'POST', `/${uid}/media`, { image_url: u, is_carousel_item: 'true' }, token)).id);
    }
    for (const c of children) await waitReady(IG, c, token);
    creation = (await call(IG, 'POST', `/${uid}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption }, token)).id;
  }
  await waitReady(IG, creation, token);
  const pub = await call(IG, 'POST', `/${uid}/media_publish`, { creation_id: creation }, token);
  const info = await call(IG, 'GET', `/${pub.id}`, { fields: 'permalink' }, token);
  return { id: pub.id, url: info.permalink };
}

async function threadsPost(uid, token, params) {
  const c = await call(TH, 'POST', `/${uid}/threads`, params, token);
  await waitReady(TH, c.id, token, 'status');
  return (await call(TH, 'POST', `/${uid}/threads_publish`, { creation_id: c.id }, token)).id;
}

/** Threads: posts[0](카드 이미지 첨부 가능) → posts[1..] 를 이어 답글로 → first_reply(링크·면책)를 첫 포스트 답글로. */
export async function publishThreads({ token, posts, imageUrl, linkUrl, firstReply }) {
  const me = await whoami('threads', token);
  const head = await threadsPost(me.id, token, imageUrl
    ? { media_type: 'IMAGE', image_url: imageUrl, text: posts[0] }
    : { media_type: 'TEXT', text: posts[0], ...(linkUrl ? { link_attachment: linkUrl } : {}) });
  let prev = head;
  for (const p of posts.slice(1)) prev = await threadsPost(me.id, token, { media_type: 'TEXT', text: p, reply_to_id: prev });
  if (firstReply) await threadsPost(me.id, token, { media_type: 'TEXT', text: firstReply, reply_to_id: head });
  const info = await call(TH, 'GET', `/${head}`, { fields: 'permalink' }, token);
  return { id: head, url: info.permalink };
}

// ── 토큰 ────────────────────────────────────────────────────────────────
/** 장기 토큰 갱신(60일). 발급 24시간 뒤부터 가능, 만료 전에 해야 한다. */
export async function refreshToken(channel, token) {
  const url = channel === 'threads'
    ? `${TH.replace('/v1.0', '')}/refresh_access_token?grant_type=th_refresh_token&access_token=${token}`
    : `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
  const json = await (await fetch(url)).json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json; // { access_token, expires_in }
}

/** Threads OAuth: 인가 코드 → 단기 토큰 → 장기 토큰. */
export async function threadsExchange(code, redirectUri) {
  const short = await (await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.THREADS_APP_ID, client_secret: process.env.THREADS_APP_SECRET,
      grant_type: 'authorization_code', redirect_uri: redirectUri, code,
    }),
  })).json();
  if (short.error || !short.access_token) throw new Error(JSON.stringify(short));
  const long = await (await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.THREADS_APP_SECRET}&access_token=${short.access_token}`)).json();
  if (long.error || !long.access_token) throw new Error(JSON.stringify(long));
  return long; // { access_token, expires_in }
}
