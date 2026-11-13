// 섹션 전환 (2026-11, simple.life 참고): 큰 섹션이 화면에 들어올 때
// 좁고 둥근 패널 → 화면 폭 전체로 펼쳐지고, 안쪽 내용이 살짝 따라 올라온다.
// 스크롤 양에 묶여 있어 되감기도 자연스럽다. 끝 상태는 원래 레이아웃 그대로.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const panels = [...document.querySelectorAll('main > section:not(.hero):not(.pillars), [data-scene]')]
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
      const p = ease(Math.max(0, Math.min(1, (vh - top) / (vh * 0.6))))
      const v = p.toFixed(3)
      if (s.dataset.p !== v) { s.dataset.p = v; s.style.setProperty('--p', v); s.classList.toggle('panel--done', p > 0.999) }
    })
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(update) }
  window.addEventListener('scroll', req, { passive: true })
  window.addEventListener('resize', req)
  update()
}
