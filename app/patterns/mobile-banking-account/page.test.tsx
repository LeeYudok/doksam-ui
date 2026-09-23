import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import MobileBankingAccountPatternsPage from "@/app/patterns/mobile-banking-account/page"
import { MOBILE_BANKING_ACCOUNT_SAMPLES } from "@/components/patterns/mobile-banking-account-samples"

describe("MobileBankingAccountPatternsPage", () => {
  it("renders the page heading", () => {
    render(<MobileBankingAccountPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "모바일뱅킹 · 계좌" })).toBeInTheDocument()
  })

  it("renders every sample as a numbered section", () => {
    render(<MobileBankingAccountPatternsPage />)
    for (const sample of MOBILE_BANKING_ACCOUNT_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("formats the primary account balance with formatWon", () => {
    render(<MobileBankingAccountPatternsPage />)
    const matches = screen.getAllByText("2,845,600원")
    expect(matches.length).toBeGreaterThanOrEqual(1)
    expect(matches[0].className).toContain("tabular-nums")
  })
})
