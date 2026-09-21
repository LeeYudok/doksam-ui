import fs from "node:fs"
import path from "node:path"

import { REPO_ROOT, collectSpecifiers, packageOfSpecifier, resolveSpecifier, type RegistryItem } from "./closure.ts"

/**
 * `components/ui/` 프리미티브를 레지스트리 항목으로 계산한다 (이슈 #57).
 *
 * 배포 항목이 `registryDependencies: ["button"]` 처럼 bare 이름으로 가리키면 소비
 * 프로젝트는 그 이름을 **ui.shadcn.com** 에서 받는다. 그러면 무엇이 깔리는지가
 * 카탈로그가 아니라 **소비 프로젝트의 init 프리셋(style·base·아이콘 라이브러리)과
 * 상류의 현재 버전**에 달린다 — 실측하면 상류 radix-nova 는 이미 6개 파일에서
 * 카탈로그보다 앞서 있고, 다른 프리셋(base-nova 등)으로 init 한 프로젝트는 아예 다른
 * 파일을 받는다.
 *
 * 그래서 프리미티브를 우리 항목으로 배포하고 의존을 `https://ui.doksam.com/r/<name>.json`
 * 으로 돌린다. 항목 내용은 손으로 적지 않고 **파일의 import 에서 계산한다** — 손으로
 * 적으면 프리미티브가 바뀔 때마다 어긋나고, 그 어긋남은 소비 프로젝트에서만 드러난다.
 */

export const UI_DIR = "components/ui"
const REGISTRY_BASE = "https://ui.doksam.com/r"

/** 소비 프로젝트가 이미 갖고 있어 항목이 실을 필요가 없는 패키지. */
const FRAMEWORK_PACKAGES = new Set(["react", "react-dom", "next"])

/** `shadcn init` 이 만들어 주는 파일 — 어떤 항목도 싣지 않는다. */
const ALWAYS_PROVIDED = new Set(["lib/utils.ts"])

/** 파일 종류 → shadcn 항목 파일 타입. */
function fileType(relative: string): string {
  if (relative.startsWith("hooks/")) return "registry:hook"
  if (relative.startsWith("lib/")) return "registry:lib"
  if (relative.startsWith(`${UI_DIR}/`)) return "registry:ui"
  return "registry:component"
}

/** `components/ui/*.tsx` 전부 — 이름만 (확장자 제외). */
export function houseUiNames(): string[] {
  return fs
    .readdirSync(path.join(REPO_ROOT, UI_DIR))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""))
    .sort()
}

/** package.json 의 버전 범위 — 항목 의존성에 그대로 박는다(범위가 없으면 latest 가 깔린다). */
function versionRanges(): Record<string, string> {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>
  }
  return pkg.dependencies ?? {}
}

/** `native-select` → `Native Select`. */
function titleOf(name: string): string {
  return name
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

interface ManifestEntry {
  customized?: boolean
  groups?: string[]
  note?: string
}

interface Manifest {
  components: Record<string, ManifestEntry>
  /** 빈 프로젝트에 실제로 설치해 대조한 결과 — 원문 해시 비교와 달리 CLI 치환이 섞이지 않는다. */
  installDiff?: { measuredAt?: string; files?: Record<string, string> }
}

function readManifestFile(): Manifest {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, UI_DIR, "upstream.manifest.json"), "utf8")) as Manifest
}

export function readManifest(): Record<string, ManifestEntry> {
  return readManifestFile().components
}

/** 설치본과 실제로 다른 파일 — 사유 문장이 값이다. */
export function readInstallDiff(): Record<string, string> {
  return readManifestFile().installDiff?.files ?? {}
}

/**
 * 매니페스트 기준으로 **같은 프리셋으로 실제 설치했을 때와 다른** 프리미티브인지 (#62).
 *
 * 예전에는 "상류 레지스트리 JSON 원문과 다름" 이었다. 원문에는 CLI 가 설치 시점에
 * 치환하는 자리가 섞여 있어 그 뜻으로는 60개 중 28개가 걸렸지만, 실제 설치본과
 * 대조하면 1개다. 이제 `customized` 와 `installDiff.files` 는 같은 집합이다.
 */
export function isDivergent(name: string, manifest = readManifest()): boolean {
  return manifest[`${name}.tsx`]?.customized === true
}

