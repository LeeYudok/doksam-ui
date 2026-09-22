import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import StickyActionbarPatternsPage from "@/app/patterns/sticky-actionbar/page"
import { STICKY_ACTIONBAR_SAMPLES } from "@/components/patterns/sticky-actionbar-samples"

describe("StickyActionbarPatternsPage", () => {
  it("renders the page heading from the pattern registry", () => {
    render(<StickyActionbarPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "하단 고정 액션바" })).toBeInTheDocument()
  })

  it("renders every sample as a numbered section", () => {
    render(<StickyActionbarPatternsPage />)
    for (const sample of STICKY_ACTIONBAR_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 2 samples", () => {
    render(<StickyActionbarPatternsPage />)
    expect(STICKY_ACTIONBAR_SAMPLES.length).toBe(2)
  })
})
