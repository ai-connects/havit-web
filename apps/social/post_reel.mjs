// 릴스 1건을 사람이 지정해 올린다(GitHub Actions social-post-reel, 수동 실행 전용). 자동 큐·검수와는 별개다.
// 환경: REEL_LANG, REEL_VIDEO_URL, REEL_CAPTION, IG_TOKEN_<언어>. REEL_DRY_RUN=true 면 계정만 확인하고 올리지 않는다.
import { fileURLToPath } from 'node:url';
import { igToken, publishInstagramReel, whoami } from './lib/meta.mjs';

/** 게시 전 입력 검사. 문제가 있으면 오류 문구 배열을 돌려준다. */
export function reelInputErrors({ lang, videoUrl, caption, token }) {
  const errors = [];
  if (!lang) errors.push('REEL_LANG 없음');
  else if (!token) errors.push(`IG_TOKEN_${lang.toUpperCase().replace(/-/g, '_')} 없음`);
  if (!/^https:\/\/\S+$/.test(videoUrl || '')) errors.push('REEL_VIDEO_URL 은 공개 https 주소여야 함');
  if (!String(caption || '').trim()) errors.push('REEL_CAPTION 없음');
  else if (caption.length > 2200) errors.push('REEL_CAPTION 은 2200자 이내여야 함');
  return errors;
}

async function main() {
  const { REEL_LANG: lang, REEL_VIDEO_URL: videoUrl, REEL_CAPTION: caption, REEL_DRY_RUN: dryRun } = process.env;
  const token = lang ? igToken(lang) : undefined;
  const errors = reelInputErrors({ lang, videoUrl, caption, token });
  if (errors.length) throw new Error(errors.join(', '));
  const me = await whoami('instagram', token);
  console.log(`계정: @${me.username} (${lang})`);
  if (dryRun === 'true') {
    console.log('드라이런: 게시하지 않음');
    return;
  }
  const r = await publishInstagramReel({ token, videoUrl, caption });
  console.log(`게시됨${r.recovered ? '(이미 올라가 있던 게시물)' : ''}: ${r.url}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(String(e.message).slice(0, 500)); process.exit(1); });
}
