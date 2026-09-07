#!/usr/bin/env node
/**
 * GLP-1 SEO 허브 원고 → data/articles/*.json 임포터.
 *
 * 소스: GLP1-SEO-리뷰패키지/02_원본_마크다운/{ko,en}/*.md (ko 60 / en 59)
 *
 * 기존 블로그 1,035건이 "좁고 깊은 롱테일(스포크)"이라면, 이 64건은
 * "ozempic side effects" 같은 헤드 키워드를 받는 허브다. 두 축이 서로를
 * 링크하도록 원고가 이미 설계돼 있어(기존 글 참조 117회) 같은 도메인·같은
 * 데이터 파이프라인에 올린다.
 *
 * 원고는 모든 걸 마크다운 본문 한 덩어리로 갖고 있다. 기존 스키마에는
 * tldr / faq / references / comparison_table 필드가 이미 있으므로, 본문에서
 * 뽑아 구조화 필드로 옮긴다 — 그래야 FaqJsonLd·MedicalArticleJsonLd 같은
 * 기존 컴포넌트가 그대로 먹고, 렌더러도 본문만 신경 쓰면 된다.
 *
 * 버리는 것:
 *   - 의학 고지 blockquote → 레포에 <MedicalDisclaimer /> 가 이미 있다
 *   - 원고가 직접 박아둔 <script type="application/ld+json"> → 레포가 생성한다
 *   - "관련 글" 섹션 → getRelatedForLang() 이 카테고리 기반으로 만든다
 */

import fs from 'node:fs'
import path from 'node:path'

const SRC = '/Users/ryanyun/Desktop/GLP1-SEO-리뷰패키지/02_원본_마크다운'
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const OUT = path.join(ROOT, 'data/articles')
// 원고 폴더명 → data/articles JSON 의 lang 키(lib/articles-v2.ts SHORT_LANG_TO_DATA).
// 블로그 색인 대상(INDEXABLE_ROUTE_LANGS)이 정확히 이 4개다.
const LANGS = ['en', 'ko', 'ja', 'zh-tw']
const DATA_KEY = { en: 'en', ko: 'ko', ja: 'ja', 'zh-tw': 'zh-TW' }

/** 슬러그 → 카테고리. 기존 ALLOWED_CATEGORIES_V2 안의 값만 쓴다(빌드 가드 있음). */
const CATEGORIES = [
  { re: /side-effect|dose|shot|injection|oral-|orforglipron|mounjaro|ozempic|wegovy|zepbound|saxenda|rybelsus|retatrutide|semaglutide|tirzepatide|foundayo/, name: 'Medication Guide', emoji: '💊' },
  { re: /tracker|track|plotter|progress|log|report|alternative|app|plotter/, name: 'Tracking & Insights', emoji: '📊' },
  { re: /diet|meal|food|protein|nutrition|calorie|locabo|carb/, name: 'Diet & Nutrition', emoji: '🥗' },
  { re: /pcos|menopause|perimenopause|postpartum|period|thyroid|pregnan/, name: 'Health & Conditions', emoji: '🩺' },
  { re: /weight|calculator|cost|plateau|regain|metabolis/, name: 'Weight & Metabolism', emoji: '⚖️' },
]
const FALLBACK_CATEGORY = { name: 'Personalized Strategies', emoji: '🎯' }


/**
 * 원고가 참조하지만 그 슬러그로는 존재하지 않는 글 14종(참조 90회).
 *
 * 전부 새로 쓰지 않고 기존 정본으로 잇는다. 예컨대 `glp-1-nausea`(25회)를
 * 새 글로 만들면 이미 있는 glp1-nausea-management-…-2026 과 같은 질의를 두고
 * 자기잠식이 생긴다. 직전 전수 검수에서 신규↔기존 키워드 의도 중복이 0건이었는데,
 * 이런 글을 새로 만드는 순간 그게 깨진다.
 *
 * 그래서 링크를 정본으로 직접 다시 쓴다(301 홉 없이). 외부에서 옛 슬러그로
 * 들어오는 경우를 위해 lib/merged-redirects.json 에도 같은 매핑을 넣는다.
 */
