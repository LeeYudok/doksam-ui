import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import PasskeyAuthPage from "@/app/templates/passkey-auth/page"

/** input-otp(문자 인증 화면)가 ResizeObserver 를 쓰는데 jsdom 에는 없다. */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

/** 데모 컨트롤로 상태 화면을 직접 연다 — 모든 상태가 도달 가능해야 한다(#46). */
function jumpTo(label: string) {
  fireEvent.click(screen.getByRole("button", { name: label }))
}

describe("PasskeyAuthPage", () => {
  it("renders the page heading and eyebrow badge", () => {
    render(<PasskeyAuthPage />)
    expect(screen.getByRole("heading", { level: 2, name: "패스키(WebAuthn) 인증" })).toBeInTheDocument()
    expect(screen.getByText("Auth · focus-task 원형")).toBeInTheDocument()
  })

  it("opens on the sign-in screen with one primary and one secondary action", () => {
    render(<PasskeyAuthPage />)
    expect(screen.getByRole("heading", { level: 2, name: "로그인" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "패스키로 계속" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "문자 인증으로 로그인" })).toBeInTheDocument()
  })

  it("moves to the authenticator-waiting screen from the primary action", () => {
    render(<PasskeyAuthPage />)
    fireEvent.click(screen.getByRole("button", { name: "패스키로 계속" }))
    expect(screen.getByRole("heading", { level: 2, name: "기기에서 확인해 주세요" })).toBeInTheDocument()
    expect(screen.getByText("인증기 응답 대기 중")).toBeInTheDocument()
  })

  it("tells user cancellation apart from authentication failure", () => {
    render(<PasskeyAuthPage />)
    fireEvent.click(screen.getByRole("button", { name: "패스키로 계속" }))
    fireEvent.click(screen.getByRole("button", { name: "사용자 취소" }))
    expect(screen.getByRole("heading", { level: 2, name: "인증을 취소했습니다" })).toBeInTheDocument()
    expect(screen.getByText("중단된 요청")).toBeInTheDocument()

    jumpTo("실패 안내")
    expect(screen.getByRole("heading", { level: 2, name: "인증하지 못했습니다" })).toBeInTheDocument()
    expect(screen.getByText("검증 실패")).toBeInTheDocument()
  })

  it("renders every catalogued screen state", () => {
    render(<PasskeyAuthPage />)
    const expected: [string, string][] = [
      ["패스키 등록", "패스키 만들기"],
      ["다른 기기", "다른 기기로 인증"],
      ["기기 관리", "등록된 기기"],
      ["문자 인증", "문자 인증"],
      ["미지원 환경", "이 브라우저에서는 패스키를 쓸 수 없습니다"],
      ["인증 완료", "로그인했습니다"],
    ]
    for (const [control, heading] of expected) {
      jumpTo(control)
      expect(screen.getByRole("heading", { level: 2, name: heading }), control).toBeInTheDocument()
    }
  })

  it("removes a registered passkey after confirming the dialog", () => {
    render(<PasskeyAuthPage />)
    jumpTo("기기 관리")
    expect(screen.getByText("YubiKey 5C")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "YubiKey 5C 삭제" }))
    const dialog = screen.getByRole("alertdialog")
    fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }))
    expect(screen.queryByText("YubiKey 5C")).not.toBeInTheDocument()
  })
})
