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

명상 시리즈 8편 (2026-10-24, `type: guide`). 허브 1 + 앱 명상 5개 카테고리(호흡·이완 / 수면 / 집중·아침 활력 / 자기연민·감사 / 식욕·갈망)에 맞춘 7편.

| slug | 타겟 질의 | 언어 | h2 |
| --- | --- | --- | --- |
| `guided-meditation-weight-loss-healthy-habits-guide-2026` | 다이어트 명상 / guided meditation for weight loss | 10개 언어 | 7 |
| `meditation-for-food-cravings-5-minute-practice-2026` | 식욕 갈망 명상 / meditation for food cravings | 10개 언어 | 7 |
| `meditation-for-emotional-stress-eating-2026` | 감정적 폭식 명상 / meditation for emotional eating | 10개 언어 | 8 |
| `body-scan-sleep-meditation-10-minute-guide-2026` | 수면 명상 바디스캔 / body scan meditation for sleep | 10개 언어 | 7 |
| `breathing-relaxation-meditation-stress-anxiety-2026` | 스트레스 불안 호흡 명상 / relaxation meditation for stress and anxiety | 10개 언어 | 8 |
| `morning-meditation-focus-energy-5-minute-2026` | 아침 명상 집중력 / morning meditation for focus and energy | 10개 언어 | 7 |
| `self-compassion-meditation-weight-loss-motivation-2026` | 자기연민 명상 / self-compassion meditation | 10개 언어 | 7 |
| `meditation-for-beginners-5-minutes-anywhere-2026` | 초보자 명상 5분 / meditation for beginners | 10개 언어 | 8 |

명상 시리즈 검토 포인트: 참고문헌은 PubMed 에서 받은 실재 논문만(DOI·제목·저널·연도 일치를 스크립트로 검증), 본문의 연도·저널은 참고문헌 것만 허용. 초록에 결과가 없는 논문은 설계·가설까지만 서술. HAVIT 섹션은 앱 코드로 확인한 사실(명상 5개 카테고리, 시작 시 카테고리 선택)만 — 가격·세션 수 없음. **앱 명상 음원의 출처(저작권) 확인 전에는 게시 보류 권장.**

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
