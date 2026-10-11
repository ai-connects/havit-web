/**
 * translate-5-articles — Translate the 5 HAVIT differentiation articles
 * into 8 PRIMARY_LANGS (ja / zh-CN / zh-TW / es / pt-BR / id / de / fr),
 * sourced from each article's English version.
 *
 * Strategy:
 *   - Source: a.langs.en (full structured content)
 *   - Output: a.langs[targetLang] with the same shape
 *   - Model: claude-sonnet-4-5-20250929 (cost-effective + good multilingual quality)
 *   - Idempotent: only translates missing language keys; existing translations
 *     are never overwritten.
 *   - Slug-filtered: only processes the 5 explicitly listed slugs (or those
 *     passed via --slugs CSV) — never touches the other ~1,086 articles.
 *   - Compliance: every target lang preserves the non-clinical disclaimer
 *     ("HAVIT is not a medical diagnostic tool" or natural equivalent) and
 *     uses "InBody reference" framing (not "vs InBody diagnosis").
 */

import { promises as fs } from 'fs';
import path from 'path';
import { complete, safeJsonParse } from './anthropic-client';

/** `--dir data/articles-pending` 로 검토 대기 아티클도 번역할 수 있다. */
const ARTICLES_DIR = (() => {
  const i = process.argv.indexOf('--dir');
  if (i > -1 && process.argv[i + 1]) return path.resolve(__dirname, '..', process.argv[i + 1]);
  return path.resolve(__dirname, '../data/articles');
})();

interface TargetLang {
  code: string;
  name: string;
  speakers: string;
  disclaimer_hint: string;
}

/**
 * `--langs ko,de` 로 일부만 돌릴 수 있다. 없으면 8개 전부.
 *
 * 왜 필요한가: 15건 × 6개 언어를 한 번에 돌리기 전에 1건 × 1개 언어로 품질과
 * 비용을 먼저 확인해야 한다. 플래그가 없으면 확인 자체가 전체 실행이 된다.
 */
function selectedLangs(all: TargetLang[]): TargetLang[] {
  const i = process.argv.indexOf('--langs');
  if (i < 0 || !process.argv[i + 1]) return all;
  const want = new Set(process.argv[i + 1].split(',').map((x) => x.trim()).filter(Boolean));
  const picked = all.filter((t) => want.has(t.code));
  const unknown = [...want].filter((w) => !all.some((t) => t.code === w));
  if (unknown.length) {
    console.error(`[translate-5] 알 수 없는 언어 코드: ${unknown.join(', ')} — 가능: ${all.map((t) => t.code).join(', ')}`);
    process.exit(1);
  }
  return picked;
}

const ALL_TARGETS: TargetLang[] = [
  {
    code: 'ja',
    name: 'Japanese',
    speakers: 'Japanese general adult readers',
    disclaimer_hint: 'HAVITは医療診断ツールではありません',
  },
  {
    code: 'zh-CN',
    name: 'Simplified Chinese (China mainland)',
    speakers: 'Simplified-Chinese general adult readers (mainland China audience)',
    disclaimer_hint: 'HAVIT 不是医疗诊断工具',
  },
  {
    code: 'zh-TW',
    name: 'Traditional Chinese (Taiwan)',
    speakers: 'Traditional-Chinese general adult readers (Taiwan audience)',
    disclaimer_hint: 'HAVIT 不是醫療診斷工具',
  },
  {
    code: 'es',
    name: 'Spanish (Latin America preferred)',
    speakers: 'Spanish-speaking general adult readers (LatAm preferred, with US Hispanic compatibility)',
    disclaimer_hint: 'HAVIT no es una herramienta de diagnóstico médico',
  },
  {
    code: 'pt-BR',
    name: 'Brazilian Portuguese',
    speakers: 'Brazilian general adult readers',
    disclaimer_hint: 'HAVIT não é uma ferramenta de diagnóstico médico',
  },
  {
    code: 'id',
    name: 'Indonesian (Bahasa Indonesia)',
    speakers: 'Indonesian general adult readers',
    disclaimer_hint: 'HAVIT bukan alat diagnostik medis',
  },
  {
    code: 'de',
    name: 'German',
    speakers: 'German-speaking (DE/AT/CH) general adult readers',
    disclaimer_hint: 'HAVIT ist kein medizinisches Diagnosegerät',
  },
  {
    code: 'fr',
    name: 'French',
    speakers: 'French-speaking (FR/CA/Maghreb) general adult readers',
    disclaimer_hint: "HAVIT n'est pas un outil de diagnostic médical",
  },
];

