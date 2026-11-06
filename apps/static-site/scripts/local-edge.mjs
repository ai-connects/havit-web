// 로컬 CloudFront 흉내: dist-edge/viewer-request.js(배포될 바로 그 파일)를 Node 에서 돌리고,
// 함수가 넘긴 URI 를 dist/ 에서 S3 처럼 꺼내 준다(업로드 메타데이터·응답 헤더 정책·404 페이지까지).
// verify.mjs 가 이 서버와 운영을 대조한다.
//
//   node scripts/local-edge.mjs              # www :8788, blog.aihavit.com :8789, aihavit.com :8790
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { BEHAVIORS, ERROR_PAGE, globToRegex, responseHeaderPolicies, uploadRules } from './rules.mjs'

const HERE = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const DIST = join(HERE, 'dist')

/** 배포 파일을 그대로 불러 handler·middleware 를 꺼낸다. `cloudfront` 모듈만 KVS 흉내로 바꾼다. */
export function loadEdge() {
  const code = readFileSync(join(HERE, 'dist-edge/viewer-request.js'), 'utf8')
  const kvs = Object.fromEntries(JSON.parse(readFileSync(join(HERE, 'dist-edge/kvs.json'), 'utf8')).map((e) => [e.Key, e.Value]))
  const body = code.replace(/^import cf from\s*"cloudfront";/, '')
  if (body === code) throw new Error('viewer-request.js 첫 줄이 예상과 다르다')
  const ctx = {
    cf: { kvs: () => ({ get: async (k) => { if (k in kvs) return kvs[k]; throw new Error('key not found') } }) },
    console,
  }
  vm.runInNewContext(`${body}\n;globalThis.__edge = { handler, middleware, inMatcher };`, ctx)
  return ctx.__edge
}

const EXT_TYPES = {
  '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.pdf': 'application/pdf',
}
const RULES = uploadRules().map((r) => ({ ...r, re: globToRegex(r.glob) }))
const POLICIES = responseHeaderPolicies()

/** S3 객체 메타데이터 — deploy.mjs 가 올릴 때 다는 것과 같은 규칙. */
export function objectHeaders(key) {
  const r = RULES.find((x) => x.re.test(key))
  return { 'content-type': r.contentType ?? EXT_TYPES[extname(key)] ?? 'application/octet-stream', 'cache-control': r.cacheControl }
}

function behaviorFor(path) {
  return BEHAVIORS.find((b) => b.path === '*' || globToRegex(b.path.slice(1)).test(path.slice(1)))
}

function toEvent(req, host) {
  const [uri, raw = ''] = req.url.split('?')
  const querystring = {}
  for (const part of raw.split('&').filter(Boolean)) {
    const i = part.indexOf('=')
    const k = i < 0 ? part : part.slice(0, i)
    const v = i < 0 ? '' : part.slice(i + 1)
    if (querystring[k]) (querystring[k].multiValue ??= [{ value: querystring[k].value }]).push({ value: v })
    else querystring[k] = { value: v }
  }
  const headers = { host: { value: host } }
  for (const [k, v] of Object.entries(req.headers)) if (k !== 'host' && k !== 'cookie') headers[k] = { value: String(v) }
  const cookies = {}
  for (const c of (req.headers.cookie ?? '').split(/;\s*/).filter(Boolean)) {
    const i = c.indexOf('=')
    const name = c.slice(0, i)
    if (!cookies[name]) cookies[name] = { value: c.slice(i + 1) }
  }
  return { version: '1.0', context: { eventType: 'viewer-request' }, viewer: { ip: '127.0.0.1' }, request: { method: req.method, uri, querystring, headers, cookies } }
}

export function serve(port, host, edge = loadEdge()) {
  return createServer(async (req, res) => {
    try {
      const path = req.url.split('?')[0]
      const b = behaviorFor(path)
      const policy = POLICIES[b.policy]
      let key = path
      if (b.fn) {
        const out = await edge.handler(toEvent(req, host))
        if (out.statusCode) {
          const h = { ...policy }
          for (const [k, v] of Object.entries(out.headers ?? {})) h[k] = v.value
          const cookies = Object.entries(out.cookies ?? {}).map(([n, c]) => `${n}=${c.value}${c.attributes ? `; ${c.attributes}` : ''}`)
          if (cookies.length) h['set-cookie'] = cookies
          res.writeHead(out.statusCode, h)
          return res.end()
        }
        key = out.uri
      }
      let file = join(DIST, decodeURIComponent(key.slice(1)))
      let status = 200
      if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) {
        file = join(DIST, ERROR_PAGE.slice(1)) // CloudFront 오류 응답: 403/404 → /blog/404.html, 404
        status = 404
      }
      const meta = status === 404 ? objectHeaders(ERROR_PAGE.slice(1)) : objectHeaders(key.slice(1))
      res.writeHead(status, { ...policy, ...meta })
      res.end(req.method === 'HEAD' ? undefined : readFileSync(file))
    } catch (e) {
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.end(String(e.stack))
    }
  }).listen(port)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const edge = loadEdge()
  serve(8788, 'www.aihavit.com', edge)
  serve(8789, 'blog.aihavit.com', edge)
  serve(8790, 'aihavit.com', edge)
  console.log('local edge: www :8788, blog.aihavit.com :8789, aihavit.com :8790')
}
