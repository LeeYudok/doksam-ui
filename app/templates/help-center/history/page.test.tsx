import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import HelpCenterHistoryPage from "@/app/templates/help-center/history/page"
import { QUESTION_HISTORY } from "@/app/templates/help-center/_data/questions"

describe("HelpCenterHistoryPage", () => {
  it("질문 이력 배지와 전 질문을 시간순 목록으로 렌더한다", () => {
    render(<HelpCenterHistoryPage />)
    expect(screen.getByText("질문 이력")).toBeInTheDocument()
    const list = screen.getByRole("list", { name: "내 질문 이력" })
    const items = within(list).getAllByRole("listitem")
    expect(items).toHaveLength(QUESTION_HISTORY.length)
  })

  it("답변 완료/대기 상태를 텍스트로도 구분한다", () => {
    render(<HelpCenterHistoryPage />)
    const answeredCount = QUESTION_HISTORY.filter((q) => q.status === "answered").length
    const pendingCount = QUESTION_HISTORY.filter((q) => q.status === "pending").length
    expect(screen.getAllByText("답변 완료")).toHaveLength(answeredCount)
    expect(screen.getAllByText("답변 대기")).toHaveLength(pendingCount)
  })

  it("답변된 질문은 답변 본문도 함께 보여준다", () => {
    render(<HelpCenterHistoryPage />)
    const answered = QUESTION_HISTORY.find((q) => q.status === "answered" && q.answer)!
    expect(screen.getByText(answered.answer!)).toBeInTheDocument()
  })
})
