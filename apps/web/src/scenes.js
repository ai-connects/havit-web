// 4꼭지 씬 (2026-11, Figma 섹션 ⑧).
// 데스크톱: 씬 높이 = 100vh + 단계 수 × STEP_VH. 안쪽이 화면에 고정되고 스크롤 양으로 단계가 넘어간다.
//   휠·세로 스와이프 한 번에 한 단계씩 넘어간다(게이지·시간 자동 넘김 없음, 2026-11-16).
// 모바일(≤960px)·모션 줄이기: 고정 없이 탭 + 시간 자동 넘김(모바일만).
import { playShot, stopShot } from './shots.js'
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const mqMobile = window.matchMedia('(max-width: 960px)')
const STEP_MS = 4200 // 한 단계를 자동으로 넘기는 시간
const DWELL_MS = 450 // 스크롤로 단계가 바뀔 때 한 단계에 머무는 최소 시간
const scenes = [...document.querySelectorAll('[data-scene]')]
const ctls = [] // 꼭지별 조작 손잡이(PC 휠 공통 처리용)

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

  // ---------- 스크롤 고정: 스크롤 한 번 = 한 단계 (2026-11-16 대표 지시, 게이지·시간 자동 넘김 제거) ----------
  // 꼭지 안에서는 휠(PC)·세로 스와이프(모바일) 한 동작마다 한 단계씩 넘어가고, 그 단계 연출이 끝까지 재생된다.
  // 첫·끝 단계에서 바깥 방향이면 막지 않고 그대로 스크롤해 꼭지를 빠져나간다.
  const geom = () => {
    const sticky = scene.querySelector('.scene__sticky')
    const off = parseFloat(getComputedStyle(sticky).top) || 0 // 모바일은 헤더 아래(64px)에 고정
    const top = scene.getBoundingClientRect().top + window.scrollY - off
    const dist = scene.offsetHeight - sticky.offsetHeight
    return { top, dist, off, sh: sticky.offsetHeight }
  }
  const pinned = () => !reduce
  const progress = () => { const { top, dist } = geom(); return Math.max(0, Math.min(1, (window.scrollY - top) / dist)) * K }
  const isInside = () => { const { off, sh } = geom(), r = scene.getBoundingClientRect(); return r.top <= off + 2 && r.bottom >= off + sh - 2 }
  // 스크롤바·키보드로 움직인 경우: 위치에 맞는 단계로 한 단계씩 따라간다.
  let mStep = -1, dwellT = 0
  const goTo = (target) => {
    if (active < 0) { setActive(target); return }
    if (dwellT || target === active) return
    setActive(active + Math.sign(target - active))
    dwellT = setTimeout(() => { dwellT = 0; goTo(mStep) }, DWELL_MS)
  }
  const onScroll = () => {
    if (!pinned()) return
    mStep = Math.min(K - 1, Math.floor(progress()))
    goTo(mStep)
  }
  // 스냅 지점: 단계마다 하나 + 꼭지 끝 하나(모바일 관성 스크롤이 꼭지 입구에서 멈추게).
  const snaps = Array.from({ length: K + 1 }, () => { const m = document.createElement('i'); m.className = 'scene__snap'; m.setAttribute('aria-hidden', 'true'); scene.append(m); return m })
  const placeSnaps = () => {
    if (!pinned()) { snaps.forEach((m) => (m.style.display = 'none')); return }
    const { dist, off } = geom()
    snaps.forEach((m, i) => {
      m.style.display = ''
      m.style.top = (i < K ? ((i + 0.02) / K) * dist : scene.offsetHeight) + 'px'
      m.style.scrollMarginTop = off + 'px'
    })
  }
  placeSnaps()
  window.addEventListener('resize', placeSnaps)
  const stepPos = (t) => { const { top, dist } = geom(); return top + ((t + 0.02) / K) * dist }
  const jump = (t) => { clearTimeout(dwellT); dwellT = 0; mStep = t; window.scrollTo({ top: stepPos(t), behavior: 'instant' }); setActive(t) }
  // PC 휠은 아래 공통 처리(wheelNav)가 맡는다 — 꼭지 사이·꼭지 밖 이동까지 한 곳에서 판단해야 해서.
  ctls.push({
    scene, K, geom, isInside,
    get active() { return active },
    jump,
    set: (t) => { clearTimeout(dwellT); dwellT = 0; mStep = t; setActive(t) },
  })
  // 모바일 세로 스와이프: 손가락 한 번 = 한 단계. 꼭지 안에서는 페이지가 끌려가지 않게 막고, 손을 뗄 때 넘긴다.
  let tY = 0, tX = 0, tAxis = '', tOut = false, tLock = 0
  window.addEventListener('touchstart', (e) => { const p = e.touches[0]; tY = p.clientY; tX = p.clientX; tAxis = ''; tOut = !isInside() }, { passive: true })
  window.addEventListener('touchmove', (e) => {
    if (!pinned() || tOut || e.touches.length > 1) return
    const p = e.touches[0], dy = tY - p.clientY, dx = tX - p.clientX
    if (!tAxis) { if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; tAxis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x' }
    if (tAxis !== 'y' || !isInside()) return
    const t = active + Math.sign(dy)
    if (t < 0 || t >= K) return // 첫·끝 단계에서 바깥 방향 → 그대로 스크롤
    if (e.cancelable) e.preventDefault()
  }, { passive: false })
  window.addEventListener('touchend', (e) => {
    if (!pinned() || tOut || tAxis !== 'y') return
    const dy = tY - e.changedTouches[0].clientY, now = performance.now()
    if (Math.abs(dy) < 30 || now < tLock || !isInside()) return
    const t = active + Math.sign(dy)
    if (t < 0 || t >= K) return
    tLock = now + 450; jump(t)
  }, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', () => { if (!mqMobile.matches) onScroll() }) // iOS 주소창이 접힐 때마다 오는 resize 는 무시

  // 단계 클릭: 바로 그 단계로 전환(페이지는 스크롤하지 않음).
  steps.forEach((el, i) => el.querySelector('button').addEventListener('click', () => {
    if (pinned()) { mStep = i; setActive(i) } else { setActive(i); mobileRestart(true) }
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
      const i = Math.max(0, Math.min(K - 1, active + dir))
      mStep = i; setActive(i); return
    }
    setActive((active + dir + K) % K); mobileRestart(true)
  }, { passive: true })
  onScroll()
})

