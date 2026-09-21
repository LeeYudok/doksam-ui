/**
 * 규칙 메타데이터 — 린트 규칙과 규칙 원문(lib/rules-markdown.ts)을 잇는 유일한 지점.
 *
 * 각 규칙은 자기가 어느 절에서 나왔는지를 `section` 으로 선언하고, 그 문자열은
 * `RULES_SECTIONS` 의 제목과 **글자 단위로 같아야** 한다. `COVERAGE` 는 반대 방향을
 * 잠근다 — 불변(invariant) 절 하나하나가 "어떤 규칙이 막는지" 또는 "왜 기계로
 * 판정하지 않는지" 중 하나를 반드시 갖는다. 둘의 정합은
 * `tools/eslint-doksam/coverage.test.ts` 가 강제하므로, 원문에 불변 절을 추가하면
 * 여기를 갱신하기 전까지 카탈로그 테스트가 깨진다.
 *
 * 이 파일은 순수 데이터다 — ESLint 도, node:fs 도 import 하지 않는다. 카탈로그의
 * /rules/lint 페이지가 이 파일 하나만 읽어 규칙 표를 그린다.
 */

/** 규칙 이름 → 출처 절과 한 줄 요약. */
export const RULE_META = {
  "no-hardcoded-color": {
    section: "컬러 · 토큰",
    summary:
      "hex·rgb()·oklch() 등 색 리터럴과 Tailwind 팔레트 클래스(text-red-500)를 막는다. 색은 시맨틱 토큰(bg-background, text-destructive, text-chart-1)으로만 쓴다.",
  },
  "no-emoji-icon": {
    section: "아이콘",
    summary:
      "JSX 본문·속성·문자열의 그림 이모지를 막는다. 아이콘은 Phosphor(@phosphor-icons/react)를 쓰고, 서버 컴포넌트에서는 /dist/ssr 경로로 import 한다.",
  },
  "no-external-url": {
    section: "폐쇄망 대응",
    summary:
      "외부 http(s) URL 리터럴과 next.config 의 images.remotePatterns 를 막는다. 폰트·아이콘·이미지는 전부 self-host 한다.",
  },
  "no-nested-ui-dir": {
    section: "컴포넌트",
    summary:
      "components/ui/ 안에 하위 폴더(components/ui/customs/ 등)를 만들어 커스텀을 끼워 넣는 것을 막는다. 커스텀은 components/ 또는 components/patterns/ 에서 조합한다.",
  },
  "require-route-boundaries": {
    section: "페이지 · 라우팅",
    summary:
      "app 라우터의 page 파일에 loading·error 경계가 없으면 보고한다. 상위 세그먼트가 이미 제공하면 통과한다(Next 의 실제 적용 범위와 같게 판정).",
  },
}

/**
 * 기계 판정 상태.
 * - `rules` — 이 플러그인의 규칙이 막는다.
 * - `delegated` — 표준 도구가 이미 막는다. 어느 도구인지 적는다.
 * - `judgment` — 사람·AI 의 판단이 필요해 정적으로 판정할 수 없다.
 * - `catalog-gate` — 소비 프로젝트가 아니라 카탈로그 레포의 테스트가 막는 절이다.
 * - `aggregate` — 다른 절의 요약이라 자체 검사가 없다.
 */
export const COVERAGE_STATUSES = ["rules", "delegated", "judgment", "catalog-gate", "aggregate"]

/**
 * 불변 절 → 무엇이 그 절을 막는가.
 *
 * 키는 `RULES_SECTIONS` 의 제목과 같아야 하고, 불변 절이 빠지거나 남으면 테스트가 깨진다.
 * "아직 안 만들었다" 를 조용히 넘기지 않기 위한 장치다 — 기계로 못 잡는 절도
 * 못 잡는다고 명시적으로 적는다.
 */
export const COVERAGE = {
  "디자인 브리프 (생성 전 필수)": {
    status: "judgment",
    note: "DESIGN.md 의 존재는 볼 수 있으나 원형·성격·배제 목록이 실제로 결정을 잘라내는지는 내용 판정이라 정적으로 볼 수 없다. 배제 목록이 '어차피 안 쓸 것' 인지 여부가 이 절의 핵심인데 그 판정이 곧 사람·AI 의 일이다.",
  },
  "수렴 안티패턴": {
    status: "judgment",
    note: "'근거 없이 채택하지 않는다' 가 조항의 형태다 — 같은 코드가 브리프에 따라 위반이기도 아니기도 하다. 린트가 판정하면 전부 오탐이 된다.",
  },
  "컬러 · 토큰": { status: "rules", rules: ["no-hardcoded-color"] },
  컴포넌트: {
    status: "rules",
    rules: ["no-nested-ui-dir"],
    note: "'components/ui/ 를 손으로 고치지 않는다' 의 전면 판정은 상류 원문과의 대조가 필요해 외부 조회 없이는 소비 프로젝트에서 할 수 없다 — 폐쇄망 전제와 충돌하므로 카탈로그의 pnpm check:shadcn 에 남긴다. 정적으로 확정 가능한 조항(하위 폴더 끼워 넣기)만 규칙으로 배포한다.",
  },
  아이콘: { status: "rules", rules: ["no-emoji-icon"] },
  "페이지 · 라우팅": { status: "rules", rules: ["require-route-boundaries"] },
  접근성: {
    status: "delegated",
    note: "eslint-plugin-jsx-a11y 가 이미 막는다(eslint-config-next 의 core-web-vitals 에 포함). 명도대비·'색만으로 전달하지 않는다' 는 렌더 결과를 봐야 하므로 정적 린트의 대상이 아니다.",
  },
  "폐쇄망 대응": { status: "rules", rules: ["no-external-url"] },
  TypeScript: {
    status: "delegated",
    note: "@typescript-eslint/no-explicit-any 와 tsconfig 의 strict 가 막는다. 같은 것을 두 번 구현하지 않는다.",
  },
  "의존성 규율": {
    status: "judgment",
    note: "유지보수 상태·라이선스·번들 비용 판정이라 정적 규칙이 아니다. 판정 근거를 PR 에 남기는 것이 이 절의 절차다.",
  },
  "AI로 설치하기 (shadcn 커스텀 레지스트리)": {
    status: "catalog-gate",
    note: "registryDependencies 의 bare 이름·버전 범위 누락은 카탈로그의 scripts/registry/ui-items.test.ts·closure.test.ts 가 막는다. 소비 프로젝트의 소스에는 판정할 대상이 없다.",
  },
  "표준 준수 체크리스트": {
    status: "aggregate",
    note: "다른 절의 요약이다 — 각 항목은 해당 절의 판정을 따른다.",
  },
}
