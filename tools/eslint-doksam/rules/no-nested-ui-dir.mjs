import { RULE_META } from "../meta.mjs"

/**
 * components/ui/ 안에 하위 폴더를 만들어 커스텀을 끼워 넣는 것을 막는다 —
 * 규칙 원문 "컴포넌트" 절의 4번 조항.
 *
 * components/ui/ 는 shadcn CLI 가 설치한 상류 원본이 놓이는 평평한 디렉터리다.
 * 그 안에 components/ui/customs/ 같은 폴더가 생기면 "손대지 않는 영역" 의 경계가
 * 흐려지고, 상류 재설치·드리프트 대조가 하우스 코드까지 훑게 된다.
 *
 * 절의 다른 조항("components/ui/ 를 손으로 고치지 않는다")의 전면 판정은 상류
 * 원문과의 대조가 필요해 폐쇄망 소비 프로젝트에서는 할 수 없다 — 카탈로그의
 * `pnpm check:shadcn` 이 맡는다. 여기서는 정적으로 확정되는 것만 본다.
 */

/** `.../components/ui/<sub>/<file>` 인가. src/ 레이아웃도 같이 본다. */
function nestedSegment(filename) {
  const normalized = filename.replaceAll("\\", "/")
  const marker = "/components/ui/"
  const at = normalized.lastIndexOf(marker)
  if (at === -1) return null
  const rest = normalized.slice(at + marker.length)
  const slash = rest.indexOf("/")
  return slash === -1 ? null : rest.slice(0, slash)
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: RULE_META["no-nested-ui-dir"].summary,
      section: RULE_META["no-nested-ui-dir"].section,
      url: "https://ui.doksam.com/rules/lint",
    },
    schema: [],
    messages: {
      nestedUiDir:
        "components/ui/{{segment}}/ — components/ui/ 안에 하위 폴더를 만들지 않는다. 커스텀은 components/ 또는 components/patterns/ 에서 프리미티브를 조합한다. doksam-ui 규칙 [invariant] '컴포넌트' (https://ui.doksam.com/rules)",
    },
  },

  create(context) {
    return {
      Program(node) {
        const segment = nestedSegment(context.filename ?? context.getFilename())
        if (!segment) return
        context.report({ node, messageId: "nestedUiDir", data: { segment } })
      },
    }
  },
}
