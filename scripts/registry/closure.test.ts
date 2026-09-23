import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"


import {
  collectSpecifiers,
  fileExists,
  NEXT_CONVENTION_FILES,
  hrefMatchesRoutes,
  internalHrefs,
  packageNameOf,
  packageOfSpecifier,
  providedPaths,
  providedRoutes,
  readRegistry,
  REPO_ROOT,
  registryDependencyName,
  resolveSpecifier,
  simulateShadcnRewrite,
  routeFromPagePath,
  undeclaredPackages,
  unresolvedImports,
  upstreamComponentNames,
} from "../../scripts/registry/closure"

const registry = readRegistry()

describe("collectSpecifiers", () => {
  it("import·export·동적 import 를 모두 잡는다", () => {
    const source = [
      `import { A } from "@/components/a"`,
      `import "@/styles/b.css"`,
      `export { C } from "./c"`,
      `export * as ns from "../d"`,
      `const e = await import("@/lib/e")`,
      `import type { F } from "@/types/f"`,
      `import{G}from"@/lib/g"`,
    ].join("\n")
    expect(collectSpecifiers(source).sort()).toEqual(
      ["../d", "./c", "@/components/a", "@/lib/e", "@/lib/g", "@/styles/b.css", "@/types/f"].sort(),
    )
  })

  it("주석 안의 import 는 잡지 않는다", () => {
    const source = [`// import { A } from "@/components/gone"`, `/* import { B } from "@/components/also-gone" */`].join(
      "\n",
    )
    expect(collectSpecifiers(source)).toEqual([])
  })

  it("npm 패키지 지정자도 그대로 돌려준다 — 해소 단계에서 걸러진다", () => {
    expect(collectSpecifiers(`import React from "react"`)).toEqual(["react"])
  })
})

