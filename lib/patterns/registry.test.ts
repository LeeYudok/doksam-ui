import { describe, expect, it } from "vitest"

import { PATTERN_REGISTRY, PATTERN_SCOPE_ORDER, getPatternEntry } from "@/lib/patterns/registry"

describe("PATTERN_REGISTRY", () => {
  it("has a unique slug per entry", () => {
    const slugs = PATTERN_REGISTRY.map((entry) => entry.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("registers all 34 patterns (25 common + 9 finance)", () => {
    expect(PATTERN_REGISTRY.length).toBe(34)
    expect(PATTERN_REGISTRY.filter((entry) => entry.scope === "common").length).toBe(25)
    expect(PATTERN_REGISTRY.filter((entry) => entry.scope === "finance").length).toBe(9)
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
      ]),
    )
  })

  it("groups the 4 srope-origin pattern slugs under finance", () => {
    const financeSlugs = PATTERN_REGISTRY.filter((entry) => entry.scope === "finance").map(
      (entry) => entry.slug,
    )
    expect(financeSlugs).toEqual(expect.arrayContaining(["stock", "pipeline", "stock-portfolio", "admin-toolbar"]))
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
