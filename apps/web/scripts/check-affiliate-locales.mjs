/**
 * AFFILIATE_LOCALES 와 실제 번역이 어긋나지 않는지 검사한다.
 *
 * 이 목록은 미들웨어(엣지 런타임, 파일을 못 읽음)와 빌드가 공유하는 단일 출처다.
 * 목록에 있는데 번역이 없으면 그 언어 내비게이션에 영어 본문인 페이지가 나가고,
 * hreflang 이 "그 언어판" 이라고 거짓을 선언한다.
 *
 * 반대로 번역을 넣고 목록에 안 넣으면 페이지가 아예 안 찍힌다. 둘 다 조용히
 * 깨지므로 빌드에서 막는다.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AFFILIATE_LOCALES, DEFAULT_LOCALE, LOCALES } from '../plugins/locales.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const I18N = resolve(HERE, '../src/i18n')

const en = JSON.parse(readFileSync(resolve(I18N, 'en.json'), 'utf-8'))
const affKeys = Object.keys(en).filter((k) => k.startsWith('aff-') || k.startsWith('__affiliate'))

const problems = []

if (!AFFILIATE_LOCALES.includes(DEFAULT_LOCALE)) {
  problems.push(`AFFILIATE_LOCALES 에 기본 언어(${DEFAULT_LOCALE}) 가 없다 — 영어판이 폴백이라 반드시 있어야 한다`)
}
for (const l of AFFILIATE_LOCALES) {
  if (!LOCALES.includes(l)) {
    problems.push(`${l} 은 사이트가 서빙하지 않는 로케일이다`)
    continue
  }
  if (l === DEFAULT_LOCALE) continue
  let dict
  try {
    dict = JSON.parse(readFileSync(resolve(I18N, `${l}.json`), 'utf-8'))
  } catch {
    problems.push(`${l}: src/i18n/${l}.json 이 없다`)
    continue
  }
  const missing = affKeys.filter((k) => dict[k] === undefined)
  if (missing.length) {
    problems.push(`${l}: aff 키 ${missing.length}/${affKeys.length} 개 누락 (${missing.slice(0, 3).join(', ')}…)`)
  }
}

// 번역은 다 해놓고 목록에 안 넣은 경우
for (const l of LOCALES) {
  if (AFFILIATE_LOCALES.includes(l)) continue
  let dict
  try {
    dict = JSON.parse(readFileSync(resolve(I18N, `${l}.json`), 'utf-8'))
  } catch {
    continue
  }
  if (affKeys.every((k) => dict[k] !== undefined)) {
    problems.push(`${l}: 번역이 전부 있는데 AFFILIATE_LOCALES 에 없다 — 페이지가 안 찍힌다`)
  }
}

if (problems.length) {
  console.error('AFFILIATE_LOCALES 와 번역이 어긋났다:\n')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`affiliate-locales: ${AFFILIATE_LOCALES.length}개 로케일 × ${affKeys.length}개 키 전수 통과`)
