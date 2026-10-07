/**
 * GET /{lang}/about — About HAVIT Blog (PRD §13.2.1 / INV-004 / VG-05).
 *
 * SSG: 6 lang × 1 = 6 정적 페이지.
 * 필수 본문 요소 (VG-05): (1) publisher (주식회사 하비트) (2) mission (3) contact.
 * 인라인 i18n: 본 페이지 내부 const ABOUT_I18N 자체포함 (lib/i18n.ts 미사용 — INV-010).
 * JSON-LD: AboutPage schema (PRD §6.3 T3).
 */

import type { Metadata } from 'next';
import { isLangIndexable } from '@/lib/articles-v2';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toFullLang } from '@/lib/i18n';
import { SITE } from '@/lib/site';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
type RouteLang = (typeof ROUTE_LANGS)[number];

interface Props {
  params: { lang: string };
}

export function generateStaticParams() {
  return ROUTE_LANGS.map((lang) => ({ lang }));
}

const CONTACT_EMAIL = 'havit@aihavit.com';
const PUBLISHER_NAME = 'Havit Inc.';
const PUBLISHER_URL = 'https://www.aihavit.com';

interface AboutI18n {
  title: string;
  metaDescription: string;
  heading: string;
  sectionPublisherHeading: string;
  sectionPublisherBody: string;
  sectionMissionHeading: string;
  sectionMissionBody: string;
  sectionContactHeading: string;
  sectionContactBody: string;
  contactLabel: string;
  publisherLabel: string;
}

