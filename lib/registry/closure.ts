import fs from "node:fs"
import path from "node:path"

/**
 * shadcn 배포 블록의 import 해소 여부를 정적으로 계산한다 (이슈 #52).
 *
 * 소비 프로젝트는 `npx shadcn add https://ui.doksam.com/r/<name>.json` 으로
 * 항목 하나를 받는다. 그때 실제로 복사되는 파일은 그 항목의 `files` 와
 * `registryDependencies` 로 이어지는 항목들의 `files` 뿐이다. 카탈로그 안에서는
 * 모든 import 가 해소되므로 typecheck·build 가 통과해도, 배포본에서는
 * 끊어져 있을 수 있다 — 그 간극을 여기서 계산한다.
 */

/** 레포 루트 — `registry.json` 이 있는 가장 가까운 상위 디렉터리. */
function findRepoRoot(): string {
  let dir = process.cwd()
  for (;;) {
    if (fs.existsSync(path.join(dir, "registry.json"))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) throw new Error("registry.json 을 찾지 못했다 — 레포 안에서 실행해야 한다.")
    dir = parent
  }
}

export const REPO_ROOT = findRepoRoot()

export interface RegistryFile {
  path: string
  type?: string
  target?: string
}

export interface RegistryItem {
  name: string
  type: string
  files?: RegistryFile[]
  registryDependencies?: string[]
  dependencies?: string[]
}

export interface Registry {
  items: RegistryItem[]
}

/**
 * shadcn CLI 가 항목과 무관하게 항상 깔아 주는 별칭.
 * `components.json` 의 `aliases.utils` 가 가리키는 `lib/utils.ts` 는
 * `shadcn init` 단계에서 생성되므로 어떤 항목도 실을 필요가 없다.
 */
const ALWAYS_PROVIDED = new Set(["lib/utils.ts"])

const EXTENSIONS = [".ts", ".tsx", ".json", "", "/index.ts", "/index.tsx"]

/**
 * import 구문에서 모듈 지정자만 뽑는다.
 * `import x from "y"` · `export * from "y"` · `import("y")` 세 형태를 모두 본다.
 */
export function collectSpecifiers(source: string): string[] {
  const found: string[] = []
  const patterns = [
    /(?:^|[\s;}])(?:import|export)\s[^;]*?\sfrom\s*["']([^"']+)["']/g,
    /(?:^|[\s;}])import\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ]
  for (const re of patterns) {
    for (const m of source.matchAll(re)) found.push(m[1])
  }
  return found
}

/**
 * 지정자를 레포 상대 경로로 해소한다.
 * 레포 안 파일이 아니면(= npm 패키지) null.
 */
export function resolveSpecifier(spec: string, fromFile: string): string | null {
  let base: string
  if (spec.startsWith("@/")) base = spec.slice(2)
  else if (spec.startsWith(".")) base = path.posix.join(path.posix.dirname(fromFile), spec)
  else return null

  for (const ext of EXTENSIONS) {
    const candidate = base + ext
    // 디렉터리도 existsSync 는 true 라 파일 여부까지 본다 — `@/profiles` 는
    // 디렉터리가 아니라 `profiles/index.ts` 로 해소돼야 한다.
    const abs = path.join(REPO_ROOT, candidate)
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return candidate
  }
  // 레포 안을 가리키는데 파일이 없으면 끊어진 import 다 — 호출부가 알아야 한다.
  return base
}

/** 항목 이름 또는 URL 에서 항목 이름만 남긴다. */
export function registryDependencyName(dep: string): string {
  if (dep.startsWith("http://") || dep.startsWith("https://")) {
    return dep.split("/").pop()!.replace(/\.json$/, "")
  }
  // `@doksam-ui/foo` 같은 네임스페이스 표기도 이름만 취한다.
  return dep.includes("/") ? dep.split("/").pop()! : dep
}

/** 상류 shadcn 항목이 제공하는 파일 경로 (우리 레포 기준 같은 자리에 깔린다). */
function upstreamFiles(name: string): string[] {
  return [`components/ui/${name}.tsx`]
}

/**
 * 항목 하나를 설치했을 때 소비 프로젝트에 실제로 존재하게 되는 파일 집합.
 * 자기 `files` + registryDependencies 로 이어지는 모든 항목의 `files`.
 */
export function providedPaths(itemName: string, registry: Registry, seen = new Set<string>()): Set<string> {
  const out = new Set<string>()
  if (seen.has(itemName)) return out
  seen.add(itemName)

  const item = registry.items.find((i) => i.name === itemName)
  if (!item) {
    // 레지스트리에 없는 이름 = 상류 shadcn 항목.
    for (const f of upstreamFiles(itemName)) out.add(f)
    return out
  }
  for (const f of item.files ?? []) out.add(f.path)
  for (const dep of item.registryDependencies ?? []) {
    for (const p of providedPaths(registryDependencyName(dep), registry, seen)) out.add(p)
  }
  return out
}

export interface UnresolvedImport {
  /** 끊어진 import 를 가진 파일 (레포 상대 경로). */
  from: string
  /** 원문 지정자. */
  specifier: string
  /** 해소된 레포 상대 경로 — 레포 안에 그 파일이 있으나 배포에 안 실린 경우. */
  resolved: string
}

/** 항목 하나에서 배포 시 해소되지 않는 import 를 모두 찾는다. */
export function unresolvedImports(item: RegistryItem, registry: Registry): UnresolvedImport[] {
  const provided = providedPaths(item.name, registry)
  const problems: UnresolvedImport[] = []

  for (const file of item.files ?? []) {
    const abs = path.join(REPO_ROOT, file.path)
    if (!fs.existsSync(abs)) {
      problems.push({ from: file.path, specifier: "(파일 없음)", resolved: file.path })
      continue
    }
    const source = fs.readFileSync(abs, "utf8")
    for (const spec of collectSpecifiers(source)) {
      const resolved = resolveSpecifier(spec, file.path)
      if (resolved === null) continue // npm 패키지
      if (ALWAYS_PROVIDED.has(resolved)) continue
      if (provided.has(resolved)) continue
      problems.push({ from: file.path, specifier: spec, resolved })
    }
  }
  return problems
}

/** registry.json 을 읽는다. */
export function readRegistry(): Registry {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "registry.json"), "utf8")) as Registry
}
