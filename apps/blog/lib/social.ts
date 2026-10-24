// 하비트 공식 Instagram·Threads 계정 — 언어마다 별도 계정(apps/social config/accounts.json 과 같은 핸들).
// 중국어 간체는 번체 계정으로 보낸다(간체 계정 없음).
const HANDLE: Record<string, string> = {
  ko: 'havit_app', ja: 'havit_app.jp', en: 'havit_app.en', zh: 'havit_app.tw', 'zh-tw': 'havit_app.tw',
  es: 'havit_app.es', 'pt-br': 'havit_app.br', id: 'havit_app.id', de: 'havit_app.de', fr: 'havit_app.fr',
};

export function socialLinks(shortLang: string) {
  const h = HANDLE[shortLang] ?? HANDLE.en;
  return {
    handle: h,
    instagram: `https://www.instagram.com/${h}/`,
    threads: `https://www.threads.com/@${h}`,
  };
}

export const FOLLOW_LABEL: Record<string, string> = {
  en: 'FOLLOW US', ko: '팔로우', ja: 'フォロー', zh: '关注我们', 'zh-tw': '追蹤我們', es: 'SÍGUENOS',
  'pt-br': 'SIGA-NOS', id: 'IKUTI KAMI', de: 'FOLGE UNS', fr: 'SUIVEZ-NOUS',
};
