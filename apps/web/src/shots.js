// 앱 화면 움직임 (2026-11): 피그마 원본 화면 이미지 위에 덮개·조각을 얹어 순서대로 드러낸다.
// 끝난 모습은 원본 이미지와 픽셀 단위로 같다. 영역·색·글자 줄은 언어별 fx.json(빌드 전 스크립트가 원본에서 측정).
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const cache = {}
const E = 'cubic-bezier(0.22, 1, 0.36, 1)'
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
function load(dir) {
  if (!cache[dir]) cache[dir] = fetch(dir + 'fx.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
  return cache[dir]
}
const pct = (v) => v + '%'
function rect(el, r, base) {
  // base: 부모 조각 영역(퍼센트) — 자식은 부모 기준 좌표로 바꾼다
  const [x, y, w, h] = base ? [((r[0] - base[0]) / base[2]) * 100, ((r[1] - base[1]) / base[3]) * 100, (r[2] / base[2]) * 100, (r[3] / base[3]) * 100] : r
  Object.assign(el.style, { left: pct(x), top: pct(y), width: pct(w), height: pct(h) })
}
function piece(src, r, base) {
  const p = document.createElement('i')
  p.className = 'shot__p'
  rect(p, r, base)
  p.style.backgroundImage = `url(${src})`
  p.style.backgroundSize = `${(100 / r[2]) * 100}% ${(100 / r[3]) * 100}%`
  p.style.backgroundPosition = `${(r[0] / (100 - r[2] || 1)) * 100}% ${(r[1] / (100 - r[3] || 1)) * 100}%`
  return p
}
function cover(c, r, base, cls = '') {
  const k = document.createElement('i')
  k.className = 'shot__c ' + cls
  rect(k, r, base)
  k.style.background = c
  return k
}
const anims = new WeakMap()
function build(host, items, src, base, list, rtlDoc) {
  items.forEach((it) => {
    const t = it.t * 1000
    const add = (el, kf, o) => list.push(el.animate(kf, { fill: 'both', easing: E, delay: t, ...o }))
    if (it.k === 'up' || it.k === 'pop') {
      const c = cover(it.c, it.r, base)
      const p = piece(src, it.r, base)
      host.append(c, p)
      add(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 1, delay: t + 420 })
      if (it.k === 'up') add(p, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 420 })
      else add(p, [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 460, easing: SPRING })
      if (it.kids) build(p, it.kids, src, it.r, list, rtlDoc)
    } else if (it.k === 'lines') {
      it.L.forEach((ln, n) => {
        const c = cover(ln[4] || it.c, ln.slice(0, 4), base)
        host.append(c)
        c.style.transformOrigin = rtlDoc ? 'left' : 'right'
        list.push(c.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 260, delay: t + n * 70, fill: 'both', easing: 'cubic-bezier(0.45, 0, 0.25, 1)' }))
      })
    } else if (it.k === 'bar') {
      const c = cover(it.c, it.r, base, 'shot__c--bar')
      host.append(c)
      c.style.transformOrigin = it.rtl ? 'left' : 'right'
      add(c, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 750 })
    } else if (it.k === 'wipe' || it.k === 'rise') {
      const c = cover(it.c, it.r, base)
      host.append(c)
      if (it.k === 'wipe') { c.style.transformOrigin = rtlDoc ? 'left' : 'right'; add(c, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 1000, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' }) }
      else { c.style.transformOrigin = 'top'; add(c, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 750 }) }
    } else if (it.k === 'pulse' || it.k === 'pulses') {
      // 원본 조각을 살짝 키웠다 돌려놓는 강조 — 가리는 덮개가 없어 사진 위에서도 이음새가 없다
      ;(it.T || [it.r]).forEach((r, n) => {
        const p = piece(src, r, base)
        p.classList.add('shot__p--pill')
        host.append(p)
        list.push(p.animate([{ transform: 'scale(1)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.35 }, { transform: 'scale(1)', opacity: 1, offset: 0.85 }, { transform: 'scale(1)', opacity: 0 }], { duration: 560, delay: t + n * 120, easing: E }))
      })
    } else if (it.k === 'scan') {
      const s = document.createElement('i')
      s.className = 'shot__scan'
      rect(s, it.r, base)
      host.append(s)
      add(s.appendChild(document.createElement('b')), [{ top: '0%', opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { top: '100%', opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'none' })
    }
  })
}
export async function playShot(el) {
  stopShot(el)
  if (reduce) return
  const img = el.querySelector('img')
  if (!img) return
  const src = img.currentSrc || img.src
  const dir = src.slice(0, src.lastIndexOf('/') + 1)
  const spec = (await load(dir))[el.dataset.code]
  if (!spec || !el.classList.contains('is-active')) return
  const layer = document.createElement('div')
  layer.className = 'shot__fx'
  el.append(layer)
  const list = []
  build(layer, spec, src, null, list, document.documentElement.dir === 'rtl')
  anims.set(el, { layer, list })
  Promise.all(list.map((a) => a.finished)).then(() => { if (anims.get(el)?.layer === layer) stopShot(el) }).catch(() => {})
}
export function stopShot(el) {
  const s = anims.get(el)
  if (!s) return
  s.list.forEach((a) => a.cancel())
  s.layer.remove()
  anims.delete(el)
}
