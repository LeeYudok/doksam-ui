/**
 * 배포용 i18n 사전을 "실제로 배포되는 코드가 참조하는 키만" 으로 줄인다 (GitHub #113).
 *
 * `i18n-provider` 항목은 `lib/i18n/messages/{en,ja,zh,es}.json` 전체(약 270KB, 568키)를
 * 그대로 싣는다. 그중 소비 프로젝트에 실제로 깔리는 컴포넌트가 쓰는 키는 극소수 —
 * 나머지는 `page`·`component`·`archetype`·`pattern`·`chrome.nav` 같은 **카탈로그 사이트
 * 자체의 산문**이라 설치본에서는 읽히지도 않는다(#98 리뷰에서 지적된 #99 SSOT 이식).
 *
 * `pnpm registry:build`(`shadcn build`) 뒤에 이 스크립트를 돌려 `public/r/i18n-provider.json`
 * 에 이미 구운(baked) 4개 사전 파일의 `content` 를 축약본으로 다시 쓴다. 소스 파일
 * (`lib/i18n/messages/*.json`)과 카탈로그 런타임(`lib/i18n/index.ts`)은 건드리지 않는다 —
 * 카탈로그 사이트는 여전히 전체 사전을 쓴다.
 *
 *   pnpm registry:build   (= shadcn build && node --experimental-strip-types scripts/registry/i18n-trim.ts)
 */
import fs from "node:fs"
import path from "node:path"

import ts from "typescript"

import { REPO_ROOT, readRegistry } from "./closure.ts"

/** t("<ns>.<key>", ...) / <TranslatedText k="<ns>.<key>" .../> 의 키 리터럴만 뽑는다(네임스페이스 무관). */
function extractKeysFromSource(source: string): string[] {
  const file = ts.createSourceFile("probe.tsx", source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)
  const found: string[] = []

  const isKeyLiteral = (node: ts.Expression | undefined): node is ts.StringLiteralLike =>
    !!node && ts.isStringLiteralLike(node) && /^[a-zA-Z][\w-]*(\.[\w-]+)+$/.test(node.text)

  const visit = (node: ts.Node) => {
    // t("ns.key", "ko 원문", ...)
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "t" &&
      isKeyLiteral(node.arguments[0])
    ) {
      found.push((node.arguments[0] as ts.StringLiteralLike).text)
    }
    // <TranslatedText k="ns.key" .../>
    if (ts.isJsxAttribute(node) && node.name.getText(file) === "k" && node.initializer) {
      const init = node.initializer
      const literal = ts.isStringLiteralLike(init) ? init : undefined
      if (isKeyLiteral(literal)) found.push(literal.text)
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(file, visit)
  return found
}

/**
 * 레지스트리(`registry.json`) 의 모든 항목이 싣는 파일을 통틀어, 그 소스가 실제로
 * 참조하는 i18n 키 집합. `lib/i18n/index.ts` 정적 import 대상인 메시지 JSON 자체는
 * 스캔하지 않는다(키가 아니라 값을 담고 있다).
 */
export function usedMessageKeys(registry: ReturnType<typeof readRegistry>): Set<string> {
  const paths = new Set<string>()
  for (const item of registry.items) {
    for (const f of item.files ?? []) {
      if (/\.tsx?$/.test(f.path)) paths.add(f.path)
    }
  }

  const keys = new Set<string>()
  for (const relPath of paths) {
    const abs = path.join(REPO_ROOT, relPath)
    if (!fs.existsSync(abs)) continue
    const source = fs.readFileSync(abs, "utf8")
    for (const key of extractKeysFromSource(source)) keys.add(key)
  }
  return keys
}

/** 전체 사전에서 쓰인 키만 남긴다(사전순 정렬 — diff 를 안정적으로 유지). */
export function trimMessages(full: Record<string, string>, used: Set<string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of Object.keys(full).sort()) {
    if (used.has(key)) out[key] = full[key]
  }
  return out
}

const LOCALES = ["en", "ja", "zh", "es"] as const

function main() {
  const registry = readRegistry()
  const used = usedMessageKeys(registry)

  const providerPath = path.join(REPO_ROOT, "public/r/i18n-provider.json")
  if (!fs.existsSync(providerPath)) {
    console.log("public/r/i18n-provider.json 이 없다 — registry:build(shadcn build) 를 먼저 돌려라.")
    return
  }
  const provider = JSON.parse(fs.readFileSync(providerPath, "utf8")) as {
    files: { path: string; content?: string; type?: string }[]
  }

  let before = 0
  let after = 0
  for (const locale of LOCALES) {
    const relPath = `lib/i18n/messages/${locale}.json`
    const fullPath = path.join(REPO_ROOT, relPath)
    const full = JSON.parse(fs.readFileSync(fullPath, "utf8")) as Record<string, string>
    const trimmed = trimMessages(full, used)

    const entry = provider.files.find((f) => f.path === relPath)
    if (!entry) throw new Error(`i18n-provider.json 에 ${relPath} 항목이 없다`)
    before += (entry.content ?? "").length
    entry.content = JSON.stringify(trimmed, null, 2) + "\n"
    after += entry.content.length
  }

  fs.writeFileSync(providerPath, JSON.stringify(provider, null, 2) + "\n")
  console.log(
    `i18n-trim: 사용 키 ${used.size}개 — i18n-provider 사전 ${before.toLocaleString()}B → ${after.toLocaleString()}B`,
  )
}

// ESM 직접 실행 판별 — sync-ui-items.ts 와 같은 관례.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main()
}
