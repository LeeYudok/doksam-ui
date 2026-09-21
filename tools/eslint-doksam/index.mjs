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

/**
 * 토큰을 정의하는 자리에서는 색 리터럴이 곧 데이터다 — 그 자리에서만 끈다.
 * 규칙 원문의 "themes/<name>.ts 를 추가한다" 가 가리키는 자리와 같다.
 */
const TOKEN_DEFINITION_FILES = ["themes/**", "**/themes/**", "**/*.config.{js,cjs,mjs,ts,mts}"]

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
  ],
}

plugin.configs = configs

export { RULE_META }
export default plugin
