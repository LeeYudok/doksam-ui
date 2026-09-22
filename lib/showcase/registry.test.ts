import { readdirSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { COMPONENT_REGISTRY, getComponentEntry } from "@/lib/showcase/registry"
import { COMPONENT_CATEGORY_ORDER } from "@/lib/showcase/types"

const UI_DIR = path.resolve(__dirname, "../../components/ui")
const UI_COMPONENT_SLUGS = readdirSync(UI_DIR)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""))

/**
 * components/ui/(shadcn 유래 프리미티브, 화면 작업 중 수정하지 않는 영역)가 아니라 components/ 바로 아래
 * shadcn 프리미티브를 조합한 커스텀 패턴이라 UI_COMPONENT_SLUGS 스캔에는 잡히지 않지만
 * 쇼케이스에는 등록된 slug 목록.
 */
const MANUAL_ENTRY_SLUGS = [
  "screen-help-dialog",
  "format-biz-no",
  "region-map",
  "rate-color",
  "format-won",
  "badge-extended",
  "tooltip-icon-button",
  "kebab-menu",
  "table-sortable",
  "table-toggle",
  "date-picker",
  "date-range-picker",
  "multi-select",
  "password-input",
  "number-input",
  "color-picker",
  "rating",
  "avatar-group",
  "circular-progress",
  "banner",
  "code-block",
  "audit-code-tag",
  "scroll-stack",
  "tree-view",
  "relation-network",
  "risk-core-map",
  "risk-grade-badge",
  "due-countdown-badge",
  "party-identity-cell",
  "contribution-meter",
  "scenario-simulator",
  "evidence-decision-panel",
  "pipeline-rail",
  "stage-progress-board",
  "keyword-cloud",
  "contribution-bars",
  "live-indicator",
  "mermaid-viewer",
  "icon-picker",
  "app-logo",
  "empty-state",
  "error-state",
  "confirm-dialog",
  "badge-with-spinner",
  "summary-card",
  "status-card",
  "action-card",
  "category-card",
  "gauge-card",
  "page-header",
  "signal-card",
  "chat-widget",
]

describe("COMPONENT_REGISTRY", () => {
  it("has a unique slug per entry", () => {
    const slugs = COMPONENT_REGISTRY.map((entry) => entry.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("registers every component under components/ui/, plus known manual entries", () => {
    const registeredSlugs = new Set(COMPONENT_REGISTRY.map((entry) => entry.slug))
    for (const slug of UI_COMPONENT_SLUGS) {
      expect(registeredSlugs.has(slug), `missing registry entry for "${slug}"`).toBe(true)
    }
    for (const slug of MANUAL_ENTRY_SLUGS) {
      expect(registeredSlugs.has(slug), `missing registry entry for manual slug "${slug}"`).toBe(true)
    }
    expect(COMPONENT_REGISTRY.length).toBe(UI_COMPONENT_SLUGS.length + MANUAL_ENTRY_SLUGS.length)
  })

  it("only uses known categories", () => {
    for (const entry of COMPONENT_REGISTRY) {
      expect(COMPONENT_CATEGORY_ORDER).toContain(entry.category)
    }
  })

  it("only uses done|todo status", () => {
    for (const entry of COMPONENT_REGISTRY) {
      expect(["done", "todo"]).toContain(entry.status)
    }
  })

  it("has non-empty title and description for every entry", () => {
    for (const entry of COMPONENT_REGISTRY) {
      expect(entry.title.length, entry.slug).toBeGreaterThan(0)
      expect(entry.description.length, entry.slug).toBeGreaterThan(0)
    }
  })
})

describe("getComponentEntry", () => {
  it("finds a registered entry by slug", () => {
    expect(getComponentEntry("button")?.title).toBe("Button")
  })

  it("returns undefined for an unknown slug", () => {
    expect(getComponentEntry("does-not-exist")).toBeUndefined()
  })
})
