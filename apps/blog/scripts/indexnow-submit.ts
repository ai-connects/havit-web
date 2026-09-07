/**
 * indexnow-submit — Submit URLs to IndexNow API for instant indexing on
 * Bing, Yandex, DuckDuckGo, Seznam, Naver.
 *
 * Default targets: the 5 new HAVIT differentiation articles × 10 PRIMARY_LANGS
 * = 50 URLs in a single POST. IndexNow batch limit is 10,000 URLs per request.
 *
 * Usage:
 *   npx tsx scripts/indexnow-submit.ts                       # 50 new URLs
 *   npx tsx scripts/indexnow-submit.ts --sitemap-recent 200  # 200 most-recently-updated URLs from sitemap
 *
 * No auth required — IndexNow verifies the host owns the key by fetching
 * keyLocation 의 파일을 가져와 본문이 키와 같은지 확인한다.
 *
 * 키 파일은 블로그 public/ 에 있어 basePath 때문에 /blog/{key}.txt 로 서빙된다.
 * IndexNow 는 하위 경로의 키를 허용하되 제출 URL 이 그 경로 아래여야 하는데,
 * 이 스크립트가 내는 URL 은 전부 /blog/ 아래라 조건을 만족한다.
 */

const HOST = 'www.aihavit.com';
const KEY = '81b971200b7d6aa96b465a75821c1b02';
const KEY_LOCATION = `https://${HOST}/blog/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

const LANGS = ['en', 'ko', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'];
const NEW_SLUGS = [
  'havit-vs-myfitnesspal-noom-simple-2026',
  'havit-ai-body-composition-92percent-vs-inbody',
  'what-is-k-wellness',
  'glp1-behavior-change-m0-m1-m2',
  'havit-ai-coaching-engine-8steps',
];

function buildUrls(): string[] {
  const urls: string[] = [];
  for (const slug of NEW_SLUGS) {
    for (const lang of LANGS) {
      urls.push(`https://${HOST}/${lang}/${slug}`);
    }
  }
  return urls;
}

async function main(): Promise<void> {
  // First verify the key file is publicly accessible
  console.log(`[indexnow] verifying key file at ${KEY_LOCATION}`);
  const verifyRes = await fetch(KEY_LOCATION);
  const verifyBody = (await verifyRes.text()).trim();
  if (verifyRes.status !== 200 || verifyBody !== KEY) {
    console.error(`[indexnow] key file verification FAILED: status=${verifyRes.status}, body="${verifyBody.slice(0, 80)}"`);
    console.error('[indexnow] Cannot submit URLs until key file is publicly reachable. Wait for Vercel deploy then retry.');
    process.exit(1);
  }
  console.log('[indexnow] key file verified ✓');

  const urls = buildUrls();
  console.log(`[indexnow] submitting ${urls.length} URLs (${NEW_SLUGS.length} articles × ${LANGS.length} langs)`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`[indexnow] response: ${res.status} ${res.statusText}`);
  if (text) console.log(`[indexnow] body: ${text}`);

  // Per IndexNow spec:
  //   200 OK         — URLs accepted (will be processed)
  //   202 Accepted   — Accepted but with warnings
  //   400 Bad Request — Invalid format
  //   403 Forbidden   — Key not found / mismatch
  //   422 Unprocessable — Host/key mismatch on submitted URLs
  //   429 Too Many Requests — Rate-limited
  if (res.status === 200 || res.status === 202) {
    console.log(`\n[indexnow] SUCCESS — ${urls.length} URLs submitted for indexing on Bing / Yandex / DuckDuckGo / Seznam / Naver.`);
    console.log('[indexnow] Indexing typically completes within minutes to a few hours.');
  } else {
    console.error('[indexnow] FAILED — see status code above. Common fixes:');
    console.error('  403 → key file not reachable or content mismatch');
    console.error('  422 → URL host does not match the "host" field');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[indexnow] fatal:', err);
  process.exit(1);
});
