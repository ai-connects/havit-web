// 정본(지금 Vercel 이 쓰는 파일)에서 정적 호스팅용 규칙을 만든다. 규칙을 여기서 새로 적지 않는다.
//   - apps/web/vercel.json            → 리다이렉트(엣지 함수 데이터) · 캐시 헤더(S3 메타데이터)
//   - apps/web/middleware.js          → 엣지 함수의 이식 코드(test-edge.mjs 가 원본과 대조)
//   - apps/blog/next.config.js        → redirects() 를 실제로 불러 분류(정규식 · 병합 slug · 옛 호스트)
//   - apps/blog/lib/merged-redirects.json
//   - apps/blog/vercel.json           → /blog 보안 헤더(응답 헤더 정책) · 캐시 헤더
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const readJson = (p) => JSON.parse(read(p))

/** path-to-regexp(Vercel·Next 공통 문법) → JS 정규식 소스 + 매개변수 이름 목록. */
export function toRegex(source) {
  let out = '^'
  const names = []
  for (let i = 0; i < source.length; ) {
    const c = source[i]
    if (c === ':') {
      let j = i + 1
      while (j < source.length && /\w/.test(source[j])) j++
      names.push(source.slice(i + 1, j))
      let pat = null
      if (source[j] === '(') {
        let depth = 0, k = j
        for (; k < source.length; k++) {
          if (source[k] === '\\') { k++; continue }
          if (source[k] === '(') depth++
          if (source[k] === ')' && --depth === 0) break
        }
        pat = source.slice(j + 1, k)
        j = k + 1
      }
      const mod = source[j] === '+' || source[j] === '*' ? source[j++] : ''
      const p = pat ?? '[^/]+?'
      if (mod === '+') out += `(${p}(?:/${p})*)`
      else if (mod === '*') out += `((?:${p}(?:/${p})*)?)`
      else out += `(${p})`
      i = j
    } else if (c === '(') {
      throw new Error(`이름 없는 그룹은 지원하지 않는다: ${source}`)
    } else {
      out += /[.*+?^${}|[\]\\]/.test(c) ? `\\${c}` : c
      i++
    }
  }
  return { re: out + '$', names }
}

function toDest(dest, names) {
  return dest.replace(/:(\w+)[+*]?/g, (_, n) => {
    const k = names.indexOf(n)
    if (k < 0) throw new Error(`목적지 매개변수 ${n} 이 출발지에 없다`)
    return `$${k + 1}`
  })
}

export async function loadNextRedirects() {
  const require = createRequire(import.meta.url)
  const cfg = require(join(ROOT, 'apps/blog/next.config.js'))
  return { rules: await cfg.redirects(), basePath: cfg.basePath }
}

/** 엣지 함수에 박을 데이터와 KeyValueStore 항목. */
export async function buildEdge() {
  const web = readJson('apps/web/vercel.json')
  const merged = readJson('apps/blog/lib/merged-redirects.json')
  const mw = read('apps/web/middleware.js')
  const loc = read('apps/web/plugins/locales.js')

  // vercel.json redirects: 매개변수 없는 것은 정확 일치 표, 나머지는 정규식.
  const exact = {}
  const patterns = []
  for (const r of web.redirects) {
    if (!r.permanent) throw new Error(`permanent:false 규칙은 아직 없다 — 상태코드 처리를 추가할 것: ${r.source}`)
    if (!/[:(]/.test(r.source)) exact[r.source] = r.destination
    else {
      const { re, names } = toRegex(r.source)
      patterns.push([re, toDest(r.destination, names)])
    }
  }

  // next.config.js redirects() 를 실제로 불러 분류한다.
  const { rules, basePath } = await loadNextRedirects()
  const junk = []
  let mergedSeen = 0, legacySeen = 0, rootSeen = 0
  const mergedMap = new Map(merged.map((r) => [r.from, r.to]))
  for (const r of rules) {
    if (r.basePath === false) {
      legacySeen++ // legacyMerged · legacyHost → 함수의 legacy() (test-edge.mjs 가 대조)
      continue
    }
    const lit = /^\/:lang\/([a-z0-9-]+)$/.exec(r.source)
    if (lit && r.destination === `/:lang/${mergedMap.get(lit[1])}`) { mergedSeen++; continue }
    if (r.source === '/' && r.destination === '/ko') { rootSeen++; continue } // /blog 는 미들웨어가 먼저 302
    const { re, names } = toRegex(basePath + r.source)
    junk.push([re, toDest(basePath + r.destination, names)])
  }
  if (mergedSeen !== merged.length || rootSeen !== 1 || legacySeen !== merged.length + 2) {
    throw new Error(`next.config.js redirects() 구성이 바뀌었다(merged ${mergedSeen}/${merged.length}, legacy ${legacySeen}, root ${rootSeen}) — buildEdge 분류를 맞출 것`)
  }

  const list = (re) => (re.exec(mw)?.[1] ?? '').match(/'([^']+)'/g).map((s) => s.slice(1, -1))
  const obj = (re) => Object.fromEntries([...(re.exec(mw)?.[1] ?? '').matchAll(/'?([\w-]+)'?:\s*'([^']+)'/g)].map((m) => [m[1], m[2]]))
  const locales = [...loc.matchAll(/^\s{2}'?([a-z]{2}(?:-[a-z]{2})?)'?: \{ htmlLang/gm)].map((m) => m[1])
  const affLocales = (/AFFILIATE_LOCALES = \[([^\]]+)\]/.exec(loc)?.[1] ?? '').match(/'([a-z-]+)'/g).map((s) => s.slice(1, -1))

  const data = {
    kvsId: '__KVS_ID__',
    legacyHost: 'blog.aihavit.com',
    apexHost: 'aihavit.com',
    text: { 301: 'Moved Permanently', 302: 'Found', 308: 'Permanent Redirect' },
    exact,
    patterns,
    junk,
    def: /DEFAULT_LOCALE = '([^']+)'/.exec(loc)[1],
    locales,
    affLocales,
    alias: obj(/const ALIAS = \{([^}]+)\}/),
    blogAlias: obj(/const BLOG_ALIAS = \{([^}]+)\}/),
    blogLangs: list(/BLOG_LOCALES = new Set\(\[([^\]]+)\]\)/),
    blogOnly: list(/BLOG_ONLY_LANGS = new Set\(\[([^\]]+)\]\)/),
    extensionless: ['/blog/api/health'],
  }
  if (locales.length !== 34 || data.blogLangs.length !== 10) throw new Error('로케일 목록을 못 읽었다')
  const kvs = merged.map((r) => ({ Key: `m:${r.from}`, Value: r.to }))
  return { data, kvs, counts: { exact: Object.keys(exact).length, patterns: patterns.length, junk: junk.length, kvs: kvs.length } }
}

