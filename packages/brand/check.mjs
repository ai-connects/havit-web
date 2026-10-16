#!/usr/bin/env node
/**
 * 브랜드 표기 빌드 가드 — docs/brand-glossary.md 위반이 있으면 exit 1.
 *
 *   node packages/brand/check.mjs --app web    # apps/web
 *   node packages/brand/check.mjs --app blog   # apps/blog
 *   node packages/brand/check.mjs              # 전부(+ 루트 문서·packages)
 *
 * 잡는 것: 단어로서의 "Havit"(→ HAVIT), "하빗"(→ 하비트),
 *          "하비트파워/하비트프로/하비트코인/하비트프리미엄" 붙여쓰기.
 * 안 잡는 것: URL·도메인·이메일·경로·slug, 영숫자에 붙은 식별자(AboutHavit),
 *          JSON key, 그리고 rules.mjs ALLOW 에 이유와 함께 적힌 곳.
 *
 * 규칙이 normalize.mjs 와 같으므로, 걸리면 그 명령 하나로 고쳐진다.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT, SCOPES, ALLOW, ALLOW_PHRASES, listFiles, transformFile, lineOf } from './rules.mjs'

const args = process.argv.slice(2)
const appIdx = args.indexOf('--app')
const app = appIdx >= 0 ? args[appIdx + 1] : null
if (app && !SCOPES[app]) {
  console.error(`알 수 없는 --app: ${app} (${Object.keys(SCOPES).join('|')})`)
  process.exit(2)
}

const files = listFiles(app ? [app] : Object.keys(SCOPES))
const problems = []
for (const rel of files) {
  const src = readFileSync(resolve(ROOT, rel), 'utf-8')
  const { hits } = transformFile(rel, src)
  for (const h of hits) {
    if (h.excluded) continue
    problems.push(`${rel}:${lineOf(src, h.index)}  "${h.match}" → "${h.replacement}"`)
  }
}

if (problems.length) {
  console.error(`❌ 브랜드 표기가 글로서리(docs/brand-glossary.md)와 어긋난다 — ${problems.length}건\n`)
  for (const p of problems.slice(0, 50)) console.error('   ' + p)
  if (problems.length > 50) console.error(`   … 외 ${problems.length - 50}건`)
  console.error('\n   고치려면 레포 루트에서 `node packages/brand/normalize.mjs --write`.')
  console.error('   의도된 예외라면 packages/brand/rules.mjs 의 ALLOW 에 파일과 이유를 적으세요.')
  process.exit(1)
}

const allowFiles = ALLOW.filter((a) => files.includes(a.file)).length
console.log(`브랜드 표기 OK — ${files.length}개 파일 확인${app ? ` (${app})` : ''}, 허용 규칙 파일 ${allowFiles}건·구문 ${ALLOW_PHRASES.length}건`)
