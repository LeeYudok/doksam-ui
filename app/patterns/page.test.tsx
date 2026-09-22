import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import PatternsPage from "@/app/patterns/page"
import { PATTERN_REGISTRY, PATTERN_SCOPE_LABEL } from "@/lib/patterns/registry"

describe("PatternsPage", () => {
  it("renders the patterns heading", () => {
    render(<PatternsPage />)
    expect(
      screen.getByRole("heading", { level: 1, name: /자주 쓰는 UI 패턴 모음/ }),
    ).toBeInTheDocument()
  })

  it("renders one scope section per used scope", () => {
    render(<PatternsPage />)
    const usedScopes = new Set(PATTERN_REGISTRY.map((entry) => entry.scope))
    for (const scope of usedScopes) {
      expect(
        screen.getByRole("heading", { level: 2, name: PATTERN_SCOPE_LABEL[scope] }),
      ).toBeInTheDocument()
    }
  })

  it("places former srope patterns in the finance scope", () => {
    render(<PatternsPage />)
    expect(screen.queryByRole("heading", { level: 2, name: "Srope — 프로젝트 확장" })).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "금융 도메인" })).toBeInTheDocument()
  })

  it("links every registry entry to its detail page", () => {
    render(<PatternsPage />)
    const links = screen.getAllByRole("link")
    for (const entry of PATTERN_REGISTRY) {
      const matches = links.filter(
        (link) => link.getAttribute("href") === `/patterns/${entry.slug}`,
      )
      expect(matches.length, entry.slug).toBe(1)
    }
  })
})
