import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import StatsPatternsPage from "@/app/patterns/stats/page"
import { STATS_SAMPLES } from "@/components/patterns/stats-samples"

describe("StatsPatternsPage", () => {
  it("renders the page heading", () => {
    render(<StatsPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "지표·KPI 카드" })).toBeInTheDocument()
  })

  it("renders every stats sample as a numbered section", () => {
    render(<StatsPatternsPage />)
    for (const sample of STATS_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders KPI card labels and won-formatted values", () => {
    render(<StatsPatternsPage />)
    expect(screen.getByText("이번 달 매출")).toBeInTheDocument()
    expect(screen.getByText("3억")).toBeInTheDocument()
  })

  it("colors a positive change with the gain token and a negative change with the loss token", () => {
    render(<StatsPatternsPage />)
    const gain = screen.getByText("+12.40%")
    const loss = screen.getByText("-2.30%")
    expect(gain.className).toContain("text-gain")
    expect(loss.className).toContain("text-loss")
  })

  it("shows a neutral color for a zero change", () => {
    render(<StatsPatternsPage />)
    const neutral = screen.getAllByText("0.00%")[0]
    expect(neutral.className).toContain("text-muted-foreground")
  })
})
