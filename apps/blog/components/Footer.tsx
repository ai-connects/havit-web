import Link from 'next/link';
import { type LangKey, toShortLang } from '@/lib/i18n';
import { localizedCategory } from '@/lib/category-labels';
import { ALL_CATEGORIES } from '@/lib/categories';
import { FOOTER_LINK_GROUPS } from '@/lib/footer-links';
import { getArticleBySlug, resolveContent } from '@/lib/articles-v2';
import { asset } from '@/lib/site';

// BLOG_AUTHORITY v1.0.0 (PRD §5.2.3 / §16.2 F-07 옵션 A) — 인라인 i18n.
// lib/i18n.ts 미변경 (INV-010, P0-#2 회피). 6 lang 자체포함.
const FOOTER_I18N: Record<string, { aiTransparency: string }> = {
  en: { aiTransparency: 'AI-assisted research, human-reviewed editorial.' },
  ko: { aiTransparency: 'AI 보조 리서치, 사람이 검토한 콘텐츠.' },
  ja: { aiTransparency: 'AI支援リサーチ、人間による編集レビュー。' },
  zh: { aiTransparency: 'AI辅助研究，人工编辑审核。' },
  'zh-tw': { aiTransparency: 'AI輔助研究，人工編輯審核。' },
  es: { aiTransparency: 'Investigación asistida por IA, edición revisada por humanos.' },
  'pt-br': { aiTransparency: 'Pesquisa assistida por IA, edição revisada por humanos.' },
  id: { aiTransparency: 'Riset dibantu AI, editorial diperiksa manusia.' },
  de: { aiTransparency: 'KI-gestützte Recherche, menschliche Redaktion.' },
  fr: { aiTransparency: 'Recherche assistée par IA, édition révisée par des humains.' },
};

function pickFooterI18n(shortLang: string): { aiTransparency: string } {
  return FOOTER_I18N[shortLang] ?? FOOTER_I18N.en;
}

// SEO crawl-path: sitewide links to the article archive + category hubs so every
// article is ≤2 clicks from any page (fixes GSC "Discovered — currently not indexed").
const LABEL_TOPICS: Record<string, string> = {
  en: 'TOPICS', ko: '주제', ja: 'トピック', zh: '主题', 'zh-tw': '主題', es: 'TEMAS',
  'pt-br': 'TÓPICOS', id: 'TOPIK', de: 'THEMEN', fr: 'THÈMES',
};
const LABEL_ALL_ARTICLES: Record<string, string> = {
  en: 'All articles', ko: '전체 아티클', ja: '全記事', zh: '全部文章', 'zh-tw': '全部文章',
  es: 'Todos los artículos', 'pt-br': 'Todos os artigos', id: 'Semua artikel',
  de: 'Alle Artikel', fr: 'Tous les articles',
};
const NOTICE: Record<string, string> = {
  en: 'HAVIT provides general wellness information and does not provide medical advice, diagnosis, or treatment.',
  ko: 'HAVIT은 일반적인 웰니스 정보를 제공하며, 의학적 조언·진단·치료를 제공하지 않습니다.',
  ja: 'HAVITは一般的なウェルネス情報を提供するものであり、医学的助言・診断・治療を提供するものではありません。',
  zh: 'HAVIT 提供一般健康信息，不提供医疗建议、诊断或治疗。',
  'zh-tw': 'HAVIT 提供一般健康資訊，不提供醫療建議、診斷或治療。',
  es: 'HAVIT ofrece información general de bienestar y no proporciona consejo médico, diagnóstico ni tratamiento.',
  'pt-br': 'A HAVIT fornece informações gerais de bem-estar e não oferece aconselhamento médico, diagnóstico ou tratamento.',
  id: 'HAVIT menyediakan informasi kesehatan umum dan tidak memberikan nasihat medis, diagnosis, atau pengobatan.',
  de: 'HAVIT bietet allgemeine Wellness-Informationen und keine medizinische Beratung, Diagnose oder Behandlung.',
  fr: 'HAVIT fournit des informations générales de bien-être et ne fournit ni conseil médical, ni diagnostic, ni traitement.',
};


