/**
 * 정적 내보내기(STATIC_EXPORT=1) 전용. 블로그 홈은 정적 빌드에서 searchParams 를 읽으면
 * 빌드가 멈추므로 무시하는데, /<lang>/page/<n> 정적 페이지가 직접 만들어 넘긴 값만은
 * 써야 한다. 그 객체를 여기 등록해 구분한다(프록시의 속성을 건드리지 않고 동일성만 본다).
 */
export const STATIC_SEARCH_PARAMS = new WeakSet<object>();
