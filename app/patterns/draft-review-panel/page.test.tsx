import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import DraftReviewPanelPatternsPage from "@/app/patterns/draft-review-panel/page"
import { DRAFT_REVIEW_PANEL_SAMPLES } from "@/components/patterns/draft-review-panel-samples"

describe("DraftReviewPanelPatternsPage", () => {
  it("renders the page heading from the pattern registry", () => {
    render(<DraftReviewPanelPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "섹션형 초안 검토·편집 패널" })).toBeInTheDocument()
  })

  it("renders every sample as a numbered section", () => {
    render(<DraftReviewPanelPatternsPage />)
    for (const sample of DRAFT_REVIEW_PANEL_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 1 sample", () => {
    render(<DraftReviewPanelPatternsPage />)
    expect(DRAFT_REVIEW_PANEL_SAMPLES.length).toBe(1)
  })
})
