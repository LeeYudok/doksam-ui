/** index.mjs 의 타입 선언 — 소비 프로젝트의 eslint.config 와 카탈로그 테스트가 읽는다. */
import type { ESLint, Linter, Rule } from "eslint"

export declare const rules: Record<string, Rule.RuleModule>

export declare const configs: {
  /** 전 규칙을 error 로 켜고, 토큰 정의 파일에서만 색 규칙을 끈 기본 설정. */
  recommended: Linter.Config[]
}

export { RULE_META } from "./meta.mjs"

declare const plugin: ESLint.Plugin & {
  rules: Record<string, Rule.RuleModule>
  configs: typeof configs
}

export default plugin
