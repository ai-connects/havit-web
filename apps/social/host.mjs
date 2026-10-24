// 렌더 이미지 → S3 공개 URL(JPEG) 을 초안의 media 에 기록. 사람 검토 이슈의 미리보기와 발행이 같은 URL 을 쓴다.
//   node host.mjs queue/2026-11-02
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';
import { hostImages } from './lib/media.mjs';

for (const dir of process.argv.slice(2).filter((p) => statSync(p, { throwIfNoEntry: false })?.isDirectory())) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    if (d.media?.length || !d.images?.length || d.lint?.status !== 'PASS') continue;
    d.media = hostImages(dir, f, d.images);
    writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
    console.log(`${d.media.length}장 ${f}`);
  }
}