const ALIAS = {
  'glp-1-nausea': 'glp1-nausea-management-evidence-based-strategies-2026',
  'glp-1-nausea-food-guide': 'glp1-nausea-management-evidence-based-strategies-2026',
  'glp-1-constipation': 'glp1-constipation-management-fiber-hydration-protocol-2026',
  'glp-1-muscle-loss': 'glp1-muscle-loss-prevention-nutrition-strategy-2026',
  'glp-1-muscle-loss-protein': 'protein-intake-goal-on-semaglutide-grams-per-pound-2026',
  'protein-on-glp-1': 'protein-intake-goal-on-semaglutide-grams-per-pound-2026',
  'maintain-weight-after-glp-1': 'stopping-semaglutide-weight-regain-prevention-protocol-2026',
  'glp-1-comparison': 'semaglutide-vs-tirzepatide',
  'sustainable-weight-loss-habits': 'glp-1-diary-habit',
  'weight-loss-tracker': 'weight-loss-tracker-app-glp-1',
  'glp-1-for-perimenopause': 'glp-1-perimenopause',
  'high-protein-snacks-glp-1': 'glp-1-diet-7-day-meal-plan',
  'track-protein-fiber-havit': 'protein-tracker-for-glp-1',
  'glp-1-guide': 'glp-1-first-month',
}

const SECTION_KIND = [
  { kind: 'faq', re: /^(자주\s*묻는\s*질문|frequently\s+asked\s+questions|faq)/i },
  { kind: 'refs', re: /^(참고\s*(문헌|자료)|references|sources)/i },
  { kind: 'related', re: /^(관련\s*글|함께\s*보면\s*좋은\s*글|related\s+articles?)/i },
]

const AVAILABLE = Object.fromEntries(
  LANGS.map((l) => [
    l,
    new Set(
      fs.existsSync(path.join(SRC, l))
        ? fs.readdirSync(path.join(SRC, l)).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3))
        : []
    ),
  ])
)

