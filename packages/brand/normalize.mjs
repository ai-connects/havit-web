#!/usr/bin/env node
/**
 * 브랜드 표기 일괄 정리 — docs/brand-glossary.md 기준.
 *
 *   node packages/brand/normalize.mjs                 # 리포트만 (기본, 파일 안 바꿈)
 *   node packages/brand/normalize.mjs --write         # 적용
 *   node packages/brand/normalize.mjs --report out.tsv  # 후보 전수(파일·위치·전후 문맥) TSV
 *
 * 멱등이다 — 이미 정리된 파일은 0건으로 지나간다. 다른 브랜치(번역·신규 아티클)가
 * 머지된 뒤 같은 명령을 다시 돌리면 그 브랜치가 들여온 옛 표기만 잡힌다.
 *
 * JSON 은 문자열 **값** 만 바꾸고 key·구조·포맷(들여쓰기, 이스케이프)은 바이트 그대로 둔다.
 * 적용 후 JSON 은 다시 파싱해 구조(키 집합·배열 길이·타입)가 같은지 확인하고,
 * 다르면 그 파일은 쓰지 않고 실패한다.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT, SCOPES, RULES, listFiles, transformFile, lineOf } from './rules.mjs'

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const reportIdx = args.indexOf('--report')
const REPORT = reportIdx >= 0 ? args[reportIdx + 1] : null

/* JSON 값 offset → 경로 ("langs.ko.faq[3].answer") */
function jsonPathIndex(src) {
  const idx = [] // [start, end, path]
  let i = 0
  const ws = () => { while (/\s/.test(src[i])) i++ }
  const str = () => { const s = i; i++; while (src[i] !== '"') { if (src[i] === '\\') i++; i++ } i++; return [s, i] }
  const val = (path) => {
    ws()
    const c = src[i]
    if (c === '{') {
      i++; ws()
      if (src[i] === '}') { i++; return }
      for (;;) {
        ws(); const [ks, ke] = str(); const key = JSON.parse(src.slice(ks, ke))
        ws(); i++ // :
        val(path ? `${path}.${key}` : key)
        ws(); if (src[i] === ',') { i++; continue } i++; return
      }
    } else if (c === '[') {
      i++; ws()
      if (src[i] === ']') { i++; return }
      for (let n = 0; ; n++) {
        val(`${path}[${n}]`)
        ws(); if (src[i] === ',') { i++; continue } i++; return
      }
    } else if (c === '"') {
      const [s, e] = str(); idx.push([s, e, path])
    } else {
      while (i < src.length && !/[,\]}\s]/.test(src[i])) i++
    }
  }
  val('')
  return (off) => (idx.find(([s, e]) => off > s && off < e) ?? [0, 0, '?'])[2]
}

function shape(v) {
  if (Array.isArray(v)) return ['[', ...v.map(shape), ']']
  if (v && typeof v === 'object') return ['{', ...Object.keys(v).flatMap((k) => [k, shape(v[k])]), '}']
  return typeof v
}

function detectScript(s) {
  if (/[가-힣]/.test(s)) return 'ko'
  if (/[぀-ヿ]/.test(s)) return 'ja'
  if (/[一-鿿]/.test(s)) return 'zh'
  return 'latin'
}