/**
 * 항목 설명문.
 *
 * 매니페스트의 `customized`/`groups` 를 근거로 쓰지 않는다 — 그 값은 상류 레지스트리
 * **원문**과의 차이라 CLI 가 설치 시점에 치환하는 자리까지 포함한다. 그걸 "하우스
 * 스타일" 이라고 적으면 **낡아서 다른 파일까지 의도한 차이로 공표**하게 된다.
 * 실제로 checkbox·radio-group·switch·field 는 상류가 포커스 가시성 클래스를 더한
 * 쪽이다(#61). 근거는 실측한 `installDiff` 만 쓴다.
 */
function describe(name: string, installDiff: Record<string, string>): string {
  const behind = installDiff[`${name}.tsx`]
  if (behind) {
    return `${titleOf(name)} 프리미티브. 카탈로그가 렌더하는 것과 같은 파일을 배포한다. 이 파일은 상류 shadcn 이 앞서 있다 — ${behind} (#61 에서 갱신한다).`
  }
  return `${titleOf(name)} 프리미티브. 카탈로그가 렌더하는 것과 같은 파일을 배포한다 — bare 이름으로 상류에서 받으면 소비 프로젝트의 프리셋·상류 버전에 따라 내용이 갈린다.`
}

/**
 * 프리미티브 하나의 항목을 그 파일의 import 에서 계산한다.
 * 같은 디렉터리의 다른 프리미티브는 registryDependencies(URL)로, 그 밖의 레포 파일은
 * 이 항목이 직접 싣는다(`sidebar` 의 `hooks/use-mobile`).
 */
export function buildUiItem(name: string, installDiff = readInstallDiff(), ranges = versionRanges()): RegistryItem {
  const entry = `${UI_DIR}/${name}.tsx`
  const files = new Set<string>([entry])
  const packages = new Set<string>()
  const registryDeps = new Set<string>()
  const queue = [entry]
  const seen = new Set<string>()

  while (queue.length) {
    const current = queue.shift()!
    if (seen.has(current)) continue
    seen.add(current)
    const source = fs.readFileSync(path.join(REPO_ROOT, current), "utf8")
    for (const spec of collectSpecifiers(source)) {
      const resolution = resolveSpecifier(spec, current)
      if (resolution.kind === "external") {
        const pkg = packageOfSpecifier(spec)
        if (!FRAMEWORK_PACKAGES.has(pkg)) packages.add(pkg)
        continue
      }
      if (resolution.kind === "missing") {
        throw new Error(`${current} 의 ${spec} 가 레포 안에서 해소되지 않는다`)
      }
      const target = resolution.path
      if (ALWAYS_PROVIDED.has(target)) continue
      // 프리미티브 파일 이름 규약은 kebab-case 지만, 정규식이 좁으면 규약을 벗어난
      // 파일이 registryDependency 가 아니라 이 항목의 files 로 빨려들어가 여러 항목이
      // 같은 파일을 싣게 된다. 이름 모양이 아니라 "components/ui 안의 단일 파일" 로 본다.
      const sibling = target.match(new RegExp(`^${UI_DIR}/([^/]+)\\.tsx?$`))
      if (sibling) {
        if (sibling[1] !== name) registryDeps.add(`${REGISTRY_BASE}/${sibling[1]}.json`)
        continue
      }
      // 프리미티브가 끌고 오는 레포 안 파일(훅 등)은 이 항목이 직접 싣는다.
      files.add(target)
      queue.push(target)
    }
  }

  const item: RegistryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:ui",
    title: titleOf(name),
    description: describe(name, installDiff),
  } as RegistryItem

  if (packages.size) {
    item.dependencies = [...packages]
      .sort()
      .map((pkg) => (ranges[pkg] ? `${pkg}@${ranges[pkg]}` : pkg))
  }
  item.files = [...files].sort().map((p) => ({ path: p, type: fileType(p) }))
  if (registryDeps.size) item.registryDependencies = [...registryDeps].sort()
  return item
}

/** 프리미티브 항목 전체 — registry.json 의 해당 부분은 이것과 일치해야 한다. */
export function expectedUiItems(): RegistryItem[] {
  const installDiff = readInstallDiff()
  const ranges = versionRanges()
  return houseUiNames().map((name) => buildUiItem(name, installDiff, ranges))
}
