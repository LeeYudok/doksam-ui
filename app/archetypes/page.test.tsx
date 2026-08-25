import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import ArchetypesPage from "@/app/archetypes/page"
import { LAYOUT_ARCHETYPES } from "@/archetypes"
import { BRAND_PROFILES } from "@/profiles"

describe("ArchetypesPage", () => {
  it("페이지 제목을 렌더한다", () => {
    render(<ArchetypesPage />)
    expect(screen.getByRole("heading", { level: 1, name: "레이아웃 원형" })).toBeInTheDocument()
  })

  it("등록된 원형마다 카드 하나를 렌더한다", () => {
    render(<ArchetypesPage />)
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(screen.getByText(archetype.label)).toBeInTheDocument()
      expect(screen.getByText(archetype.description)).toBeInTheDocument()
      expect(screen.getByText(archetype.name)).toBeInTheDocument()
    }
  })

  it("원형마다 내비 방식과 반례를 함께 보여준다", () => {
    render(<ArchetypesPage />)
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(screen.getByText(archetype.navigation)).toBeInTheDocument()
      for (const item of archetype.avoidWhen) {
        expect(screen.getByText(`· ${item}`)).toBeInTheDocument()
      }
    }
  })

  it("대표 템플릿을 해당 템플릿 경로로 링크한다", () => {
    render(<ArchetypesPage />)
    const hrefs = new Set(screen.getAllByRole("link").map((link) => link.getAttribute("href")))
    for (const archetype of LAYOUT_ARCHETYPES) {
      for (const slug of archetype.templates) {
        expect(hrefs.has(`/templates/${slug}`), `${archetype.name} → ${slug}`).toBe(true)
      }
    }
  })

  it("권장 셸을 앱 셸 패턴 페이지로 링크한다", () => {
    render(<ArchetypesPage />)
    const shellLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/patterns/app-shell")
    expect(shellLinks).toHaveLength(LAYOUT_ARCHETYPES.length)
  })

  it("원형을 기본으로 삼는 프로필을 함께 노출한다", () => {
    render(<ArchetypesPage />)
    const labels = BRAND_PROFILES.filter((p) => p.archetype === "sidebar-app").map((p) => p.label)
    expect(screen.getByText(labels.join(" · "))).toBeInTheDocument()
  })
})
