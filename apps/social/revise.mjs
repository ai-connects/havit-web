// 리뷰어가 'revise' 로 돌려보낸 초안을 지적사항대로 1회 고쳐 쓴다(reviewer 다음 실행).
//   node revise.mjs queue/2026-11-02
// 고친 초안은 review·decision 을 지워 render → host → reviewer 를 다시 거친다. 두 번째 revise 는 그날 발행하지 않는다(gate).
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadSource, readJson } from './lib/source.mjs';
import { buildPrompt } from './lib/prompt.mjs';
import { lint } from './lib/lint.mjs';

const MODEL = process.env.SOCIAL_MODEL || 'claude-sonnet-5-5';
const { default: Anthropic } = await import('@anthropic-ai/sdk');
const client = new Anthropic();

let n = 0;
for (const dir of process.argv.slice(2).filter((p) => statSync(p, { throwIfNoEntry: false })?.isDirectory())) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    if (d.decision?.status !== 'revise' || d.revision) continue;
    const source = loadSource(d.slug, d.lang);
    const { system, user } = buildPrompt(d, source, d.link);
    const { lint: _l, review, decision, images, media, image_qa, approved, approved_by, ...prev } = d;
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: `${user}\n\nYour previous draft:\n${JSON.stringify(prev, null, 1)}\n\nThe reviewer sent it back. Issues:\n${(review.issues || []).join('\n')}\nFix instructions: ${review.fix_instructions || ''}\n\nRewrite the whole draft with these fixed. Same output format.` }],
    });
    const t = msg.content.map((c) => c.text || '').join('');
    const fixed = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
    // 계획 필드(채널·언어·글·포맷·발행시각 등)와 사진은 그대로 둔다
    const draft = { ...fixed, ...Object.fromEntries(['date', 'channel', 'lang', 'slug', 'format', 'segment', 'publish_at', 'share', 'link', 'photo'].filter((k) => k in d).map((k) => [k, d[k]])) };
    const result = lint(draft, source);
    writeFileSync(p, JSON.stringify({ ...draft, lint: result, approved: false, revision: 1, previous_review: review }, null, 2) + '\n');
    n++;
    console.log(`✏️  ${result.status} ${f}${result.errors.length ? ' — ' + result.errors.join('; ') : ''}`);
  }
}
console.log(`고쳐 쓴 초안 ${n}건`);
