# 검토 대기 아티클

HAVIT 제품과 연결되는 글(비교·기능·사례·튜토리얼)은 **생성 즉시 게시하지 않는다.**
여기 두고 한 건씩 사람이 읽은 뒤에만 `data/articles/` 로 옮긴다.

`data/articles/` 밖이라 `lib/articles-v2.ts` 의 `ARTICLES_DIR` 이 읽지 않는다 —
사이트맵·RSS·목록·관련글·정적 경로 어디에도 나타나지 않는다.

## 승인

```bash
node scripts/approve-pending-article.mjs <slug>
npm run build        # 확인
```

스크립트가 **사진 맵 두 개를 먼저 쓰고** 파일 이동을 마지막에 한다. 반대로 하면
중간에 실패했을 때 "아티클은 공개됐는데 사진 배정은 없는" 상태가 남고, 재실행도
막힌다. 손으로 옮기면 그 상태가 그대로 된다 — 카테고리 폴백 사진이 나간다.

## 지금 대기 중

| slug | 타겟 질의 | 언어 | h2 |
| --- | --- | --- | --- |
| `best-diet-apps-2026` | 다이어트 앱 추천 / best diet app | en, ko | 7 |
| `best-ai-health-coach-apps-2026` | AI 코치 앱 추천 / best AI health coach app | en, ko | 7 |
| `best-calorie-counter-apps-2026` | 칼로리 계산 앱 추천 / best calorie counting app | en, ko | 7 |
| `best-food-logging-apps-2026` | 식단 기록 앱 추천 / best food logging app | en, ko | 7 |
| `best-body-composition-apps-2026` | 체성분 측정 앱 추천 / body composition app | en, ko | 7 |
| `best-habit-tracker-weight-loss-2026` | 다이어트 습관 앱 추천 / habit tracker for weight loss | en, ko | 8 |

전부 `type: comparison`, `layout: hub`.

## 검토할 때 볼 것

이 글들은 **경쟁 앱을 실명으로 다루고 HAVIT이 지는 지점을 적는다.** 그게 설계
의도다 — 자사 1등으로 세운 "best apps" 글은 생성형 엔진이 마케팅으로 걸러낸다.
`llms.txt` 의 `When HAVIT Is Not the Right Answer` 와 같은 원리다.

1. **경쟁사 서술이 사실인가.** 가격은 한 건도 적지 않았다(자주 바뀌어 글이 금방
   틀린다). 제품 성격 수준의 안정적인 사실만 적었고, 표마다 "2026년 10월 기준"을
   명시했다. Simple.Life 는 우리 라이브 글(`havit-vs-myfitnesspal-noom-simple-2026`)이
   "체성분 평가 없음"이라고 적고 있어 체성분 행에서 뺐다.
2. **HAVIT 약점 서술을 그대로 내보낼 것인가.** 글마다 **그 글의 축에서** 진다.
   칼로리 글은 음식 DB 크기, 체성분 글은 AI 추정치(n=70 내부 비교), 코치 글은
   "기록한 만큼만 좋아진다".
3. **인용이 출처와 맞는가.** 참고문헌은 글마다 다르고, 본문에서 실제로 인용한
   것만 싣는다. 숫자는 출처 원문과 대조했다 — Neeland 2024 는 "40~60% 또는 15%
   이하"(연구 간 편차)이고 **제지방은 근육과 같은 말이 아니다**, Burke 2011 은
   22건 중 15건이 식단 기록이며 **저자들이 근거 수준을 약하다고 평가**했다.
