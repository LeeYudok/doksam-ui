import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { code, demo, donts, dos } from "@/components/demos/ranked-alternatives-list.demo"

describe("ranked-alternatives-list demo", () => {
  it("shows the ranked alternatives and lets the reviewer adopt one without losing the rest", () => {
    render(demo)

    expect(screen.getByText("정부지원 대환대출 연계")).toBeInTheDocument()
    expect(screen.getByText("채택됨")).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole("button", { name: "채택" })[0])

    expect(screen.getAllByText("정부지원 대환대출 연계").length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText("신보 특별협약보증").length).toBeGreaterThanOrEqual(1)
  })

  it("exposes copyable API code and decision boundaries against evidence-decision-panel", () => {
    expect(code).toContain("RankedAlternativesList")
    expect(dos.length).toBeGreaterThanOrEqual(2)
    expect(donts.length).toBeGreaterThanOrEqual(2)
    expect(donts.some((item) => item.includes("evidence-decision-panel"))).toBe(true)
  })
})
