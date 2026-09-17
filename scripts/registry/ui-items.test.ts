import { describe, expect, it } from "vitest"

import { divergentPrimitives, packageNameOf, providedPaths, readRegistry, registryDependencyName } from "./closure"
import { buildUiItem, expectedUiItems, houseUiNames, isDivergent, readInstallDiff } from "./ui-items"

const registry = readRegistry()

/**
 * 프리미티브 배포 (이슈 #57).
 *
 * 항목이 `registryDependencies: ["card"]` 처럼 bare 이름을 쓰면 소비 프로젝트는 그
 * 이름을 ui.shadcn.com 에서 받는다 — 무엇이 깔리는지가 카탈로그가 아니라 소비
 * 프로젝트의 init 프리셋과 상류의 현재 버전에 달린다. 카탈로그가 렌더한 것과 같은
 * 파일을 받게 하려면 프리미티브도 우리 레지스트리가 배포해야 한다.
 */
describe("프리미티브 배포 — 이슈 #57", () => {
  it("모든 프리미티브가 레지스트리 항목으로 배포된다", () => {
    const names = new Set(registry.items.map((i) => i.name))
    for (const name of houseUiNames()) {
      expect(names, `components/ui/${name}.tsx 가 배포 항목이 아니다 — 소비자는 상류 원본을 받는다`).toContain(name)
    }
  })

  it("registryDependencies 에 bare 이름이 없다 — bare 는 상류에서 내려온다", () => {
    const bare = registry.items.flatMap((item) =>
      (item.registryDependencies ?? []).filter((dep) => !/^https?:/.test(dep)).map((dep) => `${item.name} → ${dep}`),
    )
    expect(bare, `bare 의존은 상류 원본을 받는다 — https://ui.doksam.com/r/<name>.json 로 바꿔라:\n${bare.join("\n")}`).toEqual([])
  })

  it("프리미티브 항목이 파일의 실제 import 와 일치한다 — 손으로 적은 값이 낡는 것을 막는다", () => {
    for (const expected of expectedUiItems()) {
      const actual = registry.items.find((i) => i.name === expected.name)
      expect(actual, `${expected.name} 항목이 없다`).toBeDefined()
      expect(
        actual,
        `${expected.name} 항목이 계산 결과와 어긋난다 — pnpm registry:sync 를 돌려라`,
      ).toEqual(expected)
    }
  })

  it("프리미티브 항목의 npm 의존성에 버전 범위가 박혀 있다", () => {
    for (const name of houseUiNames()) {
      const item = registry.items.find((i) => i.name === name)!
      for (const dep of item.dependencies ?? []) {
        expect(dep, `${name} 의 ${dep} 에 버전 범위가 없다`).not.toBe(packageNameOf(dep))
      }
    }
  })

  it("상류와 내용이 갈리는 프리미티브를 쓰는 항목은 설치본에서 우리 파일을 받는다", () => {
    const forked = divergentPrimitives()
    for (const item of registry.items) {
      const installed = providedPaths(item.name, registry)
      for (const dep of item.registryDependencies ?? []) {
        const name = registryDependencyName(dep)
        if (!forked.has(name)) continue
        expect(
          installed.has(`components/ui/${name}.tsx`),
          `${item.name} 설치에 ${name} 이 실리지 않는다 — 상류에서 다른 파일이 깔린다`,
        ).toBe(true)
      }
    }
  })

  it("buildUiItem 은 형제 프리미티브를 URL 의존으로, 그 밖의 레포 파일은 자기 files 로 싣는다", () => {
    const sidebar = buildUiItem("sidebar")
    expect(sidebar.registryDependencies).toContain("https://ui.doksam.com/r/button.json")
    expect(sidebar.files?.map((f) => f.path)).toContain("hooks/use-mobile.ts")
    // 자기 자신을 의존으로 걸지 않는다.
    expect(sidebar.registryDependencies).not.toContain("https://ui.doksam.com/r/sidebar.json")
  })

  it("isDivergent 가 매니페스트의 customized 를 따른다", () => {
    // customized 는 상류 **원문** 과의 차이다 — 설치본과의 차이(installDiff)보다 넓다.
    expect(isDivergent("checkbox")).toBe(true)
    expect(isDivergent("button")).toBe(false)
  })

  /**
   * 설명문이 매니페스트의 customized/groups 를 근거로 삼으면, 낡아서 다른 파일까지
   * "의도한 하우스 스타일" 로 공표하게 된다 — 이 커밋의 실측(#57)과 정면으로 어긋난다.
   */
  it("상류가 앞선 파일은 설명문이 그렇게 말한다 — 하우스 스타일이라고 하지 않는다", () => {
    const behind = Object.keys(readInstallDiff())
    expect(behind.length, "installDiff 가 비었다 — 측정이 사라졌다").toBeGreaterThan(0)
    for (const file of behind) {
      const name = file.replace(/\.tsx$/, "")
      const item = registry.items.find((i) => i.name === name)!
      expect(item.description, `${name} 설명문이 상류가 앞섰다는 사실을 숨긴다`).toContain("상류 shadcn 이 앞서 있다")
    }
    for (const name of houseUiNames()) {
      if (behind.includes(`${name}.tsx`)) continue
      const item = registry.items.find((i) => i.name === name)!
      expect(item.description, `${name} 이 근거 없이 상류가 앞섰다고 말한다`).not.toContain("상류 shadcn 이 앞서 있다")
    }
  })
})
