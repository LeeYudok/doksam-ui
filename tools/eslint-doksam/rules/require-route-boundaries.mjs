import fs from "node:fs"
import path from "node:path"

import { RULE_META } from "../meta.mjs"

/**
 * 새 라우트에 loading·error 경계가 없으면 보고한다 — 규칙 원문 "페이지 · 라우팅" 절.
 *
 * Next App Router 에서 `loading.tsx`·`error.tsx` 는 그 세그먼트와 **하위 전체**에
 * 적용된다. 그래서 "같은 폴더에 있는가" 로 판정하면 중첩 라우트마다 오탐이 난다 —
 * 상위 세그먼트를 `app/` 까지 거슬러 올라가며 본다. 이 판정 범위가 Next 의 실제
 * 적용 범위와 같다.
 *
 * 파일시스템을 직접 보는 규칙이라 RuleTester 도 실재하는 픽스처 경로로 돌린다.
 */

const PAGE_FILES = new Set(["page.tsx", "page.jsx", "page.ts", "page.js", "page.mdx"])
const EXTENSIONS = [".tsx", ".jsx", ".ts", ".js", ".mdx"]

/** 세그먼트 디렉터리에 그 규약 파일이 있는가. */
function hasConvention(dir, base) {
  return EXTENSIONS.some((ext) => fs.existsSync(path.join(dir, base + ext)))
}

/**
 * page 파일에서 `app/` 루트까지 올라가며 규약 파일을 찾는다.
 * app 디렉터리 밖이면 App Router 가 아니라고 보고 판정하지 않는다.
 */
function missingBoundaries(pageFile) {
  let dir = path.dirname(pageFile)
  const missing = new Set(["loading", "error"])
  for (;;) {
    for (const base of [...missing]) {
      if (hasConvention(dir, base)) missing.delete(base)
    }
    if (path.basename(dir) === "app") return [...missing]
    const parent = path.dirname(dir)
    if (parent === dir) return null // app/ 를 못 찾았다 — App Router 가 아니다.
    dir = parent
  }
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: RULE_META["require-route-boundaries"].summary,
      section: RULE_META["require-route-boundaries"].section,
      url: "https://ui.doksam.com/rules/lint",
    },
    schema: [],
    messages: {
      missingBoundary:
        "이 라우트에 {{missing}} 경계가 없다 — 새 라우트를 추가하면 loading.tsx 와 error.tsx 를 함께 만든다(상태 UI 는 ui.doksam.com/patterns/state). doksam-ui 규칙 [invariant] '페이지 · 라우팅' (https://ui.doksam.com/rules)",
    },
  },

  create(context) {
    return {
      Program(node) {
        const filename = context.filename ?? context.getFilename()
        if (!path.isAbsolute(filename)) return
        if (!PAGE_FILES.has(path.basename(filename))) return

        const missing = missingBoundaries(filename)
        if (!missing || missing.length === 0) return

        context.report({
          node,
          messageId: "missingBoundary",
          data: { missing: missing.map((base) => `${base}.tsx`).join(" · ") },
        })
      },
    }
  },
}
