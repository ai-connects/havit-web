// 자동 승인(approved:true)된 초안을 Instagram·Threads 에 직접 발행한다.
//   node publish.mjs queue/2026-11-02 [--lang ko] [--dry]
// 이미 발행한 초안(published 기록)은 건너뛴다(재실행 안전). 긴급 중지가 켜져 있으면 아무것도 하지 않는다.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config, originLabel, readJson } from './lib/source.mjs';
import { igToken, publishInstagram, publishThreads, threadsToken } from './lib/meta.mjs';
import { hostImages } from './lib/media.mjs';

try { process.loadEnvFile(path.join(path.dirname(new URL(import.meta.url).pathname), '.env')); } catch { /* .env 없음 */ }
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const onlyLang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
const dirs = args.filter((a) => !a.startsWith('--') && a !== onlyLang && statSync(a, { throwIfNoEntry: false })?.isDirectory());

if (config('control').publishing_paused) { console.log('⏸ 긴급 중지 중(config/control.json) — 발행하지 않음'); process.exit(0); }

const LANG_NAME = { ko: '한국어', en: '영어', ja: '일본어', fr: '프랑스어', de: '독일어', es: '스페인어', 'pt-br': '포르투갈어', id: '인도네시아어', 'zh-tw': '대만 번체' };
/** 발행 직후 Slack 채널 공유(config.slack_feed.langs 만). 실패해도 발행은 성공으로 둔다. */
async function shareToSlack(d, url, media) {
  const hook = process.env.SLACK_FEED_WEBHOOK_URL;
  if (!hook || !config('channels').slack_feed?.langs?.includes(d.lang)) return;
  const head = (d.card_text || d.posts?.[0] || '').split('\n')[0].slice(0, 140);
  const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: `*${d.channel === 'instagram' ? 'Instagram' : 'Threads'} · ${LANG_NAME[d.lang] || d.lang}* — <${url}|게시물 보기>\n${head}` } },
    ...(media?.[0] ? [{ type: 'image', image_url: media[0], alt_text: head || d.slug }] : []),
    { type: 'context', elements: [{ type: 'mrkdwn', text: `원문: ${originLabel(d)}` }] },
  ];
  try { await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: `${LANG_NAME[d.lang]} ${url}`, blocks }) }); }
  catch (e) { console.log(`Slack 공유 실패: ${e.message}`); }
}

let ok = 0, skip = 0, fail = 0;
for (const dir of dirs) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    if (!['instagram', 'threads'].includes(d.channel) || (onlyLang && d.lang !== onlyLang)) continue;
    if (!d.approved || d.published) { skip++; continue; }
    if (d.publish_at && Date.parse(d.publish_at) > Date.now()) { skip++; continue; } // 아직 현지 발행 시각 전
    const token = d.channel === 'instagram' ? igToken(d.lang) : threadsToken(d.lang);
    if (!token) { console.log(`토큰 없음 ${d.channel}/${d.lang} — .env 확인`); skip++; continue; }
    if (dry) { console.log(`[dry] ${d.channel}/${d.lang} ${d.slug} 이미지 ${d.images?.length || 0}장`); continue; }
    try {
      const urls = d.media?.length ? d.media : hostImages(dir, f, d.images || []);
      const res = d.channel === 'instagram'
        ? await publishInstagram({ token, imageUrls: urls, caption: [d.posts[0], (d.hashtags || []).map((t) => `#${t}`).join(' ')].filter(Boolean).join('\n\n'), firstComment: d.first_reply })
        : await publishThreads({ token, posts: d.posts, imageUrl: d.share === 'link' ? null : urls[0], linkUrl: d.share === 'link' ? d.link : null, firstReply: d.first_reply, lang: d.lang });
      writeFileSync(p, JSON.stringify({ ...d, published: { ...res, at: new Date().toISOString(), media: urls } }, null, 2) + '\n');
      ok++;
      console.log(`✅ ${d.channel}/${d.lang} ${res.url}`);
      await shareToSlack(d, res.url, urls);
    } catch (e) {
      writeFileSync(p, JSON.stringify({ ...d, publish_error: { message: String(e.message || e), at: new Date().toISOString() } }, null, 2) + '\n');
      fail++;
      console.log(`❌ ${d.channel}/${d.lang} ${d.slug} — ${e.message}`);
    }
  }
}
console.log(`\n발행 ${ok} · 건너뜀 ${skip} · 실패 ${fail}`);
process.exit(fail ? 1 : 0);
