// 자동 발행 게이트: 기계 검사 + AI 리뷰어 판정 + 차단 규칙. 사람 검토 단계는 없다.
// 예외 규칙은 AI 판단에 맡기지 않고 여기서 코드로 고정한다.
import { config } from './source.mjs';

// SNS 는 GLP-1 등 약물 주제를 다루지 않는다 → 약 이름이 나오면 그날은 내지 않는다(사람 대기 없음).
// 「인슐린 저항성」「약 복용 중이면 의료진과 상담」 같은 생리·안전 문구는 막지 않는다(2026-10-27 오탐: 오늘 32건 보류).
const DRUG = /glp-?1|semaglutide|tirzepatide|liraglutide|orforglipron|retatrutide|ozempic|wegovy|mounjaro|zepbound|saxenda|rybelsus|metformin|levothyroxine|insulin (?:shots?|injections?|pens?|doses?)|세마글루타이드|터제파타이드|오젬픽|위고비|마운자로|젭바운드|메트포르민|인슐린 주사|セマグルチド|チルゼパチド|オゼンピック|ウゴービ|マンジャロ|メトホルミン|インスリン注射|司美格鲁肽|司美格魯肽|替尔泊肽|替爾泊肽|胰岛素注射|胰島素注射/i;

// 사람 검토 단계 없음(대표 결정 2026-10-27: 「웬만한 건 통과, 사람은 리뷰 못 함」). 확신도는 참고용이고 이보다 낮을 때만 고쳐 쓴다.
export const MIN_CONFIDENCE = 0.5;
// 새 계정 첫 N일 사람 검토 — 대표 결정(2026-10-24)으로 끔: 첫 주 126건 승인은 '중요한 것만'과 맞지 않음.
export const NEW_ACCOUNT_DAYS = 0;

/** 계정(채널:언어)의 첫 발행일 — config/accounts.json. 없으면 아직 개설 전으로 보고 사람 검토. */
function accountStart(channel, lang, accounts = config('accounts').accounts) {
  const a = accounts.find((x) => x.channel === channel && x.lang === lang);
  return a?.first_post_date || null;
}

export const MAX_REVISIONS = 2;

export function mustEscalate(draft, today = new Date().toISOString().slice(0, 10), accounts) {
  const reasons = [];
  const text = [...(draft.posts || []), ...(draft.slides || []).flatMap((s) => [s.title, s.body]), draft.first_reply || ''].join('\n');
  if (DRUG.test(text)) reasons.push('약물(GLP-1 등) 언급 — SNS 제외 주제');
  const acc = (accounts || config('accounts').accounts).find((x) => x.channel === draft.channel && x.lang === draft.lang);
  if (!acc?.handle) reasons.push('계정 미등록(config/accounts.json)');
  const start = accountStart(draft.channel, draft.lang, accounts);
  if (NEW_ACCOUNT_DAYS && start && (Date.parse(today) - Date.parse(start)) / 864e5 < NEW_ACCOUNT_DAYS) reasons.push(`새 계정 첫 ${NEW_ACCOUNT_DAYS}일`);
  return reasons;
}

/** 최종 결정: 자동 승인·고쳐 쓰기·반려(그날은 안 냄) 셋 중 하나. 사람 대기열은 만들지 않는다. */
export function decide(draft, review, today, { accounts, control = config('control') } = {}) {
  if (control.publishing_paused) return { status: 'paused', reasons: ['긴급 중지 스위치 켜짐(config/control.json)'] };
  if (draft.lint?.status !== 'PASS') return { status: 'rejected', reasons: ['기계 검사 FAIL', ...(draft.lint?.errors || [])] };
  if (draft.image_qa?.status === 'FAIL') return { status: 'rejected', reasons: ['이미지 자동 검사 FAIL', ...draft.image_qa.issues] };
  const block = mustEscalate(draft, today, accounts);
  if (block.length) return { status: 'rejected', reasons: block };
  if (!review) return { status: 'rejected', reasons: ['AI 리뷰 없음'] };
  // 리뷰어 human = 어떤 형태로도 내면 안 되는 글(신체 부각 이미지 등) → 그날은 내지 않는다.
  if (review.verdict === 'human') return { status: 'rejected', reasons: ['리뷰어: 발행 불가', ...(review.issues || [])] };
  // 고쳐 쓰기는 2번까지. 그래도 미통과면 그날은 내지 않는다.
  if (review.verdict === 'revise' || (review.confidence ?? 1) < MIN_CONFIDENCE) {
    const last = (draft.revision || 0) >= MAX_REVISIONS;
    return { status: last ? 'rejected' : 'revise', reasons: [...(last ? [`${MAX_REVISIONS}번 고쳐 쓴 뒤에도 리뷰어 미통과`] : []), ...(review.issues || [])] };
  }
  return { status: 'auto_approved', reasons: [] };
}