const TARGETS: TargetLang[] = selectedLangs(ALL_TARGETS);

const DEFAULT_SLUGS: string[] = [
  'havit-vs-myfitnesspal-noom-simple-2026',
  'havit-ai-body-composition-92percent-vs-inbody',
  'what-is-k-wellness',
  'glp1-behavior-change-m0-m1-m2',
  'havit-ai-coaching-engine-8steps',
];

interface RefIn { title?: string; text?: string; source?: string; url?: string }
interface KeyStat { label: string; value: string; source?: string }
interface CompTable { title: string; headers: string[]; rows: string[][]; caption?: string }
interface Faq { question: string; answer: string }
interface LangContent {
  title: string;
  meta_description?: string;
  tldr?: string;
  body_md: string;
  key_stats?: KeyStat[];
  comparison_table?: CompTable | null;
  faq?: Faq[];
  references?: RefIn[];
  last_updated?: string;
}

async function translateContent(
  source: LangContent,
  target: TargetLang,
): Promise<LangContent | null> {
  const system = `You are an expert medical/wellness translator targeting ${target.speakers}. Translate the JSON content from English to ${target.name}.

CRITICAL RULES:
0. JSON QUOTING (highest priority): When translating, you MUST NOT use literal ASCII double quotes (") INSIDE any string value, because they break JSON parsing. Instead:
   - Replace any in-content quoting with single quotes (') or typographic smart quotes (U+201C/U+201D for English-style, U+300C/U+300D for Japanese/Chinese, U+201E/U+201C for German).
   - Example WRONG: "meta_description": "Effectiveness scales with "personalization × feedback × triggers"."
   - Example RIGHT: "meta_description": "Effectiveness scales with 'personalization × feedback × triggers'."
   - Never write \" inside a value — that's also fragile. Just use single or smart quotes.
1. Keep all numbers, percentages, units, study citations (e.g. "STEP 1 NEJM 2021", "Wilding et al. 2021"), drug names (Wegovy, Ozempic, Mounjaro, Zepbound, semaglutide, tirzepatide, metformin), and URLs verbatim.
2. Preserve markdown formatting in body_md (## headings, lists, bold, tables, links, code fences). Tables and code-block formatting must remain functional after translation.
3. Reference titles + sources: keep proper nouns / journal names in the original (e.g. "Nature Reviews Endocrinology", "NEJM", "JAMA"). Translate descriptive phrases only when natural in ${target.name}.
4. Compliance: render "InBody-reference" / "InBody as reference" as natural equivalents in ${target.name}. Avoid medical-diagnostic phrasing like "diagnosis vs InBody" or "measured by HAVIT" — HAVIT is non-clinical. Always preserve the explicit disclaimer that HAVIT is not a medical diagnostic tool; one natural equivalent in ${target.name} is: "${target.disclaimer_hint}". The body_md must include at least one sentence reinforcing this disclaimer.
5. Tone: clear, evidence-based, no clinical jargon when avoidable, but precise enough for health-literate adult readers. Match the cultural register of ${target.speakers}.
6. Do not invent, embellish, or omit content. Translate 1:1 with the source.
7. last_updated date string: keep verbatim.

OUTPUT JSON SHAPE (mirror input exactly):
{
  "title": "...",
  "meta_description": "...",
  "tldr": "...",
  "body_md": "...",
  "key_stats": [{ "label": "...", "value": "...", "source": "..." }],
  "comparison_table": { "title": "...", "headers": [...], "rows": [[...]], "caption": "..." } | null,
  "faq": [{ "question": "...", "answer": "..." }],
  "references": [{ "title": "...", "source": "...", "url": "..." }],
  "last_updated": "YYYY-MM-DD"
}

Output ONLY the JSON. Start with { and end with }. No prose, no markdown wrapper, no commentary.`;

  const user = `Translate this English content to ${target.name}. JSON:\n\n${JSON.stringify(source, null, 2)}`;

  const text = await complete({
    model: 'claude-sonnet-4-5-20250929',
    system,
    user,
    maxTokens: 32000,
    temperature: 0.3,
  });
  try {
    return safeJsonParse<LangContent>(text);
  } catch (err) {
    // Debug: save raw response for inspection on failure
    try {
      const debugPath = path.resolve(__dirname, `../data/_translate_debug_${target.code}_${Date.now()}.txt`);
      await fs.writeFile(debugPath, `=== ERROR ===\n${(err as Error)?.message}\n\n=== RAW RESPONSE (first 4KB) ===\n${(text || '').slice(0, 4096)}\n\n=== RAW RESPONSE (last 2KB) ===\n${(text || '').slice(-2048)}`, 'utf-8');
    } catch {}
    return null;
  }
}

