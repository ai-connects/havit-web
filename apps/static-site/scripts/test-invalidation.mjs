// planInvalidation 단위 시험: node scripts/test-invalidation.mjs
import assert from 'node:assert/strict'
import { planInvalidation } from './invalidation.mjs'

const M = (o) => new Map(Object.entries(o))
// 바뀐 것만, 새 키 제외, 지운 키 포함
let p = planInvalidation(
  M({ 'blog/ko/a.html': 'aaa', 'blog/ko/a.txt': 't1', 'blog/ko/new.html': 'n', 'sitemap.xml': 's2', 'assets/x.js': 'x' }),
  M({ 'blog/ko/a.html': 'OLD', 'blog/ko/a.txt': 't1', 'sitemap.xml': 's1', 'assets/x.js': 'x', 'blog/ko/gone.html': 'g' }),
)
assert.deepEqual(p.paths, ['/blog/ko/a.html', '/blog/ko/gone.html', '/sitemap.xml'])
assert.equal(p.changed, 2); assert.equal(p.deleted, 1)
// 아무것도 안 바뀜 → 무효화 없음
assert.deepEqual(planInvalidation(M({ a: '1' }), M({ a: '1' })).paths, [])
// 멀티파트 ETag 는 바뀐 것으로
assert.deepEqual(planInvalidation(M({ 'b.avif': '1' }), M({ 'b.avif': 'abc-2' })).paths, ['/b.avif'])
// 상한 초과 → /*
const big = new Map([...Array(5)].map((_, i) => [`k${i}`, 'new']))
const old = new Map([...Array(5)].map((_, i) => [`k${i}`, 'old']))
assert.deepEqual(planInvalidation(big, old, { cap: 4 }).paths, ['/*'])
assert.equal(planInvalidation(big, old, { cap: 5 }).paths.length, 5)
// 함수 변경 → /*
assert.deepEqual(planInvalidation(M({ a: '1' }), M({ a: '1' }), { functionChanged: true }).paths, ['/*'])
// 인코딩
assert.deepEqual(planInvalidation(M({ 'blog/ko/한 글.html': '2' }), M({ 'blog/ko/한 글.html': '1' })).paths, ['/blog/ko/%ED%95%9C%20%EA%B8%80.html'])
console.log('test-invalidation: ok')
