# www.aihavit.com → AWS(S3 + CloudFront) 이전 런북

목표: 홈 + 블로그를 정적 사이트 하나로 S3(비공개) + CloudFront 에서 서빙. 주소·상태코드·canonical·hreflang 은 지금과 같게.
서버(ECS·Lambda·SSR) 없음. Vercel 설정은 손대지 않고, 전환·롤백은 DNS 레코드 교체로 한다.

## 구성

| 무엇 | 어디서 |
|---|---|
| 정적 빌드 | `apps/static-site` → `node scripts/build.mjs` → `dist/`(홈 루트 + `/blog`) · `dist-edge/` |
| 블로그 정적 내보내기 | `STATIC_EXPORT=1 next build` (`apps/blog/next.config.static.js`) — 변수가 없으면 지금 Vercel 빌드 그대로 |
| 이미지 | 빌드가 실제 쓰인 (원본, 폭)만 AVIF + WebP 로 미리 줄여 `/blog/_img/` 에 둔다. AVIF 못 읽는 브라우저는 WebP 로 바꿔 끼움 |
| 라우팅 | CloudFront Function `dist-edge/viewer-request.js`(viewer-request, 약 7 KB / 한도 10 KB) |
| 병합 slug 160개 | CloudFront KeyValueStore(`m:<옛 slug>` → 새 slug). 함수에 넣으면 약 17 KB 라 한도를 넘는다 |
| 헤더 | 응답 헤더 정책 2개(홈: HSTS / 블로그: HSTS + nosniff + SAMEORIGIN + Referrer-Policy). Cache-Control 은 S3 객체 메타데이터 |
| 인프라 | `apps/static-site/infra/cloudfront.yml` (S3 · OAC · 배포 · 함수 · KVS · 헤더 정책 · 캐시 정책 · ACM · 배포 역할) — 아직 적용 안 함 |
| 배포 | GitHub Actions `static-aws` (수동 실행만, OIDC 역할. `AWS_DEPLOY_ROLE_ARN` 시크릿이 없으면 빌드만) |
| 대조 | `scripts/test-edge.mjs`(함수 ↔ middleware.js · next.config.js, 1.7만 건) · `scripts/local-edge.mjs` + `scripts/verify.mjs`(운영과 비교) |

함수가 하는 일(지금 Vercel 의 처리 순서 그대로): 옛 호스트 `blog.aihavit.com`·apex `aihavit.com` → www 308 → `apps/web/vercel.json` 리다이렉트 308 →
`middleware.js`(블로그 경로에 `/blog` 빠진 URL 301, `/`·`/blog`·`/affiliate/` 언어 302 + `hv_lang` 쿠키 + `Vary: Accept-Language, Cookie`) →
`next.config.js`(끝 찌꺼기 정규식 308, 병합 slug 308) → 깨끗한 URL 을 S3 키로(`/blog/ko/x` → `blog/ko/x.html`, `/ko/` → `ko/index.html`, `/affiliate` → `affiliate/index.html`).
해시된 파일(`/assets/*`, `/blog/_next/static/*`, `/blog/_img/*`)은 함수를 거치지 않는다.

## 1. AWS 에서 할 일 (관리자, us-east-1)

1. GitHub OIDC 공급자 확인: IAM → Identity providers 에 `token.actions.githubusercontent.com` 이 없으면 추가(대상 `sts.amazonaws.com`).
2. 스택 생성(검토 후):
   ```
   aws cloudformation deploy --region us-east-1 --stack-name havit-www-static \
     --template-file apps/static-site/infra/cloudfront.yml --capabilities CAPABILITY_NAMED_IAM \
     --parameter-overrides GitHubOidcProviderArn=arn:aws:iam::<계정ID>:oidc-provider/token.actions.githubusercontent.com
   ```
   ACM 인증서(www · blog · apex)가 DNS 검증을 기다린다. ACM 콘솔의 CNAME 3개를 Squarespace DNS 에 그대로 추가 → 수 분~수십 분 뒤 스택 완료.
   (인증서 검증 CNAME 은 전환 뒤에도 지우지 않는다 — 자동 갱신에 쓰인다.)
3. 스택 출력 `DeployRoleArn` 을 GitHub 저장소 Secrets → Actions 의 `AWS_DEPLOY_ROLE_ARN` 으로.
   역할 권한: 버킷 객체 읽기/쓰기/삭제·목록, 이 배포의 무효화, 이 함수 갱신·게시, 이 KVS 키 갱신, 이 스택 조회만. 신뢰 조건은 `repo:ai-connects/havit-web:ref:refs/heads/main`.
4. WAF 는 붙이지 않는다(봇 차단 규칙이 Googlebot·Naver Yeti 를 막을 수 있다). 지역 제한·서명 URL 도 없음.

## 2. 전환 순서

1. Actions → `static-aws` → Run workflow (main). 빌드 약 5~15분(첫 실행은 이미지 인코딩 때문에 더 길다. 이후 캐시).
2. CloudFront 기본 주소로 대조(전환 전, 운영에 초당 4건):
   `node scripts/verify.mjs --local https://<DistributionDomain> --only pages,redirects,feeds --per-lang 100`
   옛 호스트·apex 는 `curl --connect-to blog.aihavit.com:443:<DistributionDomain>:443 -sI https://blog.aihavit.com/ko/x` 로 몇 개 확인.
