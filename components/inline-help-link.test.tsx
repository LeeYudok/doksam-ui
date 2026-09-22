import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"

import { InlineHelpLink } from "@/components/inline-help-link"
import { TooltipProvider } from "@/components/ui/tooltip"

function renderWithProvider(ui: ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe("InlineHelpLink", () => {
  it("label 을 접근 가능한 이름으로 노출한다 — 라벨 없는 아이콘 단독이라 필수다", () => {
    renderWithProvider(<InlineHelpLink label="이 섹션 사용법" href="/help/section" />)
    expect(screen.getByRole("link", { name: "이 섹션 사용법" })).toBeInTheDocument()
  })

  it("href 를 주면 링크로 렌더한다", () => {
    renderWithProvider(<InlineHelpLink label="이 섹션 사용법" href="/help/section" />)
    const link = screen.getByRole("link", { name: "이 섹션 사용법" })
    expect(link).toHaveAttribute("href", "/help/section")
  })

  it("onOpen 을 주면 버튼으로 렌더하고 클릭 시 호출한다", () => {
    const onOpen = vi.fn()
    renderWithProvider(<InlineHelpLink label="이 섹션 사용법" onOpen={onOpen} />)

    const button = screen.getByRole("button", { name: "이 섹션 사용법" })
    fireEvent.click(button)

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it("title 속성도 함께 채운다", () => {
    renderWithProvider(<InlineHelpLink label="이 섹션 사용법" onOpen={() => {}} />)
    expect(screen.getByRole("button", { name: "이 섹션 사용법" })).toHaveAttribute(
      "title",
      "이 섹션 사용법",
    )
  })
})
