import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import i18nHtml from './plugins/i18n-html.js'
import sitemap from './plugins/sitemap.js'

// Single-source multilingual site. index.html is the English original; the
// i18n plugin generates /ko/, /ja/ and /zh-tw/ from it at build time using
// src/i18n/<locale>.json, so there is exactly one HTML file to maintain.
// It also serves those paths in `vite dev`.
//
// sitemap.xml is generated from that same locale list rather than kept as a
// static file, so lastmod cannot go stale behind a deploy.
//
// The blog is a separate Next.js project mounted at /blog via a vercel.json
// rewrite (it used to live on blog.aihavit.com, which never inherited the
// domain's links). Any real page here needs its own entry below — Vite silently bundles
// only index.html otherwise.
//
// /affiliate/ 도 i18nHtml 을 탄다. 플러그인의 I18N_PAGES 가 index.html 과
// affiliate/index.html 을 같이 돌려 `/ko/affiliate/` 같은 트윈을 찍는다.
// 여기 input 에 등록돼 있어야 번들에 들어오고, 그래야 플러그인이 집어간다.
//
// /open/ 은 광고 랜딩이라 I18N_PAGES(hreflang·사이트맵·언어 메뉴) 밖에서 따로 찍는다 — 플러그인의 LANDING_PAGES.
const ROOT = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [i18nHtml(), sitemap()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(ROOT, 'index.html'),
        affiliate: resolve(ROOT, 'affiliate/index.html'),
        // W2AC 광고 링크 /open 의 웹 쪽(앱 미설치자용). 언어판은 i18nHtml 이 /_open/<locale>.html 로 찍는다.
        open: resolve(ROOT, 'open/index.html'),
      },
    },
  },
})
