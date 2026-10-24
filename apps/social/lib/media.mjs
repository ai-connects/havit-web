// 렌더 PNG → JPEG(Instagram 피드는 JPEG 만) → S3 공개 URL. Meta API 는 공개 URL 의 이미지만 가져간다.
// 환경 변수: SOCIAL_MEDIA_BUCKET(기본 havit-prod-us-east), SOCIAL_MEDIA_PREFIX(기본 image/sns), AWS_REGION(기본 us-east-1)
// 앱 아티클 이미지가 이미 같은 버킷의 image/ 아래에서 공개로 서빙된다.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const BUCKET = process.env.SOCIAL_MEDIA_BUCKET || 'havit-prod-us-east';
const PREFIX = process.env.SOCIAL_MEDIA_PREFIX || 'image/sns';
const REGION = process.env.AWS_REGION || 'us-east-1';

export function toJpeg(png) {
  const jpg = png.replace(/\.png$/, '.jpg');
  if (process.platform === 'darwin') execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '90', png, '--out', jpg], { stdio: 'ignore' });
  else execFileSync('convert', [png, '-quality', '90', jpg], { stdio: 'ignore' }); // ubuntu 러너 ImageMagick
  return jpg;
}

/** key 예: 2026-11-02/instagram-ko-<slug>/01.jpg */
export function upload(file, key) {
  const dest = `s3://${BUCKET}/${PREFIX}/${key}`;
  execFileSync('aws', ['s3', 'cp', file, dest, '--content-type', 'image/jpeg', '--cache-control', 'public, max-age=31536000', '--region', REGION], { stdio: 'ignore' });
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${PREFIX}/${key}`;
}

export function hostImages(dir, draftFile, images) {
  const base = `${path.basename(dir)}/${path.basename(draftFile, '.json')}`;
  return images.map((rel, i) => upload(toJpeg(path.join(dir, rel)), `${base}/${String(i + 1).padStart(2, '0')}.jpg`));
}
