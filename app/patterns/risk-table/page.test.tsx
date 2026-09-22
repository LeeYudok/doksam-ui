import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import RiskTablePatternsPage from "@/app/patterns/risk-table/page"
import { RISK_TABLE_SAMPLES } from "@/components/patterns/risk-table-samples"

describe("RiskTablePatternsPage", () => {
  it("renders the page heading from the pattern registry", () => {
    render(<RiskTablePatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "위험 강조 테이블" })).toBeInTheDocument()
  })

  it("renders every sample as a numbered section", () => {
    render(<RiskTablePatternsPage />)
    for (const sample of RISK_TABLE_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 3 samples", () => {
    render(<RiskTablePatternsPage />)
    expect(RISK_TABLE_SAMPLES.length).toBe(3)
  })
})
