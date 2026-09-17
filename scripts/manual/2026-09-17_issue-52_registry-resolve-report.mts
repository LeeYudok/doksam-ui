/**
 * 이슈 #52 — 레지스트리 항목별 "배포 시 끊어지는 import" 보고서.
 * 실행: npx tsx scripts/manual/2026-09-17_issue-52_registry-resolve-report.mts
 */
import { readRegistry, unresolvedImports } from "../registry/closure"

const registry = readRegistry()
let total = 0
for (const item of registry.items) {
  const problems = unresolvedImports(item, registry)
  if (problems.length === 0) continue
  total += problems.length
  console.log("###", item.name, `(${problems.length})`)
  for (const resolved of [...new Set(problems.map((p) => p.resolved))].sort()) {
    console.log("   ", resolved)
  }
}
console.log("TOTAL", total)
