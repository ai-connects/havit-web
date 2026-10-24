// 발행 전 기계 검사. PASS 여도 사람 승인 큐로만 간다(완전 무인 발행 금지).
import { config } from './source.mjs';

const norm = (s) => (s || '').normalize('NFKC');
const LATIN = new Set(['en', 'es', 'pt-br', 'id', 'de', 'fr']);

/** "1,350" "4.5" "20–30%" → ["1350","4.5","20","30"] */
export function numbers(text) {
  const out = [];
  for (const m of norm(text).matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    out.push(m[0].replace(/,(?=\d{3}\b)/g, '').replace(/,$/, ''));
  }
  return out;
}

const stripUrls = (s) => norm(s).replace(/https?:\/\/\S+/g, ' ');
const stripTags = (s) => s.replace(/#[^\s#]+/g, ' ');

function postText(d) {
  return [...(d.posts || []), ...(d.slides || []).flatMap((s) => [s.title, s.body]), d.first_reply || '', d.alt_text || ''].join('\n');
}

export function lint(draft, source) {
  const ch = config('channels');
  const rule = ch.channels[draft.channel];
  const lang = ch.langs[draft.lang];
  const errors = [];
  const warnings = [];
  const body = (draft.posts || []).join('\n');
  const all = postText(draft);

  // 1) 숫자: 같은 언어판 원문에 있는 숫자 + 1~10 + 2026 만
  const allowed = new Set([...numbers(source._text), ...Array.from({ length: 10 }, (_, i) => String(i + 1)), '2026']);
  for (const n of numbers(stripTags(stripUrls(all)))) {
    if (!allowed.has(n)) errors.push(`원문에 없는 숫자: ${n}`);
  }
  for (const e of draft.evidence || []) {
    for (const n of numbers(e.value)) if (!allowed.has(n)) errors.push(`evidence 값이 원문에 없음: ${e.value}`);
    if (!source.key_stats.some((k) => k.source === e.source) && !norm(source._text).includes(norm(e.source))) {
      errors.push(`evidence 출처가 원문에 없음: ${e.source}`);
    }
  }

  // 2) 금지어
  const lowered = norm(all).toLowerCase();
  for (const w of ch.banned[draft.lang] || []) {
    // 라틴 문자 언어는 단어 단위(es「cura」가「segura」에 걸리지 않게), CJK 는 부분 문자열.
    const hit = LATIN.has(draft.lang)
      ? new RegExp(`(^|[^\\p{L}])${w.toLowerCase().replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(lowered)
      : lowered.includes(w.toLowerCase());
    if (hit) errors.push(`금지어: ${w}`);
  }

  // 3) 면책 문구 위치
  const disclaimers = [lang.disclaimer, lang.disclaimer_formal].filter(Boolean);
  const has = (s) => disclaimers.some((x) => norm(s).includes(norm(x)));
  const where = rule.disclaimer === 'first_reply' ? draft.first_reply : body;
  if (!has(where)) errors.push(`면책 문구가 ${rule.disclaimer} 에 없음`);
  if (rule.disclaimer === 'first_reply' && has(body)) warnings.push('면책 문구가 본문에도 있음(Threads 는 첫 답글만)');

  // 4) 길이·개수
  if (rule.max_chars_per_post) {
    (draft.posts || []).forEach((p, i) => { if ([...p].length > rule.max_chars_per_post) errors.push(`posts[${i}] ${[...p].length}자 > ${rule.max_chars_per_post}`); });
    if ((draft.posts || []).length > rule.max_posts) errors.push(`posts ${draft.posts.length}개 > ${rule.max_posts}`);
  }
  const cap = rule.max_caption || rule.max_chars;
  if (cap && [...body].length > cap) errors.push(`본문 ${[...body].length}자 > ${cap}`);
  if (rule.slides) {
    const n = (draft.slides || []).length;
    if (n < rule.slides[0] || n > rule.slides[1]) errors.push(`slides ${n}장 (허용 ${rule.slides.join('~')})`);
    if (!draft.alt_text) warnings.push('alt_text 없음');
  }

  // 5) 링크 위치 — 정확히 UTM 이 붙은 URL 이어야 한다
  const link = draft.link;
  const inBody = /https?:\/\//.test(body);
  if (rule.link === 'body') {
    if (!body.includes(link)) errors.push('본문에 지정 링크 없음');
  } else if (rule.link === 'first_reply' || rule.link === 'first_comment') {
    if (inBody) errors.push('본문에 링크 있음(첫 답글/댓글로 옮길 것)');
    if (!(draft.first_reply || '').includes(link)) errors.push('first_reply 에 지정 링크 없음');
  } else if (rule.link === 'profile') {
    if (/https?:\/\//.test(all)) errors.push('Instagram 본문·슬라이드에 링크 있음(프로필 링크로)');
  }

  // 6) 해시태그
  const tags = new Set([...(draft.hashtags || []), ...[...norm(all).matchAll(/#([^\s#]+)/g)].map((m) => m[1])]);
  const [lo, hi] = rule.hashtags;
  if (tags.size < lo || tags.size > hi) warnings.push(`해시태그 ${tags.size}개 (권장 ${lo}~${hi})`);

  // 7) 일본어 문체: だ/である 체 비율
  if (draft.lang === 'ja') {
    const sents = norm(body).split(/[。！？\n]/).filter((s) => s.trim().length > 4);
    const plain = sents.filter((s) => /(だ|である|だった)$/.test(s.trim())).length;
    if (sents.length && plain / sents.length > 0.2) warnings.push(`だ/である体 ${plain}/${sents.length} (です/ます 권장)`);
  }

  return { status: errors.length ? 'FAIL' : 'PASS', errors: [...new Set(errors)], warnings };
}
