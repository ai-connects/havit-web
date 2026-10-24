// 자동 승인(approved:true)된 초안을 Instagram·Threads 에 직접 발행한다.
//   node publish.mjs queue/2026-11-02 [--lang ko] [--dry]
// 이미 발행한 초안(published 기록)은 건너뛴다(재실행 안전). 긴급 중지가 켜져 있으면 아무것도 하지 않는다.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config, readJson } from './lib/source.mjs';
import { igToken, publishInstagram, publishThreads, threadsToken } from './lib/meta.mjs';
import { hostImages } from './lib/media.mjs';

try { process.loadEnvFile(path.join(path.dirname(new URL(import.meta.url).pathname), '.env')); } catch { /* .env 없음 */ }
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const onlyLang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
const dirs = args.filter((a) => !a.startsWith('--') && a !== onlyLang && statSync(a, { throwIfNoEntry: false })?.isDirectory());

if (config('control').publishing_paused) { console.log('⏸ 긴급 중지 중(config/control.json) — 발행하지 않음'); process.exit(0); }

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
        ? await publishInstagram({ token, imageUrls: urls, caption: [d.posts[0], (d.hashtags || []).map((t) => `#${t}`).join(' ')].filter(Boolean).join('\n\n') })
        : await publishThreads({ token, posts: d.posts, imageUrl: urls[0], firstReply: d.first_reply });
      writeFileSync(p, JSON.stringify({ ...d, published: { ...res, at: new Date().toISOString(), media: urls } }, null, 2) + '\n');
      ok++;
      console.log(`✅ ${d.channel}/${d.lang} ${res.url}`);
    } catch (e) {
      writeFileSync(p, JSON.stringify({ ...d, publish_error: { message: String(e.message || e), at: new Date().toISOString() } }, null, 2) + '\n');
      fail++;
      console.log(`❌ ${d.channel}/${d.lang} ${d.slug} — ${e.message}`);
    }
  }
}
console.log(`\n발행 ${ok} · 건너뜀 ${skip} · 실패 ${fail}`);
process.exit(fail ? 1 : 0);
