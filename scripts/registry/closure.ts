import fs from "node:fs"
import path from "node:path"

import ts from "typescript"

/**
 * shadcn 배포 블록의 import 해소 여부를 정적으로 계산한다 (이슈 #52).
 *
 * 소비 프로젝트는 `npx shadcn add https://ui.doksam.com/r/<name>.json` 으로
 * 항목 하나를 받는다. 그때 실제로 복사되는 파일은 그 항목의 `files` 와
 * `registryDependencies` 로 이어지는 항목들의 `files` 뿐이다. 카탈로그 안에서는
 * 모든 import 가 해소되므로 typecheck·build 가 통과해도, 배포본에서는
 * 끊어져 있을 수 있다 — 그 간극을 여기서 계산한다.
 *
 * 앱 런타임 코드가 아니라 빌드·검증 도구다. `node:fs` 를 쓰므로 `lib/` 가 아니라
 * `scripts/` 에 둔다.
 */

/** 레포 루트 — `registry.json` 이 있는 가장 가까운 상위 디렉터리. */
function findRepoRoot(): string {
  let dir = process.cwd()
  for (;;) {
    if (fs.existsSync(path.join(dir, "registry.json")) && fs.existsSync(path.join(dir, "components.json"))) return dir
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

export interface RegistryCssVars {
  theme?: Record<string, string>
  light?: Record<string, string>
  dark?: Record<string, string>
}

export interface RegistryItem {
  $schema?: string
  name: string
  type: string
  title?: string
  description?: string
  files?: RegistryFile[]
  registryDependencies?: string[]
  dependencies?: string[]
  cssVars?: RegistryCssVars
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
 * 파일이 **대소문자까지 정확히** 그 이름으로 존재하는지 본다.
 * macOS(APFS 기본)는 대소문자를 구분하지 않아 `existsSync` 만으로는
 * `@/components/UI/Button` 같은 오타가 통과한다 — 리눅스 소비자에서만 깨진다.
 */
function existsExact(relative: string): boolean {
  const abs = path.join(REPO_ROOT, relative)
  if (!fs.existsSync(abs)) return false
  // 레포 루트까지 각 구간의 실제 철자를 확인한다.
  let current = abs
  while (current !== REPO_ROOT) {
    const parent = path.dirname(current)
    if (!fs.readdirSync(parent).includes(path.basename(current))) return false
    current = parent
  }
  return true
}

/** import 지정자 해소 결과. */
export type Resolution =
  | { kind: "external" } // npm 패키지 — 배포 대상이 아니다
  | { kind: "resolved"; path: string } // 레포 안 파일
  | { kind: "missing"; path: string } // 레포 안을 가리키는데 그런 파일이 없다

/**
 * 파일이 import 하는 모듈 지정자를 모은다.
 *
 * 정규식이 아니라 TypeScript 파서를 쓴다 — 주석·문자열 안의 import 를 오탐하지
 * 않고, `import{A}from"x"` 처럼 공백이 없는 형태나 동적 import·`require` 도 잡는다.
 * (`ts.preProcessFile` 은 `export * as ns from "x"` 를 놓쳐서 쓰지 않는다.)
 */
export function collectSpecifiers(source: string): string[] {
  const file = ts.createSourceFile("probe.tsx", source, ts.ScriptTarget.Latest, /* setParentNodes */ false, ts.ScriptKind.TSX)
  const found: string[] = []

  const add = (node: ts.Expression | undefined) => {
    if (node && ts.isStringLiteralLike(node)) found.push(node.text)
  }

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier)
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      add(node.moduleReference.expression)
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression
      const isDynamicImport = callee.kind === ts.SyntaxKind.ImportKeyword
      const isRequire = ts.isIdentifier(callee) && callee.text === "require"
      if (isDynamicImport || isRequire) add(node.arguments[0])
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(file, visit)

  return found
}

/** 지정자를 레포 상대 경로로 해소한다. */
export function resolveSpecifier(spec: string, fromFile: string): Resolution {
  let base: string
  if (spec.startsWith("@/")) base = spec.slice(2)
  else if (spec.startsWith(".")) base = path.posix.join(path.posix.dirname(fromFile), spec)
  else return { kind: "external" }

  for (const ext of EXTENSIONS) {
    const candidate = base + ext
    // 디렉터리도 existsSync 는 true 라 파일 여부까지 본다 — `@/profiles` 는
    // 디렉터리가 아니라 `profiles/index.ts` 로 해소돼야 한다.
    const abs = path.join(REPO_ROOT, candidate)
    if (fs.existsSync(abs) && fs.statSync(abs).isFile() && existsExact(candidate)) {
      return { kind: "resolved", path: candidate }
    }
  }
  return { kind: "missing", path: base }
}

/** 레포 안에 그 파일이 실제로 있는지. */
export function fileExists(relative: string): boolean {
  const abs = path.join(REPO_ROOT, relative)
  return fs.existsSync(abs) && fs.statSync(abs).isFile() && existsExact(relative)
}

/** 항목 이름 또는 URL 에서 항목 이름만 남긴다. */
export function registryDependencyName(dep: string): string {
  if (dep.startsWith("http://") || dep.startsWith("https://")) {
    return dep.split("/").pop()!.replace(/\.json$/, "")
  }
  return dep.includes("/") ? dep.split("/").pop()! : dep
}

/**
 * 상류 shadcn 이 같은 이름으로 제공하는 프리미티브 — `components/ui/upstream.manifest.json` 이 원천.
 *
 * **"상류에 같은 이름이 있다" 는 "같은 파일이 깔린다" 가 아니다**(#57). bare 이름으로
 * 받으면 내용이 소비 프로젝트의 init 프리셋과 상류의 현재 버전에 달리게 된다 —
 * 실제로 6개 파일은 이미 상류가 카탈로그보다 앞서 있다.
 */
export function upstreamComponentNames(): Set<string> {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "components/ui/upstream.manifest.json"), "utf8"),
  ) as { components: Record<string, { upstream: string | null }> }
  return new Set(
    Object.entries(manifest.components)
      // `upstream: null` = 상류에 없는 하우스 전용 프리미티브 — `shadcn add <name>` 이 실패한다.
      .filter(([, meta]) => meta.upstream !== null)
      .map(([file]) => file.replace(/\.tsx?$/, "")),
  )
}

