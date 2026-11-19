// W2AC 광고 랜딩 /open 전용 스크립트(open/index.html).
// 홈 모션(4꼭지 스크롤 장면·섹션 패널·카운트업·이미지)은 홈과 같은 모듈을 그대로 쓴다.
// main.js 를 통째로 싣지 않는 건 그 파일이 Start Free 링크에 c=homepage 를 붙이고 상단 메뉴·블로그 목록을 다루기 때문이다.
// 아래 등장 애니메이션·FAQ·임상 카드 버튼은 main.js 의 같은 부분을 옮긴 것 — 홈을 바꾸면 여기도 같이.
import './scenes.js'
import './motion.js'
import './panels.js'
import './images.js'

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 스크롤 등장(히어로는 바로)
document.querySelectorAll('.hero__content > *').forEach((el, i) => {
  el.classList.add('reveal', 'is-visible')
  el.style.setProperty('--rd', `${60 + i * 80}ms`)
})
document.querySelectorAll('.hero__visual').forEach((el) => { el.classList.add('reveal', 'is-visible'); el.style.setProperty('--rd', '180ms') })
document.querySelectorAll('.section-heading.reveal').forEach((el) => {
  el.classList.add('reveal--kids')
  ;[...el.children].forEach((c, i) => c.style.setProperty('--ci', i))
})
const revealEls = document.querySelectorAll('.reveal:not(.is-visible)')
if (reduce) {
  revealEls.forEach((el) => el.classList.add('is-visible'))
} else {
  const io = new IntersectionObserver((entries) => {
    const ins = entries.filter((e) => e.isIntersecting)
    ins.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
    ins.forEach((entry, i) => {
      entry.target.style.setProperty('--rd', `${Math.min(i, 6) * 100}ms`)
      entry.target.classList.add('is-visible')
      io.unobserve(entry.target)
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  revealEls.forEach((el) => io.observe(el))
}

// FAQ — 한 번에 하나만 펼침
const faqItems = document.querySelectorAll('.faq__item')
faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq__trigger')
  const panel = item.querySelector('.faq__panel')
  trigger.addEventListener('click', () => {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true'
    faqItems.forEach((o) => {
      o.querySelector('.faq__trigger').setAttribute('aria-expanded', 'false')
      o.querySelector('.faq__panel').classList.remove('is-open')
    })
    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true')
      panel.classList.add('is-open')
    }
  })
})

// 임상 사례 카드 좌우 버튼(RTL 은 방향 반대)
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
      track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' })
    })
  })
  track.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

// 스토어 배지·설치 버튼 링크. 자동 이동은 없다 — 누를 때만 간다(광고 심사: 최종 URL = 실제 내용 페이지).
// - 기기와 같은 스토어 배지(iOS → App Store, Android → Google Play)를 앞에 크게 두고, 그 배지만
//   app.aihavit.com(받은 광고 파라미터 → OneLink pid·c)으로 보낸다. FORWARD_KEYS 는 main.js 와 같다.
// - 그 밖(PC·기기와 다른 스토어)은 스토어 직링크. Google Play 는 referrer 에 utm·클릭 ID 를 실어 Install Referrer 로 귀속을 잇는다.
// - c: ?campaign= 이 있으면 그 값, 없으면 w2ac_open. utm_campaign 이 있으면 c 를 붙이지 않는다
//   (app.aihavit.com 이 c 를 utm_campaign 보다 먼저 써서 광고 캠페인 이름이 사라진다).
// - /open/<target> 의 <target> 은 deep_link_value 로 넘겨 설치 후 첫 실행(지연 딥링크)에 쓴다.
;(() => {
  const APP_LINK = 'https://app.aihavit.com/'
  const FORWARD_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'keyword',
    'gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'twclid', 'sccid', 'irclickid', 'oppref',
    'af_c_id', 'af_adset_id', 'af_ad_id',
  ]
  const landing = new URLSearchParams(location.search)
  const q = new URLSearchParams()
  FORWARD_KEYS.forEach((k) => { if (landing.has(k)) q.set(k, landing.get(k)) })
  if (!q.has('utm_campaign')) q.set('c', landing.get('campaign') || 'w2ac_open')
  const target = location.pathname.replace(/^\/open\/?/, '').replace(/\/+$/, '')
  if (target) q.set('deep_link_value', target)
  if (document.documentElement.lang) q.set('hl', document.documentElement.lang)
  q.set('af_adset', 'w2ac_open')

  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const device = isIOS ? 'app_store' : /Android/i.test(ua) ? 'google_play' : null

  const ref = new URLSearchParams()
  ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid'].forEach((k) => {
    if (landing.has(k)) ref.set(k, landing.get(k))
  })
  if (!ref.has('utm_campaign') && landing.has('campaign')) ref.set('utm_campaign', landing.get('campaign'))
  if (!ref.has('utm_source') && (ref.has('gclid') || ref.has('gbraid') || ref.has('wbraid'))) {
    ref.set('utm_source', 'google')
    ref.set('utm_medium', 'cpc')
  }
  document.querySelectorAll('a[data-store="google_play"]').forEach((play) => {
    if (ref.toString()) play.setAttribute('href', play.getAttribute('href') + '&referrer=' + encodeURIComponent(ref.toString()))
  })

  const appLink = APP_LINK + '?' + q.toString()
  if (device) {
    document.querySelectorAll(`a[data-store="${device}"]`).forEach((a) => {
      a.setAttribute('href', appLink)
      a.classList.add('is-device')
      a.parentNode.classList.add('has-device')
    })
  }
  // 히어로 Start Free·하단 고정 버튼 = 기기 배지와 같은 링크. 기기를 못 가리면(PC 등) app.aihavit.com 이 OS 를 보고 고른다(PC 는 QR).
  document.querySelectorAll('a[data-install]').forEach((a) => {
    a.setAttribute('href', appLink)
    a.setAttribute('data-store', device || 'app_link')
  })
})()

// 모바일 하단 고정 버튼은 첫 화면부터 끝까지 항상 띄운다(대표 지시 2026-11-11). 데스크톱은 style.css 가 숨긴다.
document.querySelector('.sticky-cta')?.classList.add('is-visible')
