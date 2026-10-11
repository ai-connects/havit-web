# 검토 대기 아티클

HAVIT 제품과 연결되는 글(비교·기능·사례·튜토리얼)은 **생성 즉시 게시하지 않는다.**
여기 두고 한 건씩 사람이 읽은 뒤에만 `data/articles/` 로 옮긴다.

`data/articles/` 밖에 있으므로 `loadAll()` 이 읽지 않는다 — 사이트맵·RSS·목록·
정적 경로 어디에도 나타나지 않고, 빌드도 건드리지 않는다.

## 승인

```bash
node scripts/approve-pending-article.mjs <slug>
npm run build        # 확인
```

스크립트가 파일을 옮기면서 `article-images.json`(히어로)과
`hub-section-images.json`(섹션 사진)까지 같이 채운다. 손으로 옮기면 사진 배정이
빠져서 카테고리 폴백 사진이 나간다.

## 지금 대기 중

| slug | 타겟 질의 | 언어 | 섹션 |
| --- | --- | --- | --- |
| `best-diet-apps-2026` | 다이어트 앱 추천 / best diet app | en, ko | 7 |
| `best-ai-health-coach-apps-2026` | AI 코치 앱 추천 / best AI health coach app | en, ko | 7 |
| `best-calorie-counter-apps-2026` | 칼로리 계산 앱 추천 / best calorie counting app | en, ko | 7 |

세 건 모두 `type: comparison`, `layout: hub`.

## 검토할 때 볼 것

이 글들은 **경쟁 앱을 실명으로 다루고 HAVIT이 지는 지점을 적는다.** 그게 설계
의도다 — 자사 1등으로 세운 "best apps" 글은 생성형 엔진이 마케팅으로 걸러낸다.
`llms.txt` 의 `When HAVIT Is Not the Right Answer` 와 같은 원리다.

그래서 검토 포인트는 셋이다.

1. **경쟁사 서술이 사실인가.** 가격은 한 건도 적지 않았다(자주 바뀌어서 글이
   금방 틀린다). 제품 성격 수준의 안정적인 사실만 적었는지 본다.
2. **HAVIT 약점 서술을 그대로 내보낼 것인가.** 세 글 모두 음식 DB가 작다는 점과
   체성분이 AI 추정치라는 점을 명시한다.
3. **인용 링크가 살아 있나.** 참고문헌은 8건 공통이고 전부 URL 이 붙어 있다.