const ABOUT_I18N: Record<RouteLang, AboutI18n> = {
  en: {
    title: 'About HAVIT Blog',
    metaDescription:
      'HAVIT Blog is published by Havit Inc. We share AI-assisted, human-reviewed wellness research on habits, sleep, nutrition, and movement.',
    heading: 'About HAVIT Blog',
    sectionPublisherHeading: 'Publisher',
    sectionPublisherBody:
      'HAVIT Blog is published by Havit Inc., a Seoul-based company digitalizing premium metabolic health. Havit Inc. builds HAVIT — an AI-powered wellness companion that turns care once reserved for expensive equipment, specialist clinics, and dedicated coordinators into something anyone, anywhere can access through a smartphone. HAVIT Blog extends that mission into content. Havit Inc. is the sole legal entity responsible for everything published on this site.',
    sectionMissionHeading: 'Our Mission',
    sectionMissionBody:
      'A healthy, vibrant life — for every single person in the world. We believe the clarity of information that used to require specialist clinics or paid consultations should be available to anyone with a smartphone. HAVIT Blog translates peer-reviewed research and clinical guidelines into actionable, multilingual content on habits, sleep, nutrition, hydration, and movement. Every article passes through AI-assisted research and human editorial review before publishing.',
    sectionContactHeading: 'Contact',
    sectionContactBody:
      'For corrections, partnership inquiries, or feedback on any article, please email our editorial team. We respond to verified concerns within 7 business days and update articles publicly when warranted.',
    contactLabel: 'Email',
    publisherLabel: 'Published by',
  },
  ko: {
    title: 'HAVIT 블로그 소개',
    metaDescription:
      'HAVIT 블로그는 주식회사 하비트가 발행합니다. AI 보조 리서치와 사람의 편집 검토를 거친 습관·수면·영양·운동 관련 웰니스 콘텐츠를 제공합니다.',
    heading: 'HAVIT 블로그 소개',
    sectionPublisherHeading: '발행 주체',
    sectionPublisherBody:
      'HAVIT 블로그는 서울에 있는 주식회사 하비트가 발행합니다. 주식회사 하비트는 비싼 장비, 전문 클리닉, 전담 코디네이터로만 가능했던 프리미엄 대사(metabolic) 건강 관리를 스마트폰 하나로 — 전 세계 누구나 누릴 수 있게 디지털화하는 회사입니다. HAVIT 앱이 그 핵심 제품이며, HAVIT 블로그는 그 사명을 콘텐츠로 잇습니다. 본 사이트에 게시되는 모든 콘텐츠에 대한 법적 책임 주체는 주식회사 하비트입니다.',
    sectionMissionHeading: '미션',
    sectionMissionBody:
      '건강하고 활력 있는 삶을 — 모든 사람이 누릴 수 있는 세상. 과거 전문 클리닉이나 유료 상담에서만 접할 수 있던 수준의 명확하고 근거 기반인 건강 정보를, 스마트폰을 가진 누구나 누릴 수 있어야 한다고 믿습니다. HAVIT 블로그는 동료 검토 연구와 임상 가이드라인을 습관·수면·영양·수분·운동에 관한 실천 가능한 다국어 콘텐츠로 옮깁니다. 모든 글은 게시 전 AI 보조 리서치와 사람 편집 검토를 거칩니다.',
    sectionContactHeading: '문의',
    sectionContactBody:
      '글에 대한 정정 요청, 파트너십 문의, 피드백은 편집팀 이메일로 보내주세요. 확인된 사안에 대해 영업일 기준 7일 이내 회신하며, 필요 시 글을 공개 업데이트합니다.',
    contactLabel: '이메일',
    publisherLabel: '발행',
  },
  ja: {
    title: 'HAVITブログについて',
    metaDescription:
      'HAVITブログはHavit Inc.が発行しています。AI支援リサーチと人間による編集レビューを経た、習慣・睡眠・栄養・運動に関するウェルネスコンテンツをお届けします。',
    heading: 'HAVITブログについて',
    sectionPublisherHeading: '発行元',
    sectionPublisherBody:
      'HAVITブログはソウル拠点の Havit Inc. が発行しています。Havit Inc. は、高額な機器、専門クリニック、専属コーディネーターでしか受けられなかったプレミアム代謝(metabolic)ヘルスケアを、スマートフォン一つで世界中の誰もが利用できるようデジタル化する会社です。HAVITアプリがその中核製品であり、HAVITブログはそのミッションをコンテンツへと広げます。本サイトに掲載されるすべてのコンテンツの法的責任主体は Havit Inc. です。',
    sectionMissionHeading: 'ミッション',
    sectionMissionBody:
      '健やかで活力ある人生を — 世界中のすべての人へ。かつて専門クリニックや有料相談でしか得られなかったレベルの明確でエビデンスに基づく健康情報を、スマートフォンを持つ誰もが利用できるべきだと信じています。HAVITブログは査読付き研究と臨床ガイドラインを、習慣・睡眠・栄養・水分・運動に関する実行可能な多言語コンテンツへ変換します。すべての記事は公開前に AI 支援リサーチと人間による編集レビューを経ます。',
    sectionContactHeading: 'お問い合わせ',
    sectionContactBody:
      '記事の訂正依頼、パートナーシップに関するお問い合わせ、ご意見は編集チームまでメールでお寄せください。確認された案件には営業日7日以内に返信し、必要に応じて記事を公開更新します。',
    contactLabel: 'メール',
    publisherLabel: '発行',
  },
  zh: {
    title: '关于 HAVIT 博客',
    metaDescription:
      'HAVIT 博客由 Havit Inc. 发行。我们分享经过 AI 辅助研究和人工编辑审核的习惯、睡眠、营养和运动相关健康内容。',
    heading: '关于 HAVIT 博客',
    sectionPublisherHeading: '发行方',
    sectionPublisherBody:
      'HAVIT 博客由首尔的 Havit Inc. 发布。Havit Inc. 是一家将高端代谢(metabolic)健康管理数字化的公司——把过去只有昂贵设备、专科诊所和专属协调员才能提供的护理，让全世界任何人都能通过一部智能手机享用。HAVIT 应用是其核心产品，HAVIT 博客将这一使命延伸到内容层面。本网站所有内容的法律责任主体为 Havit Inc.。',
    sectionMissionHeading: '我们的使命',
    sectionMissionBody:
      '健康、充满活力的生活——为世界上每一个人。我们相信，过去只能在专科诊所或付费咨询中才能获得的清晰、基于证据的健康信息，应该让每一位拥有智能手机的人都能获得。HAVIT 博客将同行评审研究和临床指南转化为可执行的多语言内容，涵盖习惯、睡眠、营养、水合和运动。每篇文章在发布前都经过 AI 辅助研究和人工编辑审核。',
    sectionContactHeading: '联系方式',
    sectionContactBody:
      '如需更正、合作咨询或对任何文章的反馈，请发送邮件至我们的编辑团队。我们会在 7 个工作日内回复经核实的问题，并在必要时公开更新文章。',
    contactLabel: '邮箱',
    publisherLabel: '发行方',
  },
  'zh-tw': {
    title: '關於 HAVIT 部落格',
    metaDescription:
      'HAVIT 部落格由 Havit Inc. 發行。我們分享經過 AI 輔助研究和人工編輯審核的習慣、睡眠、營養和運動相關健康內容。',
    heading: '關於 HAVIT 部落格',
    sectionPublisherHeading: '發行方',
    sectionPublisherBody:
      'HAVIT 部落格由首爾的 Havit Inc. 發布。Havit Inc. 是一家將高端代謝(metabolic)健康管理數位化的公司——將過去只有昂貴設備、專科診所和專屬協調員才能提供的照護，讓全世界任何人都能透過一部智慧型手機享用。HAVIT 應用是其核心產品，HAVIT 部落格將這一使命延伸到內容層面。本網站所有內容的法律責任主體為 Havit Inc.。',
    sectionMissionHeading: '我們的使命',
    sectionMissionBody:
      '健康、充滿活力的生活——為世界上每一個人。我們相信，過去只能在專科診所或付費諮詢中才能獲得的清晰、基於實證的健康資訊，應該讓每一位擁有智慧型手機的人都能獲得。HAVIT 部落格將同儕審查研究和臨床指引轉化為可執行的多語言內容，涵蓋習慣、睡眠、營養、水合和運動。每篇文章在發布前都經過 AI 輔助研究和人工編輯審核。',
    sectionContactHeading: '聯絡方式',
    sectionContactBody:
      '如需更正、合作諮詢或對任何文章的回饋，請寄送電子郵件至我們的編輯團隊。我們會在 7 個工作日內回覆經查證的問題，並在必要時公開更新文章。',
    contactLabel: '電子郵件',
    publisherLabel: '發行方',
  },
  es: {
    title: 'Acerca de HAVIT Blog',
    metaDescription:
      'HAVIT Blog es publicado por Havit Inc. Compartimos investigación de bienestar asistida por IA y revisada por humanos sobre hábitos, sueño, nutrición y movimiento.',
    heading: 'Acerca de HAVIT Blog',
    sectionPublisherHeading: 'Editorial',
    sectionPublisherBody:
      'HAVIT Blog es publicado por Havit Inc., una empresa con sede en Seúl que digitaliza la salud metabólica premium — el tipo de cuidado que antes solo era posible con equipos costosos, clínicas especializadas y coordinadores dedicados, ahora accesible para cualquier persona a través de un smartphone. HAVIT es su producto principal, y HAVIT Blog extiende esa misión al contenido. Havit Inc. es la única entidad legal responsable de todo lo publicado en este sitio.',
    sectionMissionHeading: 'Nuestra Misión',
    sectionMissionBody:
      'Una vida saludable y vibrante — para cada persona del mundo. Creemos que la claridad de información que antes requería clínicas especializadas o consultas pagas debería estar disponible para cualquiera con un smartphone. HAVIT Blog traduce investigaciones revisadas por pares y guías clínicas en contenido multilingüe y accionable sobre hábitos, sueño, nutrición, hidratación y movimiento. Cada artículo pasa por investigación asistida por IA y revisión editorial humana antes de su publicación.',
    sectionContactHeading: 'Contacto',
    sectionContactBody:
      'Para correcciones, consultas de asociación o comentarios sobre cualquier artículo, envíe un correo a nuestro equipo editorial. Respondemos a inquietudes verificadas en 7 días hábiles y actualizamos artículos públicamente cuando corresponde.',
    contactLabel: 'Correo',
    publisherLabel: 'Publicado por',
  },
  'pt-br': {
    title: 'Sobre o HAVIT Blog',
    metaDescription:
      'HAVIT Blog é publicado pela Havit Inc. Compartilhamos pesquisas de bem-estar assistidas por IA e revisadas por humanos sobre hábitos, sono, nutrição e movimento.',
    heading: 'Sobre o HAVIT Blog',
    sectionPublisherHeading: 'Publicador',
    sectionPublisherBody:
      'O HAVIT Blog é publicado pela Havit Inc., uma empresa sediada em Seul que digitaliza a saúde metabólica premium — cuidados que antes só eram possíveis com equipamentos caros, clínicas especializadas e coordenadores dedicados, agora acessíveis a qualquer pessoa através de um smartphone. O HAVIT é o produto principal, e o HAVIT Blog estende essa missão ao conteúdo. A Havit Inc. é a única entidade legal responsável por tudo publicado neste site.',
    sectionMissionHeading: 'Nossa Missão',
    sectionMissionBody:
      'Uma vida saudável e cheia de energia — para cada pessoa no mundo. Acreditamos que a clareza das informações que antes exigiam clínicas especializadas ou consultas pagas deve estar disponível para qualquer pessoa com um smartphone. O HAVIT Blog traduz pesquisas revisadas por pares e diretrizes clínicas em conteúdo multilíngue e acionável sobre hábitos, sono, nutrição, hidratação e movimento. Cada artigo passa por pesquisa assistida por IA e revisão editorial humana antes de ser publicado.',
    sectionContactHeading: 'Contato',
    sectionContactBody:
      'Para correções, consultas de parceria ou feedback sobre qualquer artigo, envie um e-mail para nossa equipe editorial. Respondemos a preocupações verificadas em até 7 dias úteis e atualizamos os artigos publicamente quando justificado.',
    contactLabel: 'E-mail',
    publisherLabel: 'Publicado por',
  },
  id: {
    title: 'Tentang HAVIT Blog',
    metaDescription:
      'HAVIT Blog diterbitkan oleh Havit Inc. Kami berbagi riset kesehatan yang dibantu AI dan diperiksa manusia tentang kebiasaan, tidur, nutrisi, dan gerakan.',
    heading: 'Tentang HAVIT Blog',
    sectionPublisherHeading: 'Penerbit',
    sectionPublisherBody:
      'HAVIT Blog diterbitkan oleh Havit Inc., perusahaan berbasis Seoul yang mendigitalkan kesehatan metabolik premium — perawatan yang dulu hanya mungkin dengan peralatan mahal, klinik spesialis, dan koordinator khusus, kini dapat diakses siapa saja melalui smartphone. HAVIT adalah produk utamanya, dan HAVIT Blog memperluas misi tersebut ke dalam konten. Havit Inc. adalah satu-satunya entitas hukum yang bertanggung jawab atas semua yang diterbitkan di situs ini.',
    sectionMissionHeading: 'Misi Kami',
    sectionMissionBody:
      'Hidup sehat dan penuh energi — untuk setiap orang di dunia. Kami percaya bahwa kejelasan informasi yang dulu hanya bisa didapat di klinik spesialis atau konsultasi berbayar harus tersedia untuk siapa saja yang memiliki smartphone. HAVIT Blog menerjemahkan riset yang telah ditinjau sejawat dan pedoman klinis menjadi konten multibahasa yang dapat dipraktikkan tentang kebiasaan, tidur, nutrisi, hidrasi, dan gerakan. Setiap artikel melalui riset yang dibantu AI dan tinjauan editorial manusia sebelum diterbitkan.',
    sectionContactHeading: 'Kontak',
    sectionContactBody:
      'Untuk koreksi, pertanyaan kemitraan, atau umpan balik tentang artikel apa pun, kirim email ke tim editorial kami. Kami merespons keluhan yang terverifikasi dalam 7 hari kerja dan memperbarui artikel secara publik bila perlu.',
    contactLabel: 'Email',
    publisherLabel: 'Diterbitkan oleh',
  },
  de: {
    title: 'Über HAVIT Blog',
    metaDescription:
      'HAVIT Blog wird von Havit Inc. herausgegeben. Wir teilen KI-gestützte und von Menschen geprüfte Wellness-Forschung zu Gewohnheiten, Schlaf, Ernährung und Bewegung.',
    heading: 'Über HAVIT Blog',
    sectionPublisherHeading: 'Herausgeber',
    sectionPublisherBody:
      'HAVIT Blog wird von Havit Inc. herausgegeben, einem in Seoul ansässigen Unternehmen, das Premium-Stoffwechselgesundheit digitalisiert — Versorgung, die früher teure Geräte, Spezialkliniken und persönliche Koordinatoren erforderte, ist nun für jeden über ein Smartphone zugänglich. HAVIT ist das Hauptprodukt, und der HAVIT Blog erweitert diese Mission auf Inhalte. Havit Inc. ist die alleinige juristische Person, die für alles auf dieser Website verantwortlich ist.',
    sectionMissionHeading: 'Unsere Mission',
    sectionMissionBody:
      'Ein gesundes, vitales Leben — für jeden Menschen auf der Welt. Wir glauben, dass die Klarheit von Informationen, die früher Spezialkliniken oder kostenpflichtige Beratungen erforderte, jedem mit einem Smartphone zur Verfügung stehen sollte. HAVIT Blog übersetzt peer-reviewed Forschung und klinische Leitlinien in handlungsorientierte, mehrsprachige Inhalte zu Gewohnheiten, Schlaf, Ernährung, Hydration und Bewegung. Jeder Artikel durchläuft vor der Veröffentlichung KI-gestützte Recherche und menschliche redaktionelle Prüfung.',
    sectionContactHeading: 'Kontakt',
    sectionContactBody:
      'Für Korrekturen, Partnerschaftsanfragen oder Feedback zu einem Artikel senden Sie bitte eine E-Mail an unser Redaktionsteam. Wir antworten auf verifizierte Anliegen innerhalb von 7 Werktagen und aktualisieren Artikel öffentlich, wenn dies gerechtfertigt ist.',
    contactLabel: 'E-Mail',
    publisherLabel: 'Herausgegeben von',
  },
  fr: {
    title: 'À propos de HAVIT Blog',
    metaDescription:
      'HAVIT Blog est publié par Havit Inc. Nous partageons des recherches sur le bien-être assistées par IA et révisées par des humains sur les habitudes, le sommeil, la nutrition et le mouvement.',
    heading: 'À propos de HAVIT Blog',
    sectionPublisherHeading: 'Éditeur',
    sectionPublisherBody:
      "HAVIT Blog est publié par Havit Inc., une société basée à Séoul qui numérise la santé métabolique premium — des soins qui n'étaient autrefois possibles qu'avec du matériel coûteux, des cliniques spécialisées et des coordinateurs dédiés, désormais accessibles à toute personne via un smartphone. HAVIT est le produit principal, et HAVIT Blog étend cette mission au contenu. Havit Inc. est la seule entité légale responsable de tout ce qui est publié sur ce site.",
    sectionMissionHeading: 'Notre Mission',
    sectionMissionBody:
      "Une vie saine et pleine d'énergie — pour chaque personne dans le monde. Nous pensons que la clarté de l'information qui exigeait autrefois des cliniques spécialisées ou des consultations payantes devrait être disponible pour quiconque possède un smartphone. HAVIT Blog traduit la recherche évaluée par des pairs et les directives cliniques en contenu multilingue et actionnable sur les habitudes, le sommeil, la nutrition, l'hydratation et le mouvement. Chaque article passe par une recherche assistée par IA et une révision éditoriale humaine avant publication.",
    sectionContactHeading: 'Contact',
    sectionContactBody:
      "Pour les corrections, les demandes de partenariat ou les commentaires sur un article, envoyez un e-mail à notre équipe éditoriale. Nous répondons aux préoccupations vérifiées dans un délai de 7 jours ouvrables et mettons à jour les articles publiquement lorsque cela est justifié.",
    contactLabel: 'E-mail',
    publisherLabel: 'Publié par',
  },
};

