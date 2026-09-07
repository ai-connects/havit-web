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
// /affiliate/ is English-only and therefore NOT run through i18nHtml: that
// plugin reads bundle['index.html'] and emits the 33 locale twins from it, so
// adding an input here gives you exactly one page. affiliate/index.html carries
// its own canonical and <head> for that reason.
const ROOT = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [i18nHtml(), sitemap()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(ROOT, 'index.html'),
        affiliate: resolve(ROOT, 'affiliate/index.html'),
      },
    },
  },
})
