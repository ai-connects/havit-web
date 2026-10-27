/**
 * 본문 마크다운을 가운데 H2 앞에서 둘로 나눈다 — 그 사이에 본문 중간 설치 블록(MidArticleCTA)을 넣는다.
 * H2 가 3개 미만이면 나누지 않는다(짧은 글 중간에 끼우면 본문보다 광고가 먼저 읽힌다).
 * 코드 블록 안의 `## ` 는 제목이 아니므로 펜스 안은 건너뛴다.
 */
export function splitAtMiddleH2(md: string): string[] {
  const lines = md.split('\n');
  const h2: number[] = [];
  let fenced = false;
  lines.forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) fenced = !fenced;
    else if (!fenced && /^## /.test(l)) h2.push(i);
  });
  if (h2.length < 3) return [md];
  const at = h2[Math.floor(h2.length / 2)];
  return [lines.slice(0, at).join('\n'), lines.slice(at).join('\n')];
}
