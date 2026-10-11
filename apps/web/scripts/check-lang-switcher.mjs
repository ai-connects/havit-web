/**
 * 언어 메뉴가 쿠키를 갱신하는 경로로만 보내는지 검사한다.
 *
 * middleware.js 의 matcher 는 `/`, `/blog`, `/blog/`, `/affiliate/`,
 * `/:locale/affiliate/` 뿐이다. 그래서 `hv_lang` 쿠키는 **그 경로의 `?lang=` 을
 * 거칠 때만** 갱신된다. 메뉴가 `/ko/` 처럼 로케일 경로로 직행하면 쿠키가 그대로
 * 남아, 사용자가 방금 고른 언어와 저장된 선택이 어긋난다.
 *
 * 실제로 그 상태로 배포돼 있었다: 영어만 `?lang=en` 이라 한 번 누르면 365일
 * 박히는데, 다시 한국어를 눌러도 쿠키가 `en` 이라 한국어 기기가 맨 URL 을 열면
 * 영어가 나왔고 메뉴로는 풀 수가 없었다. 쿠키는 브라우저마다 따로라
 * "사파리는 되는데 크롬은 안 된다" 로 나타났다.
 *
 * 빌드 산출물이 아니라 `langHref` 자체를 검사하므로 vite 빌드 전에 돌 수 있다.
 */
import { I18N_PAGES, langHref, localesFor } from '../plugins/i18n-html.js'
import { DEFAULT_LOCALE } from '../plugins/locales.js'

const problems = []
let checked = 0

for (const page of I18N_PAGES) {
  const locales = localesFor(page)
  for (const current of locales) {
    for (const target of locales) {
      checked++
      const href = langHref(target, current, page)

      if (target === current) {
        // 보고 있는 언어는 자기 경로. 쿠키를 다시 쓸 이유가 없다.
        if (href !== page.path(target)) {
          problems.push(`${page.source} ${current} 자기 항목이 ${href} — ${page.path(target)} 여야 한다`)
        }
        continue
      }

      // 전환은 반드시 보던 페이지의 `?lang=` 을 거쳐야 쿠키가 갱신된다.
      const expected = `${page.path(current)}?lang=${target}`
      if (href !== expected) {
        problems.push(
          `${page.source} ${current} → ${target} 이 ${href} 로 간다. ` +
            `미들웨어를 안 거쳐 쿠키가 갱신되지 않는다 — ${expected} 여야 한다`,
        )
      }
    }
  }
  if (!locales.includes(DEFAULT_LOCALE)) {
    problems.push(`${page.source}: 기본 언어(${DEFAULT_LOCALE}) 가 없다`)
  }
}

if (problems.length) {
  console.error('언어 메뉴 링크가 쿠키 갱신 경로를 벗어났다:\n')
  for (const p of problems.slice(0, 10)) console.error(`  - ${p}`)
  if (problems.length > 10) console.error(`  … 외 ${problems.length - 10}건`)
  process.exit(1)
}

console.log(`lang-switcher: ${I18N_PAGES.length}개 페이지 · ${checked}개 조합 전수 통과`)
