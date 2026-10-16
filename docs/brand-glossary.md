# HAVIT 브랜드 글로서리 (2026-10-16 확정)

결정: 사용자 본인(대표). 이 문서가 표기 SSOT 다.

## 1. 브랜드명

| 언어 | 표기 | 금지 |
|---|---|---|
| 영문(모든 라틴 문자 언어 포함 en/es/pt/de/fr/id/vi/…) | **HAVIT** | Havit, havit(문장 속), HaVit, Havit app |
| 한국어 | **하비트** (처음 소개할 때 `하비트(HAVIT)` 허용) | 하빗, 해빗, 헤빗, 하빝 |
| 일본어 | **HAVIT** (처음 소개할 때 `HAVIT（ハビット）` 허용) | Havit（ハビット）, ハビト |
| 중국어 간체·번체 | **HAVIT** (음역 금지) | 哈比特, 哈維特, 哈维特, Havit |
| 그 외(아랍어·태국어·히브리어 등) | **HAVIT** (라틴 문자 그대로) | 현지 음역 |

## 2. 기능·상품명

| 개념 | 한국어 | 영문 | 코드 식별자(변경 금지) |
|---|---|---|---|
| 하비트 파워 | 하비트 파워 | HAVIT Power | `havit_power`, `HAVIT_POWER` |
| 하비트 프로 (프로그램) | 하비트 프로 | HAVIT Pro | `HAVIT_PRO` |
| 하비트 코인 | 하비트 코인 | HAVIT Coins | `coins_*` |
| 하비트 프리미엄 (구독) | 하비트 프리미엄 | HAVIT Premium | `havit.sub_*` |

- 한국어 기능명은 **띄어쓴다**: 하비트 파워 / 하비트 프로 / 하비트 코인 / 하비트 프리미엄. (하비트파워·하빗파워·하비트프로 금지)

## 3. 바꾸지 않는 것 (식별자·데이터)

- 도메인·URL·이메일: `aihavit.com`, `app.aihavit.com`, `havit.onelink.me`, `help@aihavit.com`
- 패키지·번들·상품 ID: `com.aiconnects.havitWellness`, `havit.sub_1m_high` 등 SKU
- 코드 식별자(변수·클래스·enum·DB 컬럼·API 필드·파일명·slug): `havit_power`, `HAVIT_PRO`, `HavitXxx` 클래스, `havit-vs-...` slug
- 사용자 입력 인식용 정규식(오타 허용 목적: `하비트|해빗|하빗|헤빗`) — 일부러 오표기를 받아들이는 코드
- 테스트 픽스처의 가짜 사람 이름·닉네임(예: 김하빗, 하빗팀) — 브랜드 표기가 아니라 임의 데이터
- 인용된 외부 원문, 마이그레이션 히스토리 파일의 과거 기록(실행 결과가 바뀌면 안 됨)

## 4. 적용 범위

사용자 노출 문구(웹·앱·서버 응답/푸시/코치 프롬프트·인앱결제 상품명), 코드 주석, 개발 문서(docs, .moai specs 등) 전부.

---

## 5. 이 레포(havit-web)에서의 적용 위치

| 위치 | 무엇을 | 비고 |
|---|---|---|
| `apps/blog/data/articles/*.json`, `apps/blog/data/articles-pending/*.json`, `apps/blog/data/*.json` | 모든 언어(`langs.*`)의 **문자열 값** | JSON key 는 건드리지 않는다 |
| `apps/blog/components/**`, `apps/blog/app/**`, `apps/blog/lib/**` | 사용자 노출 문자열·JSX 텍스트·주석 | `AboutHavit` 같은 컴포넌트·변수 이름은 식별자라 유지 |
| `apps/blog/scripts/**` | 생성 스크립트가 아티클에 써 넣는 템플릿 문자열·주석 | `geo-entity-surfacing.mjs` 의 `/havit\|하비트\|하빗/i` 같은 **레거시 인식 정규식은 유지**(이미 생성된 옛 표기를 알아보는 용도) |
| `apps/blog/public/llms.txt` | 문서 본문 | |
| `apps/web/index.html`, `apps/web/affiliate/index.html` | HTML 텍스트·메타 | `data-i18n` key 는 유지 |
| `apps/web/src/i18n/*.json` (34 로케일 + footer-articles) | 값 | key(`2026-havit-inc-all-rights` 등) 유지 |
| `apps/web/plugins/*.js` | og/메타·JSON-LD(`Organization`/`Product` name) | |
| `apps/web/public/*.html`, `apps/web/public/*.txt` | 법적 고지·llms.txt 본문 | |
| `README.md`, `apps/*/README.md`, `apps/*/docs/**`, 이 `docs/` | 문서 본문 | 로컬 경로(`Havit-Workspace` 등)는 경로라 유지 |

### 도구

- 일괄 정리: `node packages/brand/normalize.mjs` (기본은 **리포트만**, `--write` 로 적용). 멱등이라 다른 브랜치가 머지된 뒤 다시 돌려도 된다.
- 빌드 가드: `node packages/brand/check.mjs --app web|blog` — 두 앱의 `npm run build` 가 `check:brand` 로 먼저 부른다. 위반이 있으면 빌드 실패.
- 규칙·허용 목록 SSOT: `packages/brand/rules.mjs`. 예외를 늘릴 때는 여기 `ALLOW` 에 파일과 이유를 적는다.
