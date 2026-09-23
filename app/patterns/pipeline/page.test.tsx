import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import PipelinePatternsPage from "@/app/patterns/pipeline/page"

describe("PipelinePatternsPage", () => {
  it("renders the page heading and finance badge", () => {
    render(<PipelinePatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "파이프라인 패턴" })).toBeInTheDocument()
    expect(screen.getByText("금융 도메인")).toBeInTheDocument()
  })

  it("renders every pattern section title", () => {
    render(<PipelinePatternsPage />)
    for (const title of [
      "스텝 플로우",
      "실행 상태 배지",
      "툴팁 액션 버튼",
      "스텝 카드 그리드",
      "수집 이력 테이블",
      "스텝 결과 리스트",
      "고급 데이터 테이블",
      "에러 카드 + 실행 로그",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument()
    }
  })

  it("gives every icon-only action button an accessible name", () => {
    render(<PipelinePatternsPage />)
    const editButtons = screen.getAllByRole("button", { name: "수정" })
    expect(editButtons.length).toBeGreaterThan(0)
  })
})