// ── S3 업로드 메타데이터(Content-Type · Cache-Control). 위에서부터 처음 맞는 규칙 하나. ──
// glob 은 aws s3 sync --include 문법(* 는 / 도 넘는다). local-edge.mjs 도 같은 표를 쓴다.
// HTML 등: 브라우저는 지금처럼 매번 확인(max-age=0), 엣지는 하루 보관하고 배포 때 무효화한다.
export const HTML_CC = 'public, max-age=0, s-maxage=86400, must-revalidate'
export function uploadRules() {
  const web = readJson('apps/web/vercel.json')
  const blog = readJson('apps/blog/vercel.json')
  const rules = []
  const glob = (src) => src.replace(/^\//, '').replace(/:path\*$/, '*').replace(/\(\.\*\)$/, '*')
  for (const h of blog.headers) {
    const cc = h.headers.find((x) => x.key === 'Cache-Control')
    if (cc) rules.push({ glob: 'blog/' + glob(h.source), cacheControl: cc.value })
  }
  rules.push({ glob: 'blog/_img/*', contentType: 'image/avif', cacheControl: 'public, max-age=2678400' })
  for (const h of web.headers) {
    const cc = h.headers.find((x) => x.key === 'Cache-Control')
    if (!cc || h.headers.length !== 1) throw new Error(`vercel.json 헤더 ${h.source} — Cache-Control 말고는 응답 헤더 정책(infra)에 옮길 것`)
    const value = cc.value === 'public, max-age=0, must-revalidate' ? HTML_CC : cc.value
    rules.push({ glob: glob(h.source), cacheControl: value, ...(h.source === '/sitemap.xml' ? { contentType: 'application/xml' } : {}) })
  }
  rules.push(
    { glob: '*.html', contentType: 'text/html; charset=utf-8', cacheControl: HTML_CC },
    { glob: '*.xml', contentType: 'application/xml; charset=utf-8', cacheControl: HTML_CC },
    { glob: 'blog/api/health', contentType: 'application/json', cacheControl: HTML_CC },
    { glob: '*.json', contentType: 'application/json', cacheControl: HTML_CC },
    { glob: '*.txt', contentType: 'text/plain; charset=utf-8', cacheControl: HTML_CC },
    { glob: '*', cacheControl: HTML_CC },
  )
  return rules
}

export function globToRegex(g) {
  return new RegExp('^' + g.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$')
}

/** 응답 헤더 정책(infra/cloudfront.yml 과 같아야 한다 — test-edge.mjs 가 대조). */
export function responseHeaderPolicies() {
  const blog = readJson('apps/blog/vercel.json')
  const sec = Object.fromEntries(blog.headers.find((h) => h.source === '/(.*)').headers.map((x) => [x.key, x.value]))
  const hsts = { 'Strict-Transport-Security': 'max-age=63072000' } // Vercel 이 플랫폼에서 붙이던 값
  return { web: hsts, blog: { ...hsts, ...sec } }
}

/** 캐시 동작(경로 → 헤더 정책, 함수 여부). infra/cloudfront.yml 의 CacheBehaviors 와 같은 순서. */
export const BEHAVIORS = [
  { path: '/assets/*', policy: 'web', fn: false },
  { path: '/blog/_next/static/*', policy: 'blog', fn: false },
  { path: '/blog/_img/*', policy: 'blog', fn: false },
  { path: '/blog/*', policy: 'blog', fn: true },
  { path: '*', policy: 'web', fn: true },
]
export const ERROR_PAGE = '/blog/404.html'
