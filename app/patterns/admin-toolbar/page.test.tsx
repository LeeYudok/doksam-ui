import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import AdminToolbarPatternsPage from "@/app/patterns/admin-toolbar/page"

describe("AdminToolbarPatternsPage", () => {
  it("renders the page heading and finance badge", () => {
    render(<AdminToolbarPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "관리자 툴바 패턴" })).toBeInTheDocument()
    expect(screen.getByText("금융 도메인")).toBeInTheDocument()
  })

  it("renders every pattern section title", () => {
    render(<AdminToolbarPatternsPage />)
    for (const title of ["데이터 전송 버튼", "관리자 툴바", "더미 생성 툴바"]) {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument()
    }
  })

  it("opens the alert dialog before destructive reset", () => {
    render(<AdminToolbarPatternsPage />)
    fireEvent.click(screen.getByRole("button", { name: "데이터삭제" }))
    expect(screen.getByRole("alertdialog", { name: "데이터를 초기화할까요?" })).toBeInTheDocument()
  })

  it("steps the generation count with the spinner buttons", () => {
    render(<AdminToolbarPatternsPage />)
    expect(screen.getByText("1000")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "+1000" }))
    expect(screen.getByText("2000")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "-" }))
    expect(screen.getByText("1999")).toBeInTheDocument()
  })
})
