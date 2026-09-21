/**
 * `profile-*` 레지스트리 항목의 `cssVars` 를 다시 계산해 `registry.json` 에
 * 써 넣는다 (#36).
 *
 * 값은 손으로 적지 않고 `themes/*.ts` + `lib/sidebar-tokens.ts`(단일 진실원천)
 * 에서 계산한다(`lib/profile-registry-css-vars.ts`). 프로필의 `theme` 를
 * 바꾸거나 테마 프리셋 자체를 고쳤으면 이것을 돌린다. 멱등이다.
 * 어긋나면 `lib/profile-registry-css-vars.test.ts` 가 실패한다.
 *
 *   pnpm registry:sync:profiles && pnpm registry:build && pnpm gen:llms
 */
import fs from "node:fs"
import path from "node:path"

import { computeProfileRegistryCssVars } from "../../lib/profile-registry-css-vars.ts"
import { BRAND_PROFILES } from "../../profiles/index.ts"
import { REPO_ROOT, readRegistry } from "./closure.ts"

const registry = readRegistry()
let changed = 0
const skipped: string[] = []

for (const profile of BRAND_PROFILES) {
  const itemName = `profile-${profile.name}`
  const item = registry.items.find((i) => i.name === itemName)
  if (!item) {
    skipped.push(`${itemName} (registry.json 에 없음)`)
    continue
  }
  const cssVars = computeProfileRegistryCssVars(profile)
  if (!cssVars) {
    skipped.push(`${itemName} (theme "${profile.theme}" 을 themes/index.ts 에서 찾지 못함)`)
    continue
  }
  item.cssVars = cssVars
  changed++
}

fs.writeFileSync(path.join(REPO_ROOT, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`)
console.log(`profile cssVars 갱신: ${changed}개`)
if (skipped.length) console.log("건너뜀:", skipped.join(", "))
