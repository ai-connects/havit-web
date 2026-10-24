// 사람 검토가 필요한 초안(decision.status = human)을 GitHub 이슈로 올린다. 대표님은 이슈에 /approve 또는 /reject 댓글만 단다.
//   node escalate.mjs queue/2026-11-02        (GitHub Actions 안에서 GH_TOKEN·GITHUB_REPOSITORY 로 동작)
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readJson } from './lib/source.mjs';

const repo = process.env.GITHUB_REPOSITORY || 'ai-connects/havit-web';
const NAME = { threads: 'Threads', instagram: 'Instagram' };
for (const dir of process.argv.slice(2).filter((p) => statSync(p, { throwIfNoEntry: false })?.isDirectory())) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = path.join(dir, f);
    const d = readJson(p);
    if (d.decision?.status !== 'human' || d.issue) continue;
    const key = `${path.basename(dir)}/${f}`;
    const body = [
      `<!-- social-draft: ${key} -->`,
      `**${NAME[d.channel]} · ${d.lang} · ${d.format}** — 발행 예정 ${d.publish_at} (UTC)`,
      `사람 검토 사유: ${(d.decision.reasons || []).join(', ')}`,
      `원문 글: https://www.aihavit.com/blog/${d.lang}/${d.slug}`,
      '',
      ...(d.media || []).map((u, i) => `![${i + 1}](${u})`),
      '',
      ...(d.posts || []).map((t) => `> ${t.replace(/\n/g, '\n> ')}`),
      d.first_reply ? `\n첫 답글: ${d.first_reply}` : '',
      '',
      '---',
      '**`/approve`** 댓글 → 예정 시각에 발행 · **`/reject`** 댓글 → 발행 안 함',
    ].join('\n');
    const url = execFileSync('gh', ['issue', 'create', '--repo', repo, '--title', `[SNS 검토] ${d.date} ${NAME[d.channel]} ${d.lang} — ${d.slug}`.slice(0, 120), '--label', 'social-review', '--body', body], { encoding: 'utf8' }).trim();
    writeFileSync(p, JSON.stringify({ ...d, issue: url }, null, 2) + '\n');
    console.log(`이슈 ${url}`);
  }
}