// ─────────────────────────────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: {}, body: raw }
  const data = {}
  let key = null
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue
    const item = line.match(/^\s+-\s+(.*)$/)
    if (item && key) {
      if (!Array.isArray(data[key])) data[key] = []
      data[key].push(unquote(item[1]))
      continue
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (kv) {
      key = kv[1]
      data[key] = kv[2].trim() === '' ? [] : unquote(kv[2])
    }
  }
  return { data, body: raw.slice(m[0].length) }
}
const unquote = (v) => v.replace(/^["'](.*)["']$/s, '$1').trim()

/**
 * 내부 참조를 사이트 경로로 되돌린다.
 * 원고는 `/ko/<slug>`, `/<slug>`, `https://www.aihavit.com/blog/ko/<slug>` 세 형태를
 * 섞어 쓴다. 이제 전부 같은 사이트이므로 `/<lang>/<slug>` 상대경로로 통일한다.
 * 신규·기존 어디에도 없는 대상은 링크를 벗겨 문구만 남긴다(404 방지).
 */
function makeLinkRewriter(lang, existingSlugs, stats) {
  return (md) =>
    md.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, text, href) => {
      const self = href.match(/^https?:\/\/blog\.aihavit\.com(\/.*)?$/)
      const p = self ? self[1] || '/' : href
      if (/^(https?:|mailto:|tel:|#)/.test(p)) return whole
      const m = p.replace(/\/+$/, '').match(/^\/(?:(ko|en|ja|zh-tw|zh-cn|es|pt-br|id|de|fr)\/)?(.+)$/i)
      if (!m) return whole
      const slug = ALIAS[m[2]] ?? m[2]
      if (ALIAS[m[2]]) stats.aliased++
      const wantLang = m[1] && LANGS.includes(m[1].toLowerCase()) ? m[1].toLowerCase() : lang
      if (AVAILABLE[wantLang]?.has(slug) || existingSlugs.has(slug)) {
        stats.resolved++
        return `[${text}](/${wantLang}/${slug})`
      }
      // 그 언어판이 없으면 다른 언어판으로라도 잇는다(끊는 것보다 낫다).
      for (const other of LANGS) {
        if (other !== wantLang && AVAILABLE[other]?.has(slug)) {
          stats.resolved++
          return `[${text}](/${other}/${slug})`
        }
      }
      stats.stripped++
      stats.missing.set(slug, (stats.missing.get(slug) || 0) + 1)
      return text
    })
}

/** 본문을 h2 단위 섹션으로 쪼갠다(원문 텍스트를 그대로 보존). */
function splitSections(body) {
  const lines = body.split(/\r?\n/)
  const pre = []
  const sections = []
  let cur = null
  for (const line of lines) {
    const h2 = line.match(/^##\s+(?!#)(.*)$/)
    if (h2) {
      const title = h2[1].trim()
      const hit = SECTION_KIND.find((k) => k.re.test(title))
      cur = { title, kind: hit ? hit.kind : 'body', lines: [] }
      sections.push(cur)
      continue
    }
    ;(cur ? cur.lines : pre).push(line)
  }
  return { pre, sections }
}

function parseFaq(lines) {
  const out = []
  let cur = null
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || /^---+$/.test(line)) continue
    const q = line.match(/^\*\*\s*\d*[.)]?\s*([^*]+?)\s*\*\*\s*(.*)$/)
    if (q) {
      if (cur) out.push(cur)
      cur = { question: q[1].trim().replace(/[:：]$/, ''), answer: q[2].trim() }
      continue
    }
    const h3 = raw.match(/^###\s+(.*)$/)
    if (h3) {
      if (cur) out.push(cur)
      cur = { question: h3[1].trim(), answer: '' }
      continue
    }
    if (cur) cur.answer = cur.answer ? `${cur.answer} ${line}` : line
  }
  if (cur) out.push(cur)
  return out
    .filter((x) => x.question && x.answer)
    .map((x) => ({ question: x.question, answer: stripMd(x.answer) }))
}

function parseRefs(lines) {
  const out = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || /^---+$/.test(line)) continue
    const item = line.replace(/^\d+\.\s*|^[-*]\s*/, '')
    if (!item) continue
    const url = item.match(/(https?:\/\/[^\s)]+)/)
    const mdLink = item.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/)
    out.push({
      text: stripMd(mdLink ? item.replace(mdLink[0], mdLink[1]) : item.replace(url?.[0] ?? '', '')).trim(),
      url: mdLink ? mdLink[2] : url?.[1],
    })
  }
  return out.filter((r) => r.text)
}

/** 첫 마크다운 표를 comparison_table 로 뽑는다. 나머지 표는 본문에 남는다. */
function extractFirstTable(lines, title) {
  const start = lines.findIndex((l) => /^\s*\|/.test(l))
  if (start < 0) return { table: null, rest: lines }
  let end = start
  while (end < lines.length && /^\s*\|/.test(lines[end])) end++
  const rows = lines.slice(start, end)
  if (rows.length < 3) return { table: null, rest: lines }
  const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => stripMd(c.trim()))
  return {
    table: {
      title,
      headers: cells(rows[0]),
      rows: rows.slice(1).filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r)).map(cells),
    },
    rest: [...lines.slice(0, start), ...lines.slice(end)],
  }
}

const stripMd = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|__/g, '')
    .replace(/\s+/g, ' ')
    .trim()

function readingMinutes(body) {
  const ko = (body.match(/[ㄱ-힣]/g) || []).length
  const words = body.split(/\s+/).length
  return Math.max(3, Math.round(ko > 400 ? ko / 500 : words / 220))
}

// ─────────────────────────────────────────────────────────────────────────────

const existingSlugs = new Set(
  fs.readdirSync(OUT).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
)
const stats = { resolved: 0, stripped: 0, aliased: 0, missing: new Map() }

const slugs = [...new Set(LANGS.flatMap((l) => [...AVAILABLE[l]]))].sort()
const built = []

