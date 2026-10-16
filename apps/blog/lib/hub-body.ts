/**
 * GLP-1 허브 아티클 본문 파서.
 *
 * 왜 react-markdown 을 그대로 쓰지 않는가
 * ────────────────────────────────────
 * 허브 원고를 마크다운 그대로 흘리면 "긴 글"로 읽힌다. 마케팅 사이트의
 * protein-tracker-glp1 페이지와 실측 비교하면 분량은 비슷한데(2,450 vs 1,911단어)
 * 덩어리 크기가 다르다.
 *   레퍼런스     : 문단 70개 / 평균 134자 / 300자 넘는 문단 7%
 *   원고 그대로  : 문단 39개 / 평균 204자 / 300자 넘는 문단 23%
 * 원고 한 문단이 서너 문장을 담고 있어서다. 그래서 블록으로 파싱한 뒤
 *   - 긴 문단은 문장 경계로 쪼개고
 *   - "**제목** 설명" 꼴 목록은 카드/스텝 컴포넌트로 승격시킨다.
 */

import { emphasisSpans } from './emphasis';

export type HubBlock =
  | { type: 'para'; text: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'heading'; level: 3 | 4; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'steps'; items: Array<{ title: string; body: string }> }
  | { type: 'cards'; items: Array<{ title: string; body: string }> }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'quote'; text: string }
  | { type: 'caption'; text: string };

export interface HubSection {
  title: string;
  id: string;
  blocks: HubBlock[];
}

export interface HubBody {
  lead: HubBlock[];
  sections: HubSection[];
}

/** 문단 목표 길이. 레퍼런스 실측 평균(134자)에 맞춘 상한. */
const TARGET_PARA = 190;

/**
 * "**제목** 설명" 분리는 굵게가 진짜 제목일 때만 안전하다.
 * 한국어 원고는 굵게가 문장 속 어간인 경우가 많아(`**소량·자주 식사**를 하고…`)
 * 무조건 자르면 "제한" + "합니다" 처럼 단어 중간이 끊긴다. 그래서
 * (a) 굵게가 구두점으로 끝나거나 (b) 뒤가 비었거나 (c) 대시로 분리된 경우만
 * 제목으로 인정한다. 원고 실측 1,162건 중 888건이 여기 해당.
 */
export function safeBoldLead(raw: string): { title: string; body: string } | null {
  const m = raw.trim().match(/^\*\*([^*]+?)\*\*([\s\S]*)$/);
  if (!m) return null;
  const title = m[1].trim();
  const rest = m[2].trim();
  const endsSentence = /[:：.?!。]$/.test(title);
  const dashed = /^[—–-]\s/.test(rest);
  if (!endsSentence && rest && !dashed) return null;
  return {
    title: title.replace(/[:：]$/, ''),
    body: dashed ? rest.replace(/^[—–-]\s*/, '') : rest,
  };
}

function boldLeadRatio(items: string[]): number {
  if (items.length < 3) return 0;
  return items.filter((t) => safeBoldLead(t)).length / items.length;
}

/**
 * 긴 문단을 문장 경계로 쪼갠다.
 * 한국어는 '다./요.' 뒤, 영어는 '. ' 뒤. 소수점·약어(vs. 등)는 피한다.
 */
export function splitParagraph(text: string): string[] {
  if (text.length <= TARGET_PARA) return [text];
  const rawParts = text.split(/(?<=[다요]\.|[a-z0-9)][.!?])\s+(?=[가-힣A-Z“"(])/);
  if (rawParts.length < 2) return [text];
  // 강조(`**…**`, `*…*`)가 여러 문장에 걸쳐 있으면 그 안에서는 자르지 않는다.
  // 자르면 양쪽 조각 모두 별표가 짝을 잃어 화면에 그대로 찍힌다(en 원문에도 있던 노출).
  // 강조가 없는 문단은 종전과 똑같이 나뉜다.
  // 링크(`[글](/en/x)`)도 같다 — 링크 글자 안의 "vs." 에서 잘려 대괄호가 그대로 보였다.
  const spans = emphasisSpans(text);
  for (const m of text.matchAll(/\[[^\]]*\]\([^)\s]*\)/g)) spans.push([m.index ?? 0, (m.index ?? 0) + m[0].length]);
  const parts: string[] = [];
  let offset = 0;
  for (const part of rawParts) {
    const start = text.indexOf(part, offset);
    const inside = spans.some(([s0, s1]) => s0 < start && start < s1);
    if (inside && parts.length) parts[parts.length - 1] += text.slice(offset, start) + part;
    else parts.push(part);
    offset = start + part.length;
  }
  if (parts.length < 2) return [text];
  const out: string[] = [];
  let buf = '';
  for (const part of parts) {
    if (!buf) buf = part;
    else if ((buf + ' ' + part).length <= TARGET_PARA) buf += ' ' + part;
    else {
      out.push(buf);
      buf = part;
    }
  }
  if (buf) out.push(buf);
  return out;
}

