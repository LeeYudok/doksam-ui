import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import HelpCenterAskPage from "@/app/templates/help-center/page"
import { SUGGESTED_QUESTIONS } from "@/app/templates/help-center/_data/suggested-questions"

describe("HelpCenterAskPage", () => {
  it("물어보기 배지와 안내 문구를 렌더한다", () => {
    render(<HelpCenterAskPage />)
    expect(screen.getByText("물어보기")).toBeInTheDocument()
    expect(screen.getByLabelText("무엇이 궁금하신가요?")).toBeInTheDocument()
  })

  it("추천 질문 칩을 렌더한다", () => {
    render(<HelpCenterAskPage />)
    for (const question of SUGGESTED_QUESTIONS) {
      expect(screen.getByRole("button", { name: question })).toBeInTheDocument()
    }
  })

  it("추천 질문 칩을 누르면 입력창이 그 질문으로 채워진다", () => {
    render(<HelpCenterAskPage />)
    fireEvent.click(screen.getByRole("button", { name: SUGGESTED_QUESTIONS[0] }))
    expect(screen.getByLabelText("무엇이 궁금하신가요?")).toHaveValue(SUGGESTED_QUESTIONS[0])
  })

  it("질문을 보내면 방금 보낸 질문 목록에 나타나고 답변 대기 배지가 붙는다", () => {
    render(<HelpCenterAskPage />)
    const textarea = screen.getByLabelText("무엇이 궁금하신가요?")
    fireEvent.change(textarea, { target: { value: "새로 물어보는 질문입니다" } })
    fireEvent.click(screen.getByRole("button", { name: "질문 보내기" }))

    const section = screen.getByRole("region", { name: "방금 보낸 질문" })
    expect(section).toHaveTextContent("새로 물어보는 질문입니다")
    expect(section).toHaveTextContent("답변 대기")
  })

  it("최근 답변된 질문 섹션을 렌더한다", () => {
    render(<HelpCenterAskPage />)
    expect(screen.getByRole("region", { name: "최근 답변된 질문" })).toBeInTheDocument()
  })
  /** PR #111 finding 8 — 추천 질문 칩으로 같은 문장을 두 번 보내는 것이 기본 동선이다. */
  it("같은 질문을 두 번 보내도 항목이 두 개 쌓인다 — 중복 key 경고 없이", () => {
    // 질문 문자열을 key 로 쓰면 React 가 중복 key 를 console.error 로 경고한다.
    // 렌더 결과만으로는 드러나지 않는 회귀라 경고 자체를 고정한다.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    render(<HelpCenterAskPage />)
    const send = () => {
      fireEvent.click(screen.getByRole("button", { name: SUGGESTED_QUESTIONS[0] }))
      fireEvent.click(screen.getByRole("button", { name: "질문 보내기" }))
    }
    send()
    send()

    const section = screen.getByRole("region", { name: "방금 보낸 질문" })
    expect(within(section).getAllByRole("listitem")).toHaveLength(2)
    expect(within(section).getAllByText(SUGGESTED_QUESTIONS[0])).toHaveLength(2)
    expect(consoleError.mock.calls.map((args) => String(args[0])).join("\n")).not.toMatch(/same key|duplicate key/i)
    consoleError.mockRestore()
  })
})
