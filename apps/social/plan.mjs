// 2주(기본) 발행 계획: 계정(채널×언어)마다 주당 빈도만큼 슬롯을 만들고 글·포맷을 돌려 배정한다.
//   node plan.mjs 2026-10-26 [weeks=2]   → queue/plan-2026-10-26.json
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, hasLang, readJson, verifiedSlugs } from './lib/source.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const QUEUE = path.join(ROOT, 'queue');
const [start = new Date().toISOString().slice(0, 10), weeks = '2'] = process.argv.slice(2);

// 주 n회를 요일에 고르게 펼친다(월=0).
const DAYS = { 1: [2], 2: [1, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 7: [0, 1, 2, 3, 4, 5, 6] };

// 최근 30일에 같은 계정에서 쓴 글은 다시 고르지 않는다.
const used = new Map();
if (existsSync(QUEUE)) {
  for (const f of readdirSync(QUEUE).filter((x) => x.startsWith('plan-'))) {
    for (const e of readJson(path.join(QUEUE, f)).entries) {
      const k = `${e.channel}:${e.lang}`;
      if (!used.has(k)) used.set(k, new Set());
      used.get(k).add(e.slug);
    }
  }
}

const ch = config('channels');
const slugs = verifiedSlugs();
const entries = [];
let seed = 0;
for (const [channel, rule] of Object.entries(ch.channels)) {
  for (const lang of rule.langs) {
    const key = `${channel}:${lang}`;
    const seen = used.get(key) || new Set();
    // 그 언어판이 있는 글만(예: glp-1-cost-korea 는 한국어판뿐)
    const pool = slugs.filter((s) => !seen.has(s) && hasLang(s, lang));
    let i = (seed++ * 7) % pool.length; // 계정마다 시작점을 달리해 같은 날 같은 글이 몰리지 않게
    let f = 0;
    for (let w = 0; w < Number(weeks); w++) {
      for (const d of DAYS[rule.per_week]) {
        const date = new Date(`${start}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + w * 7 + d);
        entries.push({
          date: date.toISOString().slice(0, 10),
          channel,
          lang,
          slug: pool[i++ % pool.length],
          format: rule.formats[f++ % rule.formats.length],
          segment: ch.segments[lang][(w + d) % ch.segments[lang].length],
        });
      }
    }
  }
}
entries.sort((a, b) => a.date.localeCompare(b.date) || a.channel.localeCompare(b.channel));
mkdirSync(QUEUE, { recursive: true });
const out = path.join(QUEUE, `plan-${start}.json`);
writeFileSync(out, JSON.stringify({ start, weeks: Number(weeks), entries }, null, 2) + '\n');
console.log(`${entries.length}건 → ${path.relative(ROOT, out)}`);
