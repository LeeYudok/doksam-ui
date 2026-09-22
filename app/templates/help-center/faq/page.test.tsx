import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import HelpCenterFaqPage from "@/app/templates/help-center/faq/page"
import { FAQ_ITEMS } from "@/app/templates/help-center/_data/faq"

describe("HelpCenterFaqPage", () => {
  it("FAQ 배지와 전 카테고리 헤딩을 렌더한다", () => {
    render(<HelpCenterFaqPage />)
    expect(screen.getByText("FAQ")).toBeInTheDocument()
    const categories = [...new Set(FAQ_ITEMS.map((item) => item.category))]
    for (const category of categories) {
      const section = screen.getByRole("region", { name: category })
      expect(within(section).getByText(category, { selector: "h3" })).toBeInTheDocument()
    }
  })

  it("전 질문 트리거를 렌더한다", () => {
    render(<HelpCenterFaqPage />)
    for (const item of FAQ_ITEMS) {
      expect(screen.getByRole("button", { name: item.question })).toBeInTheDocument()
    }
  })

  it("질문을 누르면 답변이 펼쳐진다", () => {
    render(<HelpCenterFaqPage />)
    const first = FAQ_ITEMS[0]
    fireEvent.click(screen.getByRole("button", { name: first.question }))
    expect(screen.getByText(first.answer)).toBeVisible()
  })
})
