// 자동 발행 게이트: 기계 검사 + AI 리뷰어 판정 + 사람 검토 예외 규칙.
// 예외 규칙은 AI 판단에 맡기지 않고 여기서 코드로 고정한다.
import { config } from './source.mjs';

// 약물 언급 → 무조건 사람. (브랜드명·성분명·일반어, 10개 언어)
const MEDICATION = /glp-?1|semaglutide|tirzepatide|liraglutide|orforglipron|retatrutide|ozempic|wegovy|mounjaro|zepbound|saxenda|rybelsus|metformin|levothyroxine|insulin|medication|prescription|prescribed|세마글루타이드|터제파타이드|오젬픽|위고비|마운자로|젭바운드|메트포르민|인슐린|처방약|복용 중|セマグルチド|チルゼパチド|オゼンピック|ウゴービ|マンジャロ|メトホルミン|インスリン|處方|处方|司美格鲁肽|司美格魯肽|替尔泊肽|替爾泊肽|胰岛素|胰島素|medicamento|medicação|medicamento|obat|Medikament|médicament/i;

export const MIN_CONFIDENCE = 0.85;
// 새 계정 첫 N일 사람 검토 — 대표 결정(2026-10-24)으로 끔: 첫 주 126건 승인은 '중요한 것만'과 맞지 않음.
export const NEW_ACCOUNT_DAYS = 0;

/** 계정(채널:언어)의 첫 발행일 — config/accounts.json. 없으면 아직 개설 전으로 보고 사람 검토. */
function accountStart(channel, lang, accounts = config('accounts').accounts) {
  const a = accounts.find((x) => x.channel === channel && x.lang === lang);
  return a?.first_post_date || null;
}

export function mustEscalate(draft, today = new Date().toISOString().slice(0, 10), accounts) {
  const reasons = [];
  const text = [...(draft.posts || []), ...(draft.slides || []).flatMap((s) => [s.title, s.body]), draft.first_reply || ''].join('\n');
  if (MEDICATION.test(text)) reasons.push('약물 언급');
  const acc = (accounts || config('accounts').accounts).find((x) => x.channel === draft.channel && x.lang === draft.lang);
  if (!acc?.handle) reasons.push('계정 미등록(config/accounts.json)');
  const start = accountStart(draft.channel, draft.lang, accounts);
  if (NEW_ACCOUNT_DAYS && start && (Date.parse(today) - Date.parse(start)) / 864e5 < NEW_ACCOUNT_DAYS) reasons.push(`새 계정 첫 ${NEW_ACCOUNT_DAYS}일`);
  return reasons;
}

/** 최종 결정. lint FAIL·리뷰어 미통과·예외 규칙 중 하나라도 걸리면 자동 발행하지 않는다. */
export function decide(draft, review, today, { accounts, control = config('control') } = {}) {
  if (control.publishing_paused) return { status: 'paused', reasons: ['긴급 중지 스위치 켜짐(config/control.json)'] };
  if (draft.lint?.status !== 'PASS') return { status: 'rejected', reasons: ['기계 검사 FAIL', ...(draft.lint?.errors || [])] };
  if (draft.image_qa?.status === 'FAIL') return { status: 'rejected', reasons: ['이미지 자동 검사 FAIL', ...draft.image_qa.issues] };
  if (!review) return { status: 'human', reasons: ['AI 리뷰 없음'] };
  if (review.verdict === 'revise') return { status: draft.revision ? 'rejected' : 'revise', reasons: [...(draft.revision ? ['고쳐 쓴 뒤에도 리뷰어 미통과'] : []), ...(review.issues || [])] };
  const esc = mustEscalate(draft, today, accounts);
  if (review.verdict === 'human' || (review.confidence ?? 0) < MIN_CONFIDENCE) esc.push(`AI 리뷰어 보류(확신 ${review.confidence})`);
  if (esc.length) return { status: 'human', reasons: esc };
  return { status: 'auto_approved', reasons: [] };
}
