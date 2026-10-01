const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

// Scroll-triggered fade/slide-in reveal.
// Stagger delay resets per parent container (e.g. per card row) instead of
// using a page-wide index — a global index could assign a lower-on-the-page
// element a shorter delay than a higher one in the same intersection batch,
// making it visibly appear first when scrolling fast.
const revealEls = document.querySelectorAll('.reveal')
if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add('is-visible'))
} else {
  const siblingIndex = new Map()
  revealEls.forEach((el) => {
    const parent = el.parentElement
    const idx = siblingIndex.get(parent) || 0
    el.style.transitionDelay = `${Math.min(idx, 3) * 90}ms`
    siblingIndex.set(parent, idx + 1)
  })
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  )
  revealEls.forEach((el) => io.observe(el))
}

// FAQ accordion — only one panel open at a time, animated via CSS grid-rows
const faqItems = document.querySelectorAll('.faq__item')
faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq__trigger')
  const panel = item.querySelector('.faq__panel')
  trigger.addEventListener('click', () => {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true'
    faqItems.forEach((other) => {
      other.querySelector('.faq__trigger').setAttribute('aria-expanded', 'false')
      other.querySelector('.faq__panel').classList.remove('is-open')
    })
    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true')
      panel.classList.add('is-open')
    }
  })
})

// Blog listing — category filter and pagination are cosmetic only for
// now (every row is the same dummy post), so clicking just toggles which
// pill looks active. Once real posts/pages exist, filter .post-list__item
// by data-category and swap the rendered page instead.
const blogCategoryButtons = document.querySelectorAll('.blog-categories__item')
blogCategoryButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    blogCategoryButtons.forEach((b) => b.classList.remove('is-active'))
    btn.classList.add('is-active')
  })
})

const paginationButtons = document.querySelectorAll('.pagination__page')
paginationButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    paginationButtons.forEach((b) => b.classList.remove('is-active'))
    btn.classList.add('is-active')
  })
})

// Nav gains a shadow once the page scrolls under it
const nav = document.querySelector('.nav')
// Both the "scrolled" shadow below and the active-link underline further
// down get their first value set synchronously, right after this fresh
// page's own paint. Without this guard, that first classList change is a
// real change (no class → class) so the transition each already has for
// scroll-driven updates plays too — a shadow/underline that visibly
// animates in a beat after the page is already sitting there reads as an
// unrelated flicker. Suppressed for this one synchronous pass only;
// removed again next frame so genuine scroll-driven changes still animate.
nav.classList.add('nav--no-transition')

const onScroll = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 8)
}
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

// Nav: give a persistent underline (separate from the hover-only one
// every link already has via CSS) to whichever link matches where you
// currently are. This is a scrollspy — "current location" changes as you
// scroll, so the home link (whichever whole-page link points at this same
// page, e.g. HAVIT on "/", Affiliate on "/affiliate/") only stays active
// down to the top of the page; its underline goes away as soon as you
// scroll into the first tracked section below it.
//
// #features/#blog/#faq are tracked on whichever page actually has that
// section (right now, only the main page has #features/#blog, while both
// it and /affiliate/ have #faq) — a tracked link whose target doesn't
// exist on the current page is dropped instead of defaulting to "top of
// page", which would otherwise collide with the home stop.
const navLinksEls = document.querySelectorAll('.nav__links a')
const homeLink = Array.from(navLinksEls).find(
  (link) =>
    (link.hash === '' || link.hash === '#') &&
    link.pathname === location.pathname
)
const scrollTrackedLinks = Array.from(navLinksEls).filter((link) =>
  ['#features', '#blog', '#faq'].includes(link.hash)
)
const navStops = [homeLink, ...scrollTrackedLinks]
  .filter(Boolean)
  .map((link) => {
    const isHome = link === homeLink
    const target = isHome ? null : document.getElementById(link.hash.slice(1))
    if (!isHome && !target) return null
    return { link, top: target ? target.offsetTop : 0 }
  })
  .filter(Boolean)
  .sort((a, b) => a.top - b.top)

if (navStops.length > 0) {
  const updateActiveNavLink = () => {
    const threshold = window.scrollY + 100
    // Starts at null (nothing active) instead of defaulting to navStops[0] —
    // a page whose only tracked stop is e.g. #faq (no home link pointing at
    // itself, no #features/#blog id on the page) would otherwise have that
    // single stop "active" from the very top of the page, before you've
    // scrolled anywhere near it.
    let current = null
    navStops.forEach((stop) => {
      if (stop.top <= threshold) current = stop
    })
    navStops.forEach((stop) =>
      stop.link.classList.toggle('is-active', stop === current)
    )
  }
  updateActiveNavLink()
  window.addEventListener('scroll', updateActiveNavLink, { passive: true })
}

requestAnimationFrame(() => nav.classList.remove('nav--no-transition'))

// --- Blog section (#blog) — real article data goes here later ---
// The 3 cards currently in index.html are dummy placeholders. Once there's
// a real source for articles (CMS, API, RSS feed, etc.), fetch/import the
// data into an array shaped like ARTICLES below and call
// renderArticles(realArticles) to replace the static markup — no other
// changes to index.html or style.css are needed, since renderArticles()
// reproduces the exact same .article-card structure the CSS already
// styles.
//
// NOT called automatically yet — there is no real data source to call it
// with. Wire it up once one exists, for example:
//   const articles = await fetch('/api/articles').then((r) => r.json())
//   renderArticles(articles)

