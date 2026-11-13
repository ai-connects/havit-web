// 4꼭지 씬 (2026-11, Figma 섹션 ⑧).
// 데스크톱: 씬 높이 = 100vh + 단계 수 × STEP_VH. 안쪽이 화면에 고정되고 스크롤 양으로 단계가 넘어간다.
//   스크롤을 멈추면(IDLE_MS) 남은 거리를 일정한 속도로 자동 스크롤해 다음 단계로 넘긴다 — 진행 바가 그대로 시계가 된다.
//   휠·터치·키보드 입력이 들어오면 자동 넘김은 바로 멈추고 사용자 스크롤을 따른다.
// 모바일(≤960px)·모션 줄이기: 고정 없이 탭 + 시간 자동 넘김(모바일만).
import { playShot, stopShot } from './shots.js'
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const mqMobile = window.matchMedia('(max-width: 960px)')
const STEP_MS = 4200 // 한 단계를 자동으로 넘기는 시간
const IDLE_MS = 1600 // 스크롤을 멈춘 뒤 자동 넘김을 시작하기까지
const scenes = [...document.querySelectorAll('[data-scene]')]

function countUp(el) {
  const text = el.dataset.final || el.textContent
  el.dataset.final = text
  const m = text.match(/\d[\d,]*(?:\.\d+)?/)
  if (!m || reduce) { el.textContent = text; return }
  const raw = m[0], target = parseFloat(raw.replace(/,/g, '')), dec = (raw.split('.')[1] || '').length, comma = raw.includes(',')
  const pre = text.slice(0, m.index), post = text.slice(m.index + raw.length), t0 = performance.now(), dur = 700
  const fmt = (v) => { let x = v.toFixed(dec); if (comma) x = Number(x).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return x }
  const tick = (now) => {
    const p = Math.max(0, Math.min(1, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 3)
    el.textContent = pre + fmt(target * e) + post
    if (p < 1 && el.isConnected) requestAnimationFrame(tick); else el.textContent = text
  }
  requestAnimationFrame(tick)
}

scenes.forEach((scene) => {
  const steps = [...scene.querySelectorAll('.scene__step')]
  const imgs = [...scene.querySelectorAll('.scene__img')]
  const anims = [...scene.querySelectorAll('.scene__anim')]
  const fxs = [...scene.querySelectorAll('.scene__fx')]
  const dots = [...scene.querySelectorAll('.scene__dots span')]
  const cap = scene.querySelector('.scene__cap')
  const K = steps.length
  let active = -1

  let inView = false
  const playAnim = () => imgs.forEach((el, n) => {
    if (inView && n === active) playShot(el); else stopShot(el)
  })
  new IntersectionObserver(([e]) => { const was = inView; inView = e.isIntersecting; if (inView && !was) playAnim() }, { threshold: 0, rootMargin: '-40% 0px -40% 0px' }).observe(scene)
  const setActive = (i) => {
    if (i === active) return
    const prev = active
    active = i
    scene.style.setProperty('--active', i)
    steps.forEach((el, n) => { el.classList.toggle('is-active', n === i); el.classList.toggle('is-done', n < i) })
    imgs.forEach((el, n) => { el.classList.toggle('is-active', n === i); el.classList.toggle('is-past', n < i) })
    dots.forEach((el, n) => el.classList.toggle('is-active', n === i))
    if (mqMobile.matches) { const ul = steps[i].parentElement, li = steps[i]; ul.scrollTo({ left: li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2, behavior: 'smooth' }) }
    playAnim()
    fxs.forEach((el, n) => {
      const on = n === i
      el.classList.toggle('is-active', on)
      if (on) el.querySelectorAll('.fx__v').forEach(countUp)
    })
    if (cap) cap.innerHTML = steps[i].querySelector('.scene__txt').innerHTML
    scene.dataset.dir = prev < 0 || i > prev ? 'next' : 'prev'
  }
  let barTarget = 0, barShown = 0, barRaf = 0, barStep = -1
  const paintBar = () => {
    if (barStep !== active) { barStep = active; barShown = Math.min(barShown, barTarget, 0.02) }
    barShown += (barTarget - barShown) * (reduce ? 1 : 0.14)
    if (Math.abs(barTarget - barShown) < 0.0005) barShown = barTarget
    const b = steps[active]?.querySelector('.scene__bar > i'); if (b) b.style.transform = `scaleX(${barShown.toFixed(4)})`
    barRaf = barShown !== barTarget ? requestAnimationFrame(paintBar) : 0
  }
  const setBar = (frac) => { barTarget = Math.max(0, Math.min(1, frac)); if (!barRaf) barRaf = requestAnimationFrame(paintBar) }
  setActive(0)

  // 화면 진입 시 한 번: 제목·소개·단계가 차례로 떠오르고 폰이 올라온다.
  new IntersectionObserver((es, io) => es.forEach((e) => { if (e.isIntersecting) { scene.classList.add('is-in'); io.disconnect() } }), { threshold: 0, rootMargin: mqMobile.matches ? '0px 0px -5% 0px' : '0px 0px -35% 0px' }).observe(scene)

  // ---------- 데스크톱: 스크롤 고정 ----------
  let auto = null, idleT = 0
  const geom = () => {
    const sticky = scene.querySelector('.scene__sticky')
    const off = parseFloat(getComputedStyle(sticky).top) || 0 // 모바일은 헤더 아래(64px)에 고정
    const top = scene.getBoundingClientRect().top + window.scrollY - off
    const dist = scene.offsetHeight - sticky.offsetHeight
    return { top, dist }
  }
  const pinned = () => !reduce
  const progress = () => { const { top, dist } = geom(); return Math.max(0, Math.min(1, (window.scrollY - top) / dist)) * K }
  const onScroll = () => {
    if (!pinned()) return
    const p = progress()
    const i = Math.min(K - 1, Math.floor(p))
    setActive(i)
    setBar(Math.min(1, p - i))
    scheduleAuto()
  }
  const stopAuto = () => { if (auto) { cancelAnimationFrame(auto.raf); auto = null } }
  const scheduleAuto = () => {
    if (auto) return
    clearTimeout(idleT)
    idleT = setTimeout(startAuto, IDLE_MS)
  }
  const startAuto = () => {
    if (!pinned() || document.hidden) return
    const { top, dist } = geom()
    const p = progress()
    if (p <= 0.001 || p >= K - 0.02) return // 고정 구간 밖이거나 마지막 단계 끝
    const target = Math.min(K - 0.02, Math.floor(p) + 1 + (Math.floor(p) + 1 >= K ? -0.02 : 0.001))
    const from = window.scrollY, to = top + (target / K) * dist
    const dur = Math.max(300, (target - p) * STEP_MS)
    const t0 = performance.now()
    auto = { raf: 0 }
    const tick = (now) => {
      if (!auto) return
      const e = Math.min(1, (now - t0) / dur)
      window.scrollTo(0, from + (to - from) * e)
      if (e < 1) auto.raf = requestAnimationFrame(tick)
      else { auto = null; scheduleAuto() }
    }
    auto.raf = requestAnimationFrame(tick)
  }
  const userInput = () => { stopAuto(); clearTimeout(idleT); if (pinned()) scheduleAuto() }
  ;['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((ev) => window.addEventListener(ev, userInput, { passive: true }))
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAuto() })

  // 단계 클릭: 데스크톱은 그 단계 위치로 스크롤, 모바일은 바로 전환.
  steps.forEach((el, i) => el.querySelector('button').addEventListener('click', () => {
    if (pinned()) {
      stopAuto()
      const { top, dist } = geom()
      window.scrollTo({ top: top + ((i + 0.02) / K) * dist, behavior: 'smooth' })
    } else { setActive(i); mobileRestart(true) }
  }))

  // ---------- 모바일: 시간 자동 넘김 + 스와이프 ----------
  let mT0 = 0, mRaf = 0, mVisible = false, mHold = 0
  const mobileTick = (now) => {
    if (pinned()) { mRaf = 0; return }
    if (mVisible && !document.hidden && now > mHold) {
      if (!mT0) mT0 = now
      const f = (now - mT0) / STEP_MS
      if (f >= 1) { setActive((active + 1) % K); mT0 = now; setBar(0) } else setBar(f)
    } else mT0 = 0
    mRaf = requestAnimationFrame(mobileTick)
  }
  const mobileRestart = (hold) => { mT0 = 0; setBar(0); if (hold) mHold = performance.now() + 6000 }
  const startMobile = () => { if (!pinned() && !reduce && !mRaf) mRaf = requestAnimationFrame(mobileTick) }
  new IntersectionObserver(([e]) => { mVisible = e.isIntersecting; startMobile() }, { threshold: 0, rootMargin: '-25% 0px -25% 0px' }).observe(scene)
  mqMobile.addEventListener('change', () => { startMobile(); onScroll() })
  let sx = 0
  const stage = scene.querySelector('.scene__stage')
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX }, { passive: true })
  stage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx
    if (Math.abs(dx) < 40) return
    const rtl = getComputedStyle(stage).direction === 'rtl'
    const dir = (dx < 0) !== rtl ? 1 : -1
    if (pinned()) {
      const i = Math.max(0, Math.min(K - 1, active + dir)); stopAuto()
      const { top, dist } = geom(); window.scrollTo({ top: top + ((i + 0.02) / K) * dist, behavior: 'smooth' }); return
    }
    setActive((active + dir + K) % K); mobileRestart(true)
  }, { passive: true })
  onScroll()
})