/**
 * 상류 레지스트리 원문과 내용이 다른 프리미티브 — bare 이름으로는 같은 것을 받는다는
 * 보장이 없다. (그 차이에는 CLI 가 설치 시 치환하는 자리도 섞여 있다. 판정의 원천은
 * `components/ui/upstream.manifest.json` 이다.)
 */
export function divergentPrimitives(): Set<string> {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "components/ui/upstream.manifest.json"), "utf8"),
  ) as { components: Record<string, { customized?: boolean }> }
  return new Set(
    Object.entries(manifest.components)
      .filter(([, meta]) => meta.customized === true)
      .map(([file]) => file.replace(/\.tsx?$/, "")),
  )
}

/**
 * 항목 하나를 설치했을 때 소비 프로젝트에 실제로 존재하게 되는 파일 집합.
 * 자기 `files` + registryDependencies 로 이어지는 모든 항목의 `files`.
 */
export function providedPaths(itemName: string, registry: Registry): Set<string> {
  const out = new Set<string>()
  const seen = new Set<string>()
  const upstream = upstreamComponentNames()
  const divergent = divergentPrimitives()

  const walk = (name: string) => {
    if (seen.has(name)) return
    seen.add(name)
    const item = registry.items.find((i) => i.name === name)
    if (!item) {
      // 우리 레지스트리에 없는 이름 = 상류 shadcn 에서 내려오는 파일이다(#57).
      // 내용이 카탈로그와 같다고 볼 수 없으므로, 상류 원문과 같은 이름일 때만 제공으로 센다.
      if (upstream.has(name) && !divergent.has(name)) out.add(`components/ui/${name}.tsx`)
      return
    }
    for (const f of item.files ?? []) out.add(f.path)
    for (const dep of item.registryDependencies ?? []) walk(registryDependencyName(dep))
  }
  walk(itemName)
  return out
}

