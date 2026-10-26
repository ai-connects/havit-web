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
  return [d.card_text || '', ...(d.posts || []), ...(d.slides || []).flatMap((s) => [s.title, s.body]), d.first_reply || '', d.alt_text || ''].join('\n');
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
  // 상황 시리즈 회차 번호(EP.12)도 허용
  const allowed = new Set([...numbers(source._text), ...Array.from({ length: 10 }, (_, i) => String(i + 1)), '2026', ...(draft.series_no ? [String(draft.series_no)] : [])]);
  // 12시간제 원문(9 p.m.)을 24시간제(21 h·21:00)로 옮긴 시각도 허용 — 시각 표기 자리에서만
  const clockText = [all, ...(draft.evidence || []).map((e) => e.value)].join('\n');
  for (const m of norm(clockText).matchAll(/(?<!\d)(\d{1,2})(?:\s?[–-]\s?(\d{1,2}))?\s?(?:h(?![a-zA-Z])|:\d{2})/g)) {
    for (const n of [m[1], m[2]].filter(Boolean)) if (Number(n) >= 13 && Number(n) <= 23 && allowed.has(String(n - 12))) allowed.add(n);
  }
  for (const n of numbers(stripTags(stripUrls(all)))) {
    if (!allowed.has(n)) errors.push(`원문에 없는 숫자: ${n}`);
  }
  for (const e of draft.evidence || []) {
    for (const n of numbers(e.value)) if (!allowed.has(n)) errors.push(`evidence 값이 원문에 없음: ${e.value}`);
    // 앱 퀴즈·아티클 해설의 숫자는 별도 출처 표기가 없다 — 숫자가 원문에 있는지(위)만 본다.
    if (!source.kind?.startsWith('app_') && !source.key_stats.some((k) => k.source === e.source) && !norm(source._text).includes(norm(e.source))) {
      errors.push(`evidence 출처가 원문에 없음: ${e.source}`);
    }
  }

  // 2) 금지어
  const lowered = norm(all).toLowerCase();
  for (const w of ch.banned[draft.lang] || []) {
    // 라틴 문자 언어는 단어 단위(es「cura」가「segura」에 걸리지 않게), CJK 는 부분 문자열.
    const hit = LATIN.has(draft.lang)
      ? new RegExp(`(^|[^\\p{L}])${w.toLowerCase().replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(lowered)
      // 한국어는 앞에 한글이 붙은 경우 다른 낱말(「정기적」「주기적」 속 「기적」)이라 금지어가 아니다(2026-10-25 오탐).
      : draft.lang === 'ko'
        ? new RegExp(`(^|[^가-힣])${w.toLowerCase().replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`, 'u').test(lowered)
        : lowered.includes(w.toLowerCase());
    if (hit) errors.push(`금지어: ${w}`);
  }

  // 3) 면책 문구 위치
  const disclaimers = [lang.disclaimer, lang.disclaimer_formal].filter(Boolean);
  const has = (s) => disclaimers.some((x) => norm(s).includes(norm(x)));
  // Threads 는 면책 문구를 게시물에 넣지 않는다(프로필 소개에 둠, 대표 결정 2026-10-25) — 들어가 있으면 FAIL.
  if (rule.disclaimer === 'none') {
    if (has(body) || has(draft.first_reply || '')) errors.push('면책 문구는 Threads 게시물·댓글에 넣지 않음(프로필 소개에 있음)');
  } else {
    const where = rule.disclaimer === 'first_reply' ? draft.first_reply : body;
    if (!has(where)) errors.push(`면책 문구가 ${rule.disclaimer} 에 없음`);
    if (rule.disclaimer === 'first_reply' && has(body)) warnings.push('면책 문구가 본문에도 있음(Threads 는 첫 답글만)');
  }

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
  if (draft.share === 'link') {
    // 링크 미리보기 카드로 붙는 글 — 글·답글 어디에도 URL 을 쓰지 않는다
    if (/https?:\/\//.test(all)) errors.push('링크 공유 글인데 본문·답글에 URL 있음(미리보기로 자동 첨부)');
  } else if (rule.link === 'body') {
    if (!body.includes(link)) errors.push('본문에 지정 링크 없음');
  } else if (rule.link === 'first_reply' || rule.link === 'first_comment') {
    if (inBody) errors.push('본문에 링크 있음(첫 답글/댓글로 옮길 것)');
    if (!(draft.first_reply || '').includes(link)) errors.push('first_reply 에 지정 링크 없음');
  } else if (rule.link === 'profile') {
    if (/https?:\/\//.test(all)) errors.push('Instagram 본문·슬라이드에 링크 있음(프로필 링크로)');
  }

  // 5-1) 카드 문구 길이(이미지에 크게 찍힘)
  if (draft.card_text) {
    const lim = ['ko', 'ja', 'zh-tw', 'zh'].includes(draft.lang) ? 40 : 60;
    if ([...draft.card_text].length > lim) errors.push(`card_text ${[...draft.card_text].length}자 > ${lim}`);
  }

  // 5-2) 내부 용어 유출(독자는 '캐러셀'이라 말하지 않는다 — 언어별 swipe 문구를 쓴다)
  const META = /carousel|carrousel|carrusel|carrossel|karussell|korsel|캐러셀|카루셀|슬라이드|カルーセル|スライド|輪播/i;
  if (META.test(norm(all))) errors.push(`내부 용어 유출: "${norm(all).match(META)[0]}" — 언어별 swipe 문구로`);

  // 6) 해시태그
  const tags = new Set([...(draft.hashtags || []), ...[...norm(all).matchAll(/#([^\s#]+)/g)].map((m) => m[1])]);
  const [lo, hi] = rule.hashtags;
  if (tags.size < lo || tags.size > hi) warnings.push(`해시태그 ${tags.size}개 (권장 ${lo}~${hi})`);
  const brand = config('channels').langs[draft.lang]?.brand_tag;
  if (draft.channel === 'instagram' && brand && ![...tags].some((t) => t.toLowerCase() === brand.toLowerCase())) warnings.push(`브랜드 태그 #${brand} 없음`);

  // 6-1) 검색 키워드: 대표 키워드가 첫 125자(인스타 '더 보기' 전) 안에
  const kw = (draft.keywords || [])[0];
  if (!kw) errors.push('keywords(대표 검색 키워드) 없음');
  else if (!norm(body).slice(0, 125).toLowerCase().includes(kw.toLowerCase())) warnings.push(`대표 키워드 "${kw}" 가 첫 125자 밖`);

  // 7) 일본어 문체: だ/である 체 비율
  if (draft.lang === 'ja') {
    const sents = norm(body).split(/[。！？\n]/).filter((s) => s.trim().length > 4);
    const plain = sents.filter((s) => /(だ|である|だった)$/.test(s.trim())).length;
    if (sents.length && plain / sents.length > 0.2) warnings.push(`だ/である体 ${plain}/${sents.length} (です/ます 권장)`);
  }

  return { status: errors.length ? 'FAIL' : 'PASS', errors: [...new Set(errors)], warnings };
}
