// 모든 SNS 게시물 맨 끝의 브랜드 키 카피(대표 결정 2026-10-24). 홈 히어로 문구(apps/web/src/i18n *-headline, works-with-or-without-glp)와 같은 표현.
// 생성기가 빠뜨리지 않게 코드로 붙인다: Instagram 은 캡션 면책 문구 바로 위, Threads 는 본문 마지막 줄.
export const TAGLINE = {
  ko: '쥬비스 다이어트 출신이 만든 AI 코치, 하비트',
  en: 'HAVIT — your AI weight loss coach, built by Juvis Diet alumni',
  ja: 'ジュビスダイエット出身者が作ったAIダイエットコーチ、HAVIT',
  'zh-tw': 'Juvis Diet 團隊出身者打造的 AI 減重教練 HAVIT',
  zh: 'Juvis Diet 团队出身者打造的 AI 减重教练 HAVIT',
  es: 'HAVIT, tu coach de pérdida de peso con IA, creado por exprofesionales de Juvis Diet',
  'pt-br': 'HAVIT, seu coach de emagrecimento com IA, criado por ex-profissionais da Juvis Diet',
  id: 'HAVIT, pelatih penurun berat badan AI buatan alumni Juvis Diet',
  de: 'HAVIT – dein KI-Abnehmcoach, entwickelt von ehemaligen Juvis-Diet-Fachleuten',
  fr: "HAVIT, ton coach minceur IA conçu par d'anciens de Juvis Diet",
};

/** 초안의 마지막 게시물 끝에 키 카피를 한 번만 붙인다(면책 문구가 끝에 있으면 그 위에). */
export function withTagline(draft, disclaimer) {
  const line = TAGLINE[draft.lang];
  if (!line || !Array.isArray(draft.posts) || !draft.posts.length) return draft;
  const posts = [...draft.posts];
  const i = posts.length - 1;
  let body = posts[i].split(line).join('').replace(/\n{3,}/g, '\n\n').trimEnd();
  const at = disclaimer ? body.lastIndexOf(disclaimer) : -1;
  body = at >= 0
    ? `${body.slice(0, at).trimEnd()}\n\n${line}\n\n${body.slice(at)}`
    : `${body}\n\n${line}`;
  posts[i] = body;
  return { ...draft, posts };
}
