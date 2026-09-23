import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import PricingPatternsPage from "@/app/patterns/pricing/page"
import { PRICING_SAMPLES } from "@/components/patterns/pricing-samples"

describe("PricingPatternsPage", () => {
  it("renders the page heading", () => {
    render(<PricingPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "가격표" })).toBeInTheDocument()
  })

  it("renders every pricing sample as a numbered section", () => {
    render(<PricingPatternsPage />)
    for (const sample of PRICING_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders the 3 pricing tiers with the recommended badge", () => {
    render(<PricingPatternsPage />)
    expect(screen.getAllByText("Starter").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Team").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Enterprise").length).toBeGreaterThan(0)
    expect(screen.getAllByText("추천").length).toBeGreaterThan(0)
  })

  it("switches to yearly billing and updates the discounted price", () => {
    render(<PricingPatternsPage />)
    expect(screen.getByText("₩29,000")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("switch"))

    expect(screen.getByText("₩24,070")).toBeInTheDocument()
  })
})
