import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import MobileBankingHistoryPatternsPage from "@/app/patterns/mobile-banking-history/page"
import { MOBILE_BANKING_HISTORY_SAMPLES } from "@/components/patterns/mobile-banking-history-samples"

describe("MobileBankingHistoryPatternsPage", () => {
  it("renders the page heading and every sample section", () => {
    render(<MobileBankingHistoryPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "모바일뱅킹 · 거래내역" })).toBeInTheDocument()
    for (const sample of MOBILE_BANKING_HISTORY_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
    }
  })

  it("colors a deposit as gain and a withdrawal as loss", () => {
    render(<MobileBankingHistoryPatternsPage />)
    const deposit = screen.getByText("+3,200,000원")
    expect(deposit.className).toContain("text-gain")
    const withdrawal = screen.getByText("-6,500원")
    expect(withdrawal.className).toContain("text-loss")
  })

  it("groups transactions under date headers", () => {
    render(<MobileBankingHistoryPatternsPage />)
    expect(screen.getByText("7월 12일 (일)")).toBeInTheDocument()
  })

  it("filters the list down to a single transaction type", () => {
    render(<MobileBankingHistoryPatternsPage />)
    fireEvent.click(screen.getByRole("button", { name: "입금" }))
    expect(screen.queryByText("스타벅스 강남점")).not.toBeInTheDocument()
    expect(screen.getByText("㈜doksam")).toBeInTheDocument()
  })
})
