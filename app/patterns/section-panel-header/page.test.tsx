import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import SectionPanelHeaderPatternsPage from "@/app/patterns/section-panel-header/page"
import { SECTION_PANEL_HEADER_SAMPLES } from "@/components/patterns/section-panel-header-samples"

describe("SectionPanelHeaderPatternsPage", () => {
  it("renders the page heading from the pattern registry", () => {
    render(<SectionPanelHeaderPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "섹션 패널 헤더" })).toBeInTheDocument()
  })

  it("renders every sample as a numbered section", () => {
    render(<SectionPanelHeaderPatternsPage />)
    for (const sample of SECTION_PANEL_HEADER_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 2 samples", () => {
    render(<SectionPanelHeaderPatternsPage />)
    expect(SECTION_PANEL_HEADER_SAMPLES.length).toBe(2)
  })
})
