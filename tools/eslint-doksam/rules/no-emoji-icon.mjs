import { RULE_META } from "../meta.mjs"

/**
 * 이모지를 아이콘 대용으로 쓰는 것을 막는다 — 규칙 원문 "아이콘" 절의 마지막 조항.
 *
 * "이모지로 렌더되는 글자" 만 본다. `\p{Extended_Pictographic}` 하나로 잡으면
 * 화살표(↔)·삼각형(▶)·체크(✔) 같은 **글자 표현이 기본인** 기호까지 걸린다 —
 * 그중 상당수는 본문 안의 문장부호라 아이콘 대용이 아니다(카탈로그 자신에게
 * 돌려 실측했다). 그래서 두 가지만 본다.
 *
 *  1. `Emoji_Presentation=Yes` — 기본 표현이 이모지인 글자 (✅ 🚀 📊)
 *  2. 그림 문자 + 변이 선택자 U+FE0F — 이모지로 렌더해 달라고 명시한 글자 (⚠️)
 *
 * 한글·한자·문장부호는 애초에 걸리지 않으므로 `grep '[^\x00-\x7F]'` 식 스캔의
 * 오탐(한국어 본문 전체)도 없다. 주석은 보지 않는다 — 렌더되지 않는 글이다.
 */

const EMOJI_SOURCE = "(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic}\\uFE0F)"
const EMOJI = new RegExp(EMOJI_SOURCE, "u")
const EMOJI_ALL = new RegExp(EMOJI_SOURCE, "gu")

function pictographs(text) {
  return [...text.matchAll(EMOJI_ALL)].map((match) => match[0])
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: RULE_META["no-emoji-icon"].summary,
      section: RULE_META["no-emoji-icon"].section,
      url: "https://ui.doksam.com/rules/lint",
    },
    schema: [],
    messages: {
      emojiIcon:
        "이모지 '{{value}}' 를 아이콘 대용으로 쓰지 않는다 — Phosphor(@phosphor-icons/react, 서버 컴포넌트는 /dist/ssr)를 쓴다. doksam-ui 규칙 [invariant] '아이콘' (https://ui.doksam.com/rules)",
    },
  },

  create(context) {
    const report = (node, text) => {
      if (typeof text !== "string" || !EMOJI.test(text)) return
      for (const value of pictographs(text)) {
        context.report({ node, messageId: "emojiIcon", data: { value } })
      }
    }

    return {
      JSXText(node) {
        report(node, node.value)
      },
      Literal(node) {
        if (typeof node.value === "string") report(node, node.value)
      },
      TemplateElement(node) {
        report(node, node.value.cooked ?? node.value.raw)
      },
    }
  },
}