// 푸터 위 풀블리드 CTA 밴드 — 마케팅 사이트(aihavit.com)의 final-cta 를 옮긴 것.
// 블로그는 10개 언어라 문구를 여기 자체포함한다(lib/i18n.ts 무변경).
const FINAL_CTA: Record<string, { title: string; sub: string; note: string }> = {
  en: {
    title: 'Ready for Smarter Weight Loss?',
    sub: 'Everything you need to lose weight, preserve muscle, and build healthier habits—all in one AI-powered app.',
    note: 'Free to download. In-app purchases may apply.',
  },
  ko: {
    title: '더 똑똑한 체중 관리, 시작할까요?',
    sub: '체중 감량, 근육 보존, 건강한 습관 만들기까지 — AI 기반 앱 하나에 담았습니다.',
    note: '무료로 내려받을 수 있습니다. 인앱 결제가 있을 수 있습니다.',
  },
  ja: {
    title: 'もっと賢い体重管理を始めませんか',
    sub: '減量、筋肉の維持、健康習慣づくりまで — AI搭載アプリひとつで。',
    note: '無料でダウンロードできます。アプリ内課金があります。',
  },
  zh: {
    title: '开始更聪明的体重管理',
    sub: '减重、保住肌肉、养成健康习惯 — 一个 AI 应用全搞定。',
    note: '免费下载，含应用内购买。',
  },
  'zh-tw': {
    title: '開始更聰明的體重管理',
    sub: '減重、保住肌肉、養成健康習慣 — 一個 AI 應用全搞定。',
    note: '免費下載，含應用內購買。',
  },
  es: {
    title: '¿Listo para perder peso de forma más inteligente?',
    sub: 'Todo lo que necesitas para bajar de peso, preservar músculo y crear hábitos saludables, en una sola app con IA.',
    note: 'Descarga gratuita. Puede incluir compras dentro de la app.',
  },
  'pt-br': {
    title: 'Pronto para emagrecer de forma mais inteligente?',
    sub: 'Tudo o que você precisa para perder peso, preservar músculo e criar hábitos saudáveis — em um só app com IA.',
    note: 'Download gratuito. Pode conter compras no aplicativo.',
  },
  id: {
    title: 'Siap Turun Berat Badan dengan Lebih Cerdas?',
    sub: 'Semua yang Anda butuhkan untuk menurunkan berat badan, menjaga otot, dan membangun kebiasaan sehat — dalam satu aplikasi berbasis AI.',
    note: 'Gratis diunduh. Mungkin ada pembelian dalam aplikasi.',
  },
  de: {
    title: 'Bereit für smarteres Abnehmen?',
    sub: 'Alles, was du brauchst, um abzunehmen, Muskeln zu erhalten und gesunde Gewohnheiten aufzubauen — in einer KI-App.',
    note: 'Kostenloser Download. In-App-Käufe möglich.',
  },
  fr: {
    title: 'Prêt à perdre du poids plus intelligemment ?',
    sub: 'Tout ce qu\'il faut pour perdre du poids, préserver vos muscles et créer de bonnes habitudes — dans une seule app dopée à l\'IA.',
    note: 'Téléchargement gratuit. Achats intégrés possibles.',
  },
};

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://www.aihavit.com';

/** Column headings for the SEO link clusters (see lib/footer-links.ts). */
const FOOTER_GROUP_LABELS: Record<string, Record<string, string>> = {
  glp1Start: {
    en: 'STARTING GLP-1', ko: 'GLP-1 시작하기', ja: 'GLP-1 をはじめる', zh: '开始使用 GLP-1',
    'zh-tw': '開始使用 GLP-1', es: 'EMPEZAR CON GLP-1', 'pt-br': 'COMEÇAR COM GLP-1',
    id: 'MEMULAI GLP-1', de: 'GLP-1 STARTEN', fr: 'DÉBUTER LE GLP-1',
  },
  sideEffects: {
    en: 'SIDE EFFECT GUIDES', ko: '부작용 가이드', ja: '副作用ガイド', zh: '副作用指南',
    'zh-tw': '副作用指南', es: 'EFECTOS SECUNDARIOS', 'pt-br': 'EFEITOS COLATERAIS',
    id: 'PANDUAN EFEK SAMPING', de: 'NEBENWIRKUNGEN', fr: 'EFFETS SECONDAIRES',
  },
  compare: {
    en: 'COMPARE MEDICATIONS', ko: '약물 비교', ja: '薬の比較', zh: '药物比较',
    'zh-tw': '藥物比較', es: 'COMPARAR MEDICAMENTOS', 'pt-br': 'COMPARAR MEDICAMENTOS',
    id: 'BANDINGKAN OBAT', de: 'MEDIKAMENTE VERGLEICHEN', fr: 'COMPARER LES TRAITEMENTS',
  },
  interactions: {
    en: 'DRUG INTERACTIONS', ko: '병용·상호작용', ja: '併用・相互作用', zh: '联用与相互作用',
    'zh-tw': '併用與交互作用', es: 'INTERACCIONES', 'pt-br': 'INTERAÇÕES',
    id: 'INTERAKSI OBAT', de: 'WECHSELWIRKUNGEN', fr: 'INTERACTIONS',
  },
  afterGlp1: {
    en: 'AFTER GLP-1', ko: '중단 후 유지', ja: '中止後の維持', zh: '停药后维持',
    'zh-tw': '停藥後維持', es: 'DESPUÉS DEL GLP-1', 'pt-br': 'DEPOIS DO GLP-1',
    id: 'SETELAH GLP-1', de: 'NACH GLP-1', fr: 'APRÈS LE GLP-1',
  },
  tracker: {
    en: 'GLP-1 TRACKERS', ko: 'GLP-1 트래커', ja: 'GLP-1 トラッカー', zh: 'GLP-1 追踪器',
    'zh-tw': 'GLP-1 追蹤器', es: 'RASTREADORES GLP-1', 'pt-br': 'RASTREADORES GLP-1',
    id: 'PELACAK GLP-1', de: 'GLP-1 TRACKER', fr: 'SUIVI GLP-1',
  },
  alternatives: {
    en: 'COMPARE APPS', ko: '앱 비교', ja: 'アプリ比較', zh: '应用比较',
    'zh-tw': 'App 比較', es: 'COMPARAR APPS', 'pt-br': 'COMPARAR APPS',
    id: 'BANDINGKAN APLIKASI', de: 'APPS VERGLEICHEN', fr: 'COMPARER LES APPS',
  },
  conditions: {
    en: 'FOR YOUR SITUATION', ko: '상황별 가이드', ja: '状況別ガイド', zh: '按情况查看',
    'zh-tw': '依情況查看', es: 'SEGÚN TU CASO', 'pt-br': 'PARA O SEU CASO',
    id: 'SESUAI KONDISI ANDA', de: 'FÜR IHRE SITUATION', fr: 'SELON VOTRE CAS',
  },
};

