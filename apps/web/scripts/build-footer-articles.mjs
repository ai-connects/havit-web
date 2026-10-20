/**
 * Generate src/i18n/footer-articles.json from the blog repo.
 *
 * The homepage links into /blog, but the article titles live in the
 * blog's own data/articles/*.json. Rather than hand-copying 36 links × 4
 * languages of labels (which would drift the moment a title is edited), this
 * reads the blog repo once and bakes a small JSON the Vite i18n plugin renders.
 *
 * The cluster definition is the blog's lib/footer-links.ts — parsed here so
 * there is one source of truth for *which* articles are promoted, on both sites.
 *
 * Usage:  node scripts/build-footer-articles.mjs [path-to-blog-app]
 *
 * Default resolves to the sibling app in this monorepo (apps/blog). Before the
 * two repos merged this pointed at a checkout that had to sit next to this one;
 * an override argument is still accepted for one-off runs.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const BLOG = process.argv[2] ?? resolve(HERE, '../../blog')

/**
 * 블로그가 색인·서빙하는 언어. 2026-09 에 10개 전부로 되돌렸다 —
 * 그전엔 4개만 남기고 나머지가 410 이라 독일어 홈페이지가 영어 아티클로
 * 링크를 보내야 했다. 지금은 각 로케일이 제 언어로 들어간다.
 * 출처는 블로그의 lib/i18n.ts INDEXABLE_ROUTE_LANGS.
 */