3. 하루 전: Squarespace DNS 에서 `www`(지금 A `216.198.79.1`)·`blog`(지금 CNAME `9f715ced4f4e3574.vercel-dns-016.com`) TTL 을 5분으로.
4. 전환(트래픽 적은 한국 새벽): `www` A 레코드 삭제 → `CNAME www → <DistributionDomain>`. 이어서 `blog` CNAME → `<DistributionDomain>`.
5. 스모크: `curl -sI https://www.aihavit.com/` 에 `via: … cloudfront`, 그리고 `/`, `/ko/`, `/privacy.html`, `/blog`(302), `/blog/ko/<글>`, `/blog/sitemap.xml`, `https://blog.aihavit.com/`(308) 가 2번 결과와 같은지. GSC URL 검사 → 실시간 테스트 2~3개.
6. apex `aihavit.com`: 지금은 Vercel 이 `308 → https://www.aihavit.com<경로+쿼리>`(http 는 먼저 `308 → https://aihavit.com/`). Squarespace DNS 는 apex 에 CloudFront ALIAS 를 못 건다.
   - 전환 직후: apex A 레코드는 Vercel 그대로 둔다(같은 동작 유지).
   - 그다음(권장): 도메인 DNS 를 Route 53 으로 옮기고 apex ALIAS → CloudFront. 함수가 같은 308(경로·쿼리 유지)을 낸다(로컬 대조 완료). 차이: http→https 가 308 대신 CloudFront 기본 301.
   - Vercel 을 정리하기 전에 이 단계를 끝낸다.
7. 2주 안정 뒤 Vercel 프로젝트 `havit-website`·`aihavit-blog` 정리(그때까지 삭제 금지 — 롤백 경로).

## 3. 롤백 (5분)

- Squarespace DNS: `www` CNAME 삭제 → `A www 216.198.79.1`, `blog` CNAME → `9f715ced4f4e3574.vercel-dns-016.com`. Vercel 은 손대지 않았으므로 그대로 다시 서빙된다. TTL(5분) 뒤 복구.
- AWS 쪽은 그대로 둬도 비용이 거의 없다.

## 4. 운영 중 바뀌는 것

- 글 발행 = 재배포: 글을 main 에 머지한 뒤 Actions `static-aws` 수동 실행(업로드 → KVS → 함수 → 삭제 → `/*` 무효화). ISR(600초)·`/api/revalidate` 웹훅은 없어진다. IndexNow 는 필요하면 배포 뒤 `apps/web/scripts/indexnow.mjs`.
- HTML 캐시: 브라우저는 지금처럼 매번 확인(`max-age=0`), CloudFront 는 하루(`s-maxage=86400`), 배포 때 무효화. 해시 파일은 1년 immutable(지금과 같음).
- 블로그 홈 `?page=N` → 정적 `/blog/<lang>/page/<N>`(canonical 은 지금처럼 `/blog/<lang>`). `?q=` 검색은 브라우저에서 색인 JSON 으로(결과에 사진 없음 — UI 검수 필요). 블로그 안 링크는 전체 페이지 이동.
- 없는 주소의 404 본문은 블로그 404 페이지 하나(CloudFront 오류 페이지는 배포당 하나). 상태코드는 같다.

## 5. 예상 월 비용 (2026-11 AWS 요금표 기준)

가정: 블로그 4.4천 PV/일 + 홈 2천 PV/일(가정) ≈ 19만 PV/월. 첫 방문 기준 PV 당 요청 약 35건·전송 약 0.5 MB(HTML 은 br 압축).

| 항목 | 사용량(월) | 무료 한도(상시) | 요금 |
|---|---|---|---|
| CloudFront 전송 | ≈ 100 GB | 1 TB | $0 (초과 시 한국·아시아 $0.120/GB) |
| CloudFront 요청 | ≈ 670만 | 1,000만 | $0 (초과 시 $0.012/1만) |
| CloudFront Functions | ≈ 190만(HTML·비해시 파일만) | 200만 | ≈ $0 (초과 $0.10/100만) |
| KVS 읽기 | ≈ 15만 | 200만 | $0 ($0.03/100만) |
| 무효화 | 배포당 1경로 | 1,000경로 | $0 |
| S3 저장·요청 | 2.5 GB, 캐시 미스 GET, 배포당 PUT 약 1.8만 | — | ≈ $0.1 + 배포당 ≈ $0.09 |
| ACM 인증서 | 1 | — | $0 |
| Route 53(apex 옮길 때만) | 1 존 | — | $0.50 + 쿼리 |

합계 약 $0.2~1/월(≈ 300~1,400원, 1 USD ≈ 1,400원 가정). 지금 Vercel Fast Origin Transfer 만 $36/월(≈ 5만 원). 트래픽이 3배가 돼도 요청·함수 초과분 몇 달러 수준.
CloudFront 정액제 Free(월 100만 요청·100 GB)는 요청 수가 모자라 맞지 않고, Pro($15)는 필요 없다 — 종량제 + 상시 무료로 둔다.

## 6. 2주간 볼 것

- GSC 페이지 색인: 색인 수 유지, "찾을 수 없음(404)"·"리디렉션 오류" 급증 없음. 크롤링 통계: 응답 코드 분포·호스트 상태·평균 응답 시간(줄어야 정상).
- GSC Sitemaps: `/sitemap.xml`, `/blog/sitemap.xml` "성공", 발견 URL 수 유지. 실적(노출·클릭) 주 단위, Core Web Vitals.
- Naver 서치어드바이저: 수집 현황·수집 오류, 사이트맵 상태. Yeti 가 막히지 않는지(robots.txt 는 지금과 바이트 동일).
- CloudFront 콘솔: 4xx·5xx 비율, 함수 실행 오류(`FunctionExecutionErrors`)·`FunctionThrottles` 0. 필요하면 CloudWatch 경보.