export function headingId(text: string): string {
  return (
    's-' +
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  );
}

function parseBlocks(lines: string[]): HubBlock[] {
  const out: HubBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^---+\s*$/.test(line)) {
      i++;
      continue;
    }

    const h = line.match(/^(#{3,6})\s+(.*)$/);
    if (h) {
      out.push({ type: 'heading', level: h[1].length === 3 ? 3 : 4, text: h[2].trim() });
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push({ type: 'quote', text: buf.join(' ').trim() });
      continue;
    }

    if (/^\s*\|/.test(line)) {
      const rows: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      if (rows.length >= 3) {
        const cells = (r: string) =>
          r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        out.push({
          type: 'table',
          headers: cells(rows[0]),
          rows: rows.slice(1).filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r)).map(cells),
        });
      }
      continue;
    }

    const ol = /^\s*\d+\.\s+/.test(line);
    const ul = /^\s*[-*]\s+/.test(line);
    if (ol || ul) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(ol ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*]\s+(.*)$/);
        if (m) {
          items.push(m[1]);
          i++;
          continue;
        }
        if (/^\s{2,}\S/.test(lines[i]) && items.length) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
          continue;
        }
        break;
      }
      const ratio = boldLeadRatio(items);
      if (ratio >= 0.6) {
        const parsed = items.map((t) => safeBoldLead(t) ?? { title: '', body: t });
        out.push({ type: ol ? 'steps' : 'cards', items: parsed });
      } else {
        out.push({ type: 'list', ordered: ol, items });
      }
      continue;
    }

    /**
     * 한 줄이 통째로 `![alt](src)` 면 이미지 블록.
     *
     * 섹션 사진(hub-section-images.json)은 섹션당 1장·홀수 인덱스에만 붙고,
     * 표가 있는 섹션은 아예 건너뛴다. 앱을 하나씩 소개하는 글에서는 그 규칙으로
     * 사진을 한 장도 못 붙인다 — 앱 섹션마다 표가 들어가기 때문이다.
     * 그래서 원고가 직접 위치를 지정할 수 있는 경로를 둔다.
     */
    const img = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      out.push({ type: 'image', alt: img[1], src: img[2] });
      i++;
      continue;
    }

    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{3,6}\s|>|\s*\||\s*[-*]\s|\s*\d+\.\s|---+\s*$|!\[)/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    const text = buf.join(' ').trim();
    // 통째로 이탤릭인 줄은 보조 캡션 — 본문과 같은 크기로 두면 리듬이 죽는다.
    // "첫 별표와 끝 별표가 서로 짝"일 때만 캡션이다. `*앞 문장。* **굵게** … *끝 문장。*` 처럼
    // 별표로 시작·끝나기만 하는 문단을 캡션으로 보고 양끝만 벗기면 가운데 별표가 짝을 잃었다.
    if (/^\*[^*].*\*$/.test(text) && emphasisSpans(text).some(([a, b]) => a === 0 && b === text.length))
      out.push({ type: 'caption', text: text.replace(/^\*|\*$/g, '') });
    else for (const chunk of splitParagraph(text)) out.push({ type: 'para', text: chunk });
  }
  return out;
}

/** body_md → 리드 + h2 섹션들. */
export function parseHubBody(md: string): HubBody {
  const lines = md.split(/\r?\n/);
  const leadLines: string[] = [];
  const groups: Array<{ title: string; lines: string[] }> = [];
  let cur: { title: string; lines: string[] } | null = null;
  for (const line of lines) {
    const h2 = line.match(/^##\s+(?!#)(.*)$/);
    if (h2) {
      cur = { title: h2[1].trim(), lines: [] };
      groups.push(cur);
      continue;
    }
    (cur ? cur.lines : leadLines).push(line);
  }
  return {
    lead: parseBlocks(leadLines),
    sections: groups.map((g) => ({
      title: g.title,
      id: headingId(g.title),
      blocks: parseBlocks(g.lines),
    })),
  };
}