describe("resolveSpecifier", () => {
  it("@/ 별칭을 레포 상대 경로로 푼다", () => {
    expect(resolveSpecifier("@/lib/utils", "components/x.tsx")).toEqual({ kind: "resolved", path: "lib/utils.ts" })
  })

  it("디렉터리 지정자는 index 파일로 푼다", () => {
    expect(resolveSpecifier("@/profiles", "components/profile-scope.ts")).toEqual({
      kind: "resolved",
      path: "profiles/index.ts",
    })
  })

  it("상대 경로는 기준 파일에서 푼다", () => {
    expect(resolveSpecifier("./messages/en.json", "lib/i18n/index.ts")).toEqual({
      kind: "resolved",
      path: "lib/i18n/messages/en.json",
    })
  })

  it("레포 안을 가리키는데 그런 파일이 없으면 missing", () => {
    expect(resolveSpecifier("@/lib/does-not-exist", "components/x.tsx")).toEqual({
      kind: "missing",
      path: "lib/does-not-exist",
    })
  })

  it("대소문자가 다르면 해소하지 않는다 — macOS 에서만 통과하고 리눅스에서 깨지는 걸 막는다", () => {
    expect(resolveSpecifier("@/lib/Utils", "components/x.tsx").kind).toBe("missing")
  })

  it("npm 패키지는 external", () => {
    expect(resolveSpecifier("react", "components/x.tsx")).toEqual({ kind: "external" })
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

describe("packageNameOf · packageOfSpecifier", () => {
  it("버전 범위를 떼어 낸다", () => {
    expect(packageNameOf("@tanstack/react-table@^8.21.3")).toBe("@tanstack/react-table")
    expect(packageNameOf("mermaid@^11.16.0")).toBe("mermaid")
    expect(packageNameOf("clsx")).toBe("clsx")
  })

  it("하위 경로 import 에서 패키지 이름만 남긴다", () => {
    expect(packageOfSpecifier("@phosphor-icons/react/dist/ssr")).toBe("@phosphor-icons/react")
    expect(packageOfSpecifier("date-fns/locale")).toBe("date-fns")
  })
})

describe("providedPaths", () => {
  it("registryDependencies 를 따라 전이적으로 모은다", () => {
    const provided = providedPaths("route-error", registry)
    expect(provided).toContain("components/route-error.tsx")
    // 상류 shadcn 항목은 같은 자리에 깔린다.
    expect(provided).toContain("components/ui/button.tsx")
  })

  it("같은 항목을 여러 번 물어도 결과가 같다", () => {
    expect([...providedPaths("route-error", registry)]).toEqual([...providedPaths("route-error", registry)])
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

  it("항목이 import 하는 npm 패키지가 설치본에 선언돼 있다", () => {
    const broken = registry.items
      .map((item) => ({ item, problems: undeclaredPackages(item, registry) }))
      .filter((r) => r.problems.length > 0)

    const report = broken
      .map(({ item, problems }) => `${item.name}: ${[...new Set(problems.map((p) => p.pkg))].join(", ")}`)
      .join("\n")

    expect(broken.length, `dependencies 에 빠진 npm 패키지가 있다:\n${report}`).toBe(0)
  })

  it("npm 의존성에 버전 범위가 박혀 있다 — 없으면 latest 가 깔려 메이저가 어긋난다", () => {
    for (const item of registry.items) {
      for (const dep of item.dependencies ?? []) {
        expect(dep, `${item.name} 의 ${dep} 에 버전 범위가 없다`).not.toBe(packageNameOf(dep))
      }
    }
  })

  it("registryDependencies 가 가리키는 항목이 실제로 존재한다", () => {
    const names = new Set(registry.items.map((i) => i.name))
    const upstream = upstreamComponentNames()
    for (const item of registry.items) {
      for (const dep of item.registryDependencies ?? []) {
        const name = registryDependencyName(dep)
        if (dep.startsWith("https://ui.doksam.com/")) {
          expect(names, `${item.name} 이 없는 항목 ${dep} 를 가리킨다`).toContain(name)
        } else {
          // bare 이름은 상류 shadcn 항목 — 상류에 없으면 소비자의 add 가 실패한다.
          expect(upstream, `${item.name} 의 ${dep} 는 상류 shadcn 에 없는 이름이다`).toContain(name)
        }
      }
    }
  })

  it("항목이 싣는 파일은 레포에 실제로 있다", () => {
    for (const item of registry.items) {
      for (const f of item.files ?? []) {
        expect(fileExists(f.path), `${item.name} 의 ${f.path} 가 없다`).toBe(true)
      }
    }
  })

  it("별칭이 있는 디렉터리의 파일에는 target 을 박지 않는다 — src/ 레이아웃 소비자가 깨진다", () => {
    const ALIASED = ["components/", "lib/", "hooks/"]
    for (const item of registry.items) {
      for (const f of item.files ?? []) {
        if (!ALIASED.some((prefix) => f.path.startsWith(prefix))) continue
        expect(f.target, `${item.name} 의 ${f.path} 가 target 을 박아 별칭 해석을 우회한다`).toBeUndefined()
      }
    }
  })
})

describe("파일 이름 충돌 — 이슈 #52", () => {
  /**
   * shadcn CLI 는 설치 시 `@/` import 를 그 설치가 싣는 파일 이름으로 다시 쓴다.
   * 후보가 여럿이면 **확장자 순서**가 1순위, 기대 경로 prefix 가 2순위다.
   * 그래서 같은 이름이라도 확장자가 같으면 prefix 로 갈리지만, `.tsx` 와 `.ts` 가
   * 섞이면 확장자 순서가 먼저 이겨 엉뚱한 쪽으로 이어진다 — template-bank 의
   * `_data/product-categories.ts` import 가 설치 후 `_components/product-categories.tsx`
   * 를 가리켜 빌드가 깨진 것이 정확히 이 경우다.
   *
   * 한 항목이 아니라 **한 번의 설치 전체**(전이 의존까지)에서 봐야 한다.
   *
   * Next 규약 파일(page·layout·loading·error 등)은 alias import 대상이 아니라 제외한다.
   * `index` 는 규약 파일이 아니고 실제 import 대상이므로(`@/profiles` 등) 제외하지 않는다 —
   * 확장자가 같은 동안에만 안전하다는 사실을 이 검사가 지킨다 (#54).
   */

  it("한 번의 설치가 까는 파일 중 이름이 같고 확장자가 다른 짝이 없다", () => {
    for (const item of registry.items) {
      const seen = new Map<string, string>()
      for (const filePath of [...providedPaths(item.name, registry)].sort()) {
        const stem = filePath.replace(/.*\//, "").replace(/\.[^.]+$/, "")
        if (NEXT_CONVENTION_FILES.has(stem)) continue
        const extension = filePath.slice(filePath.lastIndexOf("."))
        const previous = seen.get(stem)
        if (previous === undefined) {
          seen.set(stem, filePath)
          continue
        }
        expect(
          previous.slice(previous.lastIndexOf(".")),
          `${item.name} 설치: ${previous} 와 ${filePath} 는 이름이 같고 확장자가 다르다 — shadcn 이 import 를 엉뚱한 쪽으로 다시 쓴다`,
        ).toBe(extension)
      }
    }
  })

  /**
   * 위 확장자-다름 가드는 "같은 확장자면 안전하다"는 전제 위에 서 있다 — 이슈 #70 이전에는
   * 이 전제가 실측된 적이 없었다.
   *
   * 2026-09-23 shadcn 4.21.0 을 디컴파일해 실제 재작성 알고리즘(`Il()`)을 확인하고
   * (`scripts/registry/closure.ts` 의 `simulateShadcnRewrite`), 빈 Next 앱에 직접 설치해
   * (`scripts/manual/2026-09-23_issue-70_same-ext-collision.mjs`) 실물 CLI 출력과 대조했다.
   * 결론: 확장자가 같으면 CLI 는 지정자 자신의 경로를 prefix 로 정확히 매칭해 항상 올바른
   * 파일을 고른다 — **단, 그 지정자가 실제로 그 파일의 진짜 경로를 가리킬 때만.** 그 전제는
   * 위의 "배포 가능성 — 이슈 #52" 블록의 `unresolvedImports` 검사가 이미 강제하고 있다
   * (지정자가 레포 안 실제 파일로 정확히 풀리지 않으면 그 자체로 실패한다).
   *
   * 이 테스트는 그 둘을 이어 붙여 전제를 고정한다: 설치본 안의 모든 `@/` import 에 대해
   * "CLI 가 실제로 재작성할 대상"(`simulateShadcnRewrite`)과 "우리가 정적으로 해소한 대상"
   * (`resolveSpecifier`)이 항상 같은 파일을 가리켜야 한다. 어긋나면 — 즉 같은 이름의 다른
   * 파일이 끼어들면 — 실패한다.
   */
  it("같은 이름 + 같은 확장자 충돌이 있어도 shadcn 의 재작성 대상이 우리가 해소한 파일과 항상 일치한다 (이슈 #70)", () => {
    for (const item of registry.items) {
      const closure = providedPaths(item.name, registry)
      const problems: string[] = []
      for (const filePath of [...closure].sort()) {
        if (!fileExists(filePath)) continue
        const source = fs.readFileSync(path.join(REPO_ROOT, filePath), "utf8")
        for (const spec of collectSpecifiers(source)) {
          if (!spec.startsWith("@/")) continue
          const resolution = resolveSpecifier(spec, filePath)
          if (resolution.kind !== "resolved" || !closure.has(resolution.path)) continue
          const rewritten = simulateShadcnRewrite(spec, closure)
          if (rewritten !== resolution.path) {
            problems.push(`${filePath}: "${spec}" → shadcn 은 ${rewritten ?? "(후보 없음)"} 를 고르지만 실제 파일은 ${resolution.path}`)
          }
        }
      }
      expect(problems, `${item.name} 설치:\n${problems.join("\n")}`).toEqual([])
    }
  })
})

describe("routeFromPagePath", () => {
  it("app/ 경로를 라우트로 바꾼다", () => {
    expect(routeFromPagePath("app/templates/admin/page.tsx")).toBe("/templates/admin")
    expect(routeFromPagePath("app/page.tsx")).toBe("/")
  })

  it("라우트 그룹은 URL 에서 사라진다", () => {
    expect(routeFromPagePath("app/(marketing)/about/page.tsx")).toBe("/about")
  })

  it("page.tsx 가 아니면 라우트가 아니다", () => {
    expect(routeFromPagePath("app/templates/admin/layout.tsx")).toBeNull()
    expect(routeFromPagePath("components/x.tsx")).toBeNull()
  })
})

describe("internalHrefs", () => {
  it("문자열 리터럴 href 만 잡는다", () => {
    const source = [
      `<Link href="/templates/shop">go</Link>`,
      `<a href="https://example.com">외부</a>`,
      `<a href="//cdn.example.com/x">프로토콜 상대</a>`,
      `<a href="#anchor">해시</a>`,
    ].join("\n")
    expect(internalHrefs(source)).toEqual(["/templates/shop"])
  })

  it("템플릿 리터럴·표현식 href 는 정적으로 완결되지 않으므로 잡지 않는다", () => {
    const source = [`<Link href={\`/templates/shop/product/\${id}\`}>go</Link>`, `<Link href={buildUrl()}>go</Link>`].join(
      "\n",
    )
    expect(internalHrefs(source)).toEqual([])
  })
})

describe("hrefMatchesRoutes", () => {
  it("정적 라우트와 일치한다", () => {
    expect(hrefMatchesRoutes("/templates/shop", ["/templates/shop"])).toBe(true)
    expect(hrefMatchesRoutes("/templates/other", ["/templates/shop"])).toBe(false)
  })

  it("동적 세그먼트를 와일드카드로 매칭한다", () => {
    expect(hrefMatchesRoutes("/templates/shop/product/42", ["/templates/shop/product/[id]"])).toBe(true)
  })

  it("쿼리·해시를 떼고 비교한다", () => {
    expect(hrefMatchesRoutes("/templates/shop?x=1#y", ["/templates/shop"])).toBe(true)
  })
})

describe("죽은 내부 링크 게이트 — GitHub #113", () => {
  it("배포 블록 파일의 내부 href 는 그 항목이 제공하는 라우트 안을 가리킨다", () => {
    const broken: string[] = []
    for (const item of registry.items) {
      const routes = providedRoutes(item.name, registry)
      for (const f of item.files ?? []) {
        if (!/\.tsx?$/.test(f.path)) continue
        const abs = path.join(REPO_ROOT, f.path)
        if (!fs.existsSync(abs)) continue
        const source = fs.readFileSync(abs, "utf8")
        for (const href of internalHrefs(source)) {
          if (!hrefMatchesRoutes(href, routes)) broken.push(`${item.name}: ${f.path} → ${href}`)
        }
      }
    }
    expect(broken, `설치본이 제공하지 않는 라우트를 가리키는 내부 링크:\n${broken.join("\n")}`).toEqual([])
  })
})
