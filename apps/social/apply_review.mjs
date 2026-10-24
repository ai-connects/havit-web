// 이슈 댓글 /approve · /reject 를 큐 초안에 반영한다(social-approve 워크플로).
//   node apply_review.mjs <issue body 파일> approve|reject <승인자>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson } from './lib/source.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [bodyFile, action, who] = process.argv.slice(2);
const key = readFileSync(bodyFile, 'utf8').match(/<!-- social-draft: (\S+) -->/)?.[1];
if (!key || key.includes('..')) { console.error('이슈 본문에 social-draft 표식이 없음'); process.exit(1); }
const p = path.join(ROOT, 'queue', key);
if (!existsSync(p)) { console.error(`큐에 없음: ${key}`); process.exit(1); }
const d = readJson(p);
const at = new Date().toISOString();
const out = action === 'approve'
  ? { ...d, approved: true, approved_by: `human:${who}`, approved_at: at }
  : { ...d, approved: false, rejected: { by: who, at } };
writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
console.log(`${action} ${key}`);
