// 섹션 전환 (2026-11, simple.life 참고): 큰 섹션이 화면에 들어올 때
// 좁고 둥근 패널 → 화면 폭 전체로 펼쳐지고, 안쪽 내용이 살짝 따라 올라온다.
// 스크롤 양에 묶여 있어 되감기도 자연스럽다. 끝 상태는 원래 레이아웃 그대로.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const panels = [...document.querySelectorAll('main > section:not(.hero):not(.pillars), [data-scene]')]
const mq = window.matchMedia('(max-width: 960px)')
if (!reduce && panels.length) {
  panels.forEach((s) => s.classList.add('panel'))
  let raf = 0
  const ease = (x) => 1 - Math.pow(1 - x, 3)
  const update = () => {
    raf = 0
    const vh = window.innerHeight
    panels.forEach((s) => {
      const top = s.getBoundingClientRect().top
      // 섹션 위 끝이 화면 아래(100%)에서 화면 40% 지점까지 오는 동안 0→1
      const p = ease(Math.max(0, Math.min(1, (vh - top) / (vh * (mq.matches ? 0.75 : 0.6)))))
      const v = p.toFixed(3)
      if (s.dataset.p === v) return
      s.dataset.p = v
      // iOS Safari 는 clip-path 안의 CSS 변수 변화를 다시 그리지 않을 때가 있어 값을 직접 넣는다.
      const q = 1 - p, mob = mq.matches
      const inset = (q * (mob ? 7 : 6)).toFixed(2), r = (q * (mob ? 44 : 72)).toFixed(1)
      s.style.clipPath = p > 0.999 ? '' : `inset(0 ${inset}% round ${r}px)`
      s.style.webkitClipPath = s.style.clipPath
      const c = s.querySelector(':scope > .container')
      if (c) c.style.transform = p > 0.999 ? '' : `translate3d(0, ${(q * (mob ? 72 : 80)).toFixed(1)}px, 0)`
    })
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(update) }
  window.addEventListener('scroll', req, { passive: true })
  window.addEventListener('resize', req)
  update()
}