/**
 * Trim an article title down to a footer-sized anchor.
 *
 * Titles follow a "Hook: long explanation" shape in every language, so cutting
 * at the first separator yields a natural short label that still carries the
 * entity (Ozempic, GLP-1, PCOS …) the anchor needs for SEO — without keeping a
 * hand-written label table in 10 languages.
 */
function shortLabel(title: string): string {
  // Budget is display width, not character count: a CJK glyph occupies about
  // twice the advance of a Latin one, so a flat 44-char cap renders Korean and
  // Japanese labels nearly twice as wide as the English ones.
  const width = (t: string) =>
    [...t].reduce((n, ch) => n + (/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60]/.test(ch) ? 2 : 1), 0);
  const MAX = 46;

  for (const sep of [': ', '：', ' — ', ' – ', ' - ', '—', '? ', '？', ', ']) {
    const i = title.indexOf(sep);
    if (i > 5) {
      const head = title.slice(0, i).trim();
      if (width(head) <= MAX) return head;
    }
  }
  if (width(title) <= MAX) return title;
  let out = '';
  for (const ch of title) {
    if (width(out + ch) > MAX - 1) break;
    out += ch;
  }
  return `${out.trimEnd()}…`;
}

export default function Footer({ lang }: { lang: LangKey }) {
  const shortLang = toShortLang(lang);
  const i18n = pickFooterI18n(shortLang);

  const cta = FINAL_CTA[shortLang] ?? FINAL_CTA.en;

  return (
    <>
      <section className="hv-final-cta">
        <div className="hv-container">
          <h2 className="hv-final-cta__title">{cta.title}</h2>
          <p className="hv-final-cta__sub">{cta.sub}</p>
          <div className="hv-final-cta__badges">
            <a href={`${MAIN_SITE}/#download`} className="hv-final-cta__badge" aria-label="App Store">
              {/* 마케팅 사이트와 같은 뱃지 에셋. next/image 를 쓰지 않는 이유는
                  5~6KB 짜리 고정 크기 PNG 라 최적화 이득이 없어서다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset('/badge-appstore.png')} alt="Download on the App Store" width={168} height={56} />
            </a>
            <a href={`${MAIN_SITE}/#download`} className="hv-final-cta__badge" aria-label="Google Play">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset('/badge-googleplay.png')} alt="Get it on Google Play" width={189} height={56} />
            </a>
          </div>
          <p className="hv-final-cta__disclaimer">{cta.note}</p>
        </div>
      </section>

    <footer className="hv-footer">
      <div className="hv-container">
        {/* No filter: the 2.1 mark is a bare wordmark on a transparent
            surround, so this dark band gets its own asset (the same paths with
            the wordmark filled white). A brightness/invert trick would fix the
            wordmark but strip the gradient bar under it of its colour. */}
        <img
          className="mb-6"
          src={asset('/havit-logo-white.svg')}
          alt="HAVIT"
          width={264}
          height={163}
          style={{ height: 38, width: 'auto' }}
        />
        <p className="text-body-small" style={{ color: 'rgba(255,255,255,0.6)' }}>
          © 2026 Havit Inc. All Rights Reserved.
        </p>
        <p className="text-body-small hv-footer__notice" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {NOTICE[shortLang] ?? NOTICE.en}
        </p>

        <div className="hv-footer__columns">
          <div className="hv-footer__col">
            <p className="eyebrow">PRODUCT</p>
            <a href={MAIN_SITE}>HAVIT</a>
            <a href="https://app.aihavit.com/" target="_blank" rel="noopener">App</a>
            <Link href={`/${shortLang}`}>Blog</Link>
            <Link href={`/${shortLang}/tools`}>Tools</Link>
          </div>
          <div className="hv-footer__col hv-footer__col--topics">
            <p className="eyebrow">{LABEL_TOPICS[shortLang] ?? LABEL_TOPICS.en}</p>
            {/* All 15 categories stay in the footer — it is the sitewide crawl
                path that keeps every article ≤2 clicks from any page. Two
                columns so the list doesn't run twice as tall as its neighbours. */}
            <div className="hv-footer__topics">
              {ALL_CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/${shortLang}/category/${c.slug}`}>
                  {localizedCategory(c.value, shortLang)}
                </Link>
              ))}
            </div>
          </div>
          <div className="hv-footer__col">
            <p className="eyebrow">COMPANY</p>
            <a href="https://www.aihavit.com" target="_blank" rel="noopener">Havit Inc.</a>
            <Link href={`/${shortLang}/about`}>About</Link>
            <Link href={`/${shortLang}/editorial-policy`}>Editorial Policy</Link>
            <Link href={`/${shortLang}/articles`}>{LABEL_ALL_ARTICLES[shortLang] ?? LABEL_ALL_ARTICLES.en}</Link>
            {/* 원시 <a> 는 basePath 접두가 자동으로 붙지 않아 경로를 직접 적는다. */}
            <a href="/blog/rss.xml">RSS</a>
            <a href="mailto:havit@aihavit.com">Contact</a>
          </div>
          <div className="hv-footer__col">
            <p className="eyebrow">LEGAL</p>
            <a href={`${MAIN_SITE}/privacy.html`}>Privacy</a>
            <a href={`${MAIN_SITE}/terms.html`}>Terms</a>
            <a href={`${MAIN_SITE}/eula.html`}>EULA</a>
            <a href={`${MAIN_SITE}/refund.html`}>Refund Policy</a>
          </div>
        </div>

        {/* SEO link clusters. Sitewide, so these articles collect internal link
            equity from every one of the ~10k article URLs. Selection rationale
            lives in lib/footer-links.ts. */}
        <div className="hv-footer__seo">
          {FOOTER_LINK_GROUPS.map((group) => {
            const links = group.slugs
              .map((slug) => {
                const article = getArticleBySlug(slug);
                if (!article) return null;
                const r = resolveContent(article, shortLang);
                if (!r) return null;
                // 번역이 없으면 이 언어의 URL 은 영어 본문을 폴백으로 띄우면서
                // noindex + canonical→en 을 단다. 거기로 링크하면 전 페이지의
                // 푸터가 색인도 안 되는 URL 로 내부 링크를 흘려보낸다.
                // 원문(en)으로 보낸다 — 본문 내 related 링크가 이미 쓰는 규칙.
                const lang = r.fallback ? 'en' : shortLang;
                return { slug, lang, label: shortLabel(r.content.title) };
              })
              .filter((x): x is { slug: string; lang: string; label: string } => x !== null);
            if (!links.length) return null;
            return (
              <div key={group.key} className="hv-footer__col">
                <p className="eyebrow">
                  {FOOTER_GROUP_LABELS[group.key]?.[shortLang] ??
                    FOOTER_GROUP_LABELS[group.key]?.en ??
                    group.key}
                </p>
                {links.map((l) => (
                  <Link key={l.slug} href={`/${l.lang}/${l.slug}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>

        {/* BLOG_AUTHORITY v1.0.0 (PRD §5.2.3 / §16.2 F-07 옵션 A / INV-005) —
            AI transparency link to editorial policy */}
        <p
          className="mt-14 pt-6 text-xs text-center"
          style={{ color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.12)' }}
        >
          <Link href={`/${shortLang}/editorial-policy`} className="hover:underline">
            {i18n.aiTransparency}
          </Link>
        </p>
      </div>
    </footer>
    </>
  );
}
