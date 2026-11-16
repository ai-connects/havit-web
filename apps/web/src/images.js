// 이미지가 "안 보이다 팍" 뜨지 않게 (2026-11)
// 1) 모든 이미지는 다 받아 디코딩된 뒤 부드럽게 나타난다.
// 2) 4꼭지 앱 화면은 그 꼭지에 가까워지면(한 화면 반 전) 미리 받아 둔다 — 단계가 바뀔 때 빈 화면이 없게.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduce) {
  document.querySelectorAll('main img').forEach((img) => {
    if (img.closest('.hero__content')) return
    const show = () => img.classList.add('is-loaded')
    if (img.complete && img.naturalWidth) { show(); return }
    img.classList.add('img-fade')
    img.addEventListener('load', () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(show), { once: true })
    img.addEventListener('error', show, { once: true })
  })
}
const warm = (scene) => scene.querySelectorAll('.shot img').forEach((img) => { img.loading = 'eager'; img.decode?.().catch(() => {}) })
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { warm(e.target); io.unobserve(e.target) } }), { rootMargin: '150% 0px 150% 0px' })
document.querySelectorAll('[data-scene]').forEach((s) => io.observe(s))
