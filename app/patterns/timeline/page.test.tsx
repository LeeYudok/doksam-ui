import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import TimelinePatternsPage from "@/app/patterns/timeline/page"
import { TIMELINE_SAMPLES } from "@/components/patterns/timeline-samples"

describe("TimelinePatternsPage", () => {
  it("renders the page heading", () => {
    render(<TimelinePatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "활동 타임라인" })).toBeInTheDocument()
  })

  it("renders every timeline sample as a numbered section", () => {
    render(<TimelinePatternsPage />)
    for (const sample of TIMELINE_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("groups activity items under date headers", () => {
    render(<TimelinePatternsPage />)
    expect(screen.getByText("2026-07-13 (오늘)")).toBeInTheDocument()
    expect(screen.getByText("2026-07-12")).toBeInTheDocument()
    expect(screen.getByText("결제 완료")).toBeInTheDocument()
    expect(screen.getByText("결제 실패")).toBeInTheDocument()
  })

  it("renders the compact timeline steps without date grouping", () => {
    render(<TimelinePatternsPage />)
    expect(screen.getByText("주문 접수")).toBeInTheDocument()
    expect(screen.getByText("배송 실패 — 주소 오류")).toBeInTheDocument()
  })
})
