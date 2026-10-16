/**
 * 강조 마크다운(`**굵게**`, `*기울임*`)이 화면에 별표 그대로 남는 문제를 렌더 단계에서 고친다.
 *
 * 왜 생기나
 * ────────
 * CommonMark 는 `**` 가 닫히려면 "오른쪽 플랭킹"이어야 한다 — 앞 글자가 구두점이면 뒤가
 * 공백이나 구두점이어야 한다. 그래서 `**결론。**다음 문장` · `**「확인」**를` 처럼 CJK
 * 구두점 뒤에서 닫고 바로 글자가 붙는 한·중·일 원고는 강조가 열리지도 닫히지도 않는다.
 * 영어는 띄어쓰기가 있어 거의 안 걸리지만, 중국어는 문장마다 걸린다(실측 편당 9~16회).
 *
 * 그래서 파서가 남긴 **짝 맞는 별표만** 같은 부모(문단·셀·제목) 안에서 다시 짝지어
 * strong/emphasis 로 감싼다. 이미 정상 파싱된 강조는 텍스트에 별표가 남지 않으니
 * 손대지 않는다 — 기존 정상 페이지 출력이 바뀌지 않는 이유다.
 *
 * 짝을 못 찾은 별표(각주 표시 `None observed*`, `ADH1B*2`)는 그대로 둔다.
 */
import { createElement, Fragment, type ReactNode } from 'react';

type MdNode = { type: string; value?: string; children?: MdNode[] };

const WS = /\s/;
/** 홑별표는 영숫자 사이(`ADH1B*2`, `5*3`)에서 강조로 보지 않는다. CJK 는 해당 없음. */
const ASCII_WORD = /[A-Za-z0-9]/;

type Tok =
  | { kind: 'node'; node: MdNode }
  | { kind: 'delim'; open: boolean; close: boolean; mate?: number; role?: 'open' | 'close' };

function delimRegex(delim: '**' | '*'): RegExp {
  return delim === '**' ? /(?<!\*)\*\*(?!\*)/g : /(?<!\*)\*(?!\*)/g;
}

/**
 * 토큰 배열에서 여는/닫는 별표를 가장 가까운 것끼리 짝짓는다.
 * 빈 강조(`****`)와 공백으로 시작·끝나는 강조는 만들지 않는다.
 */
function pair(toks: Tok[]): void {
  const stack: number[] = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.kind !== 'delim') continue;
    if (t.close && stack.length) {
      const o = stack[stack.length - 1];
      if (o < i - 1) {
        stack.pop();
        (toks[o] as Extract<Tok, { kind: 'delim' }>).mate = i;
        (toks[o] as Extract<Tok, { kind: 'delim' }>).role = 'open';
        t.mate = o;
        t.role = 'close';
        continue;
      }
    }
    if (t.open) stack.push(i);
  }
}

/** 문자열 하나를 텍스트/구분자 조각으로 나눈다. prev/next 는 문자열 밖 이웃 글자. */
function splitText(
  value: string,
  delim: '**' | '*',
  prev: string | null,
  next: string | null,
): Array<{ text: string } | { open: boolean; close: boolean }> {
  const out: Array<{ text: string } | { open: boolean; close: boolean }> = [];
  const re = delimRegex(delim);
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) {
    const before = m.index > 0 ? value[m.index - 1] : prev;
    const afterIdx = m.index + m[0].length;
    const after = afterIdx < value.length ? value[afterIdx] : next;
    let open = after !== null && !WS.test(after);
    let close = before !== null && !WS.test(before);
    if (delim === '*') {
      // 단어 안의 홑별표는 강조가 아니다(곱셈·변이형 표기·각주).
      if (before !== null && ASCII_WORD.test(before)) open = false;
      if (after !== null && ASCII_WORD.test(after)) close = false;
    }
    if (m.index > last) out.push({ text: value.slice(last, m.index) });
    out.push({ open, close });
    last = afterIdx;
  }
  if (last < value.length) out.push({ text: value.slice(last) });
  return out;
}

/* ─────────────── mdast(remark) 플러그인 ─────────────── */

/** 이웃 노드의 경계 글자. 텍스트가 아니면(링크·코드 등) 공백 아닌 글자로 본다. */
function edgeChar(node: MdNode | undefined, side: 'start' | 'end'): string | null {
  if (!node) return null;
  if (node.type === 'text') {
    const v = node.value ?? '';
    if (!v) return null;
    return side === 'start' ? v[0] : v[v.length - 1];
  }
  return 'x';
}