for (const slug of slugs) {
  const langs = {}
  let category = null
  let kwEn = ''
  let kwKo = ''
  let readMin = 0

  for (const lang of LANGS) {
    if (!AVAILABLE[lang].has(slug)) continue
    const raw = fs.readFileSync(path.join(SRC, lang, `${slug}.md`), 'utf8')
    const { data, body: rawBody } = parseFrontmatter(raw)

    // 원고가 직접 넣은 구조화 데이터·주석은 레포가 자체 생성하므로 제거
    let body = rawBody
      .replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')

    const rewrite = makeLinkRewriter(lang, existingSlugs, stats)
    const { pre, sections } = splitSections(body)

    // TL;DR — 원고의 "**빠른 답변:**" 문단
    const quick = pre.find((l) => /^\*\*(빠른 답변|quick answer|クイックアンサー|快速解答|快速回答)/i.test(l.trim()))
    const tldr = quick ? stripMd(quick.replace(/^\*\*[^*]+?[:：]?\*\*[:：]?\s*/, '')) : (data.meta_description ?? '')

    const faqSection = sections.find((s) => s.kind === 'faq')
    const refsSection = sections.find((s) => s.kind === 'refs')

    // 본문 = h1 / 의학고지 / 빠른답변 / 바이라인 블록을 뺀 프리앰블 + body 섹션.
    //
    // 바이라인은 원고마다 형식이 다르다 — 한 줄 이탤릭
    // ("*작성: … · 의료 검수: [PLACEHOLDER …] · 발행 …*") 이기도 하고,
    // "By **HAVIT Editorial Team**" / "Medically reviewed by **[…]**" /
    // "Published …" 처럼 3줄로 나뉘기도 한다. 한 줄 규칙으로 잡으면 후자가
    // 통째로 남아 [REVIEWER NAME] 같은 자리표시자가 라이브에 노출된다.
    // 저자·감수 표기는 레포의 <ArticleAuthorBlock/> 이 담당하므로 선두 블록을 통째로 버린다.
    // ⚠️ \b 를 한글 토큰에 쓰지 말 것. JS 의 \b 는 ASCII 단어 경계라
    // "작성\b" 는 "작성:" 에 매칭되지 않는다(성·: 둘 다 non-word 로 취급).
    // 이 때문에 한국어 바이라인이 전부 살아남아 [감수자 이름] 이 노출됐다.
    const BYLINE_LINE =
      /(?:by\s|작성|글\s*[:：·／/]|글\s+\[|medically reviewed|의학\s*(?:검수|감수)|의료\s*(?:검수|감수)|검수\s*[:：]|published\s|발행|last updated|최종\s*수정|執筆|文責|編集部|医療監修|監修|公開\s|最終更新|撰文|撰稿|編輯團隊|醫[學療]審[閱稿]|審[閱稿]|發[布佈]|最後更新)/i
    const preBodyRaw = pre.filter(
      (l) => !/^#\s/.test(l) && !/^>\s/.test(l) && l !== quick && !/^---+\s*$/.test(l)
    )
    // 첫 실제 문단이 나오기 전까지만 바이라인으로 간주한다(본문 중간의 "발행" 언급 보호).
    const preBody = []
    let inLead = true
    for (const l of preBodyRaw) {
      if (inLead) {
        const t = l.trim()
        if (!t) continue
        // 저자·감수·발행 표기는 짧다. 길이 상한을 둬서 본문 첫 문단이
        // "발행" 같은 단어를 품고 있다는 이유로 잘려나가지 않게 한다.
        if (t.length <= 160 && BYLINE_LINE.test(t)) continue
        if (/PLACEHOLDER|プレースホルダー|\[YYYY-MM-DD\]/i.test(t)) continue
        inLead = false
      }
      preBody.push(l)
    }

    const bodySections = sections.filter((s) => s.kind === 'body')

    let comparison = null
    const chunks = []
    for (const s of bodySections) {
      let lines = s.lines
      if (!comparison) {
        const r = extractFirstTable(lines, s.title)
        if (r.table) {
          comparison = r.table
          lines = r.rest
        }
      }
      chunks.push(`## ${s.title}\n${lines.join('\n')}`)
    }

    const bodyMd = rewrite([preBody.join('\n'), ...chunks].join('\n\n').replace(/\n{3,}/g, '\n\n').trim())

    langs[DATA_KEY[lang]] = {
      title: data.title || slug,
      meta_description: data.meta_description || '',
      tldr,
      body_md: bodyMd,
      ...(comparison ? { comparison_table: comparison } : {}),
      faq: faqSection ? parseFaq(faqSection.lines) : [],
      references: refsSection ? parseRefs(refsSection.lines) : [],
      last_updated: data.date_modified || data.date_published || data.date || '2026-08-14',
    }

    if (lang === 'en') kwEn = data.target_keyword || ''
    if (lang === 'ko') kwKo = data.target_keyword || ''
    readMin = Math.max(readMin, readingMinutes(bodyMd))
    if (!category) category = CATEGORIES.find((c) => c.re.test(slug)) ?? FALLBACK_CATEGORY
  }

  if (!Object.keys(langs).length) continue

  built.push({
    article_id: `BLOG_${slug.toUpperCase().replace(/-/g, '_')}`,
    slug,
    category: category.name,
    category_emoji: category.emoji,
    type: 'guide',
    // 이 마커로 [lang]/[slug]/page.tsx 가 허브 레이아웃을 고른다.
    layout: 'hub',
    reading_time_min: readMin,
    primary_keyword_en: kwEn,
    primary_keyword_ko: kwKo,
    langs,
    generated_at: new Date('2026-08-14T00:00:00Z').toISOString(),
  })
}

const dry = process.argv.includes('--dry')
for (const a of built) {
  if (!dry) fs.writeFileSync(path.join(OUT, `${a.slug}.json`), JSON.stringify(a, null, 2) + '\n')
}

// 원고에 남아 있는 자리표시자는 라이브에 그대로 노출되므로 반드시 보고한다.
const PLACEHOLDER_RE = /PLACEHOLDER|\[(?:REVIEWER NAME|AUTHOR NAME|감수자 이름|작성자 이름|검수 의료진 성명|YYYY-MM-DD)[^\]]*\]/g
const flagged = []
for (const a of built) {
  for (const [lang, c] of Object.entries(a.langs)) {
    const hits = [...new Set((c.body_md.match(PLACEHOLDER_RE) || []))]
    if (hits.length) flagged.push({ slug: a.slug, lang, hits })
  }
}

