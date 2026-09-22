import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import StockPortfolioPatternsPage from "@/app/patterns/stock-portfolio/page"

describe("StockPortfolioPatternsPage", () => {
  it("renders the page heading and finance badge", () => {
    render(<StockPortfolioPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "포트폴리오·추천 패턴" })).toBeInTheDocument()
    expect(screen.getByText("금융 도메인")).toBeInTheDocument()
  })

  it("renders every pattern section title", () => {
    render(<StockPortfolioPatternsPage />)
    for (const title of ["포트폴리오 종목 카드", "추천 종목 카드", "옵티마이저 추천 카드", "비트 격자", "종목 뉴스 패널"]) {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument()
    }
  })

  it("colors portfolio return rates with gain/loss semantic tokens", () => {
    render(<StockPortfolioPatternsPage />)
    expect(screen.getByText("+12.4% (+248,400원)").className).toContain("text-gain")
    expect(screen.getByText("-3.2% (-56,000원)").className).toContain("text-loss")
  })

  it("expands the optimizer active-bit reasoning on toggle", () => {
    render(<StockPortfolioPatternsPage />)
    // 접힘 상태에선 수직 비트 그리드의 그룹 헤더가 카드 안에 없다(페이지 하단 #54 데모와 별개로 카운트 확인).
    const before = screen.getAllByText(/F · 필터/).length
    fireEvent.click(screen.getByRole("button", { name: /왜 추천됐는가/ }))
    expect(screen.getAllByText(/F · 필터/).length).toBe(before + 1)
  })

  it("renders news sentiment badges", () => {
    render(<StockPortfolioPatternsPage />)
    expect(screen.getByText("긍정")).toBeInTheDocument()
    expect(screen.getByText("부정")).toBeInTheDocument()
    expect(screen.getByText("중립")).toBeInTheDocument()
  })
})
