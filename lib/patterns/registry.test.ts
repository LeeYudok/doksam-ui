import { describe, expect, it } from "vitest"

import registryJson from "@/registry.json"
import {
  PATTERN_REGISTRY,
  PATTERN_SCOPE_ORDER,
  getPatternEntry,
  getPatternsUsingComponent,
  isPatternInRegistry,
} from "@/lib/patterns/registry"
import { COMPONENT_REGISTRY } from "@/lib/showcase/registry"

const REGISTRY_ITEM_NAMES = new Set((registryJson as { items: { name: string }[] }).items.map((item) => item.name))
const COMPONENT_SLUGS = new Set(COMPONENT_REGISTRY.map((entry) => entry.slug))

/** registryNames 를 가진 패턴 수 — 패턴을 새로 편입하면 이 수가 올라간다. */
const INSTALLABLE_PATTERN_COUNT = 21
/** 아직 코드 복사만 가능한 패턴 수. */
const PENDING_PATTERN_COUNT = 15

describe("PATTERN_REGISTRY", () => {
  it("has a unique slug per entry", () => {
    const slugs = PATTERN_REGISTRY.map((entry) => entry.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("registers all 36 patterns (26 common + 10 finance)", () => {
    expect(PATTERN_REGISTRY.length).toBe(36)
    expect(PATTERN_REGISTRY.filter((entry) => entry.scope === "common").length).toBe(26)
    expect(PATTERN_REGISTRY.filter((entry) => entry.scope === "finance").length).toBe(10)
  })

  it("registers the 13 common pattern slugs (srope/bizinfo ports + app-shell + content-feed trio + observability trio)", () => {
    const commonSlugs = PATTERN_REGISTRY.filter((entry) => entry.scope === "common").map(
      (entry) => entry.slug,
    )
    expect(commonSlugs).toEqual(
      expect.arrayContaining([
        "app-shell",
        "layout",
        "dataviz",
        "cards",
        "state",
        "form-input",
        "verified",
        "content-feed",
        "list-controls",
        "faceted-filter",
        "json-tree",
        "log-viewer",
        "request-inspector",
        "concept-explainer",
        "compliance-callout",
        "section-panel-header",
        "sticky-actionbar",
        "draft-review-panel",
      ]),
    )
  })

  it("groups the 4 srope-origin pattern slugs under finance", () => {
    const financeSlugs = PATTERN_REGISTRY.filter((entry) => entry.scope === "finance").map(
      (entry) => entry.slug,
    )
    expect(financeSlugs).toEqual(expect.arrayContaining(["stock", "pipeline", "stock-portfolio", "admin-toolbar", "risk-table"]))
  })

  it("only uses known scope values", () => {
    for (const entry of PATTERN_REGISTRY) {
      expect(PATTERN_SCOPE_ORDER).toContain(entry.scope)
    }
  })

  it("has non-empty title and description for every entry", () => {
    for (const entry of PATTERN_REGISTRY) {
      expect(entry.title.length, entry.slug).toBeGreaterThan(0)
      expect(entry.description.length, entry.slug).toBeGreaterThan(0)
    }
  })
})

describe("getPatternEntry", () => {
  it("finds a registered entry by slug", () => {
    expect(getPatternEntry("layout")?.title).toBe("레이아웃 패턴")
  })

  it("returns undefined for an unknown slug", () => {
    expect(getPatternEntry("does-not-exist")).toBeUndefined()
  })
})

describe("패턴 ↔ 레지스트리 대응 (#41)", () => {
  it("registryNames 의 모든 이름이 registry.json 항목으로 실재한다", () => {
    for (const entry of PATTERN_REGISTRY) {
      for (const name of entry.registryNames ?? []) {
        expect(REGISTRY_ITEM_NAMES.has(name), `${entry.slug} → ${name}`).toBe(true)
      }
    }
  })

  it("composedOf 의 모든 slug 가 컴포넌트 카탈로그에 실재한다", () => {
    for (const entry of PATTERN_REGISTRY) {
      for (const slug of entry.composedOf ?? []) {
        expect(COMPONENT_SLUGS.has(slug), `${entry.slug} → ${slug}`).toBe(true)
      }
    }
  })

  it("registryNames 를 가진 패턴만 설치 가능으로 판정된다", () => {
    for (const entry of PATTERN_REGISTRY) {
      expect(isPatternInRegistry(entry)).toBe((entry.registryNames?.length ?? 0) > 0)
    }
  })

  it("설치 가능한 패턴 수를 잠근다 — 편입할 때마다 함께 올린다", () => {
    const installable = PATTERN_REGISTRY.filter(isPatternInRegistry)
    expect(installable.length).toBe(INSTALLABLE_PATTERN_COUNT)
    expect(PATTERN_REGISTRY.length - installable.length).toBe(PENDING_PATTERN_COUNT)
  })

  it("composedOf 역참조가 패턴을 되짚는다", () => {
    for (const entry of PATTERN_REGISTRY) {
      for (const slug of entry.composedOf ?? []) {
        expect(getPatternsUsingComponent(slug).map((p) => p.slug)).toContain(entry.slug)
      }
    }
  })

  it("알 수 없는 컴포넌트 slug 는 역참조가 비어 있다", () => {
    expect(getPatternsUsingComponent("does-not-exist")).toEqual([])
  })
})
