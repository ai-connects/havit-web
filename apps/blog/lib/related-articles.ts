/**
 * 관련글 선정 — 주제 유사도 + 인링크 분산.
 *
 * 왜: 예전 관련글은 "같은 카테고리 최신 4개" 고정이었다. en 1,016개 글이 관련글로
 * 가리키는 대상이 72개(7%)뿐이었고 나머지 944개는 본문·관련글 어디서도 링크를
 * 받지 못했다(목록/카테고리 페이지에서만 도달). GSC "발견됨 — 현재 색인 생성되지
 * 않음" 이 쌓이는 사이트 내부 원인 중 가장 직접적인 레버가 이 링크 집중이다.
 *
 * 어떻게:
 *   1) 유사도 — 영어 원고의 제목·핵심 키워드·요약·소제목·본문으로 TF-IDF 코사인
 *      (본문은 로그 빈도로 낮게 가중 — 제목 단어 하나에 끌려가는 오매칭 억제).
 *      같은 카테고리 가산, 약물(GLP-1 등) 주제 여부가 다른 쌍은 차단.
 *      영어 원고가 없으면 다른 언어 원고 + primary_keyword_en 으로 대체.
 *   2) 언어별 배정 — 그 언어 원고가 실제로 있는 글만 후보(폴백/noindex 링크 금지).
 *      앞 슬롯은 순수 유사도 상위(관련성), 뒤 슬롯은 유사도 후보 안에서
 *      인링크가 아직 없는/적은 글을 우선(발견성).
 *
 * 결정론: 입력을 slug 순으로 정렬해 계산하고 모든 정렬에 slug 타이브레이크를 둔다.
 * 같은 데이터면 빌드마다 같은 결과. 계산은 프로세스당 1회(유사도) + 언어당 1회
 * (배정) 캐시 — 1.1k 글 기준 약 1초라 사전 계산 JSON 을 커밋하지 않고 빌드
 * 시점에 계산한다(새 글이 들어와도 스크립트 재실행 없이 반영).
 * 분포 점검: scripts/related-links-report.ts
 */

import type { ArticleV2, ArticleV2LangContent } from './articles-v2';

/** 관련글 슬롯 수 중 순수 유사도 순으로 채우는 앞부분. */
export const RELEVANCE_SLOTS = 3;
/** 글마다 보관하는 유사도 후보 수. */
const TOP_K = 40;
/**
 * 후보 하한 = clamp(1위 유사도 × REL_FLOOR, ABS_FLOOR, REL_CAP).
 * 1위가 거의 중복 글(0.7+)인 경우에도 하한이 REL_CAP 을 넘지 않게 해 칸이 비지 않게 하고,
 * 절대 하한 아래(제목 단어 한두 개만 겹침)는 칸이 비더라도 추천하지 않는다.
 */
const REL_FLOOR = 0.35;
const REL_CAP = 0.15;
const ABS_FLOOR = 0.1;
/** 인링크 우선 슬롯이 바라보는 후보 깊이(유사도 순). */
const DISCOVERY_DEPTH = 25;
const SAME_CATEGORY_BONUS = 0.06;
const BODY_WEIGHT = 0.7;

const STOPWORDS = new Set(
  (
    'a an and are as at be been being but by can could did do does doing for from had has have how i if in into is it its ' +
    'just me more most my no not of on or our out over so than that the their them then there these they this those to too ' +
    'up us was we what when where which while who why will with without you your yours vs versus about after before during ' +
    'between through really actually every each any all also new best top ultimate complete guide tips tip science ' +
    'explained simple easy quick ways way things thing truth secret secrets need know should here heres whats youre ' +
    'dont doesnt isnt cant wont 2025 2026 2027 one two three four five six seven eight nine ten get getting make makes ' +
    'making use using used help helps work works like may might much many very even still why ' +
    // 제목 수식어 — 주제가 아니라 형식을 말하는 단어. 이것만 겹친 오매칭이 표본에서 나왔다
    // (Sleep Regularity Index ↔ Omega-3 Index, Six-Meals Myth ↔ 10,000 Steps Myth).
    'myth myths index modification modifications modify protocol protocols method methods rule rules trick tricks ' +
    'hack hacks approach framework checklist plan plans strategy strategies technique techniques mistake mistakes ' +
    'reveal reveals revealed nobody talk talks matter matters happen happens really evidence research study studies ' +
    'show shows data based backed proven expert experts'
  ).split(/\s+/),
);

