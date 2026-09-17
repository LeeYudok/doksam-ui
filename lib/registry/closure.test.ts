import { describe, expect, it } from "vitest"

import {
  collectSpecifiers,
  providedPaths,
  readRegistry,
  registryDependencyName,
  resolveSpecifier,
  unresolvedImports,
} from "@/lib/registry/closure"

const registry = readRegistry()

describe("collectSpecifiers", () => {
  it("import·export·동적 import 를 모두 잡는다", () => {
    const source = [
      `import { A } from "@/components/a"`,
      `import "@/styles/b.css"`,
      `export { C } from "./c"`,
      `export * from "../d"`,
      `const e = await import("@/lib/e")`,
      `import type { F } from "@/types/f"`,
    ].join("\n")
    expect(collectSpecifiers(source).sort()).toEqual(
      ["../d", "./c", "@/components/a", "@/lib/e", "@/styles/b.css", "@/types/f"].sort(),
    )
  })

  it("npm 패키지 지정자도 그대로 돌려준다 — 해소 단계에서 걸러진다", () => {
    expect(collectSpecifiers(`import React from "react"`)).toEqual(["react"])
  })
})

describe("resolveSpecifier", () => {
  it("@/ 별칭을 레포 상대 경로로 푼다", () => {
    expect(resolveSpecifier("@/lib/utils", "components/x.tsx")).toBe("lib/utils.ts")
  })

  it("디렉터리 지정자는 index 파일로 푼다", () => {
    expect(resolveSpecifier("@/profiles", "components/profile-scope.ts")).toBe("profiles/index.ts")
  })

  it("상대 경로는 기준 파일에서 푼다", () => {
    expect(resolveSpecifier("./messages/en.json", "lib/i18n/index.ts")).toBe("lib/i18n/messages/en.json")
  })

  it("npm 패키지는 null", () => {
    expect(resolveSpecifier("react", "components/x.tsx")).toBeNull()
  })
})

describe("registryDependencyName", () => {
  it("URL 에서 항목 이름만 남긴다", () => {
    expect(registryDependencyName("https://ui.doksam.com/r/profile-scope.json")).toBe("profile-scope")
  })

  it("상류 shadcn 이름은 그대로", () => {
    expect(registryDependencyName("button")).toBe("button")
  })
})

describe("providedPaths", () => {
  it("registryDependencies 를 따라 전이적으로 모은다", () => {
    const provided = providedPaths("route-error", registry)
    expect(provided).toContain("components/route-error.tsx")
    // 상류 shadcn 항목은 같은 자리에 깔린다.
    expect(provided).toContain("components/ui/button.tsx")
  })
})

describe("배포 가능성 — 이슈 #52", () => {
  it("모든 레지스트리 항목의 import 가 설치본 안에서 해소된다", () => {
    const broken = registry.items
      .map((item) => ({ item, problems: unresolvedImports(item, registry) }))
      .filter((r) => r.problems.length > 0)

    const report = broken
      .map(
        ({ item, problems }) =>
          `${item.name}\n` +
          [...new Set(problems.map((p) => `  ${p.from} → ${p.specifier}`))].sort().join("\n"),
      )
      .join("\n")

    expect(
      broken.length,
      `shadcn add 로 설치하면 import 가 끊어지는 항목이 있다 — files 나 registryDependencies 에 빠진 것을 넣어라:\n${report}`,
    ).toBe(0)
  })

  it("registryDependencies 가 가리키는 doksam 항목은 실제로 존재한다", () => {
    const names = new Set(registry.items.map((i) => i.name))
    for (const item of registry.items) {
      for (const dep of item.registryDependencies ?? []) {
        if (!dep.startsWith("https://ui.doksam.com/")) continue
        expect(names, `${item.name} 이 없는 항목 ${dep} 를 가리킨다`).toContain(registryDependencyName(dep))
      }
    }
  })

  it("항목이 싣는 파일은 레포에 실제로 있다", () => {
    for (const item of registry.items) {
      for (const f of item.files ?? []) {
        expect(resolveSpecifier(`@/${f.path}`, "registry.json"), `${item.name} 의 ${f.path}`).toBe(f.path)
      }
    }
  })
})

describe("파일 이름 충돌 — 이슈 #52", () => {
  /**
   * shadcn CLI 는 설치 시 `@/` import 를 항목이 싣는 파일 이름으로 다시 쓴다.
   * 한 항목 안에 확장자를 뺀 이름이 같은 파일이 둘 있으면 엉뚱한 쪽으로 이어진다 —
   * 실제로 template-bank 의 `_data/product-categories` import 가 설치 후
   * `_components/product-categories` 를 가리켜 빌드가 깨졌다.
   *
   * Next 규약 파일(page·layout·loading·error 등)은 서로를 import 하지 않아 제외한다.
   */
  const NEXT_CONVENTION = new Set(["page", "layout", "loading", "error", "not-found", "template", "default", "index"])

  it("한 항목 안에서 import 대상 파일의 이름이 겹치지 않는다", () => {
    for (const item of registry.items) {
      const seen = new Map<string, string>()
      for (const f of item.files ?? []) {
        const stem = f.path.replace(/.*\//, "").replace(/\.[^.]+$/, "")
        if (NEXT_CONVENTION.has(stem)) continue
        const previous = seen.get(stem)
        expect(
          previous,
          `${item.name}: ${previous} 와 ${f.path} 의 파일 이름이 같다 — shadcn 이 import 를 엉뚱한 쪽으로 다시 쓴다`,
        ).toBeUndefined()
        seen.set(stem, f.path)
      }
    }
  })
})
