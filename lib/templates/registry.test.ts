import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { LAYOUT_ARCHETYPES } from "@/archetypes"
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry"

const ARCHETYPE_NAMES = new Set(LAYOUT_ARCHETYPES.map((a) => a.name))
const slugOf = (href: string) => href.split("/").pop() ?? ""
const REPO_ROOT = path.resolve(__dirname, "..", "..")

describe("TEMPLATE_REGISTRY", () => {
  it("모든 항목이 /templates/ 하위 고유 href 를 가진다", () => {
    const hrefs = TEMPLATE_REGISTRY.map((t) => t.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    for (const href of hrefs) expect(href).toMatch(/^\/templates\/[a-z-]+$/)
  })

  it("app/templates/ 하위 템플릿 디렉터리와 1:1 대응한다", () => {
    // 22종 — app/templates/ 하위 템플릿 디렉터리와 1:1
    expect(TEMPLATE_REGISTRY).toHaveLength(22)
    for (const t of TEMPLATE_REGISTRY) {
      expect(t.title.length).toBeGreaterThan(0)
      expect(t.description.length).toBeGreaterThan(0)
    }
  })

  /**
   * #37 — 원형(archetype) 축이 소비 경로 끝까지 닿는지 잠근다.
   *
   * 원형을 고른 에이전트는 "그럼 어느 템플릿을 열어보면 되는가"를 되짚을 수 있어야
   * 하고, 그 템플릿은 `shadcn add` 로 실제로 가져갈 수 있어야 한다. 셋 중 하나라도
   * 끊기면 원형은 문서상 선택지로만 남고 산출물 뼈대는 다시 수렴한다.
   */
  it("모든 템플릿의 archetype 이 실재하는 원형을 가리킨다", () => {
    for (const t of TEMPLATE_REGISTRY) {
      expect(ARCHETYPE_NAMES.has(t.archetype), `${t.href} → ${t.archetype}`).toBe(true)
    }
  })

  it("모든 원형이 자신을 주 원형으로 삼는 템플릿을 최소 1개 갖는다", () => {
    const covered = new Set(TEMPLATE_REGISTRY.map((t) => t.archetype))
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(covered.has(archetype.name), `${archetype.name} 을 주 원형으로 쓰는 템플릿이 없다`).toBe(true)
    }
  })

  it("원형은 구조화 필드로만 표현한다 — profile 자유 문자열에 섞지 않는다", () => {
    for (const t of TEMPLATE_REGISTRY) {
      expect(t.profile, `${t.href}.profile`).not.toMatch(/원형/)
    }
  })

  it("모든 원형이 shadcn 레지스트리에 설치 가능한 템플릿 블록으로 노출된다", () => {
    const registry = JSON.parse(readFileSync(path.join(REPO_ROOT, "registry.json"), "utf8")) as {
      items: { name: string }[]
    }
    const blocks = new Set(registry.items.map((i) => i.name))
    const installable = TEMPLATE_REGISTRY.filter((t) => blocks.has(`template-${slugOf(t.href)}`))
    const installableArchetypes = new Set(installable.map((t) => t.archetype))

    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(
        installableArchetypes.has(archetype.name),
        `${archetype.name} 원형을 덮는 template 블록이 registry.json 에 없다 — 에이전트가 모방할 실물이 없다`,
      ).toBe(true)
    }
  })
})
