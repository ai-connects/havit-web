// API 키 없이 초안을 사람/에이전트가 쓸 때: 슬롯별 프롬프트를 파일로 떨군다.
//   node dump_prompts.mjs queue/plan-2026-10-26.json 2026-10-26 2026-11-01 <out_dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadSource, readJson, withUtm } from './lib/source.mjs';
import { buildPrompt } from './lib/prompt.mjs';

const [planPath, from, to, out] = process.argv.slice(2);
const plan = readJson(path.resolve(planPath));
mkdirSync(out, { recursive: true });
let n = 0;
for (const e of plan.entries.filter((x) => x.date >= from && x.date <= to)) {
  const source = loadSource(e.slug, e.lang);
  const link = withUtm(source.url, e);
  const { system, user } = buildPrompt(e, source, link);
  const id = `${e.date}_${e.channel}-${e.lang}-${e.slug}`;
  writeFileSync(path.join(out, `${id}.prompt.md`), `${system}\n\n---\n\n${user}\n`);
  writeFileSync(path.join(out, `${id}.meta.json`), JSON.stringify({ ...e, link }, null, 2));
  n++;
}
console.log(`${n}건 → ${out}`);
