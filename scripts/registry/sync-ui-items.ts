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

// 프리미티브가 아닌 bare 이름은 자동으로 URL 로 바꾸지 않는다 — 그러면 레지스트리에
// 없는 항목을 가리키는 끊어진 의존이 조용히 생긴다. 사람이 판단할 일이므로 멈춘다 (#63).
const bareLeft = [...new Set(kept.flatMap((i) => (i.registryDependencies ?? []).filter((d) => !/^https?:/.test(d))))]
if (bareLeft.length) {
  console.error(`프리미티브가 아닌 bare 의존이 남았다: ${bareLeft.join(", ")}`)
  console.error("레지스트리 항목이면 https://ui.doksam.com/r/<name>.json 으로 적고, 오타면 고쳐라.")
  process.exit(1)
}

const out = { ...registry, items: [...kept, ...expectedUiItems()] }
fs.writeFileSync(path.join(REPO_ROOT, "registry.json"), `${JSON.stringify(out, null, 2)}\n`)
console.log(`항목 ${registry.items.length} → ${out.items.length} (프리미티브 ${uiNames.size}개 추가)`)
