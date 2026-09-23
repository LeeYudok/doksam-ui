import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import StockPatternsPage from "@/app/patterns/stock/page"

describe("StockPatternsPage", () => {
  it("renders the page heading and finance badge", () => {
    render(<StockPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "주식 패턴" })).toBeInTheDocument()
    expect(screen.getByText("금융 도메인")).toBeInTheDocument()
  })

  it("renders every pattern section title", () => {
    render(<StockPatternsPage />)
    for (const title of [
      "종목 카드",
      "시장 방향",
      "매매 시그널",
      "재료 알림 + 센티먼트",
      "보유 종목 카드",
      "워치리스트 게이지",
      "일별 추적 테이블",
      "시뮬레이션 결과",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument()
    }
  })

  it("colors a rising rate as gain(red) and a falling rate as loss(blue)", () => {
    render(<StockPatternsPage />)
    const kospi = screen.getByText("-0.32%")
    expect(kospi.className).toContain("text-loss")
    const kosdaq = screen.getByText("+1.08%")
    expect(kosdaq.className).toContain("text-gain")
  })
})
