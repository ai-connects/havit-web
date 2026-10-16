/**
 * generate-serp-snippets — Write hook-style `short_title` / `short_description`
 * for Latin-script langs (en/es/pt-BR/de/fr/id).
 *
 * Why: page.tsx truncates <title> at 50 chars and cuts at the first ": ", so a
 * Latin title like "Farmers Walk: The Deceptively Simple Exercise…" ships as
 * just "Farmers Walk". CJK titles fit in 50 chars and keep their hook — that gap
 * is why ko/ja/zh-TW CTR (2.1–2.9%) is 2–3x the Latin langs (0.8–1.7%) at the
 * same average position. Descriptions over 158 chars get cut to the first
 * sentence the same way.
 *
 * Few-shot examples are read from articles that already carry hand-written
 * short_title + short_description in the same lang, so the style follows them.
 *
 * Every candidate is validated before it is written:
 *   - short_title ≤ 60 chars, no ellipsis
 *   - short_description ≤ 155 chars (only generated when meta_description > 158)
 *   - every number must already appear in the article (no invented stats)
 * Anything that fails twice is skipped and keeps the auto-truncated fallback.
 *
 * Idempotent: entries that already have short_title are never touched.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... npx tsx scripts/generate-serp-snippets.ts --dry-run [--lang es] [--limit 30]
 *   ANTHROPIC_API_KEY=... npx tsx scripts/generate-serp-snippets.ts --write
 */

import { promises as fs } from 'fs';
import path from 'path';
import { complete, safeJsonParse } from './anthropic-client';

const ARTICLES_DIR = path.resolve(__dirname, '../data/articles');
const REPORT_PATH = path.resolve(__dirname, '../data/serp-snippets-report.jsonl');
const MODEL = 'claude-sonnet-5-5';
const LANGS = ['en', 'es', 'pt-BR', 'de', 'fr', 'id'] as const;
const LANG_NAME: Record<string, string> = {
  en: 'English (US)',
  es: 'Spanish (Latin America + Spain, neutral)',
  'pt-BR': 'Brazilian Portuguese',
  de: 'German',
  fr: 'French',
  id: 'Indonesian',
};
const TITLE_MAX = 60;
const DESC_MAX = 155;
const DESC_TRUNCATE_AT = 158; // page.tsx DESC_MAX_LEN
const BATCH = 15;
const CONCURRENCY = 6;

type LangContent = Record<string, unknown> & {
  title: string;
  short_title?: string;
  short_description?: string;
  meta_description?: string;
  tldr?: string;
  body_md?: string;
  key_stats?: unknown;
};
type Article = { slug: string; primary_keyword_en?: string; langs: Record<string, LangContent> };
type Job = { file: string; slug: string; lang: string; c: LangContent; needDesc: boolean; keyword?: string; issue?: string };
type Out = { id: string; short_title: string; short_description?: string };

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const onlyLang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
const limit = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;

const SYSTEM = `You write Google SERP snippets (HTML <title> and meta description) for HAVIT, a health & weight-management blog.
Goal: maximize click-through at the same ranking position. The Korean/Japanese/Traditional Chinese versions of this blog earn 2-3x the CTR because their titles keep the hook; match that.

short_title rules:
- Aim for 45-55 characters; ${TITLE_MAX} is a hard limit (count carefully — longer titles are discarded). Never end with an ellipsis.
- Start with the phrase people actually type into Google for this topic, in natural ${'{LANG}'} search wording (often a question: "Does…", "¿La…?", "Quanto tempo…", "…Adalah?").
- Then a hook: a concrete number from the article, a "how long / when to worry / how to / which is better" promise, or a short answer tease.
- A number must read as part of a natural phrase ("hasta un 25%", "cae un 0,7% al año", "7 foods"). Never tack a bare number or "-73%" onto the end. If a number does not fit naturally, use a verbal hook instead.
- It must read like a headline a native editor would write, not a keyword list.
- Never end with a lone dangling keyword after a question mark (e.g. "…sleep? Adenosine"). Use the precise word for the topic (recovery ≠ healing).
- Keep drug and brand names as people search them in that market (Ozempic, Wegovy, Mounjaro, Zepbound…).
- No site name, no year unless the original title is about a dated comparison.

short_description rules (only when asked):
- ≤ ${DESC_MAX} characters, 1-2 sentences.
- Say what the reader gets (numbers, steps, warning signs, comparison) without fully giving away a yes/no answer — leave a reason to click.

Hard constraints:
- Use ONLY facts and numbers present in the provided title/description/tldr/key facts. Never invent statistics.
- Medical topics: no cure promises, no fear-mongering, no "doctors hate this" clickbait.
- Write in ${'{LANG}'} only.

Return ONLY a JSON array: [{"id": "...", "short_title": "...", "short_description": "..."}]. Omit short_description when needDesc is false.`;

function numbersOk(text: string, source: string): boolean {
  const norm = (s: string) => s.replace(/,/g, '.');
  const src = norm(source);
  return (text.match(/\d+(?:[.,]\d+)?/g) ?? []).every((n) => src.includes(norm(n)));
}

function sourceText(c: LangContent): string {
  return [c.title, c.meta_description, c.tldr, c.body_md, JSON.stringify(c.key_stats ?? '')].join(' ');
}

function validate(job: Job, o: Out | undefined): string | null {
  if (!o?.short_title) return 'missing title';
  const t = o.short_title.trim();
  if (t.length > TITLE_MAX) return `title was ${t.length} chars (max ${TITLE_MAX}): "${t}"`;
  if (/…|\.\.\.$/.test(t)) return 'title ellipsis';
  const src = sourceText(job.c);
  if (!numbersOk(t, src)) return 'title number not in article';
  if (job.needDesc) {
    const d = o.short_description?.trim();
    if (!d) return 'missing description';
    if (d.length > DESC_MAX) return `description was ${d.length} chars (max ${DESC_MAX}): "${d}"`;
    if (d.length < 70) return `description ${d.length} chars (too short)`;
    if (!numbersOk(d, src)) return 'description number not in article';
  }
  return null;
}

