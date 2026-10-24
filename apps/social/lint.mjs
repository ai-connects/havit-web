// 큐에 있는 초안을 다시 검사한다(사람이 고친 뒤 재검사용).
//   node lint.mjs queue/2026-10-26 [queue/2026-10-27 ...]
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadSource, readJson } from './lib/source.mjs';
import { lint } from './lib/lint.mjs';

const files = process.argv.slice(2).flatMap((p) =>
  statSync(p).isDirectory() ? readdirSync(p).filter((f) => f.endsWith('.json')).map((f) => path.join(p, f)) : [p]);
let fail = 0;
for (const f of files) {
  const d = readJson(f);
  const r = lint(d, loadSource(d.slug, d.lang));
  writeFileSync(f, JSON.stringify({ ...d, lint: r }, null, 2) + '\n');
  if (r.status === 'FAIL') fail++;
  console.log(`${r.status} ${f}${r.errors.length ? ' — ' + r.errors.join('; ') : ''}${r.warnings.length ? ' [경고] ' + r.warnings.join('; ') : ''}`);
}
console.log(`\n${files.length - fail}/${files.length} PASS`);
process.exit(fail ? 1 : 0);
