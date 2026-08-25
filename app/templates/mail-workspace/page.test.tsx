import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import MailWorkspacePage from "@/app/templates/mail-workspace/page"
import { FOLDERS, THREADS } from "@/app/templates/mail-workspace/_data/threads"

describe("MailWorkspacePage (split-pane 원형)", () => {
  it("목록 패인과 상세 패인을 한 화면에 둔다", () => {
    render(<MailWorkspacePage />)
    expect(screen.getByRole("region", { name: "메일 목록" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "메일 상세" })).toBeInTheDocument()
  })

  it("목록에 전체 메일을 렌더하고 첫 메일을 기본 선택한다", () => {
    render(<MailWorkspacePage />)
    const list = screen.getByRole("region", { name: "메일 목록" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(THREADS.length)
    expect(screen.getByRole("heading", { level: 2, name: THREADS[0].subject })).toBeInTheDocument()
  })

  it("목록 항목을 고르면 상세 패인만 바뀐다", () => {
    render(<MailWorkspacePage />)
    const list = screen.getByRole("region", { name: "메일 목록" })
    fireEvent.click(within(list).getByText(THREADS[2].subject))

    expect(screen.getByRole("heading", { level: 2, name: THREADS[2].subject })).toBeInTheDocument()
    // 목록은 그대로 유지된다 — 라우팅이 아니라 우측 교체다.
    expect(within(list).getAllByRole("listitem")).toHaveLength(THREADS.length)
  })

  it("검색어로 목록만 좁힌다", () => {
    render(<MailWorkspacePage />)
    fireEvent.change(screen.getByLabelText("메일 검색"), { target: { value: "인증서" } })

    const list = screen.getByRole("region", { name: "메일 목록" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(1)
    expect(within(list).getByText(THREADS[2].subject)).toBeInTheDocument()
  })

  it("일치하는 메일이 없으면 빈 상태를 보여준다", () => {
    render(<MailWorkspacePage />)
    fireEvent.change(screen.getByLabelText("메일 검색"), { target: { value: "존재하지않는키워드" } })
    expect(screen.getByText("검색 결과가 없습니다.")).toBeInTheDocument()
  })

  it("중요 표시 폴더는 flagged 메일만 남긴다", () => {
    render(<MailWorkspacePage />)
    const folders = screen.getByRole("navigation", { name: "메일 폴더" })
    const flagged = FOLDERS.find((f) => f.id === "flagged")
    fireEvent.click(within(folders).getByText(flagged?.label ?? ""))

    const list = screen.getByRole("region", { name: "메일 목록" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(THREADS.filter((m) => m.flagged).length)
  })
})
