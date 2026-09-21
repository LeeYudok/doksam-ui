/**
 * 린트 규칙 dogfood — 이 카탈로그 자신에게 doksam-ui 플러그인을 물려 돌린다 (#40).
 *
 * 규칙을 고치면 여기서 먼저 돌려 오탐을 본다. 소비 프로젝트보다 카탈로그가
 * 규칙에 더 많이 노출되므로(데모·템플릿·패턴이 전부 들어 있다) 오탐이 있으면
 * 여기서 먼저 드러난다. 실제로 이 스크립트로 95건 → 23건까지 좁혔고, 남은
 * 23건은 카탈로그의 실제 위반이다.
 *
 *   node scripts/lint-probe.mjs
 */
import { ESLint } from "eslint"
import base from "../eslint.config.mjs"
import doksam from "../tools/eslint-doksam/index.mjs"

const eslint = new ESLint({
  cwd: new URL("..", import.meta.url).pathname,
  overrideConfigFile: true,
  overrideConfig: [
    ...base,
    { ignores: ["tools/eslint-doksam/__fixtures__/**", "probe.mjs"] },
    ...doksam.configs.recommended,
  ],
})
const results = await eslint.lintFiles(["app", "components", "lib", "hooks", "themes", "scripts", "next.config.ts", "e2e", "test", "tools"])
const counts = new Map()
for (const r of results) for (const m of r.messages) {
  if (!m.ruleId?.startsWith("doksam-ui/")) continue
  counts.set(m.ruleId, (counts.get(m.ruleId) ?? 0) + 1)
}
console.log([...counts].sort((a,b)=>b[1]-a[1]))
const byFile = results.map(r=>[r.filePath.replace(process.cwd()+"/",""), r.messages.filter(m=>m.ruleId?.startsWith("doksam-ui/"))]).filter(r=>r[1].length)
console.log("files:", byFile.length)
for (const [f, ms] of byFile.sort((a,b)=>b[1].length-a[1].length).slice(0,30)) {
  console.log(f, ms.length, JSON.stringify(ms.slice(0,3).map(m=>`${m.line}:${m.ruleId?.split("/")[1]}:${m.message.slice(0,70)}`)))
}
