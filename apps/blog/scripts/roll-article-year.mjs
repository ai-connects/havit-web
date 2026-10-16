/**
 * 앱 추천·비교 아티클의 **제목·설명 속 연도만** 다음 해로 올린다.
 *
 *   node scripts/roll-article-year.mjs 2026 2027            # 전체 미리보기
 *   node scripts/roll-article-year.mjs 2026 2027 --write    # 적용
 *
 * 왜 스크립트인가
 * ─────────────
 * 이 글들은 "다이어트 앱 추천 2027" 처럼 **쿼리에 연도가 붙는** 카테고리다.
 * 그래서 제목의 연도는 남기고 매년 올린다. 반대로 slug 는 연도가 없다 —
 * 리다이렉트 설비가 없어서 URL 을 바꾸면 누적 신호를 잃기 때문이다
 * (Fortune·Eat This Much 패턴: yearless slug + 제목에 연도).
 *
 * 손으로 하면 10개 언어 × 6건 × (title/short_title/meta_description/tldr/
 * body_md/comparison_table.caption/faq) 를 빠뜨린다. 특히 body_md 안의
 * "Stand Oktober 2026" / "2026년 10월 기준" 같은 기준시점 문구가 남으면
 * 제목은 2027 인데 본문은 2026 이라고 말하는 글이 된다.
 *
 * ⚠️ **연도만 바꾸는 것으로 끝내면 안 된다.** 제목이 2027 이라고 말하는
 * 순간 그 해 기준으로 **내용을 실제로 갱신**해야 한다 — 평점·앱 목록·
 * 단종된 앱. 안 하면 신선도를 거짓으로 주장하는 글이 된다. 이 스크립트는
 * 그 작업의 **마지막 단계**지 전부가 아니다.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'data/articles');

/** 연도 쿼리가 붙는 글만. 일반 건강 아티클은 연도를 아예 쓰지 않는다. */
const SLUGS = [
  'best-diet-apps',
  'best-ai-health-coach-apps',
  'best-calorie-counter-apps',
  'best-food-logging-apps',
  'best-body-composition-apps',
  'best-habit-tracker-weight-loss',
];

const [from, to] = process.argv.slice(2);
const write = process.argv.includes('--write');
if (!/^\d{4}$/.test(from ?? '') || !/^\d{4}$/.test(to ?? '')) {
  console.error('사용법: node scripts/roll-article-year.mjs <이전연도> <새연도> [--write]');
  process.exit(1);
}

const FIELDS = ['title', 'short_title', 'meta_description', 'short_description', 'tldr', 'body_md'];
let total = 0;

for (const slug of SLUGS) {
  const p = path.join(DIR, `${slug}.json`);
  let a;
  try {
    a = JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    console.error(`!! 없다: ${slug}.json`);
    process.exitCode = 1;
    continue;
  }
  if (a.slug !== slug) {
    console.error(`!! ${slug}.json 의 slug 가 '${a.slug}' 다 — 연도가 slug 에 들어가면 안 된다.`);
    process.exitCode = 1;
    continue;
  }
  let n = 0;
  const swap = (s) => {
    if (typeof s !== 'string' || !s.includes(from)) return s;
    n += s.split(from).length - 1;
    return s.split(from).join(to);
  };
  for (const [, c] of Object.entries(a.langs ?? {})) {
    for (const f of FIELDS) c[f] = swap(c[f]);
    if (c.comparison_table) {
      c.comparison_table.title = swap(c.comparison_table.title);
      c.comparison_table.caption = swap(c.comparison_table.caption);
    }
    for (const q of c.faq ?? []) {
      q.question = swap(q.question);
      q.answer = swap(q.answer);
    }
    for (const k of c.key_stats ?? []) {
      k.label = swap(k.label);
      k.value = swap(k.value);
      k.source = swap(k.source);
    }
  }
  console.log(`${slug}: ${n}곳`);
  total += n;
  if (write && n) writeFileSync(p, `${JSON.stringify(a, null, 2)}\n`);
}

console.log(`\n${from} → ${to} · 총 ${total}곳${write ? ' 적용' : ' (미리보기 — 적용은 --write)'}`);
if (write) {
  console.log('\n다음: comparison_table.title 이 바뀌었으면 본문 h2 와 다시 일치하는지 확인하고,');
  console.log('      평점·앱 목록·단종 앱을 그 해 기준으로 실제 갱신한 뒤 npm run build.');
}