function classify(rel, path, ctx) {
  let location
  let lang
  if (rel.startsWith('apps/blog/data/articles')) {
    const m = /^langs\.([^.[]+)\.([^.[]+)/.exec(path ?? '')
    lang = m ? m[1] : detectScript(ctx)
    location = `blog 아티클 JSON · ${m ? m[2] : (path || '?')}`
  } else if (rel.startsWith('apps/blog/data/')) { location = 'blog 데이터 JSON'; lang = detectScript(ctx) }
  else if (rel.startsWith('apps/blog/scripts/')) { location = 'blog 생성 스크립트'; lang = detectScript(ctx) }
  else if (rel.startsWith('apps/blog/public/')) { location = 'blog public(llms.txt 등)'; lang = detectScript(ctx) }
  else if (rel.startsWith('apps/blog/')) {
    location = /\.(tsx?|mjs|js)$/.test(rel) ? 'blog 컴포넌트·페이지·lib' : 'blog 문서'
    lang = detectScript(ctx)
  } else if (rel.startsWith('apps/web/src/i18n/')) {
    location = 'web i18n 로케일 JSON'
    lang = rel.split('/').pop().replace('.json', '')
  } else if (rel.startsWith('apps/web/plugins/')) { location = 'web plugins(메타·JSON-LD)'; lang = detectScript(ctx) }
  else if (rel.startsWith('apps/web/public/')) { location = 'web public(법적 고지·llms.txt)'; lang = /-ko\./.test(rel) ? 'ko' : detectScript(ctx) }
  else if (rel.startsWith('apps/web/')) { location = 'web HTML'; lang = detectScript(ctx) }
  else { location = '문서'; lang = detectScript(ctx) }
  return { location, lang }
}

const files = listFiles(Object.keys(SCOPES))
const rows = []
const agg = new Map()
let changedFiles = 0
let failed = 0

for (const rel of files) {
  const abs = resolve(ROOT, rel)
  const src = readFileSync(abs, 'utf-8')
  const { out, hits } = transformFile(rel, src)
  if (!hits.length) continue
  const pathOf = rel.endsWith('.json') ? jsonPathIndex(src) : null
  for (const h of hits) {
    // 앞선 규칙(Havit→HAVIT)은 길이를 바꾸지 않으므로 index 는 원문 위치와 같다.
    const s0 = Math.max(0, h.index - 40)
    const e0 = h.index + h.match.length + 40
    const ctxBefore = src.slice(s0, e0).replace(/\s+/g, ' ')
    const ctxAfter = (src.slice(s0, h.index) + h.replacement + src.slice(h.index + h.match.length, e0)).replace(/\s+/g, ' ')
    const path = pathOf ? pathOf(h.index) : null
    const { location, lang } = classify(rel, path, ctxBefore)
    rows.push({ rel, where: path ?? `L${lineOf(src, h.index)}`, lang, location, rule: h.rule, status: h.excluded ? `제외: ${h.excluded}` : '적용', ctxBefore, ctxAfter })
    if (!h.excluded) {
      const key = `${location}\t${lang}\t${h.rule}`
      agg.set(key, (agg.get(key) ?? 0) + 1)
    }
  }
  if (out === src) continue
  if (rel.endsWith('.json')) {
    try {
      if (JSON.stringify(shape(JSON.parse(src))) !== JSON.stringify(shape(JSON.parse(out)))) throw new Error('구조 변경')
    } catch (e) {
      console.error(`❌ ${rel}: JSON 검증 실패 (${e.message}) — 쓰지 않음`)
      failed++
      continue
    }
  }
  changedFiles++
  if (WRITE) writeFileSync(abs, out)
}

if (REPORT) {
  const esc = (s) => String(s).replace(/\t/g, ' ')
  const head = ['file', 'where', 'lang', 'location', 'rule', 'status', 'before', 'after']
  writeFileSync(REPORT, [head.join('\t'), ...rows.map((r) => [r.rel, r.where, r.lang, r.location, r.rule, r.status, r.ctxBefore, r.ctxAfter].map(esc).join('\t'))].join('\n') + '\n')
}

const applied = rows.filter((r) => r.status === '적용').length
const excluded = rows.length - applied
console.log(`${WRITE ? '적용' : '리포트(dry-run)'} — 후보 ${rows.length}건: 적용 ${applied} / 제외 ${excluded}, 변경 파일 ${changedFiles}개`)
for (const r of RULES) console.log(`  ${r.label}: ${rows.filter((x) => x.rule === r.id && x.status === '적용').length}`)
if (agg.size) {
  console.log('\n위치\t언어\t규칙\t건수')
  for (const [k, v] of [...agg].sort()) console.log(`${k}\t${v}`)
}
if (excluded) {
  console.log('\n제외 사례:')
  for (const r of rows.filter((x) => x.status !== '적용')) console.log(`  ${r.rel} ${r.where} — ${r.status}`)
}
if (failed) process.exit(1)
