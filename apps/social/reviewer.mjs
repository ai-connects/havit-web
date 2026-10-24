// AI 리뷰어: 큐 초안(글 + 렌더 이미지)을 판정하고 자동 발행 게이트를 적용한다.
//   node reviewer.mjs queue/2026-11-02 [queue/...]
// 환경 변수: ANTHROPIC_API_KEY, SOCIAL_REVIEW_MODEL (기본 claude-opus-5-5 — 생성 모델보다 강한 모델로 검수)
// 결과: 초안 JSON 에 review·decision 기록. decision.status = auto_approved 일 때만 approved:true.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSource, readJson } from './lib/source.mjs';
import { decide } from './lib/gate.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SYSTEM = readFileSync(path.join(ROOT, 'prompts/reviewer.md'), 'utf8');
const MODEL = process.env.SOCIAL_REVIEW_MODEL || 'claude-opus-5-5';
const { default: Anthropic } = await import('@anthropic-ai/sdk');
const client = new Anthropic();

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
    }
    const decision = decide(d, review);
    const out = { ...d, review, decision, approved: decision.status === 'auto_approved', approved_by: decision.status === 'auto_approved' ? `ai-reviewer:${MODEL}` : null };
    writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
    tally[decision.status] = (tally[decision.status] || 0) + 1;
    console.log(`${decision.status.padEnd(13)} ${path.relative(ROOT, p)}${decision.reasons.length ? ' — ' + decision.reasons.join('; ') : ''}`);
  }
}
console.log('\n' + Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(' · '));
