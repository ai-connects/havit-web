// Claude 호출 클라이언트. 기본은 구독(Claude Code CLI `claude -p`), SOCIAL_LLM=api 면 API 키(@anthropic-ai/sdk).
// 구독 경로는 ANTHROPIC_API_KEY 를 지운 채 CLI 를 띄워 claude.ai 로그인(로컬) 또는 CLAUDE_CODE_OAUTH_TOKEN(CI)으로 청구된다.
// messages.create({ model, system, messages }) 의 단일 user 메시지(텍스트·이미지)만 지원 — 이 앱이 쓰는 모양 그대로.
import { spawn } from 'node:child_process';

export async function createClient() {
  if ((process.env.SOCIAL_LLM || 'cli') === 'api') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    return new Anthropic();
  }
  return { messages: { create: cliCreate } };
}

const TIMEOUT_MS = 10 * 60 * 1000;

async function cliCreate({ model, system, messages }) {
  if (messages.length !== 1 || messages[0].role !== 'user') throw new Error('claude-cli: user 메시지 1개만 지원');
  const sys = Array.isArray(system) ? system.map((b) => b.text || '').join('\n') : system || '';
  const args = ['-p', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose',
    '--model', model, '--tools', '', '--strict-mcp-config', '--no-session-persistence', '--setting-sources', 'project'];
  if (sys) args.push('--system-prompt', sys);
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY; // 남아 있으면 CLI 가 API 키로 청구한다
  for (let attempt = 0; ; attempt++) {
    try {
      const text = await run(args, env, JSON.stringify({ type: 'user', message: messages[0] }) + '\n');
      return { content: [{ type: 'text', text }], stop_reason: 'end_turn' };
    } catch (err) {
      if (attempt >= 2) throw err;
      await new Promise((r) => setTimeout(r, 15000 * (attempt + 1))); // 구독 사용량 한도·일시 오류는 잠깐 쉬고 재시도
    }
  }
}

function run(args, env, input) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.env.CLAUDE_BIN || 'claude', args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    const timer = setTimeout(() => { p.kill('SIGTERM'); reject(new Error('claude-cli 시간 초과')); }, TIMEOUT_MS);
    p.stdout.on('data', (b) => { out += b; });
    p.stderr.on('data', (b) => { err += b; });
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => {
      clearTimeout(timer);
      const result = out.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).find((m) => m?.type === 'result');
      if (!result || result.is_error) return reject(new Error(`claude-cli 실패(${code}): ${(result?.result || err || out).slice(0, 300)}`));
      resolve(result.result || '');
    });
    p.stdin.end(input);
  });
}
