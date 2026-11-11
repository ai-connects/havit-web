# W2AC 링크 `www.aihavit.com/open`

Google Ads 디맨드젠(웹 → 앱) 최종 URL. 앱이 깔린 기기는 OS 가 이 URL 을 앱으로 열고(Android App Links · iOS Universal Links), 앱이 없는 사람에게는 이 웹 페이지가 보인다.

광고 심사는 최종 URL 이 리디렉션이 아닌 실제 내용이 있는 페이지여야 통과한다. 예전 app.aihavit.com 리디렉터는 「대상 페이지 불일치」로 거절됐다. 그래서 이 페이지는 자동으로 이동하지 않는다(스크립트·meta refresh 둘 다 없음). 스토어는 사람이 배지를 눌러야 열린다.

## 경로 규칙

| 경로 | 앱 설치 기기 | 미설치·PC |
|---|---|---|
| `/open`, `/open/` | 앱이 열림 | 랜딩(200) |
| `/open/<target>`, 예 `/open/premium?campaign=x` | 앱이 열림(앱이 `<target>` 처리) | 같은 랜딩(200) |
| 그 밖의 경로(`/`, `/blog/...`) | 웹 그대로 | 웹 그대로 |

- iOS: `apple-app-site-association` 의 `components` 가 `/open`, `/open/`, `/open/*` 만 받는다. 다른 경로는 앱으로 넘어가지 않는다.
- Android: `assetlinks.json` 은 도메인 검증만 한다. 어떤 경로를 열지는 앱 매니페스트의 intent-filter(`pathPrefix="/open"`)가 정한다(앱 쪽 작업).
- 언어: CloudFront 함수가 `?lang` → `hv_lang` 쿠키 → `Accept-Language` → 영어 순으로 골라 `/_open/<locale>.html` 로 리라이트한다. 리디렉트가 아니고 주소창은 `/open/...` 그대로다. 언어판은 빌드가 `apps/web/src/i18n/<locale>.json` 의 홈 키로 34개 언어 전부를 찍고, 키가 하나라도 없으면 빌드가 실패한다(영어 대체 없음).
- 색인: `<meta name="robots" content="noindex">` 만 단다(홈과 같은 문구). robots.txt 로는 막지 않는다 — AdsBot 이 읽어야 한다. 사이트맵·hreflang 에도 넣지 않는다.

## 귀속(스토어 배지)

- 기기와 같은 스토어 배지(iOS → App Store, Android → Google Play)를 앞에 크게 두고, 그 배지만 app.aihavit.com 으로 보낸다(홈 배지와 같은 경로: 광고 파라미터 → OneLink `pid`·`c`). 넘기는 키는 `apps/web/src/main.js` 의 `FORWARD_KEYS` 와 같다(`gclid`·`gbraid`·`wbraid`·`utm_*` 등).
- `c` = `?campaign=` 값, 없으면 `w2ac_open`. `utm_campaign` 이 있으면 `c` 를 붙이지 않는다. `af_adset=w2ac_open`.
- `/open/<target>` 의 `<target>` 은 `deep_link_value` 로 넘긴다(설치 후 첫 실행 지연 딥링크용 — 앱이 읽을지는 앱 쪽 결정).
- PC·기기와 다른 스토어 배지는 스토어 직링크. Google Play 직링크에는 `referrer=`(utm·클릭 ID, 클릭 ID 만 있으면 `utm_source=google&utm_medium=cpc`)를 붙인다.

## 파일

| 파일 | 역할 |
|---|---|
| `apps/web/public/.well-known/assetlinks.json` | Android, `com.aiconnects.havitWellness`, SHA-256 `A6:09:…:F4:BD`(prod.aihavit.org·havit.onelink.me 와 같음) |
| `apps/web/public/.well-known/apple-app-site-association` | iOS, `92YBP87N46.com.aiconnects.havit-wellness`, 확장자 없음 |
| `apps/web/open/index.html` | 랜딩(영어 원본). 홈 본문(아티클·블로그 제외: 히어로·기능·임상·후기·비교·근거·FAQ·최종 스토어 버튼)과 같은 마크업·키, 모바일 하단 고정 설치 버튼. 상단 메뉴·블로그 링크 없음 |
| `apps/web/plugins/i18n-html.js` `LANDING_PAGES` | 언어판 `_open/<locale>.html` 생성 |
| `apps/static-site/edge/viewer-request.src.js` `openLanding()` | `/open*` 리라이트, `.well-known` 확장자 없는 파일 통과 |
| `apps/static-site/scripts/rules.mjs` | `.well-known/*` 업로드 `Content-Type: application/json` |
| `.github/workflows/static-aws.yml` | 배포 뒤 S3 메타데이터 확인, 다르면 `aws s3 cp --content-type application/json` |

CloudFront 설정(`infra/cloudfront.yml`)은 바꾸지 않았다. `/.well-known/*` 는 기본 동작(함수 있음)을 타고, 함수는 이 두 파일을 그대로 S3 키로 넘긴다(전에는 확장자 없는 AASA 에 `/index.html` 을 붙여 404 였다).

## 로컬 검증

```bash
cd apps/web && npm run build
cd ../static-site && node scripts/build.mjs --skip-app-builds   # apps/blog/out 이 있어야 한다
node scripts/test-edge.mjs                                       # w2ac-open 케이스 포함
node scripts/local-edge.mjs &                                    # www = :8788
curl -sI localhost:8788/.well-known/apple-app-site-association   # 200, application/json
curl -sI localhost:8788/.well-known/assetlinks.json              # 200, application/json
curl -sI -H 'Accept-Language: ko' 'localhost:8788/open/premium?campaign=x'   # 200 text/html, Location 없음
python3 -m json.tool dist/.well-known/apple-app-site-association
```

## 배포 후 확인

```bash
for p in /.well-known/apple-app-site-association /.well-known/assetlinks.json /open "/open/premium?campaign=x&gclid=t"; do
  curl -s -o /dev/null -w "%{http_code} %{content_type} %{redirect_url} $p\n" "https://www.aihavit.com$p"
done   # 모두 200, 앞 둘은 application/json, redirect 없음
curl -s https://www.aihavit.com/.well-known/apple-app-site-association | python3 -m json.tool
curl -s https://app-site-association.cdn-apple.com/a/v1/www.aihavit.com   # Apple CDN 이 받아 간 내용(반영까지 최대 하루 이상)
curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.aihavit.com&relation=delegate_permission/common.handle_all_urls"
```

- 앱 쪽: iOS Associated Domains `applinks:www.aihavit.com`, Android intent-filter `autoVerify="true"` · host `www.aihavit.com` · `pathPrefix="/open"` 가 들어간 빌드가 나와야 실기기에서 앱이 열린다. Android 확인: `adb shell pm get-app-links com.aiconnects.havitWellness` 에서 `www.aihavit.com: verified`.
- 실기기: 앱 설치 기기에서 메모·메시지 앱에 링크를 붙여 눌러 볼 것(주소창에 직접 입력하면 Universal Link 가 열리지 않는다).
