import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { code, demo, donts, dos } from "@/components/demos/evidence-decision-panel.demo"

describe("evidence-decision-panel demo", () => {
  it("renders a recommendation and lets the reviewer change the draft selection", () => {
    render(demo)

    expect(screen.getByRole("radio", { name: /정밀 검토 요청/ })).toBeChecked()
    fireEvent.click(screen.getByRole("radio", { name: /관찰 유지/ }))
    expect(screen.getByRole("radio", { name: /관찰 유지/ })).toBeChecked()
  })

  it("exposes copyable API code and decision boundaries", () => {
    expect(code).toContain("EvidenceDecisionPanel")
    expect(dos.length).toBeGreaterThanOrEqual(2)
    expect(donts.length).toBeGreaterThanOrEqual(2)
  })
})
