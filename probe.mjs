import { ESLint } from "eslint"
import base from "./eslint.config.mjs"
import doksam from "./tools/eslint-doksam/index.mjs"

const eslint = new ESLint({
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
