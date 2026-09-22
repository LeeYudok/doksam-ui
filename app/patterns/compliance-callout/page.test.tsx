import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import ComplianceCalloutPatternsPage from "@/app/patterns/compliance-callout/page"
import { COMPLIANCE_CALLOUT_SAMPLES } from "@/components/patterns/compliance-callout-samples"

describe("ComplianceCalloutPatternsPage", () => {
  it("renders the page heading from the pattern registry", () => {
    render(<ComplianceCalloutPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "규정 콜아웃" })).toBeInTheDocument()
  })

  it("renders every sample as a numbered section", () => {
    render(<ComplianceCalloutPatternsPage />)
    for (const sample of COMPLIANCE_CALLOUT_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 3 samples", () => {
    render(<ComplianceCalloutPatternsPage />)
    expect(COMPLIANCE_CALLOUT_SAMPLES.length).toBe(3)
  })
})
