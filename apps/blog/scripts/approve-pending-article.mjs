/**
 * 검토가 끝난 pending 아티클 한 건을 게시 상태로 옮긴다.
 *
 *   node scripts/approve-pending-article.mjs best-diet-apps-2026
 *
 * 왜 스크립트인가
 * ─────────────
 * HAVIT 제품과 연결되는 글(비교·기능·사례)은 생성 즉시 게시하지 않는다.
 * data/articles-pending/ 에 두고 한 건씩 사람이 읽은 뒤에만 넘긴다. 그런데
 * 넘기는 작업이 파일 이동 하나가 아니다 — 사진 배정 두 곳을 같이 손대야
 * 한다. 손으로 하면 히어로만 넣고 섹션 사진을 빠뜨려 글 하나에 같은 사진이
 * 네 번 반복되거나(hubSectionImage 가 null 이면 호출부가 생략한다), 아예
 * 카테고리 폴백 사진이 나간다.
 *
 * 하는 일은 셋뿐이다.
 *   1. data/articles-pending/<slug>.json → data/articles/<slug>.json
 *   2. images.json 의 hero  → data/article-images.json 의 map
 *   3. images.json 의 sections → data/hub-section-images.json 의 map
 *
 * 되돌리려면 반대로 옮기고 두 map 에서 그 slug 키만 지우면 된다.
 */
import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PENDING = path.join(ROOT, 'data/articles-pending');
const LIVE = path.join(ROOT, 'data/articles');
const HERO_MAP = path.join(ROOT, 'data/article-images.json');
const SECTION_MAP = path.join(ROOT, 'data/hub-section-images.json');

const slug = process.argv[2];
if (!slug) {
  console.error('사용법: node scripts/approve-pending-article.mjs <slug>');
  process.exit(1);
}

const src = path.join(PENDING, `${slug}.json`);
const dest = path.join(LIVE, `${slug}.json`);
if (!existsSync(src)) {
  console.error(`pending 에 없다: ${src}`);
  process.exit(1);
}
if (existsSync(dest)) {
  console.error(`이미 게시돼 있다: ${dest}`);
  process.exit(1);
}

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');

const article = readJson(src);
const assign = readJson(path.join(PENDING, 'images.json'));

const hero = assign.hero?.[slug];
const sections = assign.sections?.[slug];
if (!hero || !sections) {
  console.error(`images.json 에 ${slug} 배정이 없다 — 사진 없이 나가면 카테고리 폴백이 뜬다.`);
  process.exit(1);
}

/* 섹션 사진 개수는 본문 h2 개수와 맞아야 한다. 어긋나면 뒤쪽 섹션이
   조용히 사진 없이 나가거나 엉뚱한 섹션에 붙는다. 언어마다 검사한다. */
for (const [lang, content] of Object.entries(article.langs)) {
  const h2 = (content.body_md.match(/^## /gm) ?? []).length;
  if (h2 !== sections.length) {
    console.error(`${slug} [${lang}]: h2 ${h2}개인데 섹션 사진은 ${sections.length}개다.`);
    process.exit(1);
  }
}

const heroMap = readJson(HERO_MAP);
const sectionMap = readJson(SECTION_MAP);
heroMap.map[slug] = hero;
heroMap.count = Object.keys(heroMap.map).length;
sectionMap.map[slug] = sections;

renameSync(src, dest);
writeJson(HERO_MAP, heroMap);
writeJson(SECTION_MAP, sectionMap);

delete assign.hero[slug];
delete assign.sections[slug];
writeJson(path.join(PENDING, 'images.json'), assign);

console.log(`게시: ${slug}`);
console.log(`  히어로   ${hero}`);
console.log(`  섹션     ${sections.length}장`);
console.log(`  언어     ${Object.keys(article.langs).join(', ')}`);
console.log('다음: npm run build 로 확인한 뒤 커밋.');