/** 항목 하나를 설치했을 때 함께 깔리는 npm 패키지. */
export function providedPackages(itemName: string, registry: Registry): Set<string> {
  const out = new Set<string>()
  const seen = new Set<string>()
  const walk = (name: string) => {
    if (seen.has(name)) return
    seen.add(name)
    const item = registry.items.find((i) => i.name === name)
    if (!item) return
    for (const dep of item.dependencies ?? []) out.add(packageNameOf(dep))
    for (const dep of item.registryDependencies ?? []) walk(registryDependencyName(dep))
  }
  walk(itemName)
  return out
}

/** `@scope/pkg@^1.2.3` → `@scope/pkg`. */
export function packageNameOf(dependency: string): string {
  const at = dependency.lastIndexOf("@")
  if (at <= 0) return dependency
  return dependency.slice(0, at)
}

/** import 지정자에서 패키지 이름만 남긴다 — `@phosphor-icons/react/dist/ssr` → `@phosphor-icons/react`. */
export function packageOfSpecifier(spec: string): string {
  const parts = spec.split("/")
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

export interface UnresolvedImport {
  /** 끊어진 import 를 가진 파일 (레포 상대 경로). */
  from: string
  /** 원문 지정자. */
  specifier: string
  /** 해소된 레포 상대 경로 — 레포 안에 그 파일이 있으나 배포에 안 실린 경우. */
  resolved: string
  /** 레포 안에도 그런 파일이 없는 경우. */
  missing: boolean
}

/** 항목 하나에서 배포 시 해소되지 않는 import 를 모두 찾는다. */
export function unresolvedImports(item: RegistryItem, registry: Registry): UnresolvedImport[] {
  const provided = providedPaths(item.name, registry)
  const problems: UnresolvedImport[] = []

  for (const file of item.files ?? []) {
    if (!fileExists(file.path)) {
      problems.push({ from: file.path, specifier: "(파일 없음)", resolved: file.path, missing: true })
      continue
    }
    const source = fs.readFileSync(path.join(REPO_ROOT, file.path), "utf8")
    for (const spec of collectSpecifiers(source)) {
      const resolution = resolveSpecifier(spec, file.path)
      if (resolution.kind === "external") continue
      if (ALWAYS_PROVIDED.has(resolution.path)) continue
      if (resolution.kind === "resolved" && provided.has(resolution.path)) continue
      problems.push({
        from: file.path,
        specifier: spec,
        resolved: resolution.path,
        missing: resolution.kind === "missing",
      })
    }
  }
  return problems
}

/** 항목이 import 하는 npm 패키지 중 설치본에 선언되지 않은 것. */
export function undeclaredPackages(item: RegistryItem, registry: Registry): { from: string; pkg: string }[] {
  const declared = providedPackages(item.name, registry)
  const problems: { from: string; pkg: string }[] = []
  for (const file of item.files ?? []) {
    if (!fileExists(file.path)) continue
    const source = fs.readFileSync(path.join(REPO_ROOT, file.path), "utf8")
    for (const spec of collectSpecifiers(source)) {
      if (resolveSpecifier(spec, file.path).kind !== "external") continue
      const pkg = packageOfSpecifier(spec)
      // react·next 등 프레임워크는 소비 프로젝트가 이미 갖고 있다.
      if (FRAMEWORK_PACKAGES.has(pkg)) continue
      if (declared.has(pkg)) continue
      problems.push({ from: file.path, pkg })
    }
  }
  return problems
}

/** 소비 프로젝트가 이미 갖고 있다고 보는 패키지. */
const FRAMEWORK_PACKAGES = new Set(["react", "react-dom", "next"])

/** registry.json 을 읽는다. */
export function readRegistry(): Registry {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "registry.json"), "utf8")) as Registry
}
