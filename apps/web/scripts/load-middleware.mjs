/**
 * middleware.js 를 검사 스크립트에서 불러온다.
 *
 * middleware 는 블로그 병합표 JSON 을 import 속성 없이 불러온다 — Vercel 미들웨어 번들러가
 * `with { type: 'json' }` 을 못 읽어서다. Node 는 속성 없는 JSON import 를 거부하므로
 * vite 의 SSR 로더로 불러온다.
 */
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

export async function loadMiddleware() {
  const vite = await createServer({
    configFile: false,
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, hmr: false },
    logLevel: 'error',
  })
  try {
    return await vite.ssrLoadModule('/middleware.js')
  } finally {
    await vite.close()
  }
}
