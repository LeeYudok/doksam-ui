import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import EvidenceDecisionPatternsPage from "@/app/patterns/evidence-decision/page"
import { EVIDENCE_DECISION_SAMPLES } from "@/components/patterns/evidence-decision-samples"

describe("EvidenceDecisionPatternsPage", () => {
  it("renders its title from the finance pattern registry", () => {
    render(<EvidenceDecisionPatternsPage />)

    expect(screen.getByRole("heading", { level: 1, name: "근거 기반 의사결정" })).toBeInTheDocument()
  })

  it("renders every evidence-decision sample", () => {
    render(<EvidenceDecisionPatternsPage />)

    for (const sample of EVIDENCE_DECISION_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
    }
  })
})
