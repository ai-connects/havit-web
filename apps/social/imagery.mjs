// 초안마다 사진을 정한다(render 전에 실행). 라이브러리에서 맞는 사진 → 없으면 AI 생성. 같은 계정에서 14일 안에 쓴 사진은 피한다.
//   node imagery.mjs queue/2026-11-02
// 환경 변수: ANTHROPIC_API_KEY(선택용), GEMINI_API_KEY(생성용)
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';
import { choose, generate } from './lib/imagery.mjs';
import { createClient } from './lib/llm.mjs';

const client = await createClient();

/** 최근 14일 같은 계정이 쓴 라이브러리 사진. */
function recentFiles(queueRoot, channel, lang, date) {
  const used = new Set();
  const from = new Date(Date.parse(`${date}T00:00:00Z`) - 14 * 864e5).toISOString().slice(0, 10);
  for (const d of readdirSync(queueRoot).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x) && x >= from && x < date)) {
    for (const f of readdirSync(path.join(queueRoot, d)).filter((x) => x.startsWith(`${channel}-${lang}-`) && x.endsWith('.json'))) {
      const p = readJson(path.join(queueRoot, d, f)).photo;
      if (p?.file) used.add(p.file);
    }
  }
  return used;
}

for (const dir of process.argv.slice(2).filter((p) => statSync(p, { throwIfNoEntry: false })?.isDirectory())) {
  const queueRoot = path.dirname(path.resolve(dir));
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    if (d.photo || d.share === 'link' || d.lint?.status !== 'PASS') continue;
    const summary = (d.card_text || d.slides?.[0]?.title || d.posts?.[0] || '').slice(0, 300);
    try {
      const pick = await choose(client, { brief: d.image_brief || summary, summary, slug: d.slug, recent: recentFiles(queueRoot, d.channel, d.lang, d.date) });
      if (pick.source === 'ai') {
        const outDir = path.join(dir, 'img', f.replace(/\.json$/, ''));
        mkdirSync(outDir, { recursive: true });
        pick.path = path.relative(dir, await generate(pick.prompt, path.join(outDir, 'photo.png')));
      }
      d.photo = pick;
      console.log(`${pick.source === 'library' ? '📷' : '🎨'} ${f} — ${pick.desc || pick.prompt}`);
    } catch (e) {
      d.photo = { source: 'none', error: String(e.message).slice(0, 200) }; // 사진 없이 브랜드 카드로 렌더
      console.log(`· ${f} 사진 없음 — ${d.photo.error}`);
    }
    writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  }
}
