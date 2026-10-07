#!/usr/bin/env node
/**
 * IndexNow 제출 — Bing·네이버·Yandex·Seznam 이 공유하는 URL 변경 알림 프로토콜.
 * (Google 은 미참여: Google 쪽은 sitemap lastmod 가 같은 역할을 한다.)
 *
 * 키 파일: public/<KEY>.txt (https://www.aihavit.com/<KEY>.txt 로 서빙돼야 검증된다).
 *
 *   node scripts/indexnow.mjs              # www + 블로그 sitemap 전체 제출
 *   node scripts/indexnow.mjs <url> ...    # 지정 URL 만 (새 글·수정 글)
 *
 * 한 요청당 최대 10,000 URL. 같은 URL 을 짧은 간격으로 반복 제출하면 무시/제한되므로
 * 전체 제출은 큰 변경(이전·대량 수정) 때만 쓰고, 평소엔 바뀐 URL 만 보낼 것.
 */
const KEY = '41c58e8135404b932b1063ea9aeb6b6a';
const HOST = 'www.aihavit.com';
const SITEMAPS = [`https://${HOST}/sitemap.xml`, `https://${HOST}/blog/sitemap.xml`];

async function sitemapUrls(url) {
  const xml = await (await fetch(url)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const args = process.argv.slice(2);
const urls = args.length ? args : (await Promise.all(SITEMAPS.map(sitemapUrls))).flat();
const own = [...new Set(urls)].filter((u) => new URL(u).host === HOST);
console.log(`submitting ${own.length} URLs`);

for (let i = 0; i < own.length; i += 10000) {
  const batch = own.slice(i, i + 10000);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: batch }),
  });
  // 200 = 접수, 202 = 접수(키 검증 대기). 그 외는 본문에 이유가 온다.
  console.log(`batch ${i / 10000 + 1}: ${res.status} ${res.status >= 300 ? await res.text() : ''}`);
  if (res.status >= 300) process.exitCode = 1;
}
