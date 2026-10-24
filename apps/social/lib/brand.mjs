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

// 첫 댓글의 서비스 소개 한 줄(대표 지시 2026-10-25) — 홈 히어로 설명(havit-connects-ai-body-composition)을 줄인 것.
export const INTRO = {
  ko: '하비트는 식사를 사진 한 장으로 기록하면, AI 코치 HAVI가 오늘 할 일 하나를 알려주는 다이어트 앱이에요.',
  en: 'HAVIT is an AI weight loss coach: snap a meal, and HAVI tells you the one thing to do today.',
  ja: 'HAVITは、食事を写真1枚で記録すると、AIコーチHAVIが今日やることをひとつ教えてくれるダイエットアプリです。',
  'zh-tw': 'HAVIT 是 AI 減重教練 App：拍照記錄一餐，HAVI 就告訴你今天該做的一件事。',
  zh: 'HAVIT 是 AI 减重教练 App：拍照记录一餐，HAVI 就告诉你今天该做的一件事。',
  es: 'HAVIT es un coach de pérdida de peso con IA: registra tu comida con una foto y HAVI te dice qué hacer hoy.',
  'pt-br': 'A HAVIT é um coach de emagrecimento com IA: registre a refeição com uma foto e a HAVI diz o que fazer hoje.',
  id: 'HAVIT adalah pelatih diet AI: foto makananmu, lalu HAVI kasih tahu satu hal untuk hari ini.',
  de: 'HAVIT ist ein KI-Abnehmcoach: Mahlzeit per Foto erfassen, und HAVI sagt dir, was heute zählt.',
  fr: "HAVIT est un coach minceur IA : prends ton repas en photo, et HAVI te dit quoi faire aujourd'hui.",
};

/** 첫 댓글에 서비스 소개 한 줄 — 앱 링크·「프로필 링크」 안내 줄 바로 위(없으면 맨 끝). 한 번만. */
export function withIntro(draft) {
  const line = INTRO[draft.lang];
  if (!line || !draft.first_reply) return draft;
  const lines = draft.first_reply.split(line).join('').split('\n').filter((l, i, a) => !(l === '' && a[i - 1] === ''));
  const cta = lines.findIndex((l) => /https?:\/\/|link in bio|프로필 링크|プロフィール|個人簡介|个人简介|bio|Profil/i.test(l));
  if (cta >= 0) lines.splice(cta, 0, line);
  else lines.push(line);
  return { ...draft, first_reply: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() };
}
