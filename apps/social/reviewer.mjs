// AI 리뷰어: 큐 초안(글 + 렌더 이미지)을 판정하고 자동 발행 게이트를 적용한다.
//   node reviewer.mjs queue/2026-11-02 [queue/...]
// 환경 변수: ANTHROPIC_API_KEY, SOCIAL_REVIEW_MODEL (기본 claude-opus-5-5 — 생성 모델보다 강한 모델로 검수)
// 결과: 초안 JSON 에 review·decision 기록. decision.status = auto_approved 일 때만 approved:true.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSource, readJson } from './lib/source.mjs';
import { decide } from './lib/gate.mjs';
import { createClient } from './lib/llm.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SYSTEM = readFileSync(path.join(ROOT, 'prompts/reviewer.md'), 'utf8');
// 전문가 패널(영양사·비만 전문의·체중감량 연구 교수) — 원문 충실도와 별개로 임상적 적절성을 본다(대표 지시 2026-10-25).
const EXPERT = readFileSync(path.join(ROOT, 'prompts/expert.md'), 'utf8');
const MODEL = process.env.SOCIAL_REVIEW_MODEL || 'claude-opus-5-5';
const client = await createClient();

const dirs = process.argv.slice(2).filter((p) => !p.startsWith('--')).filter((p) => statSync(p, { throwIfNoEntry: false })?.isDirectory());
const tally = {};
for (const dir of dirs) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    if (d.decision && !process.argv.includes('--force')) continue; // 이미 판정됨(고쳐 쓴 초안만 다시 본다)
    let review = null;
    if (d.lint?.status === 'PASS') {
      const { _text, ...source } = loadSource(d.slug, d.lang);
      const { lint, review: _r, decision: _d, images, ...draft } = d;
      const imgs = (images || []).slice(0, 10).map((rel) => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/png', data: readFileSync(path.join(dir, rel)).toString('base64') },
      }));
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM.replaceAll('{lang}', d.lang).replaceAll('{channel}', d.channel),
        messages: [{ role: 'user', content: [
          { type: 'text', text: `SOURCE:\n${JSON.stringify(source, null, 1)}\n\nDRAFT:\n${JSON.stringify(draft, null, 1)}` },
          ...imgs,
        ] }],
      });
      const t = msg.content.map((c) => c.text || '').join('');
      try { review = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); } catch { review = null; } // 파싱 실패 = 리뷰 없음 → 사람 검토
      if (review && review.verdict !== 'human') {
        const em = await client.messages.create({
          model: MODEL,
          max_tokens: 6000,
          system: EXPERT.replaceAll('{lang}', d.lang).replaceAll('{channel}', d.channel),
          messages: [{ role: 'user', content: `SOURCE:\n${JSON.stringify(source, null, 1)}\n\nDRAFT:\n${JSON.stringify(draft, null, 1)}` }],
        });
        const et = em.content.map((c) => c.text || '').join('');
        let expert = null;
        try { expert = JSON.parse(et.slice(et.indexOf('{'), et.lastIndexOf('}') + 1)); } catch { expert = { verdict: 'human', issues: ['전문가 패널 응답 파싱 실패'] }; }
        review.expert = expert;
        if (expert.verdict === 'revise' || expert.verdict === 'human') {
          // 전문가 판정이 더 엄격하면 그걸 따른다(고쳐 쓰기 지시는 합친다)
          if (expert.verdict === 'human' || review.verdict === 'approve') review.verdict = expert.verdict;
          review.issues = [...(review.issues || []), ...(expert.issues || []).map((x) => `[전문가] ${x}`)];
          review.fix_instructions = [review.fix_instructions, expert.fix_instructions].filter(Boolean).join('\n');
        }
      }
    }
    const decision = decide(d, review);
    const out = { ...d, review, decision, approved: decision.status === 'auto_approved', approved_by: decision.status === 'auto_approved' ? `ai-reviewer:${MODEL}` : null };
    writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
    tally[decision.status] = (tally[decision.status] || 0) + 1;
    console.log(`${decision.status.padEnd(13)} ${path.relative(ROOT, p)}${decision.reasons.length ? ' — ' + decision.reasons.join('; ') : ''}`);
  }
}
console.log('\n' + Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(' · '));
