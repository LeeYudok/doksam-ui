import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import HelpCenterManualPage from "@/app/templates/help-center/manual/page"
import { MANUAL_CATEGORIES } from "@/app/templates/help-center/_data/manual"

// cmdk 가 쓰는 포인터 캡처 API 는 jsdom 에 없어 폴리필한다
// (app/templates/rag-search/page.test.tsx 의 기존 관례와 동일).
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Element.prototype as any).hasPointerCapture ??= () => false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Element.prototype as any).scrollIntoView ??= () => {}
  // cmdk 가 항목 크기 측정에 쓰는 ResizeObserver 는 jsdom 에 없다.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe("HelpCenterManualPage", () => {
  it("매뉴얼 색인 배지와 검색창을 렌더한다", () => {
    render(<HelpCenterManualPage />)
    expect(screen.getByText("매뉴얼 색인")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("화면·기능 검색…")).toBeInTheDocument()
  })

  it("첫 항목이 기본 선택되어 디테일 패널에 표시된다", () => {
    render(<HelpCenterManualPage />)
    const firstEntry = MANUAL_CATEGORIES[0].entries[0]
    expect(screen.getByRole("heading", { level: 3, name: firstEntry.title })).toBeInTheDocument()
    expect(screen.getByText(firstEntry.body)).toBeInTheDocument()
  })

  it("다른 항목을 선택하면 디테일 패널이 바뀐다", () => {
    render(<HelpCenterManualPage />)
    const secondEntry = MANUAL_CATEGORIES[0].entries[1]
    fireEvent.click(screen.getByText(secondEntry.title))
    expect(screen.getByRole("heading", { level: 3, name: secondEntry.title })).toBeInTheDocument()
  })
})