async function loadEnv(): Promise<void> {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const text = await fs.readFile(envPath, 'utf-8');
    for (const line of text.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    console.error('.env.local not found');
    process.exit(1);
  }
}

interface Counters {
  articles: number;
  translations_done: number;
  translations_skipped: number;
  translations_failed: number;
  errors: number;
}

async function processArticle(filePath: string, c: Counters): Promise<void> {
  let raw: string;
  try { raw = await fs.readFile(filePath, 'utf-8'); } catch { c.errors++; return; }
  let a: any;
  try { a = JSON.parse(raw); } catch { c.errors++; return; }

  const src = a.langs?.en as LangContent | undefined;
  if (!src || !src.title || !src.body_md) {
    console.error(`[skip] ${path.basename(filePath)} has no usable en source`);
    c.errors++;
    return;
  }

  let modified = false;
  const missing = TARGETS.filter((t) => !a.langs?.[t.code]?.title);
  const present = TARGETS.length - missing.length;
  c.translations_skipped += present;

  if (missing.length === 0) {
    console.log(`[${path.basename(filePath)}] all ${TARGETS.length} langs already present, skipping`);
    c.articles++;
    return;
  }

  console.log(`[${path.basename(filePath)}] translating ${missing.length} langs: ${missing.map((t) => t.code).join(', ')}`);

  const CONCURRENCY = 3;
  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const slice = missing.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(slice.map((t) => translateContent(src, t)));
    for (let j = 0; j < slice.length; j++) {
      const r = results[j];
      const tgt = slice[j];
      if (r.status === 'fulfilled' && r.value && r.value.title && r.value.body_md && r.value.body_md.length > 500) {
        a.langs = a.langs ?? {};
        a.langs[tgt.code] = r.value;
        modified = true;
        c.translations_done++;
        console.log(`  ${tgt.code}: ok (body_md=${r.value.body_md.length})`);
      } else {
        c.translations_failed++;
        const reason =
          r.status === 'rejected' ? `rejected: ${(r.reason as Error)?.message}` :
          !r.value ? 'parse failed' :
          !r.value.title ? 'no title' :
          !r.value.body_md ? 'no body_md' :
          r.value.body_md.length <= 500 ? `body_md too short (${r.value.body_md.length})` :
          'unknown';
        console.error(`  ${tgt.code}: FAIL — ${reason}`);
      }
    }
    // Write intermediate progress every concurrent batch (idempotent saves)
    if (modified) {
      await fs.writeFile(filePath, JSON.stringify(a, null, 2), 'utf-8');
    }
  }
  c.articles++;
}

async function main(): Promise<void> {
  await loadEnv();

  // Parse --slugs csv if provided, otherwise use DEFAULT_SLUGS
  let slugs = DEFAULT_SLUGS;
  const slugArgIdx = process.argv.indexOf('--slugs');
  if (slugArgIdx > -1 && process.argv[slugArgIdx + 1]) {
    slugs = process.argv[slugArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean);
  }

  // Optional --max-concurrent (per-article concurrency; lang concurrency stays at 3)
  // Note: we keep ARTICLE_CONCURRENCY=1 to avoid clobbering rate limits while
  // the 1,200-item queue might be running. Translation parallelism per article
  // is bounded by CONCURRENCY=3 in processArticle.

  console.log(`[translate-5] processing ${slugs.length} slugs → ${TARGETS.map((t) => t.code).join(', ')}`);
  const start = Date.now();
  const c: Counters = {
    articles: 0,
    translations_done: 0,
    translations_skipped: 0,
    translations_failed: 0,
    errors: 0,
  };

  for (const slug of slugs) {
    const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
    try {
      await fs.access(filePath);
    } catch {
      console.error(`[translate-5] missing file: ${filePath}`);
      c.errors++;
      continue;
    }
    await processArticle(filePath, c);
    const elapsedS = Math.round((Date.now() - start) / 1000);
    console.log(`[translate-5] progress: articles=${c.articles}/${slugs.length} done=${c.translations_done} skipped=${c.translations_skipped} failed=${c.translations_failed} errors=${c.errors} elapsed=${elapsedS}s`);
  }

  console.log('\n[translate-5] DONE');
  console.log(JSON.stringify(c, null, 2));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[translate-5] fatal:', err);
    process.exit(1);
  });
}
