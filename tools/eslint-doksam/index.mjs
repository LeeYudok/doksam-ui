/**
 * eslint-plugin-doksam-ui — ui.doksam.com 표준의 불변(invariant) 조항 중
 * 정적으로 판정 가능한 것을 소비 프로젝트의 IDE·CI 에서 강제한다(이슈 #40).
 *
 * npm 레지스트리가 아니라 카탈로그의 shadcn 레지스트리로 배포한다 —
 * `npx shadcn add https://ui.doksam.com/r/eslint-plugin.json` 이 이 폴더를 그대로
 * 복사한다. 소비 프로젝트는 표준 자산을 이미 그 경로로 받고 있으므로 새 배포
 * 채널(npm 접근·사내 미러)을 전제하지 않는다 — 폐쇄망 전제와 같은 전제다.
 *
 * 런타임 의존성이 없다. ESLint 는 peer 로 전제하고, 이 파일들은 평문 ESM(.mjs)
 * 이라 빌드 단계도 없다.
 *
 * 사용 (eslint.config.mjs):
 *
 *   import doksam from "./tools/eslint-doksam/index.mjs"
 *   export default [ ...doksam.configs.recommended ]
 *
 * 규칙이 어느 조항에서 나왔는지는 meta.mjs 가 들고 있고, 규칙 원문과의 정합은
 * 카탈로그의 tools/eslint-doksam/coverage.test.ts 가 잠근다.
 */
import { RULE_META } from "./meta.mjs"
import noEmojiIcon from "./rules/no-emoji-icon.mjs"
import noExternalUrl from "./rules/no-external-url.mjs"
import noHardcodedColor from "./rules/no-hardcoded-color.mjs"
import noNestedUiDir from "./rules/no-nested-ui-dir.mjs"
import requireRouteBoundaries from "./rules/require-route-boundaries.mjs"

export const rules = {
  "no-hardcoded-color": noHardcodedColor,
  "no-emoji-icon": noEmojiIcon,
  "no-external-url": noExternalUrl,
  "no-nested-ui-dir": noNestedUiDir,
  "require-route-boundaries": requireRouteBoundaries,
}

const plugin = {
  meta: { name: "doksam-ui", version: "0.1.0" },
  rules,
}

/** 전 규칙을 error 로 켠 기본 설정. 불변 조항이므로 warn 이 아니다. */
const allErrors = Object.fromEntries(Object.keys(rules).map((name) => [`doksam-ui/${name}`, "error"]))

/** 전 규칙을 끈 설정 — 플러그인 자기 소스처럼 규칙이 적용될 자리가 아닌 곳에 쓴다. */
const allOff = Object.fromEntries(Object.keys(rules).map((name) => [`doksam-ui/${name}`, "off"]))

/**
 * 토큰을 정의하는 자리에서는 색 리터럴이 곧 데이터다 — 그 자리에서만 끈다.
 * 규칙 원문의 "themes/<name>.ts 를 추가한다" 가 가리키는 자리와 같다.
 */
const TOKEN_DEFINITION_FILES = [
  "themes/**",
  "**/themes/**",
  "**/*.config.{js,cjs,mjs,ts,mts}",
  // 시맨틱 토큰의 원천값을 적는 자리 — 여기서의 색 리터럴이 곧 토큰이다.
  "**/*-tokens.{ts,mts}",
  "**/tokens/**",
  "**/profile-css.ts",
]

/**
 * 색을 **데이터로 다루는** 파일 — 색 리터럴이 디자인 결정이 아니라 입력값이다.
 *
 * 테스트와 fixture 는 위반 사례 자체를 적어야 하고, 색을 고르거나 변환하는
 * 컴포넌트에서 팔레트는 사용자가 고를 후보지 화면의 시맨틱이 아니다.
 * 카탈로그 자신에게 돌려 실측했을 때 이 두 부류가 오탐의 대부분이었다.
 */
const COLOR_AS_DATA_FILES = [
  "**/color-picker*.{ts,tsx}",
  "**/*color-picker*.{ts,tsx}",
]

/**
 * 테스트와 fixture — 위반 사례 자체를 값으로 적어야 하는 자리다.
 *
 * 색뿐 아니라 외부 URL 도 마찬가지다(폐쇄망 검사를 검사하는 테스트는 외부 URL
 * 문자열을 입력으로 갖는다). 그래서 색만이 아니라 두 규칙을 함께 끈다.
 */
const TEST_FILES = ["**/*.test.{ts,tsx,mts}", "**/*.spec.{ts,tsx,mts}", "**/__fixtures__/**", "**/e2e/**"]

export const configs = {
  recommended: [
    {
      name: "doksam-ui/recommended",
      plugins: { "doksam-ui": plugin },
      rules: allErrors,
    },
    {
      name: "doksam-ui/token-definitions",
      files: TOKEN_DEFINITION_FILES,
      rules: { "doksam-ui/no-hardcoded-color": "off" },
    },
    {
      name: "doksam-ui/color-as-data",
      files: COLOR_AS_DATA_FILES,
      rules: { "doksam-ui/no-hardcoded-color": "off" },
    },
    {
      name: "doksam-ui/tests",
      files: TEST_FILES,
      rules: {
        "doksam-ui/no-hardcoded-color": "off",
        "doksam-ui/no-external-url": "off",
      },
    },
    {
      // 이 플러그인 자신의 소스에는 규칙이 잡아야 할 문자열이 예시로 들어 있다
      // (meta.mjs 의 요약문, no-external-url.mjs 의 remotePatterns 감지 등).
      name: "doksam-ui/self",
      files: ["**/eslint-doksam/**"],
      rules: allOff,
    },
  ],
}

plugin.configs = configs

export { RULE_META }
export default plugin
