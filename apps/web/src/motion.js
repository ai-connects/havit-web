// 홈 모션 1단계(2026-11, 레퍼런스: simple.life·Apple·Levels·Function).
// 모든 모션은 IntersectionObserver 로 화면에 들어올 때 한 번만 재생하고,
// prefers-reduced-motion 이면 최종 상태로 바로 둔다. 문구는 건드리지 않아 34개 언어가 그대로 따라온다.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onceVisible(els, cb, threshold = 0.4) {
  if (!els.length) return
  if (reduce || !('IntersectionObserver' in window)) { els.forEach((el) => cb(el, true)); return }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target, false) } })
  }, { threshold })
  els.forEach((el) => io.observe(el))
}

// ① 임상 숫자 카운트업 — "4×", "83%", "4배" 처럼 언어마다 앞뒤 글자가 달라 첫 숫자만 0부터 올린다.
function countUp(el, instant) {
  const text = el.textContent
  const m = text.match(/\d+(?:[.,]\d+)?/)
  if (!m || instant) return
  const target = parseFloat(m[0].replace(',', '.'))
  const dec = (m[0].split(/[.,]/)[1] || '').length
  const sep = m[0].includes(',') ? ',' : '.'
  const pre = text.slice(0, m.index), post = text.slice(m.index + m[0].length)
  const t0 = performance.now(), dur = 1100
  el.style.minWidth = `${el.getBoundingClientRect().width}px` // 숫자 폭 변화로 흔들리지 않게
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur)
    const v = target * (1 - Math.pow(1 - p, 3))
    el.textContent = pre + v.toFixed(dec).replace('.', sep) + post
    if (p < 1) requestAnimationFrame(tick)
    else el.textContent = text
  }
  requestAnimationFrame(tick)
}
onceVisible([...document.querySelectorAll('.study__value')], countUp, 0.6)

// ② 막대 차오름 — 임상 비교 막대, 사례 카드 막대, 비교표 행.
const fillTargets = [...document.querySelectorAll('.case-card, .compare2__table')]
fillTargets.forEach((el) => el.classList.add('is-armed'))
onceVisible(fillTargets, (el) => el.classList.add('is-in'), 0.3)

// ③ 히어로 코치 말풍선 — 하나씩 "…" 입력 표시 후 메시지가 나타난다.
const bubbles = [...document.querySelectorAll('.coach-bubble')]
if (bubbles.length && !reduce) {
  bubbles.forEach((b) => b.classList.add('is-waiting'))
  let delay = 500
  bubbles.forEach((b) => {
    setTimeout(() => { b.classList.remove('is-waiting'); b.classList.add('is-typing') }, delay)
    setTimeout(() => b.classList.remove('is-typing'), delay + 1100)
    delay += 1700
  })
}

// ④ 임상 사례 캐러셀 자동 넘김 — 6초마다 한 장, 끝에서 처음으로. 마우스·터치·포커스·화면 밖이면 멈춤, 정지 버튼 제공.
const wrap = document.querySelector('.cases-wrap')
if (wrap && !reduce) {
  const track = wrap.querySelector('.cases')
  const rtl = getComputedStyle(track).direction === 'rtl'
  const bar = document.createElement('div'); bar.className = 'cases__progress'; bar.innerHTML = '<div class="cases__bar"><span></span></div>'
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cases__pause'
  btn.setAttribute('aria-label', 'Pause'); btn.setAttribute('aria-pressed', 'false')
  wrap.after(bar); bar.appendChild(btn)
  const fill = bar.querySelector('.cases__bar span')
  const PERIOD = 6000
  let paused = false, hover = false, visible = false, t = 0, last = 0
  const step = () => { const c = track.querySelector('.case-card'); return c ? c.getBoundingClientRect().width + 16 : 300 }
  const advance = () => {
    const max = track.scrollWidth - track.clientWidth
    const x = Math.abs(track.scrollLeft)
    const next = x >= max - 4 ? 0 : x + step()
    track.scrollTo({ left: rtl ? -next : next, behavior: 'smooth' })
  }
  const loop = (now) => {
    const dt = last ? now - last : 0; last = now
    if (!paused && !hover && visible) {
      t += dt
      if (t >= PERIOD) { t = 0; advance() }
    }
    fill.style.transform = `scaleX(${t / PERIOD})`
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.3 }).observe(wrap)
  ;['pointerenter', 'focusin', 'touchstart'].forEach((ev) => wrap.addEventListener(ev, () => { hover = true }, { passive: true }))
  ;['pointerleave', 'focusout'].forEach((ev) => wrap.addEventListener(ev, () => { hover = false }))
  wrap.querySelectorAll('.cases__nav').forEach((b) => b.addEventListener('click', () => { t = 0 }))
  btn.addEventListener('click', () => {
    paused = !paused
    btn.setAttribute('aria-pressed', String(paused)); btn.setAttribute('aria-label', paused ? 'Play' : 'Pause')
  })
}

