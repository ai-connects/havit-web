// 배포 무효화 범위 계산 — 바뀐 파일만 CloudFront 캐시에서 지운다(2026-11-19).
//
// 예전엔 배포마다 `/*` 로 전 세계 엣지 캐시를 통째로 비웠다. 블로그 글 PR 이 하루에도 여러 번 머지되니
// 캐시가 늘 비어 있어, 원본(S3, us-east-1)까지 다녀오는 첫 응답 0.7초가 거의 모든 요청에 붙었다
// (네이버 수집 다운로드 시간 11/9 이후 약 250ms → 1,000ms, 서울에서 실측 캐시 미스 0.66~0.81초 / 적중 0.03초).
//
// 규칙
// - 지울 대상 = 원격(S3)에 이미 있는데 내용(MD5)이 바뀐 키 + 이번에 지워지는 키. 새 키는 엣지에 캐시된 적이 없으니 뺀다
//   (그 주소를 미리 요청해 받은 404 는 ErrorCachingMinTTL 60초만 남는다 — infra/cloudfront.yml).
// - 경로 = S3 키 그대로(`/blog/ko/x.html`). 뷰어 요청 함수가 주소를 S3 키로 바꾼 뒤 캐시를 찾으므로 캐시 키가 곧 S3 키다.
// - 엣지 함수 코드가 바뀌면(라우팅이 바뀜) 같은 주소가 다른 키를 가리킬 수 있어 `/*`.
// - 바뀐 키가 cap 을 넘으면 `/*` — 경로 하나하나가 요금(월 1,000개 무료, 이후 경로당 0.005달러)이고,
//   와일드카드는 동시에 15개까지라 언어별로 쪼갤 수도 없다. 템플릿·공통 모듈 변경처럼 거의 전부 바뀐 배포가 여기 해당한다.
// - S3 ETag 가 MD5 가 아닌 경우(멀티파트 업로드, `-` 포함)는 바뀐 것으로 본다.

export const DEFAULT_CAP = 150

/**
 * @param {Map<string,string>} local  dist 키 → md5(hex)
 * @param {Map<string,string>} remote S3 키 → ETag(따옴표 없이)
 * @param {{functionChanged?: boolean, cap?: number}} opt
 * @returns {{paths: string[], reason: string, changed: number, deleted: number}}
 */
export function planInvalidation(local, remote, { functionChanged = false, cap = DEFAULT_CAP } = {}) {
  const changed = []
  for (const [k, md5] of local) {
    const etag = remote.get(k)
    if (etag === undefined) continue // 새 키
    if (etag.includes('-') || etag !== md5) changed.push(k)
  }
  const deleted = [...remote.keys()].filter((k) => !local.has(k))
  const keys = [...changed, ...deleted].sort()
  const n = { changed: changed.length, deleted: deleted.length }
  if (functionChanged) return { paths: ['/*'], reason: '엣지 함수 변경', ...n }
  if (keys.length === 0) return { paths: [], reason: '바뀐 파일 없음', ...n }
  if (keys.length > cap) return { paths: ['/*'], reason: `바뀐 파일 ${keys.length}개 > ${cap}`, ...n }
  // 공백·한글 등은 퍼센트 인코딩(CloudFront 는 인코딩된 경로로 맞춘다). `*` 는 키에 없다.
  return { paths: keys.map((k) => '/' + k.split('/').map(encodeURIComponent).join('/')), reason: `바뀐 파일 ${keys.length}개`, ...n }
}
