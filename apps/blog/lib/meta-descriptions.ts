/**
 * 허브 페이지(홈·전체 목록·카테고리) 의 <meta name="description">.
 *
 * 화면에 보이는 짧은 태그라인(HERO_TAGLINE 등)을 그대로 쓰면 19~39자라
 * Bing Webmaster 가 "Meta description too short" 로 잡는다. 화면 문구는 두고
 * 검색 스니펫용 문장만 여기서 따로 만든다 — 글 수·대표 글 제목을 넣어 페이지마다
 * 고유하게.
 */

type L = 'ko' | 'en' | 'ja' | 'zh' | 'zh-tw' | 'es' | 'pt-br' | 'id' | 'de' | 'fr';

const HOME: Record<L, (n: number) => string> = {
  ko: (n) => `습관·수면·영양·운동·체중 관리에 관한 건강 가이드 ${n}건. 연구 논문과 진료 가이드라인을 바탕으로 정리하고 출처를 함께 싣습니다.`,
  en: (n) => `${n} science-backed guides on habits, sleep, nutrition, exercise and weight management, written from published research and clinical guidelines, with sources listed.`,
  ja: (n) => `習慣・睡眠・栄養・運動・体重管理に関する健康ガイド${n}本。研究論文や診療ガイドラインをもとにまとめ、出典もあわせて掲載しています。`,
  zh: (n) => `关于习惯、睡眠、营养、运动和体重管理的健康指南共${n}篇，依据已发表的研究与临床指南整理，并附上参考来源。`,
  'zh-tw': (n) => `關於習慣、睡眠、營養、運動與體重管理的健康指南共${n}篇，依據已發表的研究與臨床指引整理，並附上參考來源。`,
  es: (n) => `${n} guías basadas en ciencia sobre hábitos, sueño, nutrición, ejercicio y control de peso, elaboradas a partir de estudios publicados y guías clínicas.`,
  'pt-br': (n) => `${n} guias baseados em ciência sobre hábitos, sono, nutrição, exercício e controle de peso, elaborados a partir de estudos publicados e diretrizes clínicas.`,
  id: (n) => `${n} panduan berbasis sains tentang kebiasaan, tidur, nutrisi, olahraga, dan manajemen berat badan, disusun dari riset terbitan dan pedoman klinis.`,
  de: (n) => `${n} wissenschaftlich fundierte Guides zu Gewohnheiten, Schlaf, Ernährung, Bewegung und Gewichtsmanagement, erarbeitet aus Studien und klinischen Leitlinien.`,
  fr: (n) => `${n} guides fondés sur la science : habitudes, sommeil, nutrition, activité physique et gestion du poids, rédigés à partir d’études et de recommandations cliniques.`,
};

const ARTICLES: Record<L, (n: number) => string> = {
  ko: (n) => `HAVIT 블로그 전체 아티클 ${n}건을 카테고리별로 모은 색인. 수면·영양·운동·습관·GLP-1 등 주제별 과학 근거 기반 가이드를 한눈에 찾아보세요.`,
  en: (n) => `Index of all ${n} HAVIT Blog articles, grouped by category — browse evidence-based guides on sleep, nutrition, exercise, habits, GLP-1 and more.`,
  ja: (n) => `HAVITブログの全${n}記事をカテゴリー別にまとめた索引。睡眠・栄養・運動・習慣・GLP-1など、科学的根拠に基づくガイドをテーマ別に探せます。`,
  zh: (n) => `HAVIT博客全部${n}篇文章的分类索引。按主题浏览关于睡眠、营养、运动、习惯与GLP-1等的科学循证指南。`,
  'zh-tw': (n) => `HAVIT部落格全部${n}篇文章的分類索引。依主題瀏覽關於睡眠、營養、運動、習慣與GLP-1等的科學實證指南。`,
  es: (n) => `Índice de los ${n} artículos del Blog de HAVIT por categoría: guías basadas en evidencia sobre sueño, nutrición, ejercicio, hábitos, GLP-1 y más.`,
  'pt-br': (n) => `Índice dos ${n} artigos do Blog HAVIT por categoria: guias baseados em evidências sobre sono, nutrição, exercício, hábitos, GLP-1 e mais.`,
  id: (n) => `Indeks ${n} artikel Blog HAVIT per kategori: panduan berbasis bukti tentang tidur, nutrisi, olahraga, kebiasaan, GLP-1, dan lainnya.`,
  de: (n) => `Verzeichnis aller ${n} Artikel im HAVIT Blog nach Kategorie: evidenzbasierte Guides zu Schlaf, Ernährung, Bewegung, Gewohnheiten, GLP-1 und mehr.`,
  fr: (n) => `Index des ${n} articles du blog HAVIT par catégorie : guides fondés sur les preuves sur le sommeil, la nutrition, le sport, les habitudes, les GLP-1 et plus.`,
};

const CATEGORY: Record<L, (name: string, n: number, titles: string) => string> = {
  ko: (c, n, t) => `${c} 관련 과학 근거 기반 가이드 ${n}건. ${t}`,
  en: (c, n, t) => `${n} evidence-based ${c} guides from the HAVIT Blog. ${t}`,
  ja: (c, n, t) => `${c}に関する科学的根拠に基づくガイド${n}本。${t}`,
  zh: (c, n, t) => `${c}相关的科学循证指南共${n}篇。${t}`,
  'zh-tw': (c, n, t) => `${c}相關的科學實證指南共${n}篇。${t}`,
  es: (c, n, t) => `${n} guías basadas en evidencia sobre ${c} en el Blog de HAVIT. ${t}`,
  'pt-br': (c, n, t) => `${n} guias baseados em evidências sobre ${c} no Blog HAVIT. ${t}`,
  id: (c, n, t) => `${n} panduan berbasis bukti tentang ${c} di Blog HAVIT. ${t}`,
  de: (c, n, t) => `${n} evidenzbasierte Guides zum Thema ${c} im HAVIT Blog. ${t}`,
  fr: (c, n, t) => `${n} guides fondés sur les preuves sur le thème ${c}, sur le blog HAVIT. ${t}`,
};

const CJK = new Set<L>(['ko', 'ja', 'zh', 'zh-tw']);
const MAX = { latin: 158, cjk: 110 };

function asLang(lang: string): L {
  return (lang in HOME ? lang : 'en') as L;
}

function clip(s: string, lang: L): string {
  const max = CJK.has(lang) ? MAX.cjk : MAX.latin;
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(CJK.has(lang) ? '·' : ', ', max - 1);
  return (cut > max / 2 ? s.slice(0, cut) : s.slice(0, max - 1)).trimEnd() + '…';
}

export function homeMetaDescription(lang: string, count: number): string {
  const l = asLang(lang);
  return HOME[l](count);
}

export function articlesMetaDescription(lang: string, count: number): string {
  const l = asLang(lang);
  return ARTICLES[l](count);
}

/** 대표 글 제목 몇 개를 이어 붙여 카테고리마다 고유한 설명을 만든다. */
export function categoryMetaDescription(lang: string, name: string, titles: string[]): string {
  const l = asLang(lang);
  const sep = CJK.has(l) ? ' · ' : ', ';
  return clip(CATEGORY[l](name, titles.length, titles.slice(0, 3).join(sep)), l);
}
