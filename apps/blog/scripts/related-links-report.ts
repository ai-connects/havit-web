/**
 * 관련글 인링크 분포 리포트 — 구(같은 카테고리 최신 N) vs 신(유사도+인링크 분산).
 *
 *   cd apps/blog && npx tsx scripts/related-links-report.ts [--limit 6] [--sample 30] [--seed 42] [--lang en]
 *
 * 언어별: 글 수(그 언어 원고 보유), 관련글 인링크 0 비율, 본문+관련글 인링크 0 비율,
 * 최대 인링크, 지니계수. --sample 이면 해당 언어 무작위 N개 글의 추천 결과를 출력.
 */
import {
  getAllArticles,
  getRelatedForLang,
  resolveContent,
  type ArticleV2,
} from '../lib/articles-v2';

const args = process.argv.slice(2);
const arg = (k: string, d: string) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
const LIMIT = Number(arg('limit', '6'));
const SAMPLE = Number(arg('sample', '0'));
const SEED = Number(arg('seed', '42'));
const SAMPLE_LANG = arg('lang', 'en');
const OLD_LIMIT = 4;
const LANGS = ['en', 'ko', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'];

function gini(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  const sum = s.reduce((a, b) => a + b, 0);
  if (!n || !sum) return 0;
  let acc = 0;
  s.forEach((x, i) => (acc += (2 * (i + 1) - n - 1) * x));
  return acc / (n * sum);
}

/** 구 알고리즘(이 PR 이전 getRelatedForLang) 재현. */
function oldRelated(all: ArticleV2[], article: ArticleV2, lang: string): string[] {
  const out: string[] = [];
  for (const a of all) {
    if (a.slug === article.slug || a.category !== article.category) continue;
    const r = resolveContent(a, lang);
    if (!r || r.fallback) continue;
    out.push(a.slug);
    if (out.length >= OLD_LIMIT) break;
  }
  return out;
}

function bodyLinks(a: ArticleV2, lang: string, slugs: Set<string>): string[] {
  const r = resolveContent(a, lang);
  if (!r || r.fallback) return [];
  const out: string[] = [];
  const re = /\]\((?:https?:\/\/[^/)]+)?(?:\/blog)?\/([a-z-]+)\/([a-z0-9-]+)\/?(?:[#?][^)]*)?\)/g;
  for (const m of r.content.body_md.matchAll(re)) {
    if (m[1] === lang && slugs.has(m[2]) && m[2] !== a.slug) out.push(m[2]);
  }
  return out;
}

function stats(native: ArticleV2[], picks: Map<string, string[]>, body: Map<string, string[]>) {
  const rel = new Map<string, number>();
  const tot = new Map<string, number>();
  for (const a of native) {
    rel.set(a.slug, 0);
    tot.set(a.slug, 0);
  }
  for (const [, ts] of picks) for (const t of ts) rel.set(t, (rel.get(t) ?? 0) + 1);
  for (const [s, ts] of picks) {
    for (const t of new Set([...ts, ...(body.get(s) ?? [])])) tot.set(t, (tot.get(t) ?? 0) + 1);
  }
  const relV = [...rel.values()];
  const totV = [...tot.values()];
  const n = native.length;
  const pct = (x: number) => `${((100 * x) / n).toFixed(1)}%`;
  return {
    targets: new Set([...picks.values()].flat()).size,
    zeroRel: pct(relV.filter((x) => x === 0).length),
    zeroAll: pct(totV.filter((x) => x === 0).length),
    max: Math.max(...relV),
    gini: gini(relV).toFixed(3),
    avgOut: ([...picks.values()].reduce((x, ts) => x + ts.length, 0) / n).toFixed(1),
    under: pct([...picks.values()].filter((ts) => ts.length < LIMIT).length),
  };
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const t0 = Date.now();
const all = getAllArticles();
const tLoad = Date.now() - t0;
const rows: string[] = [];
let tCompute = 0;
for (const lang of LANGS) {
  const native = all.filter((a) => {
    const r = resolveContent(a, lang);
    return r && !r.fallback;
  });
  const slugs = new Set(native.map((a) => a.slug));
  const body = new Map(native.map((a) => [a.slug, bodyLinks(a, lang, slugs)]));
  const before = new Map(native.map((a) => [a.slug, oldRelated(all, a, lang)]));
  const t1 = Date.now();
  const after = new Map(native.map((a) => [a.slug, getRelatedForLang(a, lang, LIMIT).map((r) => r.slug)]));
  tCompute += Date.now() - t1;
  const b = stats(native, before, body);
  const f = stats(native, after, body);
  const badLinks = [...after.values()].flat().filter((s) => !slugs.has(s)).length;
  rows.push(
    `| ${lang} | ${native.length} | ${b.targets} → ${f.targets} | ${b.zeroRel} → ${f.zeroRel} | ${b.zeroAll} → ${f.zeroAll} | ${b.max} → ${f.max} | ${b.gini} → ${f.gini} | ${b.avgOut} → ${f.avgOut} | ${f.under} | ${badLinks} |`,
  );
}
console.log(`load ${tLoad}ms, related compute (10 langs, incl. similarity) ${tCompute}ms, limit=${LIMIT}\n`);
console.log(`| 언어 | 글 수 | 관련글 대상 수 | 관련글 인링크0 | 본문+관련글 인링크0 | 최대 인링크 | 지니 | 글당 관련글 | ${LIMIT}개 미만 | 비원고 링크 |`);
console.log('|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) console.log(r);

if (SAMPLE > 0) {
  const native = all
    .filter((a) => {
      const r = resolveContent(a, SAMPLE_LANG);
      return r && !r.fallback;
    })
    .sort((x, y) => (x.slug < y.slug ? -1 : 1));
  const rand = rng(SEED);
  const chosen = new Set<number>();
  while (chosen.size < Math.min(SAMPLE, native.length)) chosen.add(Math.floor(rand() * native.length));
  for (const i of [...chosen]) {
    const a = native[i];
    console.log(`\n### [${a.category}] ${resolveContent(a, SAMPLE_LANG)!.content.title}  (${a.slug})`);
    for (const r of getRelatedForLang(a, SAMPLE_LANG, LIMIT)) console.log(`  - [${r.category}] ${r.title}`);
  }
}
