/**
 * #57 증거 — **실제 설치본**과 카탈로그의 components/ui 를 대조한다.
 *
 * 매니페스트의 `customized` 는 상류 레지스트리 JSON **원문**과의 차이라, CLI 가 설치
 * 시점에 치환하는 자리(IconPlaceholder → 아이콘 라이브러리, cn-* 토큰, 메뉴 옵션)가
 * 섞여 있다. 그래서 "우리가 고친 것" 인지 "설치하면 같아지는 것" 인지 원문 비교로는
 * 가를 수 없다. 이 스크립트는 빈 프로젝트에 bare 이름으로 설치한 결과와 직접 비교한다.
 *
 * 준비 (네트워크·CLI 사용, 한 번만):
 *   pnpm dlx create-next-app@latest probe --ts --tailwind --eslint --app \
 *     --no-src-dir --turbopack --import-alias "@/*" --use-pnpm --yes
 *   cd probe && pnpm dlx shadcn@latest init -t next -b radix -p nova -y
 *   for n in $(ls ../components/ui/*.tsx | xargs -n1 basename | sed 's/.tsx//'); do \
 *     pnpm dlx shadcn@latest add $n -y --overwrite; done
 *
 * 실행:
 *   node scripts/manual/2026-09-17_issue-57_installed-vs-catalog.mjs <probe 디렉터리>
 *
 * 2026-09-17 실측: 60개 중 6개만 다르고, 그 6개는 상류가 카탈로그보다 앞선 것이었다.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const probe = process.argv[2]
if (!probe) {
  console.error("사용법: node scripts/manual/2026-09-17_issue-57_installed-vs-catalog.mjs <probe 디렉터리>")
  process.exit(1)
}

/** 설치본은 cn 별칭을 그대로 두고 import 순서가 다르다 — 그 차이는 내용 차이가 아니다. */
function meaning(src) {
  const lines = src.replace(/from ["']cn["']/g, 'from "@/lib/utils"').split("\n")
  const imports = lines.filter((l) => /^\s*import\s/.test(l)).sort()
  const rest = lines.filter((l) => !/^\s*import\s/.test(l))
  return [...imports, ...rest].join("\n").replace(/['"`]/g, "").replace(/;/g, "").replace(/\s+/g, " ").trim()
}

const catalogDir = join(ROOT, "components/ui")
const probeDir = join(probe, "components/ui")
const diff = []
let same = 0
for (const file of readdirSync(catalogDir).filter((f) => f.endsWith(".tsx")).sort()) {
  let installed
  try {
    installed = readFileSync(join(probeDir, file), "utf8")
  } catch {
    diff.push(`${file} (설치본에 없음)`)
    continue
  }
  if (meaning(installed) === meaning(readFileSync(join(catalogDir, file), "utf8"))) same += 1
  else diff.push(file)
}
console.log(`같음 ${same} / 다름 ${diff.length}`)
for (const file of diff) console.log(`  - ${file}`)
