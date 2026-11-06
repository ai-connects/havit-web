/**
 * Single article 생성 테스트 — 8-Phase 전체 검증.
 *
 * 실행:
 *   1. Claude 구독 로그인(claude) 확인 — API 키 불필요
 *   2. npx tsx scripts/test-single.ts
 *
 * 약 5분, 구독 사용량. 결과: data/articles/{slug}.json
 */

import { promises as fs } from 'fs';
import path from 'path';

// .env.local 수동 로드 (dotenv 없이)
async function loadEnv(): Promise<void> {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const text = await fs.readFile(envPath, 'utf-8');
    for (const line of text.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
      }
    }
    console.log('✓ .env.local loaded');
  } catch {
    console.error('✗ .env.local not found. Create it (empty file is fine; subscription login is used)');
    process.exit(1);
  }
}

async function main(): Promise<void> {
  await loadEnv();

  if (process.env.BLOG_LLM === 'api' && !process.env.ANTHROPIC_API_KEY) {
    console.error('✗ BLOG_LLM=api 인데 ANTHROPIC_API_KEY 가 .env.local 에 없다');
    process.exit(1);
  }

  const { generateArticle } = await import('./pipeline');

  const seed = {
    slug: 'doms-real-cause-recovery-protocol-2026',
    category: 'Exercise & Activity',
    category_emoji: '💪',
    type: 'science' as const,
    primary_keyword_en: 'why muscles sore 24 48 hours after workout',
    primary_keyword_ko: '운동 후 근육통 이틀 뒤 이유',
    unique_angle:
      'DOMS는 젖산 때문이 아니다 — 미세 근손상 + 염증 반응의 실제 메커니즘과 회복 가속법',
    authoritative_sources: [
      'Schoenfeld 2024 JISSN',
      'McHugh 2023 Sports Medicine',
      'Hyldahl 2025 Frontiers in Physiology',
    ],
    reading_time_min: 10,
  };

  console.log('\n=== Generating test article ===');
  console.log('slug:', seed.slug);
  console.log('languages: ko, en, ja, zh, es');
  console.log('estimated time: 4~6 minutes, cost: ~$1\n');

  const start = Date.now();
  try {
    const result = await generateArticle(seed);
    const elapsed = Math.round((Date.now() - start) / 1000);

    await fs.mkdir(path.resolve(__dirname, '../data/articles'), { recursive: true });
    const outPath = path.resolve(__dirname, '../data/articles', `${result.slug}.json`);
    await fs.writeFile(outPath, JSON.stringify(result, null, 2));

    console.log('\n=== SUCCESS (', elapsed, 's) ===');
    console.log('languages generated:', Object.keys(result.langs).join(', '));
    console.log('naturalness iterations:', result.iterations.naturalness_pass);
    console.log('\n--- Titles ---');
    for (const lang of ['en', 'ko', 'ja', 'zh', 'es'] as const) {
      console.log(`[${lang}]`, result.langs[lang]?.title);
    }
    console.log('\n--- Body lengths (chars) ---');
    for (const lang of ['en', 'ko', 'ja', 'zh', 'es'] as const) {
      console.log(`[${lang}]`, result.langs[lang]?.body_md?.length ?? 0);
    }
    console.log('\nsaved:', outPath);
    console.log('\nView in browser:');
    console.log('  npm run dev');
    console.log(`  open http://localhost:3001/blog/seo-batch-2/${result.slug}?lang=ko`);
    console.log('\n(Note: this seed is not yet wired into /blog/seo-batch-2 — see step 3.)');
  } catch (e: any) {
    console.error('\n=== FAIL ===');
    console.error('error:', e.message);
    if (e.stack) console.error(e.stack.slice(0, 800));
    process.exit(1);
  }
}

main();
