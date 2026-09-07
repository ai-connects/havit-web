# HAVIT Blog — Vercel 배포 가이드

> 통합 계획서 (`docs/HAVIT_BlogIntegration_PRD.md`) Phase 0~3 실행 가이드.

## 사전 준비 (사용자 측 액션)

### 1. GitHub 저장소
1. github.com/new → 저장소명 `aihavit/blog` (또는 본인 organization 하)
2. Private 또는 Public (SEO 위해 Public 권장)
3. 빈 저장소 생성 후 — 아래 명령어로 코드 푸시:
   ```bash
   cd /Users/ryanyun/Desktop/Havit-Workspace/prototype/havit-blog-prototype
   git init
   git add .
   git commit -m "feat: initial HAVIT blog deployment-ready"
   git branch -M main
   git remote add origin https://github.com/aihavit/blog.git
   git push -u origin main
   ```

### 2. Vercel 프로젝트 연결
1. vercel.com/new
2. **Import Git Repository** → `aihavit/blog` 선택
3. Framework Preset: **Next.js** (자동 감지)
4. Root Directory: `./`
5. **Environment Variables** (아래 6개 추가):
   - `NEXT_PUBLIC_SITE_URL` = `https://www.aihavit.com/blog`
   - `NEXT_PUBLIC_MAIN_URL` = `https://www.aihavit.com`
   - `NEXT_PUBLIC_GA_ID` = `G-XXXXXXXXXX` (실제 GA4 ID로 교체)
   - `REVALIDATE_SECRET` = `(랜덤 32자 문자열, openssl rand -hex 16으로 생성)`
   - `TWITTER_HANDLE` = `@havit_ai` (확인 필요)
   - `ANTHROPIC_API_KEY` = `sk-ant-...` (article 자동 생성용)
6. **Deploy** 클릭 → 첫 배포

### 3. DNS 설정 (도메인 등록업체에서)

블로그 서브도메인:
```
Type:  CNAME
Name:  blog
Value: cname.vercel-dns.com
TTL:   60 (or auto)
```

메인 도메인 (Vercel 이전 시):
```
Type:  A
Name:  @
Value: 76.76.21.21

Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
```

### 4. Vercel Custom Domain 연결
1. Vercel 프로젝트 → Settings → Domains
2. `www.aihavit.com/blog` 추가 → SSL 자동 발급 대기 (~30초)

### 5. 메인 사이트 Vercel 이전 (옵션)
1. `havit-website/` 도 별도 Vercel 프로젝트로
2. Framework: Other (정적 HTML)
3. Build Command: (비움)
4. Output Directory: `./`
5. Domain: `aihavit.com` + `www.aihavit.com`

---

## 배포 후 검증 체크리스트

- [ ] `https://www.aihavit.com/blog` HTTP 200
- [ ] `https://www.aihavit.com/blog/blog?lang=ko` 동작
- [ ] `https://www.aihavit.com/blog/blog?lang=en` 동작
- [ ] 블로그 헤더에 `← HAVIT` 링크 → `https://www.aihavit.com` 정상 이동
- [ ] 메인 사이트 헤더에 `블로그` (또는 영어 `Blog`) 링크 → `https://www.aihavit.com/blog/ko` 이동
- [ ] `https://www.aihavit.com/blog/sitemap.xml` 응답
- [ ] `https://www.aihavit.com/blog/robots.txt` 응답
- [ ] Lighthouse SEO ≥ 95 (5건 sample article)
- [ ] Google Search Console에 두 도메인 등록 + sitemap 제출
- [ ] GA4 cross-domain tracking 확인 (Realtime → user from main site 클릭 → blog 진입 추적)

---

## 향후 (Phase 4-5)

1. **자동화 파이프라인** (`scripts/`):
   - `article-queue.ts` — 1,200 article 큐 매니저
   - `generate-article.ts` — 8-Phase 자동 실행
   - `auto-commit.ts` — git push 자동화
2. **Webhook 연결**:
   - Django `post_save` signal → `https://www.aihavit.com/blog/api/revalidate`
   - HMAC 검증 (REVALIDATE_SECRET 사용)
3. **모니터링**:
   - Vercel Analytics
   - Google Search Console 인덱싱 추적
   - Slack 알림 (배포 성공/실패)

---

## 비용 추정

| 항목 | 예상 비용 |
|------|----------|
| Vercel Pro | $20/월 (트래픽 대응) |
| Anthropic API (1,200 × 5언어 article 생성) | $1,500~3,000 (1회성) |
| 도메인 (이미 보유) | $0 |
| GA4 | $0 (무료) |
| **총 1회성** | **약 $1,500~3,000** |
| **월 운영** | **약 $20** |