/**
 * 약물 주제 판별 어휘. 한쪽만 약물 글인 쌍은 추천하지 않는다 —
 * GLP-1 글에 일반 운동/식단 글이 걸리거나 그 반대가 되는 엉뚱한 매칭 방지.
 * 일반명사(medication·drug·pill·dose·injection)는 넣지 않는다 — "Without Medication"
 * 같은 제목이 약물 글로 분류돼 POTS 글이 지방간 글과만 묶이는 오분류가 실측됐다.
 */
const MED_TERMS = new Set([
  'glp1', 'semaglutide', 'tirzepatide', 'liraglutide', 'retatrutide', 'orforglipron', 'cagrilintide',
  'ozempic', 'wegovy', 'mounjaro', 'zepbound', 'saxenda', 'rybelsus', 'victoza', 'trulicity', 'dulaglutide',
  'metformin', 'phentermine', 'contrave', 'qsymia', 'orlistat', 'compounded', 'incretin',
].map(stem));

function stem(t: string): string {
  if (t.length > 5 && t.endsWith('ies')) return t.slice(0, -3) + 'y';
  if (t.length > 6 && t.endsWith('ing')) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith('s') && !t.endsWith('ss') && !t.endsWith('us')) return t.slice(0, -1);
  return t;
}

function tokenize(text: string | undefined): string[] {
  if (!text) return [];
  const norm = text
    .toLowerCase()
    .replace(/glp[\s-]?1/g, 'glp1')
    .replace(/[’']/g, '');
  const out: string[] = [];
  for (const raw of norm.split(/[^\p{L}\p{N}]+/u)) {
    if (!raw || raw.length < 2 || STOPWORDS.has(raw) || /^\d+$/.test(raw)) continue;
    out.push(stem(raw));
  }
  return out;
}

function headings(body: string | undefined): string {
  if (!body) return '';
  const hs = body.match(/^#{2,3}\s+.*$/gm);
  return hs ? hs.join(' ') : '';
}

interface DocFeatures {
  slug: string;
  category: string;
  med: boolean;
  tf: Map<string, number>;
}

function features(a: ArticleV2): DocFeatures {
  const c: ArticleV2LangContent | undefined =
    a.langs?.en ?? a.langs?.ko ?? Object.values(a.langs ?? {})[0];
  const tf = new Map<string, number>();
  const add = (text: string | undefined, w: number) => {
    for (const t of tokenize(text)) tf.set(t, (tf.get(t) ?? 0) + w);
  };
  add(c?.title, 2);
  add(a.primary_keyword_en, 2);
  add(c?.meta_description, 1);
  add(c?.tldr, 1);
  add(headings(c?.body_md), 0.5);
  // 본문은 제목 어휘 한두 개(예: "index", "cycling")에 끌려가는 오매칭을 잡아 주는
  // 주제 문맥. 빈도는 로그로 눌러 긴 글이 이기지 않게 한다.
  const body = new Map<string, number>();
  for (const t of tokenize(c?.body_md)) body.set(t, (body.get(t) ?? 0) + 1);
  for (const [t, f] of body) tf.set(t, (tf.get(t) ?? 0) + BODY_WEIGHT * (1 + Math.log(f)));
  let med = a.category === 'Medication Guide';
  if (!med) {
    // 제목·키워드에 약물 어휘가 있으면 약물 글로 본다(본문 언급만으로는 아님).
    for (const t of tokenize(`${c?.title ?? ''} ${a.primary_keyword_en ?? ''}`)) {
      if (MED_TERMS.has(t)) {
        med = true;
        break;
      }
    }
  }
  return { slug: a.slug, category: a.category, med, tf };
}

export interface Neighbor {
  slug: string;
  sim: number;
}

/**
 * slug → 유사도 내림차순 이웃 목록(TOP_K). 약물 주제 불일치 쌍은 아예 제외.
 */
export function computeNeighbors(articles: ArticleV2[]): Map<string, Neighbor[]> {
  const sorted = [...articles].sort((x, y) => (x.slug < y.slug ? -1 : x.slug > y.slug ? 1 : 0));
  const docs = sorted.map(features);
  const N = docs.length;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);

  // TF-IDF 벡터(L2 정규화). df 1(자기 자신뿐) 또는 25% 초과(변별력 없음) 용어는 버린다.
  const maxDf = Math.max(2, Math.floor(N * 0.25));
  const vecs: Map<string, number>[] = docs.map((d) => {
    const v = new Map<string, number>();
    let norm = 0;
    for (const [t, f] of d.tf) {
      const n = df.get(t) ?? 0;
      if (n < 2 || n > maxDf) continue;
      const w = f * Math.log(N / n);
      v.set(t, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [t, w] of v) v.set(t, w / norm);
    return v;
  });

  const postings = new Map<string, Array<[number, number]>>();
  vecs.forEach((v, i) => {
    for (const [t, w] of v) {
      let p = postings.get(t);
      if (!p) postings.set(t, (p = []));
      p.push([i, w]);
    }
  });

  const out = new Map<string, Neighbor[]>();
  const acc = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    acc.fill(0);
    for (const [t, w] of vecs[i]) {
      for (const [j, wj] of postings.get(t)!) if (j !== i) acc[j] += w * wj;
    }
    const list: Neighbor[] = [];
    for (let j = 0; j < N; j++) {
      if (j === i || acc[j] <= 0) continue;
      if (docs[i].med !== docs[j].med) continue;
      const sim = acc[j] + (docs[i].category === docs[j].category ? SAME_CATEGORY_BONUS : 0);
      list.push({ slug: docs[j].slug, sim });
    }
    list.sort((x, y) => y.sim - x.sim || (x.slug < y.slug ? -1 : 1));
    const top = list.length ? list[0].sim : 0;
    const floor = Math.max(ABS_FLOOR, Math.min(top * REL_FLOOR, REL_CAP));
    out.set(
      docs[i].slug,
      list.filter((n) => n.sim >= floor).slice(0, TOP_K),
    );
  }
  return out;
}

/**
 * 한 언어의 관련글 배정. `native` = 그 언어 원고가 실제로 있는 slug 집합
 * (후보이자 소스). 결과: slug → 추천 slug 목록(최대 limit, 표시 순서).
 *
 *   A) 앞 RELEVANCE_SLOTS 칸: 유사도 상위.
 *   B) 인링크 0 인 글 끌어오기: 각 고아 글에 대해, 그 글과 가장 비슷하고 빈 칸이
 *      남은 소스 한 곳에 꽂는다(소스 쪽 후보 목록에 있어야 함 — 관련성 유지).
 *   C) 남은 칸: 소스의 후보(DISCOVERY_DEPTH) 중 인링크 적은 순 → 유사도 순.
 */
export function assignRelated(
  neighbors: Map<string, Neighbor[]>,
  native: Set<string>,
  limit: number,
): Map<string, string[]> {
  const sources = [...native].filter((s) => neighbors.has(s)).sort();
  const cand = new Map<string, Neighbor[]>();
  const candSim = new Map<string, Map<string, number>>();
  for (const s of sources) {
    const c = neighbors.get(s)!.filter((n) => native.has(n.slug));
    cand.set(s, c);
    candSim.set(s, new Map(c.map((n) => [n.slug, n.sim])));
  }
  const picks = new Map<string, string[]>();
  const inlinks = new Map<string, number>();
  const take = (s: string, t: string) => {
    picks.get(s)!.push(t);
    inlinks.set(t, (inlinks.get(t) ?? 0) + 1);
  };

  // A) 관련성 슬롯
  const relSlots = Math.min(RELEVANCE_SLOTS, limit);
  for (const s of sources) {
    picks.set(s, []);
    for (const n of cand.get(s)!.slice(0, relSlots)) take(s, n.slug);
  }

  // B) 고아 끌어오기 — 고아 글 기준으로 가장 가까운 소스부터 시도.
  for (const t of sources) {
    if ((inlinks.get(t) ?? 0) > 0) continue;
    for (const n of cand.get(t)!) {
      const s = n.slug;
      const p = picks.get(s);
      if (!p || p.length >= limit || p.includes(t)) continue;
      if (!candSim.get(s)!.has(t)) continue;
      take(s, t);
      break;
    }
  }

  // C) 남은 칸 — 인링크 적은 후보 우선. 칸 단위 라운드로 돌려 앞 slug 쏠림을 줄인다.
  for (let round = 0; round < limit; round++) {
    for (const s of sources) {
      const p = picks.get(s)!;
      if (p.length >= limit) continue;
      let best: Neighbor | null = null;
      let bestIn = Infinity;
      for (const n of cand.get(s)!.slice(0, DISCOVERY_DEPTH)) {
        if (p.includes(n.slug)) continue;
        const k = inlinks.get(n.slug) ?? 0;
        if (k < bestIn || (k === bestIn && best && n.sim > best.sim)) {
          best = n;
          bestIn = k;
        }
      }
      if (best) take(s, best.slug);
    }
  }
  return picks;
}
