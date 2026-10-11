/**
 * 언어 메뉴가 **미들웨어가 실제로 도는 경로**로만 보내는지 검사한다.
 *
 * middleware.js 의 matcher 밖 경로에 `?lang=` 을 붙이면 쿼리가 통째로 무시된다.
 * `hv_lang` 쿠키는 갱신되지 않고, 리다이렉트도 없고, 사용자는 방금 누른 언어
 * 대신 보던 언어를 다시 본다 — 메뉴가 죽은 것처럼 보인다.
 *
 * 두 번 당했다.
 *   1차: 영어만 `?lang=en` 이라 한 번 누르면 365일 박히는데, 다시 한국어를
 *        눌러도 쿠키가 `en` 이라 한국어 기기가 맨 URL 을 열면 영어가 나왔다.
 *        쿠키는 브라우저마다 따로라 "사파리는 되는데 크롬은 안 된다"로 나타났다.
 *   2차: 그걸 고치면서 링크를 `보던 경로 + ?lang=` 으로 바꿨는데, `/ko/` 는
 *        matcher 에 없다. 33개 언어판 홈에서 메뉴가 통째로 죽었다
 *        (실측: `/ko/?lang=en` → 200, Set-Cookie 없음).
 *
 * 1차는 이 가드가 잡았지만 2차는 못 잡았다. matcher 를 **주석에 글로** 적어두고
 * 기대값을 `보던 경로 + ?lang=` 으로 단언해서, 버그를 정답으로 검증했기 때문이다.
 * 그래서 이제 matcher 를 import 해서 **경로가 실제로 매칭되는지** 본다.
 *
 * 빌드 산출물이 아니라 `langHref` 자체를 검사하므로 vite 빌드 전에 돌 수 있다.
 */
import { I18N_PAGES, langHref, localesFor } from '../plugins/i18n-html.js'
import { DEFAULT_LOCALE } from '../plugins/locales.js'
import { config } from '../middleware.js'

/**
 * Vercel matcher 한 줄을 정규식으로. `/:name` 은 슬래시 없는 한 세그먼트다.
 * 우리가 쓰는 문법은 리터럴과 `/:name` 뿐이라 이 정도면 충분하다 — 더 복잡한
 * 패턴(`(.*)`, `:name*`, `:name?`)이 들어오면 조용히 통과시키지 않고 멈춘다.
 */
function matcherToRegExp(pattern) {
  const source = pattern
    .split('/')
    .map((seg) => {
      if (!seg) return ''
      if (/^:[A-Za-z_]\w*$/.test(seg)) return '[^/]+'
      // 리터럴 세그먼트만 허용한다. `[abc]` 같은 게 들어오면 아래 escape 가
      // 문자클래스로 살아남아 **조용히 통과**한다 — 그래서 모양부터 막는다.
      if (/[^\w.\-~%]/.test(seg)) {
        throw new Error(`matcher 패턴을 해석할 수 없다: ${pattern} — 이 가드를 함께 고칠 것`)
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return new RegExp(`^${source}$`)
}

const MATCHERS = config.matcher.map(matcherToRegExp)
const runsMiddleware = (pathname) => MATCHERS.some((re) => re.test(pathname))

const problems = []
let checked = 0

// matcher 자체가 홈과 제휴 기본 경로를 받는지 먼저 확인한다 — 여기가 깨지면
// 아래 조합 검사가 전부 의미를 잃는다.
for (const page of I18N_PAGES) {
  const base = page.path(DEFAULT_LOCALE)
  if (!runsMiddleware(base)) {
    problems.push(`${page.source}: 기준 경로 ${base} 가 matcher 밖이다 — ?lang= 이 무시된다`)
  }
}

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

      // 전환 링크는 `?lang=` 을 달고, 그 경로가 matcher 안에 있어야 한다.
      const [pathname, query] = href.split('?')
      if (query !== `lang=${target}`) {
        problems.push(`${page.source} ${current} → ${target} 이 ${href} — \`?lang=${target}\` 이 없다`)
        continue
      }
      if (!runsMiddleware(pathname)) {
        problems.push(
          `${page.source} ${current} → ${target} 이 ${href} 로 간다. ` +
            `${pathname} 는 matcher 밖이라 미들웨어가 돌지 않는다 — 쿼리가 무시되고 쿠키도 안 바뀐다`,
        )
      }
    }
  }
  if (!locales.includes(DEFAULT_LOCALE)) {
    problems.push(`${page.source}: 기본 언어(${DEFAULT_LOCALE}) 가 없다`)
  }
}

if (problems.length) {
  console.error('언어 메뉴 링크가 미들웨어를 안 거친다:\n')
  for (const p of problems.slice(0, 10)) console.error(`  - ${p}`)
  if (problems.length > 10) console.error(`  … 외 ${problems.length - 10}건`)
  process.exit(1)
}

console.log(
  `lang-switcher: ${I18N_PAGES.length}개 페이지 · ${checked}개 조합 · ` +
    `matcher ${config.matcher.length}줄 대조 전수 통과`,
)
