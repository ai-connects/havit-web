/**
 * 브랜드 표기 규칙 — docs/brand-glossary.md 의 기계 판독용 SSOT.
 *
 * normalize.mjs(일괄 정리)와 check.mjs(빌드 가드)가 **같은 규칙**을 쓴다.
 * 정리 스크립트가 고치는 범위와 가드가 막는 범위가 갈라지면, 가드를 통과한
 * 표기가 다음 정리에서 또 바뀌거나 그 반대가 된다.
 *
 * 바꾸지 않는 것 (글로서리 §3):
 *   - URL·도메인·이메일·경로·slug — `Havit` 앞뒤가 `/ . @ - _` 로 이어지거나
 *     `://`·`www.` 가 든 토큰 안에 있으면 건드리지 않는다.
 *   - 코드 식별자 — `AboutHavit`, `hasHavitQ` 처럼 영숫자에 붙은 Havit 은
 *     단어가 아니므로 애초에 매칭하지 않는다.
 *   - JSON key — normalize/check 모두 문자열 **값**만 본다.
 *   - 사용자 입력 인식용 레거시 정규식 — ALLOW 에 파일 단위로 명시한다.
 */
import { readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/** 앱별 검사 범위. normalize 는 전부, check 는 --app 으로 고른 것만. */
export const SCOPES = {
  web: ['apps/web'],
  blog: ['apps/blog'],
  docs: ['README.md', 'docs', 'packages'],
}

const EXTS = new Set(['.json', '.ts', '.tsx', '.js', '.mjs', '.html', '.md', '.txt'])
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.vercel', '.git', 'out'])
const SKIP_FILES = new Set([
  // 글로서리 자체는 금지 표기를 예시로 담고 있다.
  'docs/brand-glossary.md',
  // 규칙 파일은 금지 표기를 패턴으로 담고 있다.
  'packages/brand/rules.mjs',
  'packages/brand/normalize.mjs',
  'packages/brand/check.mjs',
  'package-lock.json',
])

/**
 * 의도적으로 옛 표기를 남기는 곳. { file, rule, reason }.
 * rule 은 아래 RULES 의 id.
 */
export const ALLOW = [
  {
    file: 'apps/blog/scripts/geo-entity-surfacing.mjs',
    rule: 'ko-habit',
    reason: '이전에 생성된 문서의 옛 표기(하빗)를 알아보는 레거시 인식 정규식과 그 설명 주석',
  },
]

/* ───────────── 규칙 ───────────── */

const HANGUL = /[가-힣]/

/** `Havit` → `HAVIT`. 영숫자·`$` 에 붙어 있으면 식별자라 매칭하지 않는다. */
const LATIN_RE = /(?<![A-Za-z0-9_$])Havit(?![A-Za-z0-9_$])/g

/** URL·경로·이메일·slug 판정. text 안 index 위치의 Havit 이 그런 토큰 안이면 이유를 돌려준다. */
function latinExclusion(text, index) {
  const before = text[index - 1] ?? ''
  const after2 = text.slice(index + 5, index + 7)
  if (/[/\\.@_-]/.test(before)) return `경로/도메인/slug 연결(앞 '${before}')`
  if (/^[-_/.@][A-Za-z0-9]/.test(after2)) return `경로/도메인/slug 연결(뒤 '${after2}')`
  // 외부 원문 인용 — App Store 판매자명 표기("Havit Incorporated")는 스토어가 보여주는 그대로 인용한다.
  if (text.startsWith(' Incorporated', index + 5)) return '외부 원문 인용(App Store 판매자명)'
  // 같은 토큰(공백·따옴표·괄호로 끊기는 구간) 안에 URL 표지가 있는가
  let s = index
  while (s > 0 && !/[\s"'`()<>[\]]/.test(text[s - 1])) s--
  let e = index + 5
  while (e < text.length && !/[\s"'`()<>[\]]/.test(text[e])) e++
  const token = text.slice(s, e)
  if (/:\/\/|^www\.|mailto:/i.test(token)) return `URL 토큰(${token.slice(0, 60)})`
  return null
}

/** 하빗 + 조사 → 하비트 + 조사 (받침이 사라지므로 조사도 바뀐다). */
const KO_HABIT_RE = /하빗(\((?:Havit|HAVIT)\))?(이에요|으로|은|을|과|이)?/g
function koHabitReplace(m, paren, particle, offset, text) {
  const head = '하비트' + (paren ? '(HAVIT)' : '')
  if (!particle) return head
  const next = text[offset + m.length] ?? ''
  switch (particle) {
    case '이에요': return head + '예요'
    case '으로': return head + '로'
    case '은': return head + '는'
    case '을': return head + '를'
    case '과': return head + '와'
    case '이':
      // 주격 '이' 는 '가', 서술격(이다·이고·이라·이나·이랑…)은 '이' 탈락
      return HANGUL.test(next) ? head : head + '가'
  }
  return head + particle
}

/** 하비트파워 → 하비트 파워 (기능명 띄어쓰기). */
const KO_SPACING_RE = /하비트(파워|프로|코인|프리미엄)/g

export const RULES = [
  {
    id: 'latin-havit',
    label: 'Havit → HAVIT',
    re: LATIN_RE,
    exclude: latinExclusion,
    replace: () => 'HAVIT',
  },
  {
    id: 'ko-habit',
    label: '하빗 → 하비트',
    re: KO_HABIT_RE,
    exclude: () => null,
    replace: koHabitReplace,
  },
  {
    id: 'ko-spacing',
    label: '하비트파워/프로/코인/프리미엄 → 띄어쓰기',
    re: KO_SPACING_RE,
    exclude: () => null,
    replace: (m, word) => `하비트 ${word}`,
  },
]

export function isAllowed(file, ruleId) {
  return ALLOW.some((a) => a.file === file && a.rule === ruleId)
}

/**
 * 한 덩어리 텍스트에 규칙을 적용한다.
 * 반환: { out, hits: [{ rule, index, match, replacement, excluded }] }
 * index 는 **입력** 텍스트 기준.
 */
export function transformText(text, file) {
  let cur = text
  const hits = []
  for (const rule of RULES) {
    const allowed = isAllowed(file, rule.id)
    rule.re.lastIndex = 0
    cur = cur.replace(rule.re, (...args) => {
      const m = args[0]
      const offset = args[args.length - 2]
      const src = args[args.length - 1]
      const why = allowed ? `허용 목록(${file})` : rule.exclude(src, offset)
      if (why) {
        hits.push({ rule: rule.id, index: offset, match: m, replacement: m, excluded: why })
        return m
      }
      const rep = rule.replace(...args)
      if (rep !== m) hits.push({ rule: rule.id, index: offset, match: m, replacement: rep, excluded: null })
      return rep
    })
  }
  return { out: cur, hits }
}

/* ───────────── 파일 ───────────── */

export function listFiles(scopeNames) {
  const out = []
  const walk = (abs) => {
    const rel = relative(ROOT, abs).split(sep).join('/')
    const st = statSync(abs)
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(abs.split(sep).pop())) return
      for (const name of readdirSync(abs)) walk(join(abs, name))
      return
    }
    const ext = rel.slice(rel.lastIndexOf('.'))
    if (!EXTS.has(ext)) return
    if (SKIP_FILES.has(rel) || SKIP_FILES.has(rel.split('/').pop())) return
    out.push(rel)
  }
  for (const s of scopeNames) for (const p of SCOPES[s]) {
    try { walk(resolve(ROOT, p)) } catch { /* 없는 경로는 건너뛴다 */ }
  }
  return [...new Set(out)].sort()
}

/**
 * JSON 원문에서 문자열 **값** 토큰만 골라 콜백에 넘긴다(key 는 건드리지 않는다).
 * 원문 바이트를 그대로 유지한 채 값 내부만 치환하려고 파싱 후 재직렬화를 하지 않는다.
 * cb(raw 내용(따옴표 제외), 토큰 시작 offset) → 새 raw 내용
 */
export function mapJsonStringValues(src, cb) {
  const STR = /"(?:[^"\\]|\\.)*"/g
  let out = ''
  let last = 0
  let m
  while ((m = STR.exec(src))) {
    const rest = src.slice(STR.lastIndex, STR.lastIndex + 40)
    const isKey = /^\s*:/.test(rest)
    out += src.slice(last, m.index)
    if (isKey) out += m[0]
    else out += '"' + cb(m[0].slice(1, -1), m.index + 1) + '"'
    last = STR.lastIndex
  }
  return out + src.slice(last)
}

/** 파일 하나 처리. 반환 { out, hits } — hits 의 index 는 원문 기준 절대 offset. */
export function transformFile(rel, src) {
  if (rel.endsWith('.json')) {
    const hits = []
    const out = mapJsonStringValues(src, (raw, base) => {
      const r = transformText(raw, rel)
      for (const h of r.hits) hits.push({ ...h, index: h.index + base })
      return r.out
    })
    return { out, hits }
  }
  return transformText(src, rel)
}

/** offset → 1-based 줄 번호 */
export function lineOf(src, index) {
  let n = 1
  for (let i = 0; i < index; i++) if (src.charCodeAt(i) === 10) n++
  return n
}
