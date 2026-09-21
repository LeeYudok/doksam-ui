import path from "node:path"
import { fileURLToPath } from "node:url"

import { RuleTester } from "eslint"
import { describe, it } from "vitest"

import { rules } from "./index.mjs"

/**
 * 규칙별 통과·실패 픽스처. ESLint 9 의 RuleTester 는 flat config 형식을 받는다.
 *
 * vitest 는 describe/it 을 전역으로 노출하지 않으므로 RuleTester 에 직접 물려 준다 —
 * 안 그러면 RuleTester 가 자체 러너로 떨어져 실패가 vitest 보고에 안 잡힌다.
 */
RuleTester.describe = describe
RuleTester.it = it

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__")

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

tester.run("no-hardcoded-color", rules["no-hardcoded-color"], {
  valid: [
    { code: `const cls = "bg-background text-muted-foreground"` },
    { code: `const cls = "text-chart-1 border-border ring-ring"` },
    { code: `const cls = "hover:bg-accent dark:text-foreground"` },
    // 등락색은 토큰으로 — 팔레트 이름이 아니라 시맨틱 이름이다.
    { code: `const cls = "text-[--gain] bg-[--loss]"` },
    // 앵커 링크는 3자리 hex 와 글자가 같다 — 색 문맥이 아니면 잡지 않는다.
    { code: `const href = "#faq"` },
    { code: `const el = <a href="#abc">go</a>` },
    // 색 이름이 들어가도 팔레트 조합이 아니면 통과한다.
    { code: `const cls = "border-b-2 text-sm"` },
    // 데이터가 곧 색인 자리는 allow 로 뺀다.
    {
      code: `const swatches = ["#ef4444"]`,
      options: [{ allow: ["#ef4444"] }],
    },
  ],
  invalid: [
    {
      code: `const cls = "text-red-500"`,
      errors: [{ messageId: "hardcodedColor", data: { value: "text-red-500" } }],
    },
    {
      code: `const cls = "dark:hover:bg-slate-200/50"`,
      errors: [{ messageId: "hardcodedColor", data: { value: "dark:hover:bg-slate-200/50" } }],
    },
    {
      code: `const cls = "border-t-blue-600"`,
      errors: 1,
    },
    {
      code: `const cls = "bg-white text-black"`,
      errors: 2,
    },
    {
      code: `const style = { backgroundColor: "#0f172a" }`,
      errors: [{ messageId: "hardcodedColor", data: { value: "#0f172a" } }],
    },
    {
      // 3자리 hex 는 색 문맥에서만.
      code: `const style = { color: "#fff" }`,
      errors: [{ messageId: "hardcodedColor", data: { value: "#fff" } }],
    },
    {
      code: `const style = { color: "rgba(15, 23, 42, 0.5)" }`,
      errors: [{ messageId: "hardcodedColor", data: { value: "rgba()" } }],
    },
    {
      code: `const cls = \`bg-[#0f172a] \${extra}\``,
      errors: 1,
    },
    {
      code: `const el = <div className="bg-emerald-600" />`,
      errors: 1,
    },
  ],
})

tester.run("no-emoji-icon", rules["no-emoji-icon"], {
  valid: [
    { code: `const el = <CheckCircleIcon weight="fill" />` },
    // 한글·한자·문장부호는 그림 문자가 아니다 — 본문 전체를 잡는 grep 과 다른 지점.
    { code: `const el = <p>저장되었습니다 · 확인 — 100%</p>` },
    { code: `const notice = "© 2026 doksam"` },
    { code: `// 이모지 아이콘 금지 ✅ 는 주석이라 대상이 아니다` },
  ],
  invalid: [
    {
      code: `const el = <button>✅ 저장</button>`,
      errors: [{ messageId: "emojiIcon", data: { value: "✅" } }],
    },
    {
      code: `const el = <span aria-label="경고">⚠️</span>`,
      errors: 1,
    },
    {
      code: `const label = "🚀 배포"`,
      errors: 1,
    },
    {
      code: `const label = \`📊 \${count}건\``,
      errors: 1,
    },
  ],
})

tester.run("no-external-url", rules["no-external-url"], {
  valid: [
    { code: `const src = "/images/placeholder.png"` },
    { code: `const ns = "http://www.w3.org/2000/svg"` },
    { code: `const dev = "http://localhost:3000/api"` },
    { code: `const config = { images: { remotePatterns: [] } }` },
    {
      code: `const internal = "https://intra.doksam.local/asset.woff2"`,
      options: [{ allow: ["https://intra.doksam.local"] }],
    },
  ],
  invalid: [
    {
      code: `const font = "https://fonts.googleapis.com/css2?family=Inter"`,
      errors: [{ messageId: "externalUrl" }],
    },
    {
      code: `const el = <img src="https://i.pravatar.cc/100" alt="" />`,
      errors: 1,
    },
    {
      code: `const res = await fetch(\`https://api.example.com/\${id}\`)`,
      errors: 1,
    },
    {
      code: `const config = { images: { remotePatterns: [{ hostname: "cdn.example.com" }] } }`,
      errors: [{ messageId: "remotePatterns" }],
    },
  ],
})

tester.run("no-nested-ui-dir", rules["no-nested-ui-dir"], {
  valid: [
    { code: `export const x = 1`, filename: "/repo/components/ui/button.tsx" },
    { code: `export const x = 1`, filename: "/repo/components/patterns/state-empty.tsx" },
    { code: `export const x = 1`, filename: "/repo/src/components/ui/card.tsx" },
  ],
  invalid: [
    {
      code: `export const x = 1`,
      filename: "/repo/components/ui/customs/fancy-button.tsx",
      errors: [{ messageId: "nestedUiDir", data: { segment: "customs" } }],
    },
    {
      code: `export const x = 1`,
      filename: "/repo/src/components/ui/house/table.tsx",
      errors: 1,
    },
  ],
})

tester.run("require-route-boundaries", rules["require-route-boundaries"], {
  valid: [
    // 같은 세그먼트가 둘 다 갖고 있다.
    { code: `export default function Page() { return null }`, filename: path.join(FIXTURES, "app/covered/page.tsx") },
    // 상위 세그먼트의 경계가 하위에도 적용된다 — Next 의 실제 적용 범위.
    {
      code: `export default function Page() { return null }`,
      filename: path.join(FIXTURES, "app/covered/nested/page.tsx"),
    },
    // App Router 밖의 page.tsx 는 판정 대상이 아니다.
    { code: `export default function Page() { return null }`, filename: path.join(FIXTURES, "plain/page.tsx") },
    // page 파일이 아니면 보지 않는다.
    { code: `export default function Loading() { return null }`, filename: path.join(FIXTURES, "app/bare/loading.tsx") },
  ],
  invalid: [
    {
      code: `export default function Page() { return null }`,
      filename: path.join(FIXTURES, "app/bare/page.tsx"),
      errors: [{ messageId: "missingBoundary", data: { missing: "loading.tsx · error.tsx" } }],
    },
    {
      code: `export default function Page() { return null }`,
      filename: path.join(FIXTURES, "app/partial/page.tsx"),
      errors: [{ messageId: "missingBoundary", data: { missing: "error.tsx" } }],
    },
  ],
})
