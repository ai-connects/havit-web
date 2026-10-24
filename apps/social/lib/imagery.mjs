// 게시물 사진: ① 우리 사진 라이브러리(config/image_index.json, 사용 가능 표시만)에서 주제에 맞는 것 → ② 없으면 AI 생성.
// 선택은 Claude(가벼운 모델)가 후보 15장 설명 중에서 고르고, 맞는 게 없으면 생성 프롬프트를 쓴다.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = JSON.parse(readFileSync(path.join(ROOT, 'config/image_index.json'), 'utf8')).filter((x) => x.suitable);
const PICK_MODEL = process.env.SOCIAL_PICK_MODEL || 'claude-haiku-5-5';
const IMAGE_MODEL = process.env.SOCIAL_IMAGE_MODEL || 'gemini-3.1-flash-image'; // imagen-4.0-generate-001 은 404(2026-10 확인)

// AI 생성 이미지 공통 제약 — 건강 콘텐츠의 사실성·브랜드 안전.
const GEN_RULES = 'Natural editorial photograph, soft daylight, realistic, calm and warm mood, uncluttered composition with empty space at the bottom. ' +
  'Absolutely no text, letters, numbers, logos, labels or brand names anywhere. No before/after body comparison, no shirtless or body-focused shots, ' +
  'no needles, injections, pills close-up, medical procedures or hospitals. Prefer food, objects, hands, places and scenery over faces; if a person appears, show them from behind or at a distance.';

const words = (t) => new Set((t || '').toLowerCase().match(/[a-z]{3,}/g) || []);

/** 키워드 겹침으로 후보 15장(최근 쓴 사진 제외). */
export function candidates(brief, slug, recent = new Set()) {
  const q = words(`${brief} ${slug.replace(/-/g, ' ')}`);
  return INDEX
    .filter((x) => !recent.has(x.file))
    .map((x) => ({ x, score: [...words(`${x.desc} ${x.tags.join(' ')}`)].filter((w) => q.has(w)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map(({ x }) => x);
}

/** Claude 로 고르기: {file|null, gen_prompt}. */
export async function choose(client, { brief, summary, slug, recent }) {
  const list = candidates(brief, slug, recent);
  const msg = await client.messages.create({
    model: PICK_MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content:
      `Pick the photo that best fits this social post. Pick only if it clearly matches the topic — a mismatched photo is worse than none.\n` +
      `POST: ${summary}\nIDEAL IMAGE: ${brief}\nCANDIDATES:\n${list.map((x) => `${x.file} — ${x.desc}`).join('\n')}\n\n` +
      `Return ONLY JSON: {"file": "<file or null>", "gen_prompt": "<if null: one-sentence English description of a photo to generate, concrete objects and setting>"}` }],
  });
  const t = msg.content.map((c) => c.text || '').join('');
  let j;
  try { j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); } catch { j = { file: null, gen_prompt: brief }; }
  const hit = INDEX.find((x) => x.file === j.file);
  return hit ? { source: 'library', file: hit.file, url: hit.url, desc: hit.desc } : { source: 'ai', prompt: j.gen_prompt || brief };
}

/** Gemini 이미지 모델로 생성(GEMINI_API_KEY). 세로 3:4 저장. */
export async function generate(prompt, outFile) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY 없음');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${prompt}. ${GEN_RULES}` }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4' } },
    }),
  });
  const json = await res.json();
  const b64 = json.candidates?.[0]?.content?.parts?.find((x) => x.inlineData)?.inlineData?.data;
  if (!b64) throw new Error(`이미지 생성 실패: ${JSON.stringify(json.error || json.promptFeedback || json).slice(0, 200)}`);
  writeFileSync(outFile, Buffer.from(b64, 'base64'));
  return outFile;
}
