/**
 * Anthropic Claude API 호출 wrapper.
 * - claude-opus-4-7 (1M context) 사용
 * - prompt caching 활용 (시스템 프롬프트 재사용)
 * - rate limit 처리 (지수 백오프)
 */

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-4-5'; // 가용 모델 — opus 4.7이 아직 API에 없으면 fallback
const MAX_TOKENS = 8192;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY env var not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface CompletionOptions {
  system?: string;
  user: string;
  maxTokens?: number;
  /** null omits the param (newer models reject `temperature`). */
  temperature?: number | null;
  /** Reasoning effort (output_config.effort); omitted when unset. 'low' keeps thinking from eating max_tokens on bulk JSON tasks. */
  effort?: 'low' | 'medium' | 'high';
  cacheSystem?: boolean;
  /** Override the default Opus model (e.g. 'claude-sonnet-4-5' for cost). */
  model?: string;
}

export async function complete(opts: CompletionOptions): Promise<string> {
  const { system, user, maxTokens = MAX_TOKENS, temperature = 0.7, cacheSystem = true, model = MODEL, effort } = opts;
  const effortParam = effort ? ({ output_config: { effort } } as Record<string, unknown>) : {};
  const c = getClient();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const systemBlocks: Anthropic.Messages.TextBlockParam[] | undefined = system
        ? [
            {
              type: 'text',
              text: system,
              ...(cacheSystem ? { cache_control: { type: 'ephemeral' } } : {}),
            } as Anthropic.Messages.TextBlockParam,
          ]
        : undefined;

      // Long requests (>16K maxTokens or estimated >10min) require streaming per
      // anthropic-sdk. Use stream API and accumulate text from final message.
      const useStream = maxTokens > 16000;

      if (useStream) {
        const stream = c.messages.stream({
          model,
          max_tokens: maxTokens,
          ...(temperature != null ? { temperature } : {}),
          ...effortParam,
          ...(systemBlocks ? { system: systemBlocks } : {}),
          messages: [{ role: 'user', content: user }],
        });
        const final = await stream.finalMessage();
        const text = final.content
          .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('\n');
        return text;
      }

      const response = await c.messages.create({
        model,
        max_tokens: maxTokens,
        ...(temperature != null ? { temperature } : {}),
        ...effortParam,
        ...(systemBlocks ? { system: systemBlocks } : {}),
        messages: [{ role: 'user', content: user }],
      });

      const text = response.content
        .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n');

      return text;
    } catch (error: any) {
      const isRetryable =
        error?.status === 429 ||
        error?.status === 503 ||
        error?.status === 500 ||
        error?.message?.toLowerCase()?.includes('overloaded');

      if (isRetryable && attempt < MAX_RETRIES - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[anthropic] retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms: ${error.message}`);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw new Error('Anthropic API: max retries exceeded');
}

export function extractJsonBlock(text: string): string {
  // 1) ```json ... ``` 또는 ``` ... ``` 코드 펜스
  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenced) return fenced[1].trim();

  // 2) Array 응답 우선 — [ 가 { 보다 먼저 나오면 array로 처리
  const firstBracket = text.indexOf('[');
  const firstBrace = text.indexOf('{');
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    const lastBracket = text.lastIndexOf(']');
    if (lastBracket > firstBracket) {
      return text.slice(firstBracket, lastBracket + 1).trim();
    }
  }

  // 3) Object 응답 — 첫 { 부터 마지막 } 까지
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text.trim();
}

/**
 * 안전한 JSON parse — 실패 시 일반적인 LLM 응답 문제들을 자동 수정.
 */
export function safeJsonParse<T>(text: string): T {
  const cleaned = extractJsonBlock(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (e1) {
    // Try common LLM JSON issues
    try {
      const fixed = cleaned
        .replace(/,(\s*[}\]])/g, '$1') // trailing comma
        .replace(/\\\\n/g, '\\n') // double escape
        .replace(/\n\s*\/\/[^\n]*/g, ''); // // 주석 제거
      return JSON.parse(fixed) as T;
    } catch {
      // Try fixing unescaped quotes within string values (LLM이 본문 안에 " 를 그대로 쓰는 경우)
      try {
        const fixed = fixUnescapedQuotes(cleaned);
        return JSON.parse(fixed) as T;
      } catch {
        // 마지막 시도: } 까지만 잘라서 parse
        const truncated = cleaned.replace(/,?\s*$/, '');
        try {
          return JSON.parse(truncated) as T;
        } catch {
          throw e1;
        }
      }
    }
  }
}

/**
 * String value 안에 escape 안 된 double-quote를 추정으로 escape.
 * LLM이 markdown body에 quote를 안 escape 하는 흔한 케이스 대응.
 *
 * 알고리즘:
 *   "key": "...val with " quote inside..." → "key": "...val with \" quote inside..."
 *
 * 단순한 휴리스틱이라 모든 케이스 잡진 못함. 안 잡히는 건 retry로 처리.
 */
function fixUnescapedQuotes(json: string): string {
  // value 시작 ": " 부터 끝 " (다음에 ,\n 또는 }\n 또는 ]\n) 까지 추출 후 내부 " escape
  // 위험: 너무 aggressive하면 valid JSON도 깨짐. 보수적으로.
  let result = '';
  let i = 0;
  let inString = false;
  let escapeNext = false;
  let stringStart = -1;
  let depth = 0;

  while (i < json.length) {
    const c = json[i];

    if (escapeNext) {
      result += c;
      escapeNext = false;
      i++;
      continue;
    }

    if (c === '\\') {
      result += c;
      escapeNext = true;
      i++;
      continue;
    }

    if (c === '"' && !inString) {
      inString = true;
      stringStart = i;
      result += c;
      i++;
      continue;
    }

    if (c === '"' && inString) {
      // 닫는 " 인지 안에 escape 누락 " 인지 판정
      // 다음 non-whitespace 가 : , } ] \n 중 하나면 닫는 ", 아니면 escape 누락
      let j = i + 1;
      while (j < json.length && /\s/.test(json[j])) j++;
      const next = json[j];
      if (next === ':' || next === ',' || next === '}' || next === ']' || next === undefined) {
        // 닫는 quote
        inString = false;
        result += c;
      } else {
        // escape 누락
        result += '\\"';
      }
      i++;
      continue;
    }

    if (!inString) {
      if (c === '{' || c === '[') depth++;
      if (c === '}' || c === ']') depth--;
    }

    result += c;
    i++;
  }

  return result;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