const withFaq = built.filter((a) => Object.values(a.langs).some((c) => c.faq?.length)).length
const withTable = built.filter((a) => Object.values(a.langs).some((c) => c.comparison_table)).length
const withRefs = built.filter((a) => Object.values(a.langs).some((c) => c.references?.length)).length
const byLang = {}
for (const a of built) for (const k of Object.keys(a.langs)) byLang[k] = (byLang[k] || 0) + 1
console.log(`${dry ? '[dry] ' : ''}아티클 ${built.length}건 → data/articles/`)
console.log(`  언어별: ${Object.entries(byLang).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
console.log(`  FAQ 보유 ${withFaq} · 비교표 ${withTable} · 참고문헌 ${withRefs}`)
console.log(`  내부 링크: 해석 ${stats.resolved} (별칭 경유 ${stats.aliased}) / 제거 ${stats.stripped} (대상 없음 ${stats.missing.size}종)`)
if (flagged.length) {
  console.log(`\n⚠️  본문에 자리표시자가 남은 콘텐츠 ${flagged.length}개 — 배포 전 채워야 함:`)
  const byHit = new Map()
  for (const f of flagged) for (const h of f.hits) byHit.set(h, (byHit.get(h) || 0) + 1)
  for (const [h, n] of [...byHit.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${String(n).padStart(3)}개  ${h}`)
  }
  console.log(`     예: ${flagged.slice(0, 3).map((f) => `${f.slug}(${f.lang})`).join(', ')}`)
} else {
  console.log('  자리표시자 잔여: 없음 ✅')
}
