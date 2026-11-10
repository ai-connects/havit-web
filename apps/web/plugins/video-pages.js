/**
 * 언어별 소개 영상 페이지(/<locale>/video/)와 홈 안내 구획.
 *
 * 영상이 실제로 올라간 언어만 찍는다. src/video/videos.json 의 youtubeId 가
 * 비어 있으면 그 언어에는 페이지도, 홈 구획도, 사이트맵 항목도 생기지 않는다 —
 * 볼 수 없는 영상을 구조화 데이터로 선언하면 색인 오류가 되기 때문이다.
 *
 * 머리·꼬리는 그 언어의 홈에서 그대로 가져온다. 내비게이션·푸터·번들된 CSS 를
 * 두 벌로 유지하지 않기 위해서다. i18n-html 이 홈을 찍은 뒤에 돌아야 한다.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = 'https://www.aihavit.com'
const DURATION = 'PT59S'
const X_DEFAULT = 'en'

export function loadVideos() {
  const all = JSON.parse(readFileSync(resolve(HERE, '../src/video/videos.json'), 'utf-8'))
  return Object.fromEntries(Object.entries(all).filter(([, v]) => v.youtubeId && v.uploadDate))
}

export const videoPath = (locale) => (locale === 'en' ? '/video/' : `/${locale}/video/`)
export const videoUrl = (locale) => `${SITE}${videoPath(locale)}`
export const thumbUrl = (locale) => `${SITE}/video/${locale}.jpg`
export const embedUrl = (v) => `https://www.youtube-nocookie.com/embed/${v.youtubeId}`
export const VIDEO_DURATION_SECONDS = 59

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function jsonLd(locale, v) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: v.description,
    thumbnailUrl: [thumbUrl(locale)],
    uploadDate: v.uploadDate,
    duration: DURATION,
    embedUrl: embedUrl(v),
    inLanguage: v.inLanguage,
    transcript: v.transcript.join(' '),
    publisher: {
      '@type': 'Organization',
      name: 'HAVIT',
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon-512.png` },
    },
  }).replace(/</g, '\\u003c')
}

function alternates(videos) {
  const links = Object.entries(videos).map(
    ([l, v]) => `<link rel="alternate" hreflang="${v.inLanguage}" href="${videoUrl(l)}" />`,
  )
  if (videos[X_DEFAULT]) {
    links.push(`<link rel="alternate" hreflang="x-default" href="${videoUrl(X_DEFAULT)}" />`)
  }
  return links.join('\n    ')
}

export function renderVideoPage(homeHtml, locale, videos) {
  const v = videos[locale]
  const head = [
    `<link rel="canonical" href="${videoUrl(locale)}" />`,
    alternates(videos),
    `<meta property="og:type" content="video.other" />`,
    `<meta property="og:site_name" content="HAVIT" />`,
    `<meta property="og:title" content="${esc(v.title)}" />`,
    `<meta property="og:description" content="${esc(v.description)}" />`,
    `<meta property="og:url" content="${videoUrl(locale)}" />`,
    `<meta property="og:image" content="${thumbUrl(locale)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${jsonLd(locale, v)}</script>`,
  ].join('\n    ')
  const main = `<main class="video-page">
      <div class="container video-page__inner">
        <h1 class="video-page__title">${esc(v.h1)}</h1>
        <p class="video-page__lead">${esc(v.lead)}</p>
        <div class="video-frame">
          <iframe src="${embedUrl(v)}" title="${esc(v.title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <a class="btn btn--primary video-page__cta" data-cta="video-start" data-placement="video-page" href="https://app.aihavit.com/">${esc(v.cta)}</a>
        <h2 class="video-page__subtitle">${esc(v.transcriptHeading)}</h2>
        <div class="video-page__transcript">${v.transcript.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
      </div>
    </main>`
  return homeHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(v.title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/?>/, `<meta name="description" content="${esc(v.description)}" />`)
    .replace(/\s*<link\s+rel="(canonical|alternate)"[^>]*>/g, '')
    .replace(/\s*<meta\s+(property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/g, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace(/<main>[\s\S]*<\/main>/, () => main)
}

export function injectHomeSection(homeHtml, locale, videos) {
  const v = videos[locale]
  const section = `<section class="video-home">
        <div class="container video-home__inner">
          <h2 class="video-home__title">${esc(v.homeHeading)}</h2>
          <a class="video-home__poster" href="${videoPath(locale)}" data-cta="video-open" data-placement="home">
            <img src="/video/${locale}.jpg" alt="${esc(v.title)}" width="1280" height="720" loading="lazy" />
            <span class="video-home__label">${esc(v.homeCta)}</span>
          </a>
        </div>
      </section>

      `
  return homeHtml.replace('<section class="feature-grid"', () => `${section}<section class="feature-grid"`)
}

/** 사이트맵 조각. 영상이 없는 언어는 나오지 않는다. */
export function videoSitemapEntries() {
  const videos = loadVideos()
  return Object.entries(videos).map(([l, v]) =>
    [
      '  <url>',
      `    <loc>${videoUrl(l)}</loc>`,
      `    <lastmod>${v.uploadDate}</lastmod>`,
      ...Object.entries(videos).map(
        ([o, ov]) => `    <xhtml:link rel="alternate" hreflang="${ov.inLanguage}" href="${videoUrl(o)}" />`,
      ),
      '    <video:video>',
      `      <video:thumbnail_loc>${thumbUrl(l)}</video:thumbnail_loc>`,
      `      <video:title>${esc(v.title)}</video:title>`,
      `      <video:description>${esc(v.description)}</video:description>`,
      `      <video:player_loc>${embedUrl(v)}</video:player_loc>`,
      `      <video:duration>${VIDEO_DURATION_SECONDS}</video:duration>`,
      `      <video:publication_date>${v.uploadDate}</video:publication_date>`,
      '    </video:video>',
      '  </url>',
    ].join('\n'),
  )
}

export default function videoPages() {
  return {
    name: 'havit-video-pages',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const videos = loadVideos()
      for (const locale of Object.keys(videos)) {
        const file = locale === 'en' ? 'index.html' : `${locale}/index.html`
        const home = bundle[file]
        if (!home) {
          this.warn(`[video] ${locale}: no home page in bundle, skipped`)
          continue
        }
        const html = String(home.source)
        this.emitFile({
          type: 'asset',
          fileName: `${videoPath(locale).slice(1)}index.html`,
          source: renderVideoPage(html, locale, videos),
        })
        home.source = injectHomeSection(html, locale, videos)
      }
    },
  }
}
