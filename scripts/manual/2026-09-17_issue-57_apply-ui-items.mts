/**
 * #57 적용 — 포크 프리미티브를 레지스트리 항목으로 싣고, bare registryDependencies 를
 * 우리 레지스트리 URL 로 돌린다. 한 번 돌리고 나면 결과는 registry.json 에 남는다.
 * 이후의 드리프트는 scripts/registry/ui-items.test.ts 가 막는다.
 *
 *   node --experimental-strip-types scripts/manual/2026-09-17_issue-57_apply-ui-items.mts
 */
import fs from "node:fs"
import path from "node:path"

import { REPO_ROOT, readRegistry } from "../registry/closure"
import { expectedUiItems, houseUiNames } from "../registry/ui-items"

const registry = readRegistry()
const uiNames = new Set(houseUiNames())
const kept = registry.items.filter((item) => !uiNames.has(item.name))

for (const item of kept) {
  if (!item.registryDependencies) continue
  item.registryDependencies = [
    ...new Set(
      item.registryDependencies.map((dep) =>
        /^https?:/.test(dep) ? dep : uiNames.has(dep) ? `https://ui.doksam.com/r/${dep}.json` : dep,
      ),
    ),
  ].sort()
}

const bareLeft = kept.flatMap((i) => (i.registryDependencies ?? []).filter((d) => !/^https?:/.test(d)))
if (bareLeft.length) console.log("남은 bare 의존:", [...new Set(bareLeft)].join(", "))

const out = { ...registry, items: [...kept, ...expectedUiItems()] }
fs.writeFileSync(path.join(REPO_ROOT, "registry.json"), `${JSON.stringify(out, null, 2)}\n`)
console.log(`항목 ${registry.items.length} → ${out.items.length} (프리미티브 ${uiNames.size}개 추가)`)