export function generateMetadata({ params }: Props): Metadata {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) return { title: 'Not Found — HAVIT Blog' };
  const i18n = ABOUT_I18N[params.lang as RouteLang];
  return {
    title: `${i18n.title} — HAVIT Blog`,
    description: i18n.metaDescription,
    // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS).
    robots: isLangIndexable(params.lang)
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      canonical: `${SITE}/${params.lang}/about`,
      languages: Object.fromEntries(ROUTE_LANGS.filter(isLangIndexable).map((l) => [l, `${SITE}/${l}/about`])),
    },
    openGraph: {
      title: i18n.title,
      description: i18n.metaDescription,
      type: 'website',
      url: `${SITE}/${params.lang}/about`,
      siteName: 'HAVIT Blog',
      locale: params.lang,
      images: [{ url: `${SITE}/og-card.png`, width: 1200, height: 630, alt: 'HAVIT Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: i18n.title,
      description: i18n.metaDescription,
      images: [`${SITE}/og-card.png`],
    },
  };
}

interface AboutPageJsonLd {
  '@context': 'https://schema.org';
  '@type': 'AboutPage';
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  publisher: {
    '@type': 'Organization';
    name: string;
    url: string;
    logo: { '@type': 'ImageObject'; url: string };
  };
}

function buildAboutJsonLd(lang: RouteLang, i18n: AboutI18n): AboutPageJsonLd {
  const fullLang = toFullLang(lang === 'zh-tw' ? 'zh-tw' : lang === 'zh' ? 'zh-cn' : lang);
  // toBcp47 inline
  const bcp = fullLang === 'uz_cyrl_uz'
    ? 'uz-Cyrl-UZ'
    : `${fullLang.split('_')[0]}-${fullLang.split('_')[1].toUpperCase()}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: i18n.title,
    description: i18n.metaDescription,
    url: `${SITE}/${lang}/about`,
    inLanguage: bcp,
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      url: PUBLISHER_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/havit-logo.png`,
      },
    },
  };
}

