// <dir>/<id>.out.json(모델 출력 JSON) + <id>.meta.json → queue/<date>/ 초안으로 넣고 검사.
//   node import_drafts.mjs <dir>
import { mkdirSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSource, readJson } from './lib/source.mjs';
import { lint } from './lib/lint.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2];
let pass = 0, n = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.meta.json'))) {
  const id = f.replace('.meta.json', '');
  const outF = path.join(dir, `${id}.out.json`);
  if (!existsSync(outF)) { console.log(`MISSING ${id}`); continue; }
  const e = readJson(path.join(dir, f));
  const draft = { ...readJson(outF), ...e };
  const r = lint(draft, loadSource(e.slug, e.lang));
  const qd = path.join(ROOT, 'queue', e.date);
  mkdirSync(qd, { recursive: true });
  writeFileSync(path.join(qd, `${e.channel}-${e.lang}-${e.slug}.json`), JSON.stringify({ ...draft, lint: r, approved: false }, null, 2) + '\n');
  n++; if (r.status === 'PASS') pass++;
  console.log(`${r.status} ${id}${r.errors.length ? ' — ' + r.errors.join('; ') : ''}${r.warnings.length ? ' [경고] ' + r.warnings.join('; ') : ''}`);
}
console.log(`\nPASS ${pass}/${n}`);
