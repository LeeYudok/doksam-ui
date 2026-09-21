/**
 * 이슈 #39 로 스모크 대상이 24 → 180개로 늘면서 실제로 새로 걸린 회귀.
 * 화이트리스트 대상(노이즈)이 아니라 진짜 결함이므로 콘솔 error 를 숨기지
 * 않고 test.fail 로 명시적으로 "지금은 실패해야 정상"을 인정한 채 돈다 —
 * 조용히 초록불로 만들지 않기 위함. 원인 조사·수정은 별도 이슈로 분리
 * (#39 는 스모크 커버리지 확장이 스코프).
 *
 * e2e/smoke.spec.ts 와 lib/e2e/routes.test.ts(방어 테스트) 양쪽이 같은 값을
 * 보도록 이 한 파일에서만 정의한다. 두 가지를 방어 테스트가 강제한다:
 *
 * 1. 키가 실제 라우트(lib/e2e/routes.ts 의 getAllSmokeRoutes())에 존재해야
 *    한다 — 라우트 rename·오타로 항목이 죽은 채 남는 것을 막는다.
 * 2. 사유 문자열에 이슈 번호(`#숫자`)가 반드시 있어야 한다 — PR 본문에만
 *    적고 코드에는 안 남겨 6개월 뒤 추적 불가능해지는 것을 막는다.
 *
 * 목록 크기는 KNOWN_FAILING_ROUTES_MAX_SIZE 로 상한을 건다 — 새 항목을
 * 추가하려면 그 숫자도 함께 올려야 하고, 그 자체가 리뷰 diff 에 드러나는
 * 신호가 되게 하기 위함이다. 늘리기 전에 "정말 별도 이슈로 미룰 결함인가"
 * 를 먼저 검토할 것 — 이 장치는 예외를 아예 막지는 못하지만 무심코 늘어나는
 * 것은 막는다.
 *
 * (e2e/smoke.spec.ts 는 `test.fail()` 로 이 라우트를 실행한다 — `test.fixme()`
 * 와 달리 몸체가 실제로 돌고, 원인이 고쳐져 테스트가 통과해버리면 Playwright
 * 가 "예상과 다르게 통과함"으로 그 자체를 실패 처리한다. 즉 #50 이 고쳐지고도
 * 이 레코드를 지우는 걸 잊으면 CI 가 그 사실을 알려준다 — `test.fixme()` 는
 * 몸체를 아예 안 돌려서 이 감지가 불가능했다.)
 *
 * #50 에서 `/components/multi-select` 항목을 제거했다 — 원인은 트리거
 * `<Button>`(button) 안에 칩 제거용 `<button>` 이 중첩된 무효 HTML 이었고,
 * components/multi-select.tsx 에서 제거 컨트롤을 role="button" span 으로
 * 바꿔 해결했다. 현재 알려진 실패 라우트는 없다.
 */
export const KNOWN_FAILING_ROUTES: Record<string, string> = {}

export const KNOWN_FAILING_ROUTES_MAX_SIZE = 0
