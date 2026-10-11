/**
 * 언어 메뉴가 쿠키를 갱신하는 경로로만 보내는지 검사한다.
 *
 * middleware.js 의 matcher 는 `['/', '/blog', '/blog/']` 뿐이다. 그래서 `hv_lang`
 * 쿠키는 **`/` 를 거칠 때만** 갱신된다. 메뉴가 `/ko/` 처럼 로케일 경로로 직행하면
 * 쿠키가 그대로 남고, 사용자가 방금 고른 언어와 저장된 선택이 어긋난다.
 *
 * 실제로 그 상태로 배포돼 있었다: 영어만 `?lang=en` 이라 한 번 누르면 365일 박히는데
 * 다시 한국어를 눌러도 쿠키가 `en` 이라, 한국어 기기가 맨 URL 을 열면 영어가 나왔고
 * 메뉴로는 풀 수가 없었다.
 *
 * 빌드 산출물이 아니라 `langHref` 자체를 검사하므로 vite 빌드 전에 돌 수 있다
 * (check:tokens 와 같은 자리).
 */
import { langHref } from '../plugins/i18n-html.js'
import { DEFAULT_LOCALE, LOCALES } from '../plugins/locales.js'

const problems = []

for (const current of LOCALES) {
  for (const target of LOCALES) {
    const href = langHref(target, current)

    if (target === current) {
      const expected = target === DEFAULT_LOCALE ? '/' : `/${target}/`
      if (href !== expected) {
        problems.push(`현재 언어(${current}) 항목이 ${href} — ${expected} 여야 한다`)
      }
      continue
    }

    // 전환은 반드시 `/` 를 거쳐야 쿠키가 갱신된다.
    if (href !== `/?lang=${target}`) {
      problems.push(
        `${current} → ${target} 이 ${href} 로 간다. ` +
          `미들웨어 matcher 가 '/' 뿐이라 쿠키가 갱신되지 않는다 — /?lang=${target} 이어야 한다`,
      )
    }
  }
}

if (problems.length) {
  console.error('언어 메뉴 링크가 쿠키 갱신 경로를 벗어났다:\n')
  for (const p of problems.slice(0, 10)) console.error(`  - ${p}`)
  if (problems.length > 10) console.error(`  … 외 ${problems.length - 10}건`)
  process.exit(1)
}

console.log(`lang-switcher: ${LOCALES.length}×${LOCALES.length} 조합 전수 통과`)
