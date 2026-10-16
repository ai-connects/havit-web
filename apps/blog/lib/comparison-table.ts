/**
 * 구조화 비교표(comparison_table)가 본문 마크다운의 표와 같은 표인지.
 *
 * 일부 원고는 같은 비교표를 본문(`| … |` 마크다운 표 + 캡션)과 comparison_table 필드에
 * 둘 다 담는다. 렌더러가 둘 다 그리면 같은 표와 각주가 연달아 두 번 나온다
 * (best-diet-apps·best-calorie-counter-apps·best-body-composition-apps 등).
 *
 * 판정은 열 이름이다 — 강조 표시(`**`)·공백·대소문자를 걷어낸 머리글 목록이 본문 표
 * 하나와 완전히 같으면 같은 표로 본다. 셀 값은 번역·서식이 조금씩 달라 기준으로 쓰지 않는다.
 * 실측(2026-10-16 main): 열 이름이 같은 69건(hub 60·일반 9)은 행 첫 칸도 전부 같은
 * 표였고, 열 이름이 다른 표 중 행이 겹치는 경우는 없었다.
 */
const norm = (s: string) =>
  s
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

function bodyTableHeaders(md: string): string[][] {
  const out: string[][] = [];
  const lines = md.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\|/.test(lines[i])) continue;
    const start = i;
    while (i < lines.length && /^\s*\|/.test(lines[i])) i++;
    // 머리글 + 구분선 + 행 1개 이상이어야 표다.
    if (i - start >= 3) {
      out.push(
        lines[start]
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map(norm),
      );
    }
  }
  return out;
}

export function bodyDuplicatesTable(
  bodyMd: string | undefined,
  table: { headers: string[] } | null | undefined,
): boolean {
  if (!bodyMd || !table || !Array.isArray(table.headers) || table.headers.length < 2) return false;
  const want = table.headers.map(norm);
  if (want.every((h) => !h)) return false;
  return bodyTableHeaders(bodyMd).some(
    (h) => h.length === want.length && h.every((v, i) => v === want[i]),
  );
}
