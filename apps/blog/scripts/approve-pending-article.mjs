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
if (!hero || !Array.isArray(sections) || sections.length === 0) {
  console.error(`images.json 에 ${slug} 배정이 없다 — 사진 없이 나가면 카테고리 폴백이 뜬다.`);
  process.exit(1);
}

/*
 * 배열은 **위치로** 읽힌다 — lib/article-images.ts 의 `HUB_MAP[slug]?.[sectionIndex]`.
 * 그래서 모자라면 뒤쪽 섹션이 조용히 사진 없이 나가고, 남으면 그냥 안 쓰인다.
 * 엉뚱한 섹션에 붙는 일은 없다.
 *
 * 실제로 쓰이는 건 일부뿐이다: HubArticleView 가 `si % 2 === 1` 인 섹션에만,
 * 그것도 표·카드·스텝이 없는 섹션에만 사진을 건다(h2 7개면 2~3장). 남는 항목은
 * 인덱스를 맞추기 위한 자리라 그대로 둔다.
 */
for (const [lang, content] of Object.entries(article.langs ?? {})) {
  if (typeof content?.body_md !== 'string') {
    console.error(`${slug} [${lang}]: body_md 가 없다.`);
    process.exit(1);
  }
  const h2 = (content.body_md.match(/^## /gm) ?? []).length;
  if (sections.length < h2) {
    console.error(`${slug} [${lang}]: h2 ${h2}개인데 섹션 사진은 ${sections.length}개뿐이다.`);
    process.exit(1);
  }
}

const heroMap = readJson(HERO_MAP);
const sectionMap = readJson(SECTION_MAP);
if (heroMap.map[slug] || sectionMap.map[slug]) {
  console.error(`${slug}: 사진 맵에 이미 항목이 있다 — 덮어쓰지 않는다. 되돌리려면 두 맵에서 먼저 지울 것.`);
  process.exit(1);
}
heroMap.map[slug] = hero;
heroMap.count = Object.keys(heroMap.map).length;
sectionMap.map[slug] = sections;

/*
 * 순서가 중요하다. 파일을 먼저 옮기면, 그 뒤 쓰기가 실패했을 때(디스크 참·중단)
 * **아티클만 게시되고 사진 배정은 없는** 상태로 남는다 — 이 스크립트가 막으려던
 * 바로 그 상태다. 게다가 재실행하면 pending 에 없다며 exit 1 이라 손으로 되돌려야
 * 한다. 맵을 먼저 쓰고, 공개로 바뀌는 rename 을 마지막에 둔다.
 */
writeJson(HERO_MAP, heroMap);
writeJson(SECTION_MAP, sectionMap);
renameSync(src, dest);

delete assign.hero[slug];
delete assign.sections[slug];
writeJson(path.join(PENDING, 'images.json'), assign);

console.log(`게시: ${slug}`);
console.log(`  히어로   ${hero}`);
console.log(`  섹션     ${sections.length}장`);
console.log(`  언어     ${Object.keys(article.langs).join(', ')}`);
console.log('다음: npm run build 로 확인한 뒤 커밋.');
