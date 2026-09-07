# GLP-1 허브 템플릿 중복 통합안

작성 2026-09-07 · 대상 `apps/blog/data/articles` · 상태 **제안 (미실행)**

> 제품 연결 컨텐츠이므로 승인 전 어떤 파일도 변경하지 않는다.

---

## 1. 왜 지금인가

| 지표 | 값 |
|---|---|
| sitemap URL (en/ja/ko/zh-tw) | 4,143 |
| GSC 색인됨 (전체 도메인) | **236** |
| 그중 블로그 | 203 |
| 그중 **타겟 4개 언어** | **112** |
| 타겟 언어 색인률 | **2.7%** |
| 색인 안 됨 | 7,834 |

### GSC 미색인 사유 (2026-09-04)

| 사유 | 페이지 | 유효성 검사 |
|---|---:|---|
| 크롤링됨 — 현재 색인이 생성되지 않음 | **4,740** | **실패함** |
| 발견됨 — 현재 색인이 생성되지 않음 | 2,101 | 통과 |
| 찾을 수 없음(404/410) | 486 | 시작되지 않음 |
| NOINDEX 태그에 의해 제외 | 450 | 시작되지 않음 |
| 리디렉션이 포함된 페이지 | 51 | 시작되지 않음 |
| 사용자가 선택한 표준이 없는 중복 | 3 | 시작되지 않음 |
| robots.txt에 의해 차단됨 | 3 | 통과 |

크롤 후 거부가 4,740 이고 **유효성 검사가 "실패함"** 이다. 5월 기록(4,618)보다
늘었다. 발견하고도 크롤조차 하지 않는 것이 2,101.

### 색인된 236건의 실제 구성

| | 페이지 |
|---|---:|
| www.aihavit.com | 33 (로케일 홈 28 + `/`, `/affiliate/`, `/refund.html`, `/refund-ko.html`, `/eula-ko.html`) |
| blog — ko | 55 |
| blog — zh-tw | 43 |
| blog — **zh (폐기)** | **41** |
| blog — **id (폐기)** | **32** |
| blog — **es (폐기)** | **10** |
| blog — **de (폐기)** | **8** |
| blog — **en** | **7** |
| blog — ja | 7 |

두 가지가 동시에 드러난다.

**(1) 색인된 블로그 203건 중 91건(45%)이 이미 410 처리된 폐기 언어다.**
Google 이 재크롤하면 그대로 빠진다 → 색인 수는 여기서 **91 더 떨어진다**
(236 → 약 145). "언어를 줄였더니 색인이 더 준다"는 관측은 이 부분에서 정확하다.
다만 그 91건은 폐기 6개 언어 약 6,200 URL 중 91건 = **색인률 1.5%** 이고,
타겟 4개 언어는 112/4,143 = **2.7%** 로 여전히 두 배다. 되돌릴 근거가 못 된다.

**(2) 영어가 1,038 URL 중 7건이다. 그중 3건은 category 페이지이므로 실제 아티클은 4건.**

```
en 색인 아티클 (전부):
  evening-phone-charging-location-sleep-hygiene-2026
  wim-hof-breathing-method-physiological-mechanisms-evidence-2026
  glp1-muscle-preservation-protein-timing-resistance-training-2026
  houseplant-air-quality-mental-wellbeing-2026
```

**GLP-1 허브 38개 슬러그는 en·ja·ko·zh-tw 어디에서도 단 하나도 색인되지 않았다.**

즉 **병목은 언어 수가 아니다.** 그리고 en 은 near-duplicate 가 가장 심한 언어다.
EN 본문 1,094개 스캔 결과:

- jaccard ≥0.45 쌍 **99개**
- 상위 쌍이 전부 GLP-1 허브의 `*-tracker` / `*-side-effects` 클러스터

문자 단위 diff로 확인한 최악 사례:

```
foundayo-side-effects  vs  orforglipron-side-effects
  본문 11,590자 / 11,597자 — 차이 구간 35개
  → 브랜드명 find-and-replace 수준
```

```
ozempic-tracker  vs  wegovy-tracker
  본문 10,337자 / 9,366자 — 차이 구간 102개, ratio 0.942
```

이건 "색인이 안 된다" 이전에 Google **scaled content abuse** 정책 표면이다.
도메인 단위 색인 스로틀링(5.7%)의 유력한 설명이 된다.

## 2. 이 클러스터만 dedup 을 건너뛴 상태

`lib/merged-redirects.json` 에 이미 **152건**의 근접 중복 병합이 있고
`next.config.js` 가 전 언어에 301 을 적용한다 — 메커니즘은 이미 검증됐다.

그런데 허브 38개 슬러그 중 이 목록에 든 것은 **0건**이다.
편집 코퍼스에만 dedup 을 돌리고 머니 페이지는 제외한 상태.

## 3. 클러스터별 판정

### A. generic tracker 6개 → 1개  【즉시 실행 가능】

`glp-1-dose-tracker` · `glp-1-progress-tracker` · `glp-1-shot-tracker`
`side-effect-tracker` · `glp-1-tracker-app` · `injection-tracker-app`

약물 구분이 없는 동일 주제. 서로를 카니벌라이즈한다.

→ keeper `glp-1-tracker` (신규 허브, 6개 본문의 고유 섹션 흡수)
→ 나머지 5개 `merged-redirects.json` 301

**URL −5**

### B. foundayo → orforglipron 2쌍  【즉시 실행 가능】

