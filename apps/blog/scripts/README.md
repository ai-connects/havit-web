# Article Generation Pipeline

batch-2에서 검증된 자연스러움 강화판 8-Phase 시스템 자동화.

## 구조

```
scripts/
├── types.ts              # 공유 타입
├── anthropic-client.ts   # Claude 호출 wrapper (구독 claude -p 기본, 재시도)
├── pipeline.ts           # 8-Phase 자동 실행 (한 article × 5 언어)
├── queue.ts              # 1,200 article 큐 매니저
├── discover-topics.ts    # content-discoverer 자동 (1,200 seed 발굴)
└── auto-commit.ts        # 결과를 git에 일괄 commit + push
```

## 사용법

### 1. 환경 변수 (`.env.local`)

기본은 Claude 구독(`claude` 로그인) — 키 불필요. API 키는 `BLOG_LLM=api` 로 명시했을 때만 `ANTHROPIC_API_KEY` 를 읽는다.

### 2. 1,200 topic seed 발굴 (1회만)

```bash
npm run discover
```

→ `data/article-seeds.json` 생성 (약 1,200건)

### 3. 큐 가동 (소규모 테스트)

```bash
# 1 배치 (10건)만 실행
npm run queue:batch
```

→ `data/articles/*.json` 생성, `data/queue-state.json` 진행 상태 기록

### 4. 전체 1,200건 실행

```bash
npm run queue
```

→ 약 24시간 (10 병렬 기준), Anthropic API 비용 $1.5~3K 추정

### 5. git commit + push

```bash
npm run commit:articles
```

→ 25개씩 묶어 commit, Vercel auto-deploy 트리거

### 6. 통합 실행 (큐 + 커밋)

```bash
npm run pipeline:run
```

## 진행 상태 확인

```bash
npm run queue:status
```

출력 예시:
```json
{
  "total": 1200,
  "completed": 145,
  "in_progress": 0,
  "pending": 1055,
  "failed": 0,
  "started_at": "2026-05-23T19:00:00Z",
  "last_run": "2026-05-23T21:45:00Z"
}
```

## 8-Phase 파이프라인 흐름

```
ArticleSeed (slug, category, type, keyword)
  │
  ├─ Phase 1+2: writer-en + writer-ko (병렬)
  │
  ├─ ┌── NATURALNESS LOOP (PASS까지 최대 3회) ──┐
  │  │ Phase 4: reviewNaturalness (8차원 N1-N8)
  │  │   REJECT → Phase 5: rewriteArticle → Phase 4 재실행
  │  │   PASS  → ↓
  │  └────────────────────────────────────────┘
  │
  ├─ Phase 3: localize JA/ZH/ES (en 기반)
  │   └─ 각 언어 naturalness 체크
  │
  └─ GeneratedArticle (5 언어 풀)
       └─ saveArticle → data/articles/{slug}.json
```

## 실패 처리

- 한 article 최대 3회 재시도
- 3회 실패 시 `status: "error"`로 마킹, 큐에서 제외
- 사용자가 수동 검토 후 `queue-state.json`에서 status 변경하면 재시도 가능

## 비용 추정

| 항목 | 비용 |
|------|------|
| discover-topics (1회) | $5~10 |
| writer-en + writer-ko (1,200 × 2) | $300~500 |
| naturalness loop (평균 1.5회) | $50~100 |
| localize × 3 (JA/ZH/ES) | $300~500 |
| **총** | **$650~1,100** |

> 5언어 × 1,200건 = 6,000 풀 article. Per article ~$0.5~1.

## 모니터링

```bash
# 실시간 진행률 (별도 terminal)
watch -n 5 'cat data/queue-state.json | python3 -m json.tool | head -10'
```

## 트러블슈팅

### Rate Limit (429)
- anthropic-client.ts가 자동 재시도 (지수 백오프, 최대 3회)
- 지속 시 BATCH_SIZE 5로 줄임 (`scripts/queue.ts`)

### JSON 파싱 실패
- 일부 응답이 JSON 외 텍스트 포함 → `extractJsonBlock`이 처리
- 그래도 실패 시 해당 article만 error 마킹, 큐 계속

### 메모리/디스크
- `data/articles/` = 약 60~120MB (1,200 × 5언어 × 10~20KB each)
- queue 진행 중 disk space 모니터링
