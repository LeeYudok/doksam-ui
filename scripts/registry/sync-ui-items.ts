/**
 * `components/ui` 프리미티브 항목을 registry.json 에 다시 써 넣는다 (#57).
 *
 * 항목 내용은 손으로 적지 않고 파일의 import 에서 계산한다. 프리미티브를 추가·수정하거나
 * upstream.manifest.json 의 installDiff 를 갱신했으면 이것을 돌린다. 멱등이다.
 * 어긋나면 scripts/registry/ui-items.test.ts 가 실패한다.
 *
 *   pnpm registry:sync && pnpm registry:build && pnpm gen:llms
 */
import fs from "node:fs"
import path from "node:path"

import { REPO_ROOT, readRegistry } from "./closure.ts"
import { expectedUiItems, houseUiNames } from "./ui-items.ts"

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
