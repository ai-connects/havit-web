// 사람 승인: 검토 페이지를 본 뒤 검사 통과 초안을 일괄 승인한다. FAIL 은 절대 승인하지 않는다.
//   node approve.mjs queue/2026-11-02 [queue/...] [--except <파일이름 일부>,<...>] [--only <...>]
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1].split(',').filter(Boolean) : []);
const except = opt('--except');
const only = opt('--only');
const dirs = args.filter((a) => !a.startsWith('--') && !except.includes(a) && !only.includes(a) && statSync(a, { throwIfNoEntry: false })?.isDirectory());
const at = new Date().toISOString();
let ok = 0, skip = 0;
for (const d of dirs) {
  for (const f of readdirSync(d).filter((x) => x.endsWith('.json'))) {
    const p = path.join(d, f);
    const x = readJson(p);
    const pick = (only.length ? only.some((s) => f.includes(s)) : true) && !except.some((s) => f.includes(s));
    if (!pick) continue;
    if (x.lint?.status !== 'PASS') { console.log(`건너뜀(FAIL) ${p}`); skip++; continue; }
    writeFileSync(p, JSON.stringify({ ...x, approved: true, approved_at: at }, null, 2) + '\n');
    ok++;
  }
}
console.log(`승인 ${ok}건 · FAIL 로 건너뜀 ${skip}건`);