async function loadJobs(): Promise<{ jobs: Job[]; examples: Record<string, string[]> }> {
  const files = (await fs.readdir(ARTICLES_DIR)).filter((f) => f.endsWith('.json'));
  const jobs: Job[] = [];
  const examples: Record<string, string[]> = {};
  for (const f of files) {
    const a = JSON.parse(await fs.readFile(path.join(ARTICLES_DIR, f), 'utf-8')) as Article;
    for (const lang of LANGS) {
      const c = a.langs?.[lang];
      if (!c?.title || !c.body_md) continue;
      if (c.short_title && c.short_description) {
        (examples[lang] ??= []).push(
          `- original: ${c.title}\n  short_title: ${c.short_title}\n  short_description: ${c.short_description}`,
        );
        continue;
      }
      if (c.short_title) continue;
      const needDesc = (c.meta_description ?? '').length > DESC_TRUNCATE_AT;
      if (c.title.length <= 50 && !needDesc) continue; // already shipped intact
      jobs.push({ file: f, slug: a.slug, lang, c, needDesc, keyword: a.primary_keyword_en });
    }
  }
  return { jobs, examples };
}

async function runBatch(lang: string, batch: Job[], examples: string[]): Promise<Map<string, Out>> {
  const system = SYSTEM.replaceAll('{LANG}', LANG_NAME[lang]);
  const items = batch.map((j) => ({
    id: j.slug,
    needDesc: j.needDesc,
    title: j.c.title,
    description: j.c.meta_description,
    tldr: j.c.tldr,
    topic_keyword_en: j.keyword,
    ...(j.issue ? { previous_attempt_rejected_because: j.issue } : {}),
  }));
  const user = `Examples already approved for ${LANG_NAME[lang]}:\n${examples.slice(0, 6).join('\n')}\n\nWrite snippets for these ${items.length} articles:\n${JSON.stringify(items, null, 1)}`;
  const text = await complete({ model: MODEL, system, user, maxTokens: 8000, temperature: null, effort: 'low' });
  let arr: Out[];
  try {
    arr = safeJsonParse<Out[]>(text);
  } catch (e) {
    throw new Error(`unparseable (${text.length} chars): ${text.slice(0, 200)} … ${text.slice(-200)}`);
  }
  return new Map(arr.map((o) => [o.id, o]));
}

async function pool<T>(tasks: (() => Promise<T>)[], n: number): Promise<T[]> {
  const out: T[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < tasks.length) {
        const k = i++;
        out[k] = await tasks[k]();
      }
    }),
  );
  return out;
}

async function main(): Promise<void> {
  const { jobs: all, examples } = await loadJobs();
  const jobs = all.filter((j) => !onlyLang || j.lang === onlyLang).slice(0, limit);
  console.log(`jobs: ${jobs.length} (${WRITE ? 'WRITE' : 'dry-run'})`);

  const accepted = new Map<Job, Out>();
  const rejected: { job: Job; reason: string }[] = [];
  let pending = jobs;
  for (let attempt = 1; attempt <= 3 && pending.length; attempt++) {
    const tasks: (() => Promise<void>)[] = [];
    for (const lang of LANGS) {
      const lj = pending.filter((j) => j.lang === lang);
      for (let i = 0; i < lj.length; i += BATCH) {
        const batch = lj.slice(i, i + BATCH);
        tasks.push(async () => {
          let res = new Map<string, Out>();
          try {
            res = await runBatch(lang, batch, examples[lang] ?? []);
          } catch (e) {
            console.warn(`[batch fail] ${lang} ${batch[0].slug}: ${(e as Error).message}`);
          }
          for (const j of batch) {
            const o = res.get(j.slug);
            const why = validate(j, o);
            if (why) rejected.push({ job: j, reason: why });
            else accepted.set(j, o!);
          }
        });
      }
    }
    rejected.length = 0;
    await pool(tasks, CONCURRENCY);
    pending = rejected.map((r) => ({ ...r.job, issue: r.reason }));
    console.log(`attempt ${attempt}: accepted ${accepted.size}, rejected ${pending.length}`);
  }

  const lines = [...accepted].map(([j, o]) =>
    JSON.stringify({ lang: j.lang, slug: j.slug, title: j.c.title, short_title: o.short_title.trim(), short_description: j.needDesc ? o.short_description?.trim() : undefined }),
  );
  lines.push(...rejected.map((r) => JSON.stringify({ lang: r.job.lang, slug: r.job.slug, rejected: r.reason })));
  await fs.writeFile(REPORT_PATH, lines.join('\n') + '\n');
  console.log(`report: ${REPORT_PATH}`);

  if (!WRITE) return;
  const byFile = new Map<string, [Job, Out][]>();
  for (const [j, o] of accepted) byFile.set(j.file, [...(byFile.get(j.file) ?? []), [j, o]]);
  for (const [file, entries] of byFile) {
    const p = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(p, 'utf-8');
    const a = JSON.parse(raw) as Article;
    for (const [j, o] of entries) {
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(a.langs[j.lang])) {
        next[k] = v;
        if (k === 'title') {
          next.short_title = o.short_title.trim();
          if (j.needDesc) next.short_description = o.short_description!.trim();
        }
      }
      a.langs[j.lang] = next as LangContent;
    }
    await fs.writeFile(p, JSON.stringify(a, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
  }
  console.log(`wrote ${accepted.size} entries across ${byFile.size} files`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