// ---------- PC 휠: 스크롤 한 번 = 한 칸 (2026-11-19 대표 지시) ----------
// - 꼭지 안: 한 번에 한 단계. 앞 단계 연출이 끝나길 기다리지 않는다(잠금 STEP_LOCK_MS 만, 그 사이 들어온 스크롤은 줄 세워 바로 이어 넘김).
// - 꼭지 끝 단계에서 한 번 더 = 다음 섹션 맨 위로 바로 이동(예전엔 고정 구간 70vh 를 빈 스크롤로 더 내려야 했다).
//   첫 단계에서 위로 = 앞 섹션으로 바로 이동. 꼭지 바로 앞·뒤에서 꼭지 쪽으로 스크롤하면 꼭지 입구 단계로 바로 들어간다.
// - "한 번"의 판정: 트랙패드·매직마우스는 손을 뗀 뒤에도 관성 이벤트가 1~2초 이어진다. 이벤트 간격(GAP_MS)이 벌어지거나,
//   관성으로 줄어들던 세기가 다시 크게 커지면(새로 쓸어 올림) 새 동작으로 본다. 예전엔 관성이 이어지는 동안 새 스크롤을 전부 무시해서
//   "여러 번 스크롤해도 안 넘어가는" 문제가 있었다.
const GAP_MS = 160, STEP_LOCK_MS = 260
let wLast = 0, wPeak = 0, wValley = 0, wFalling = false, wUsed = false
let lockUntil = 0, lockT = 0, animRaf = 0, queued = 0
const wheelIntent = (e, now) => {
  const abs = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 600 : 1)
  const gap = now - wLast
  wLast = now
  const fresh = gap > GAP_MS || (wFalling && abs >= wValley * 1.8 && abs - wValley >= 6)
  if (fresh) { wPeak = wValley = abs; wFalling = false; wUsed = false; return true }
  if (!wFalling) { if (abs >= wPeak) wPeak = wValley = abs; else { wFalling = true; wValley = abs } }
  else wValley = Math.min(wValley, abs)
  return false
}
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const animTo = (y, done) => {
  y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight))
  const y0 = window.scrollY, dy = y - y0, t0 = performance.now(), dur = Math.min(720, 420 + Math.abs(dy) * 0.2)
  const f = (now) => {
    const p = Math.min(1, (now - t0) / dur)
    window.scrollTo({ top: y0 + dy * ease(p), behavior: 'instant' })
    if (p < 1) { animRaf = requestAnimationFrame(f); return }
    animRaf = 0
    done?.()
    lock(120)
  }
  animRaf = requestAnimationFrame(f)
}
const lock = (ms) => {
  lockUntil = performance.now() + ms
  clearTimeout(lockT)
  lockT = setTimeout(() => { if (queued) { const d = queued; queued = 0; const act = decide(d); if (act) act() } }, ms)
}
// 이 방향 스크롤 한 번에 할 일. null = 브라우저 기본 스크롤에 맡김.
const decide = (dir) => {
  const vh = window.innerHeight
  for (const c of ctls) {
    if (!c.isInside()) continue
    const t = c.active + dir
    if (t >= 0 && t < c.K) return () => { c.jump(t); lock(STEP_LOCK_MS) }
    const { top, dist, sh } = c.geom()
    if (dir > 0) return () => animTo(top + c.scene.offsetHeight) // 다음 섹션 맨 위
    const prev = c.scene.previousElementSibling
    const prevTop = prev ? prev.getBoundingClientRect().top + window.scrollY : 0
    const nextC = ctls.find((o) => o.scene === prev)
    return () => animTo(Math.max(prevTop, top - sh), nextC ? () => nextC.set(nextC.K - 1) : null) // 앞 섹션(길면 그 마지막 화면)
  }
  for (const c of ctls) { // 꼭지 바로 앞·뒤
    const r = c.scene.getBoundingClientRect(), { top, dist, off } = c.geom()
    if (dir > 0 && r.top > off + 2 && r.top < vh * 0.6) return () => animTo(top, () => c.set(0))
    if (dir < 0 && r.bottom < vh - 2 && r.bottom > vh * 0.4) return () => animTo(top + dist, () => c.set(c.K - 1))
  }
  return null
}
const wheelOn = () => !reduce && !mqMobile.matches
window.addEventListener('wheel', (e) => {
  if (!wheelOn() || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return
  const now = performance.now(), fresh = wheelIntent(e, now), dir = Math.sign(e.deltaY)
  if (!dir) return
  if (animRaf) { e.preventDefault(); if (fresh) queued = dir; return } // 이동 중 스크롤 = 도착 뒤 한 칸 더
  const act = decide(dir)
  if (!act) return
  e.preventDefault()
  if (!fresh && wUsed) return // 이미 한 칸 넘긴 동작의 관성
  wUsed = true
  if (now < lockUntil) { queued = dir; return }
  queued = 0
  act()
}, { passive: false })
