# HAVIT SNS 초안 생성기

블로그의 **검증된 글**을 Threads · Instagram · Facebook · LinkedIn 용 ko/ja/en 포스트 초안으로 바꾸고, 발행 전에 기계 검사를 한다. **발행은 사람이 승인한 초안만** 한다(완전 무인 발행 금지).

```
plan.mjs      계정(채널×언어)별 주당 빈도로 2주 계획 → queue/plan-<시작일>.json
generate.mjs  계획 슬롯마다 Claude 로 초안 → 검사(실패 시 1회 재생성) → queue/<날짜>/*.json (approved:false)
lint.mjs      사람이 고친 초안 재검사
approve.mjs   검토 후 일괄 승인(PASS 만, --except/--only 로 제외·선택)
render.mjs    초안 → 이미지(PNG 1080×1350): IG 는 슬라이드마다, 나머지는 카드 1장
review_html.mjs  이미지 포함 검토 페이지
```

이미지는 설치된 Chrome 헤드리스로 렌더한다(추가 의존성 없음, `CHROME_BIN` 으로 경로 변경). 재료는 브랜드 컬러(라임 #D4FF50·검정)·HAVI 캐릭터(`web/public/cta`)·블로그 대표 사진(앱 아티클 사진 라이브러리)뿐이고, 이미지 속 글은 lint 를 통과한 초안 문구만 쓴다. AI 이미지 생성은 쓰지 않는다(건강 콘텐츠의 사실성·브랜드 일관성).

API 키 없이 돌릴 때(에이전트·사람이 초안을 쓰는 경우): `dump_prompts.mjs` 로 슬롯별 프롬프트를 떨구고, 출력 JSON 을 `<id>.out.json` 으로 둔 뒤 `import_drafts.mjs` 로 큐에 넣는다.

```bash
cd apps/social
npm install
node plan.mjs 2026-10-26 2
ANTHROPIC_API_KEY=... node generate.mjs queue/plan-2026-10-26.json --date 2026-10-26
node generate.mjs queue/plan-2026-10-26.json --dry   # 프롬프트만 확인
npm test
```

## 계정 매트릭스 (config/channels.json)

| 채널 | 언어 | 주당 |
|---|---|---|
| Threads | 블로그 10개 언어(ko·ja·en·zh-tw·zh·es·pt-br·id·de·fr) 언어별 계정 | 7(매일) |
| Instagram | 같은 10개 언어별 계정 (ko = `havit_app`) | 7(매일) |
| Facebook 페이지 | en | 3 |
| LinkedIn 회사 페이지 | en | 2 |
| LinkedIn 창업자 개인 | ko · en | 2 |

한 포스트에 여러 언어를 섞지 않는다(이용자 패널 6명 전원 반대, 모르는 언어가 섞이면 언팔).

## 소스 게이트 (config/sources.json)

오래된 블로그 글에는 지어낸 연구 인용이 섞여 있다. SNS 는 **인용 검증이 끝난 글만** 쓴다(참고문헌 파일럿, AI 노출 상위 인용 교정, 명상 시리즈). 인용 교정을 마친 글을 이 목록에 추가한다. 목록 밖 글은 `loadSource` 가 거부한다.

## 기계 검사 (lib/lint.mjs)

| 검사 | 결과 |
|---|---|
| 같은 언어판 원문에 없는 숫자(1~10·2026 제외) | FAIL |
| 언어별 금지어(효능 단정·완치·디톡스 등, 영어는 단어 경계) | FAIL |
| 면책 문구 누락/위치(Threads 는 첫 답글, 나머지는 본문) | FAIL |
| 길이·포스트 수·캐러셀 장수 | FAIL |
| 링크 위치(Threads·LinkedIn 첫 답글/댓글, IG 링크 금지, FB 본문) + UTM | FAIL |
| 해시태그 개수, 일본어 だ/である 체 비율 | 경고 |

PASS 여도 `approved:false` 로 큐에 들어간다. 승인 → Buffer API 예약은 다음 단계에서 붙인다.

## 미확정

- Instagram 해시태그 상한(정책 변경 중) · Buffer 연결 · HAVI 캐릭터 고해상도 원본(현재 210px)
- 명상 음원·앱 운동 영상은 권리 확인 전까지 SNS 에 쓰지 않는다