function repairLevel(parent: MdNode, delim: '**' | '*', type: 'strong' | 'emphasis'): void {
  const kids = parent.children;
  if (!kids || !kids.some((k) => k.type === 'text' && (k.value ?? '').includes('*'))) return;

  const toks: Tok[] = [];
  kids.forEach((k, idx) => {
    if (k.type !== 'text' || !(k.value ?? '').includes('*')) {
      toks.push({ kind: 'node', node: k });
      return;
    }
    const pieces = splitText(k.value ?? '', delim, edgeChar(kids[idx - 1], 'end'), edgeChar(kids[idx + 1], 'start'));
    for (const p of pieces) {
      if ('text' in p) toks.push({ kind: 'node', node: { type: 'text', value: p.text } });
      else toks.push({ kind: 'delim', open: p.open, close: p.close });
    }
  });
  pair(toks);
  if (!toks.some((t) => t.kind === 'delim' && t.role)) return;

  const build = (from: number, to: number): MdNode[] => {
    const out: MdNode[] = [];
    const pushText = (v: string) => {
      const lastNode = out[out.length - 1];
      if (lastNode && lastNode.type === 'text') lastNode.value = (lastNode.value ?? '') + v;
      else out.push({ type: 'text', value: v });
    };
    let i = from;
    while (i < to) {
      const t = toks[i];
      if (t.kind === 'node') {
        if (t.node.type === 'text') pushText(t.node.value ?? '');
        else out.push(t.node);
        i++;
      } else if (t.role === 'open' && t.mate !== undefined) {
        out.push({ type, children: build(i + 1, t.mate) });
        i = t.mate + 1;
      } else {
        pushText(delim);
        i++;
      }
    }
    return out;
  };
  parent.children = build(0, toks.length);
}

function repairTree(node: MdNode): void {
  if (!node.children) return;
  for (const c of node.children) repairTree(c);
  repairLevel(node, '**', 'strong');
  repairLevel(node, '*', 'emphasis');
  // 굵게를 감싸면서 새로 생긴 strong 안쪽의 기울임도 마저 본다.
  for (const c of node.children) if (c.type === 'strong' || c.type === 'emphasis') repairLevel(c, '*', 'emphasis');
}

/** react-markdown `remarkPlugins` 에 넣는다. remark-gfm 뒤에 둘 것. */
export function remarkRepairEmphasis() {
  return (tree: MdNode) => {
    repairTree(tree);
  };
}

/* ─────────────── 일반 문자열(마크다운으로 렌더하지 않는 필드)용 ─────────────── */

/**
 * tldr·FAQ 답변·참고문헌·비교표 셀처럼 마크다운 파서를 거치지 않고 텍스트로 찍는 필드용.
 * 목록·제목 같은 블록 문법은 해석하지 않는다 — 여기서 하는 일은 짝 맞는 `**`/`*` 를
 * strong/em 으로 바꾸는 것뿐이다. 별표가 없으면 문자열을 그대로 돌려준다.
 */
export function renderEmphasis(text: string, strongClass?: string): ReactNode {
  if (!text || !text.includes('*')) return text;
  let key = 0;
  const run = (s: string, delim: '**' | '*'): ReactNode[] => {
    const pieces = splitText(s, delim, null, null);
    const toks: Tok[] = pieces.map((p) =>
      'text' in p
        ? { kind: 'node' as const, node: { type: 'text', value: p.text } }
        : { kind: 'delim' as const, open: p.open, close: p.close },
    );
    pair(toks);
    const out: ReactNode[] = [];
    const inner = (from: number, to: number): string =>
      toks
        .slice(from, to)
        .map((t) => (t.kind === 'node' ? t.node.value ?? '' : delim))
        .join('');
    const plain = (v: string) => (delim === '**' ? run(v, '*') : [v]);
    let buf = '';
    let i = 0;
    while (i < toks.length) {
      const t = toks[i];
      if (t.kind === 'delim' && t.role === 'open' && t.mate !== undefined) {
        if (buf) out.push(...plain(buf));
        buf = '';
        const body = inner(i + 1, t.mate);
        out.push(
          delim === '**'
            ? createElement('strong', { key: key++, className: strongClass }, ...run(body, '*'))
            : createElement('em', { key: key++ }, body),
        );
        i = t.mate + 1;
      } else {
        buf += t.kind === 'node' ? t.node.value ?? '' : delim;
        i++;
      }
    }
    if (buf) out.push(...plain(buf));
    return out;
  };
  const nodes = run(text, '**');
  return createElement(Fragment, null, ...nodes);
}

/**
 * 짝이 맞는 강조 구간(문자 오프셋, 구분자 포함)을 돌려준다. 문단을 문장 단위로 쪼갤 때
 * 이 구간 안에서는 자르지 않는다 — `**첫 문장. 둘째 문장.**` 을 둘로 나누면 양쪽 모두
 * 별표가 짝을 잃고 그대로 노출된다.
 */
export function emphasisSpans(text: string): Array<[number, number]> {
  if (!text.includes('*')) return [];
  const spans: Array<[number, number]> = [];
  const scan = (s: string, delim: '**' | '*') => {
    const re = delimRegex(delim);
    const pos: number[] = [];
    const toks: Tok[] = [];
    for (const p of splitText(s, delim, null, null)) {
      if ('text' in p) toks.push({ kind: 'node', node: { type: 'text', value: p.text } });
      else toks.push({ kind: 'delim', open: p.open, close: p.close });
    }
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) pos.push(m.index);
    pair(toks);
    let d = 0;
    const idxOf: number[] = [];
    toks.forEach((t) => idxOf.push(t.kind === 'delim' ? pos[d++] : -1));
    toks.forEach((t, i) => {
      if (t.kind === 'delim' && t.role === 'open' && t.mate !== undefined) {
        spans.push([idxOf[i], idxOf[t.mate] + delim.length]);
      }
    });
  };
  scan(text, '**');
  // 굵게 구분자를 같은 길이의 비별표 글자로 가려 홑별표 판정에 섞이지 않게 한다.
  scan(text.replace(/(?<!\*)\*\*(?!\*)/g, '\u0000\u0000'), '*');
  return spans;
}
