import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import PortalLoginPage from "@/app/templates/portal-login/page"

/** 카드 안(focus-task 원형이 규율하는 영역)만 스코프한다. */
function card() {
  return screen.getByRole("region", { name: "로그인 카드" })
}

describe("PortalLoginPage", () => {
  it("renders the page heading and eyebrow badge", () => {
    render(<PortalLoginPage />)
    expect(screen.getByRole("heading", { level: 2, name: "사내 업무포털 로그인" })).toBeInTheDocument()
    expect(screen.getByText("Auth · focus-task 원형")).toBeInTheDocument()
  })

  it("renders a non-navigational system status bar above the card", () => {
    render(<PortalLoginPage />)
    expect(screen.getByText("doksam 사내 업무포털")).toBeInTheDocument()
    expect(screen.getByText(/정상 운영 중/)).toBeInTheDocument()
    expect(screen.getByText("운영계 · PROD")).toBeInTheDocument()
    // 시스템 바에는 다른 화면으로 이동하는 링크가 없다.
    expect(screen.queryAllByRole("link")).toHaveLength(0)
  })

  it("renders the notice area with the pinned notice first", () => {
    render(<PortalLoginPage />)
    const notices = screen.getByRole("region", { name: "공지사항" })
    expect(screen.getByText(/정기 점검/)).toBeInTheDocument()
    expect(within(notices).getByText("여신 조기경보 화면 UI 개편 안내")).toBeInTheDocument()
    expect(within(notices).getByText("보안 정책 개정에 따른 비밀번호 규칙 변경 안내")).toBeInTheDocument()
  })

  it("renders the security notice footer without collapsing the card", () => {
    render(<PortalLoginPage />)
    expect(screen.getByText(/이 시스템은 사내 업무 목적으로만 사용해야 합니다/)).toBeInTheDocument()
    expect(within(card()).getByRole("heading", { level: 3, name: "로그인" })).toBeInTheDocument()
  })

  it("shows a validation alert when submitting empty fields", () => {
    render(<PortalLoginPage />)
    fireEvent.click(within(card()).getByRole("button", { name: "로그인" }))
    expect(within(card()).getByText("입력값을 확인하세요")).toBeInTheDocument()
  })

  it("moves to the success screen after entering credentials", () => {
    render(<PortalLoginPage />)
    fireEvent.change(within(card()).getByLabelText("사번"), { target: { value: "20261234" } })
    fireEvent.change(within(card()).getByLabelText("비밀번호"), { target: { value: "pass1234" } })
    fireEvent.click(within(card()).getByRole("button", { name: "로그인" }))
    expect(within(card()).getByRole("heading", { level: 3, name: "로그인했습니다" })).toBeInTheDocument()
    expect(within(card()).getByText("20261234")).toBeInTheDocument()
  })

  /** 역할 분기는 선택 UI 가 아니라 안내 문구로만 드러난다(#101 설계 결정). */
  it("shows role routing as informational text, never a selector", () => {
    render(<PortalLoginPage />)
    expect(screen.getByText(/담당자 · 심사역 · 관리자 화면 중 해당하는 곳으로 자동 이동합니다/)).toBeInTheDocument()
    expect(screen.queryByRole("radio")).toBeNull()
    expect(screen.queryByRole("combobox")).toBeNull()
  })

  it("keeps the card to one primary action and one secondary action", () => {
    render(<PortalLoginPage />)
    // 폼 제출(로그인)·인증서 로그인 버튼 2개 + 비밀번호 찾기 링크형 버튼 1개.
    expect(within(card()).getByRole("button", { name: "로그인" })).toBeInTheDocument()
    expect(within(card()).getByRole("button", { name: "인증서로 로그인" })).toBeInTheDocument()
    expect(within(card()).getByRole("button", { name: "비밀번호를 잊으셨나요?" })).toBeInTheDocument()
  })

  it("reveals an inline note without navigating away when asking for certificate help", () => {
    render(<PortalLoginPage />)
    fireEvent.click(within(card()).getByRole("button", { name: "인증서로 로그인" }))
    expect(within(card()).getByText(/IT지원팀\(내선 1544\)에 등록을 요청하세요/)).toBeInTheDocument()
  })
})
