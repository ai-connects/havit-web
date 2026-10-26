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
// 모델이 키 카피를 살짝 바꿔 써도(「d'anciens membres de Juvis Diet」) 정본과 두 줄이 되지 않게: 쥬비스를 말하는 짧은 줄은 키 카피로 보고 지운다.
const JUVIS = /juvis|쥬비스|ジュビス/i;
const dropTaglineLike = (text, line, keep) => text.split('\n')
  .filter((l) => l.trim() === keep || !(JUVIS.test(l) && l.trim().length <= line.length + 40))
  .join('\n');

export function withTagline(draft, disclaimer) {
  const line = TAGLINE[draft.lang];
  if (!line || !Array.isArray(draft.posts) || !draft.posts.length) return draft;
  const posts = draft.posts.map((x) => dropTaglineLike(x, line));
  const first_reply = draft.first_reply ? dropTaglineLike(draft.first_reply, line, INTRO[draft.lang]).replace(/\n{3,}/g, '\n\n').trim() : draft.first_reply;
  const i = posts.length - 1;
  let body = posts[i].split(line).join('').replace(/\n{3,}/g, '\n\n').trimEnd();
  const at = disclaimer ? body.lastIndexOf(disclaimer) : -1;
  body = at >= 0
    ? `${body.slice(0, at).trimEnd()}\n\n${line}\n\n${body.slice(at)}`
    : `${body}\n\n${line}`;
  posts[i] = body;
  return { ...draft, posts, ...(draft.first_reply !== undefined && { first_reply }) };
}

// 첫 댓글의 서비스 소개 한 줄(대표 지시 2026-10-25) — 홈 히어로 설명(havit-connects-ai-body-composition)을 줄인 것.
export const INTRO = {
  // 홈 히어로 「AI 다이어트 코치 + 모든 걸 한 앱에」(hero-headline·__title·meals-hydration-workouts-sleep-steps). ko 는 「앱 하나면 됩니다」. GLP-1 은 SNS 에서 뺀다.
  ko: '하비트는 쥬비스 출신이 만든 AI 다이어트 코치예요. 식사·수분·운동·수면·걸음 기록부터 AI 코칭까지, 앱 하나면 됩니다.',
  en: 'HAVIT — your AI weight loss coach. Everything in one app: meals, water, workouts, sleep and steps, coached by HAVI.',
  ja: 'HAVIT — あなたのAIダイエットコーチ。食事・水分・運動・睡眠・歩数まで、すべてをひとつのアプリに。',
  'zh-tw': 'HAVIT — 你的 AI 減重教練。飲食、喝水、運動、睡眠、步數，一個 App，全都搞定。',
  zh: 'HAVIT — 你的 AI 减重教练。饮食、喝水、运动、睡眠、步数，一个 App，全都搞定。',
  es: 'HAVIT, tu coach de pérdida de peso con IA. Comidas, agua, ejercicio, sueño y pasos: todo en una sola app.',
  'pt-br': 'HAVIT, seu coach de emagrecimento com IA. Refeições, água, treinos, sono e passos: tudo em um só app.',
  id: 'HAVIT, pelatih penurun berat badan AI-mu. Makanan, minum, latihan, tidur, dan langkah — semua dalam satu aplikasi.',
  de: 'HAVIT – dein KI-Abnehmcoach. Mahlzeiten, Wasser, Training, Schlaf und Schritte: alles in einer App.',
  fr: 'HAVIT, ton coach minceur IA. Repas, eau, sport, sommeil et pas : tout dans une seule app.',
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