export default function AboutPage({ params }: Props) {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) notFound();
  const lang = params.lang as RouteLang;
  const i18n = ABOUT_I18N[lang];
  const fullLang = toFullLang(lang === 'zh-tw' ? 'zh-tw' : lang === 'zh' ? 'zh-cn' : lang);
  const jsonLd = buildAboutJsonLd(lang, i18n);

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={fullLang} />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 md:px-6 py-8 md:py-12">
          <header className="mb-8">
            <h1 className="font-bold text-3xl md:text-4xl xl:text-5xl leading-tight mb-4">
              {i18n.heading}
            </h1>
            <p className="text-sm text-gray-500">
              {i18n.publisherLabel}: <strong className="text-gray-700">{PUBLISHER_NAME}</strong>
              {' · '}
              <a
                href={PUBLISHER_URL}
                target="_blank"
                rel="noopener"
                className="hover:text-primary-600 underline-offset-2 hover:underline"
              >
                {PUBLISHER_URL.replace('https://', '')}
              </a>
            </p>
          </header>

          <div className="prose prose-gray max-w-none">
            <h2>{i18n.sectionPublisherHeading}</h2>
            <p>{i18n.sectionPublisherBody}</p>

            <h2>{i18n.sectionMissionHeading}</h2>
            <p>{i18n.sectionMissionBody}</p>

            <h2>{i18n.sectionContactHeading}</h2>
            <p>{i18n.sectionContactBody}</p>
            <p>
              <strong>{i18n.contactLabel}:</strong>{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="hover:text-primary-600"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          {/* PRD §6.3 T3 — AboutPage JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </article>
      </main>
      <Footer lang={fullLang} />
    </div>
  );
}
