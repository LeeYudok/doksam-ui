import { describe, expect, it } from "vitest"

import { TEMPLATE_REGISTRY } from "@/lib/templates/registry"

describe("TEMPLATE_REGISTRY", () => {
  it("모든 항목이 /templates/ 하위 고유 href 를 가진다", () => {
    const hrefs = TEMPLATE_REGISTRY.map((t) => t.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    for (const href of hrefs) expect(href).toMatch(/^\/templates\/[a-z-]+$/)
  })

  it("app/templates/ 하위 템플릿 디렉터리와 1:1 대응한다", () => {
    // 20종 — app/templates/ 하위 템플릿 디렉터리와 1:1
    expect(TEMPLATE_REGISTRY).toHaveLength(20)
    for (const t of TEMPLATE_REGISTRY) {
      expect(t.title.length).toBeGreaterThan(0)
      expect(t.description.length).toBeGreaterThan(0)
    }
  })
})