// eslint-disable-next-line no-unused-vars
const ARTICLES_PLACEHOLDER_SHAPE = [
  { url: 'https://example.com/article-1', thumbnail: '/src/assets/images/article-1.webp', title: 'Discovery articles here' },
  { url: 'https://example.com/article-2', thumbnail: '/src/assets/images/article-2.webp', title: 'Discovery articles here' },
  { url: 'https://example.com/article-3', thumbnail: '/src/assets/images/article-3.webp', title: 'Discovery articles here' },
]

// eslint-disable-next-line no-unused-vars
function renderArticles(articles) {
  const track = document.querySelector('.articles__track')
  if (!track) return

  // Deliberately no `.reveal` class here: the scroll-reveal IntersectionObserver
  // set up above only observes elements present at page load, so a dynamically
  // injected `.reveal` element would never get its `.is-visible` class added and
  // would stay invisible. Re-wire that observer to these new nodes if the
  // fade-in-on-scroll effect should also apply to real articles later.
  track.innerHTML = articles
    .map((article, i) => `
      <figure class="article-card${i === 1 ? ' article-card--center' : ''}" data-article-id="${article.id ?? i}">
        <a class="article-card__media" href="${article.url}">
          <img src="${article.thumbnail}" alt="${article.title}" />
        </a>
        <figcaption class="text-title-small">${article.title}</figcaption>
      </figure>
    `)
    .join('')
}

// Language switcher — <details> has no built-in dismiss, so it would stay open
// while you scroll or click elsewhere on the page.
const langSwitch = document.querySelector('.lang-switch')
if (langSwitch) {
  document.addEventListener('click', (e) => {
    if (!langSwitch.contains(e.target)) langSwitch.removeAttribute('open')
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') langSwitch.removeAttribute('open')
  })
}

// 임상 사례 카드 가로 스크롤 — 좌우 버튼 + 끝에 닿으면 버튼/가장자리 흐림을 끈다.
// RTL 에서는 scrollLeft 가 0 에서 음수로 가므로 절댓값으로 위치를 재고, 방향은 뒤집는다.
const casesWrap = document.querySelector('.cases-wrap')
if (casesWrap) {
  const track = casesWrap.querySelector('.cases')
  const rtl = getComputedStyle(track).direction === 'rtl'
  const step = () => {
    const card = track.querySelector('.case-card')
    return card ? (card.getBoundingClientRect().width + 16) * 2 : 500
  }
  const update = () => {
    const max = track.scrollWidth - track.clientWidth
    const x = Math.abs(track.scrollLeft)
    casesWrap.classList.toggle('at-start', x <= 4)
    casesWrap.classList.toggle('at-end', x >= max - 4)
  }
  casesWrap.querySelectorAll('.cases__nav').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir) * (rtl ? -1 : 1)
      track.scrollBy({ left: dir * step(), behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    })
  })
  track.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

// 모바일 다운로드 경로 → AppsFlyer OneLink. 스토어 직링크로 나가면 설치가 AppsFlyer 에 오가닉으로 잡혀
// 웹 유입이 사라진다. OneLink(대시보드 링크 "website", campaign=homepage)는 기기별로 App Store / Google Play 로 보내면서
// 설치를 웹에 귀속시키고, af_adset 으로 어느 버튼이었는지 남긴다. PC 는 직링크 그대로 —
// OneLink 의 데스크톱 리다이렉트는 하나뿐이라 Google Play 배지도 App Store 로 보내게 되고,
// app.aihavit.com 은 AppsFlyer redirect allowlist 에 없다. iPadOS 는 UA 가 Mac 으로 나오므로 터치 포인트로 가른다.
{
  const ONELINK = 'https://havit.onelink.me/crNQ/website'
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/i.test(ua)
  if (isIOS || isAndroid) {
    const oneLinkFor = (a) => `${ONELINK}?af_adset=${encodeURIComponent(a.dataset.placement || 'unknown')}`
    document.querySelectorAll('a[data-store]').forEach((a) => a.setAttribute('href', oneLinkFor(a)))
    document.querySelectorAll('a[data-cta="start-free"]').forEach((a) => {
      a.setAttribute('href', oneLinkFor(a))
      a.dataset.destination = isIOS ? 'app_store' : 'google_play'
    })
  }
}

// 모바일 하단 고정 CTA — 히어로가 화면 위로 빠지면 나타나고, 최종 CTA 가 화면에 들어오면 숨긴다.
// (CSS 에서 640px 이하에서만 display:block 이라 데스크톱은 계산만 돌고 보이지 않는다.)
const stickyCta = document.querySelector('.sticky-cta')
const heroEl = document.querySelector('.hero')
const finalCtaEl = document.querySelector('.final-cta')
if (stickyCta && heroEl && finalCtaEl) {
  let ticking = false
  const syncSticky = () => {
    ticking = false
    const pastHero = heroEl.getBoundingClientRect().bottom < 0
    const beforeFinal = finalCtaEl.getBoundingClientRect().top > window.innerHeight
    stickyCta.classList.toggle('is-visible', pastHero && beforeFinal)
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(syncSticky)
    }
  }, { passive: true })
  syncSticky()
}