const BLOG_LANGS = ['en', 'ko', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr']
const LANG_TO_DATA = {
  en: 'en', ko: 'ko', ja: 'ja', zh: 'zh-CN', 'zh-tw': 'zh-TW',
  es: 'es', 'pt-br': 'pt-BR', id: 'id', de: 'de', fr: 'fr',
}

/**
 * 통합된 슬러그는 빼야 한다. 블로그 자체 푸터는 lib/articles-v2.ts 의
 * MERGED_AWAY 필터를 거쳐 이미 빠지는데, 이 생성기는 파일을 직접 읽어서
 * 걸러지지 않았다 — 같은 SSOT 를 쓴다는 두 푸터가 서로 달라져,
 * 34개 로케일 홈이 308 로 리다이렉트되는 URL 로 링크하고 있었다.
 */
const MERGED_AWAY = new Set(
  JSON.parse(readFileSync(resolve(BLOG, 'lib/merged-redirects.json'), 'utf-8')).map((r) => r.from),
)

const src = readFileSync(resolve(BLOG, 'lib/footer-links.ts'), 'utf-8')
const groups = []
for (const m of src.matchAll(/key:\s*'([a-zA-Z0-9]+)',\s*slugs:\s*\[([\s\S]*?)\]/g)) {
  const key = m[1]
  const slugs = [...m[2].matchAll(/'([a-z0-9-]{12,})'/g)].map((s) => s[1])
  if (slugs.length) groups.push({ key, slugs })
}
if (!groups.length) throw new Error('no groups parsed from blog lib/footer-links.ts')

/** Same rule the blog footer uses: cut at the first separator, budget by display width. */
const width = (t) =>
  [...t].reduce(
    (n, ch) =>
      n + (/[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠]/.test(ch) ? 2 : 1),
    0,
  )
function shortLabel(title) {
  const MAX = 46
  for (const sep of [': ', '：', ' — ', ' – ', ' - ', '—', '? ', '？', ', ']) {
    const i = title.indexOf(sep)
    if (i > 5) {
      const head = title.slice(0, i).trim()
      if (width(head) <= MAX) return head
    }
  }
  if (width(title) <= MAX) return title
  let out = ''
  for (const ch of title) {
    if (width(out + ch) > MAX - 1) break
    out += ch
  }
  return `${out.trimEnd()}…`
}

/**
 * 앱 추천 그룹(appGuides)의 앵커 — 블로그 apps/blog/lib/app-guides.ts appGuideLabel 의 복제.
 * short_title(없으면 title)에서 연도를 떼고 첫 구분자 앞만 남긴다 → "칼로리 계산 앱 추천".
 * 고치면 블로그 쪽도 같이 고칠 것.
 */
const APP_GUIDE_GROUPS = new Set(['appGuides'])
const STRONG_SEPARATORS = /\s*(?:[:：｜|—–?？]|\s-\s)\s*/
const WEAK_SEPARATORS = /\s*[,，、]\s*/
function appGuideLabel(content) {
  const MAX = 56
  const t = (content.short_title || content.title)
    .replace(/[（(]\s*2026\s*[)）]/g, '')
    .replace(/\s*(?:\b(?:in|en|em|di|im)\s+)?2026\s*(?:年版|年)?\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
  const parts = t.split(STRONG_SEPARATORS).map((x) => x.trim()).filter(Boolean)
  const multiVs = parts.find((x) => (x.match(/\bvs\b/gi) ?? []).length >= 2)
  let label = multiVs ?? parts[0] ?? t
  if (width(label) > MAX) {
    const head = label.split(WEAK_SEPARATORS)[0].trim()
    if (head && width(head) <= MAX) label = head
  }
  if (width(label) <= MAX) return label
  let out = ''
  for (const ch of label) {
    if (width(out + ch) > MAX - 1) break
    out += ch
  }
  return `${out.trimEnd()}…`
}

let missing = 0
const out = groups.map((g) => ({
  key: g.key,
  links: g.slugs
    .map((slug) => {
      if (MERGED_AWAY.has(slug)) {
        console.warn(`  ! merged away, skipping: ${slug}`)
        return null
      }
      const p = resolve(BLOG, 'data/articles', `${slug}.json`)
      if (!existsSync(p)) {
        missing++
        console.warn(`  ! missing article: ${slug}`)
        return null
      }
      const a = JSON.parse(readFileSync(p, 'utf-8'))
      const labels = {}
      for (const lang of BLOG_LANGS) {
        const c = a.langs?.[LANG_TO_DATA[lang]]
        // 앱 추천 그룹은 블로그 resolveContent 와 같은 기준(title·body_md 둘 다)으로 원고 여부를 본다.
        if (!c?.title) continue
        if (APP_GUIDE_GROUPS.has(g.key)) {
          if (c.body_md) labels[lang] = appGuideLabel(c)
        } else {
          labels[lang] = shortLabel(c.title)
        }
      }
      return { slug, labels }
    })
    .filter(Boolean),
}))

// index.html 본문의 아티클 카드는 `/blog/en/<slug>` 로 박혀 있다. 로케일 홈에서
// 제 언어로 보내려면 그 언어 원고가 있는지 알아야 해서(없으면 noindex 폴백 페이지로
// 링크 권위가 샌다) 카드 slug 마다 원고가 있는 블로그 언어를 같이 굽는다.
const cards = {}
const indexHtml = readFileSync(resolve(HERE, '../index.html'), 'utf-8')
for (const [, slug] of indexHtml.matchAll(/href="\/blog\/en\/([^"/#?]+)"/g)) {
  const p = resolve(BLOG, 'data/articles', `${slug}.json`)
  if (!existsSync(p)) {
    missing++
    console.warn(`  ! missing card article: ${slug}`)
    continue
  }
  const a = JSON.parse(readFileSync(p, 'utf-8'))
  cards[slug] = BLOG_LANGS.filter((lang) => {
    const c = a.langs?.[LANG_TO_DATA[lang]]
    return c?.title && c?.body_md
  })
}

const dest = resolve(HERE, '../src/i18n/footer-articles.json')
writeFileSync(dest, `${JSON.stringify({ blogLangs: BLOG_LANGS, groups: out, cards }, null, 2)}\n`)
console.log(
  `wrote ${dest.split('/').slice(-3).join('/')} — ${out.length} groups, ` +
    `${out.reduce((n, g) => n + g.links.length, 0)} links, ${missing} missing`,
)