Foundayo 는 Lilly 의 orforglipron 브랜드명 = **같은 분자**.
본문이 이름만 치환된 상태(차이 구간 35개).

→ `foundayo-side-effects` 301 → `orforglipron-side-effects`
→ `foundayo-tracker` 301 → `orforglipron-tracker`
→ keeper 안에 "Foundayo (브랜드명)" 섹션 추가해 브랜드 쿼리 흡수

**URL −2**

### C. 브랜드 tracker 8개  → **(a) 통합 확정**

`ozempic` `wegovy` `mounjaro` `zepbound` `semaglutide` `tirzepatide`
`retatrutide` `oral-wegovy` × `-tracker` — 상호 유사도 0.65~0.88, ≥0.6 쌍 19개

"이 약을 먹을 때 무엇을 기록할 것인가"는 약물이 달라도 조언이 거의 같다.
GSC 실측 결과 **8개 전부 색인 0건**이다. 지킬 랭킹이 없으므로 통합에 비용이 없다.

→ keeper `glp-1-tracker` (A 의 허브와 동일) 1개
→ 8개 전부 301, 각 약물 고유 정보(titration 표 · 승인 적응증)는 허브 안 섹션으로 흡수

**URL −8**

### D. side-effects 11개  → **분자 기준 통합 확정**

분자 기준으로 접으면 5개로 압축된다:

```
semaglutide  ← ozempic, wegovy, oral-wegovy
tirzepatide  ← mounjaro, zepbound
orforglipron ← foundayo
retatrutide
glp-1 (허브)
```

검색량은 **브랜드 >> 분자**이므로 보통은 브랜드를 keeper 로 둔다. 그러나 11개
전부 색인 0건이라 현재 랭킹 기준으로는 어느 쪽을 keeper 로 잡아도 잃는 것이 없다.
→ 검색량이 큰 **브랜드를 keeper** 로 두고 분자 페이지를 브랜드로 접는다:

```
keeper: ozempic-side-effects · wegovy-side-effects · mounjaro-side-effects
        zepbound-side-effects · glp-1-side-effects (허브)
301   : semaglutide → wegovy   (감량 적응증 기준)
        tirzepatide → zepbound
        orforglipron ← foundayo (B 에서 처리)
        oral-wegovy  → wegovy 안 "경구 제형" 섹션
        retatrutide  → glp-1 허브 (미승인 약물, 단독 페이지 근거 약함)
```

**URL −5**, 남는 6개는 약물별 실측 incidence 표로 차별화.

### E. alternative 10개  【손대지 않음】

최고 유사도 0.654, ≥0.6 쌍 2/45. 경쟁 앱마다 타겟 쿼리가 다르다.
**이 클러스터는 건강하다.** 유일한 검토 대상은 `pep-alternative` ↔
`shotsy-alternative` (0.654) 한 쌍.

## 4. 순서

1. **A + B 먼저** — 판단 불필요, URL −7, `merged-redirects.json` 7줄 추가 + 허브 1편 작성
2. GSC 색인 236건 CSV 로 C·D 갈래 확정
3. C·D 실행 → URL −13. 총 4,143 → 4,123 이지만 **URL 수가 아니라 중복 신호 제거가 본질**
4. 영어 색인 아티클이 4건 → 두 자리로 올라오는지 확인
5. 그 다음에야 언어 웨이브 (es/de)

## 5. 언어 재오픈 — 결정 기록

이 문서의 초안은 언어 재오픈을 반대했다. 근거는 "5.7% 색인률인 도메인에 URL 을
2.5배 공급하는 것" 이었다.

그 뒤 GSC 링크 리포트를 보고 판단을 바꿨다. **외부 링크 265개가 전부 www 앞으로
들어오고 블로그로 오는 건 0개다** (링크 출처도 apple.com 101 / google.com 100 /
saramin 28 등 앱스토어·채용사이트뿐, 에디토리얼 백링크 0). 색인 슬롯을 묶고
있던 건 URL 공급량이 아니라 링크 권위였고, 그렇다면 언어를 조이든 풀든 숫자는
움직이지 않는다 — 실제로 두 달간 "크롤링됨 — 미색인" 이 4,618 → 4,740 으로
늘기만 했다.

그래서 언어 축은 레버가 아니라고 보고 10개 전부 되돌렸다. 대신 진짜 레버인
서브디렉터리 이전(`blog.aihavit.com` → `www.aihavit.com/blog`)을 **같은
릴리스에서** 함께 냈다. 따로 내보내면 폐기 언어 URL 이 410 → 200 → 301 로
세 번 바뀌어 Google 이 상태를 다시 배우는 데만 몇 주가 더 든다.

이 문서의 1~4 절(템플릿 중복 통합)은 그대로 유효하다. 오히려 언어가 10개로
늘면서 중복 1건이 10개 URL 로 곱해지므로 우선순위가 올라갔다.

## 6. 이 판단이 틀렸는지 확인하는 법

이전 후 4~8주 뒤 GSC 에서:

- **맞았다면** — 색인 수가 145(이전 직후 예상 바닥)에서 올라오고, 특히
  `/blog/en/` 색인이 지금의 4건에서 두 자리로 간다.
- **틀렸다면** — "크롤링됨 — 미색인" 이 다시 늘고 색인은 제자리다. 그러면
  남은 원인은 컨텐츠 자체이고, 1~4 절과 URL 총량 축소(영어 100편)로 간다.
