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

/** 카드 밖 데모 컨트롤에서 상태 화면을 직접 연다. */
function jumpTo(label: string) {
  const demo = screen.getByRole("region", { name: "데모 컨트롤" })
  fireEvent.click(within(demo).getByRole("button", { name: label }))
}

/** 카드 안(focus-task 원형이 규율하는 영역)만 스코프한다. */
function card() {
  return screen.getByRole("region", { name: "인증 카드" })
}

describe("PasskeyAuthPage", () => {
  it("renders the page heading and eyebrow badge", () => {
    render(<PasskeyAuthPage />)
    expect(screen.getByRole("heading", { level: 2, name: "패스키(WebAuthn) 인증" })).toBeInTheDocument()
    expect(screen.getByText("Auth · focus-task 원형")).toBeInTheDocument()
  })

  it("opens on the sign-in screen with one primary and one secondary action", () => {
    render(<PasskeyAuthPage />)
    // 카드 안 제목은 페이지 h2 아래 단계인 h3 이다(#55 L7).
    expect(within(card()).getByRole("heading", { level: 3, name: "로그인" })).toBeInTheDocument()
    expect(within(card()).getByRole("button", { name: "패스키로 계속" })).toBeInTheDocument()
    expect(within(card()).getByRole("button", { name: "문자 인증으로 로그인" })).toBeInTheDocument()
  })

  it("moves to the authenticator-waiting screen from the primary action", () => {
    render(<PasskeyAuthPage />)
    fireEvent.click(within(card()).getByRole("button", { name: "패스키로 계속" }))
    expect(within(card()).getByRole("heading", { level: 3, name: "기기에서 확인해 주세요" })).toBeInTheDocument()
    expect(screen.getByText("인증기 응답 대기 중")).toBeInTheDocument()
  })

  /**
   * #55 M2 회귀 가드 — 대기 화면 카드 안에 데모용 결과 선택 버튼이 다시 들어오면
   * 실패한다. 이 템플릿은 레지스트리 블록으로 통째로 배포되므로, 카드 안의
   * "인증 실패" 버튼은 소비 프로젝트의 보안 화면에 그대로 출시된다.
   */
  it("keeps demo-only controls out of the card", () => {
    render(<PasskeyAuthPage />)
    fireEvent.click(within(card()).getByRole("button", { name: "패스키로 계속" }))

    for (const name of ["성공", "사용자 취소", "인증 실패", "취소 안내", "실패 안내", "미지원 환경"]) {
      expect(within(card()).queryByRole("button", { name }), `카드 안 "${name}"`).toBeNull()
    }
    // 대기 화면 카드에 남는 것: 이탈용 보조 링크 하나뿐이다.
    expect(within(card()).getAllByRole("button")).toHaveLength(1)
    expect(within(card()).getByRole("button", { name: "로그인으로 돌아가기" })).toBeInTheDocument()
  })

  it("tells user cancellation apart from authentication failure", () => {
    render(<PasskeyAuthPage />)
    jumpTo("취소 안내")
    expect(within(card()).getByRole("heading", { level: 3, name: "인증을 취소했습니다" })).toBeInTheDocument()
    expect(screen.getByText("중단된 요청")).toBeInTheDocument()

    jumpTo("실패 안내")
    expect(within(card()).getByRole("heading", { level: 3, name: "인증하지 못했습니다" })).toBeInTheDocument()
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
      expect(within(card()).getByRole("heading", { level: 3, name: heading }), control).toBeInTheDocument()
    }
  })

  /**
   * #55 M3 — 표준 화면 경로로 도달하는 화면과 실제 환경 신호로만 갈라지는 화면을
   * 데모 컨트롤이 갈라서 표시한다. 소비 프로젝트는 후자를 실제 신호에 연결해야 한다.
   */
  it("separates in-app screens from demo-only screens in the demo panel", () => {
    render(<PasskeyAuthPage />)
    const demo = screen.getByRole("region", { name: "데모 컨트롤" })
    expect(within(demo).getByText(/데모 전용/)).toBeInTheDocument()
    for (const label of ["취소 안내", "실패 안내", "미지원 환경"]) {
      expect(within(demo).getByRole("button", { name: label })).toBeInTheDocument()
    }
  })

  it("reaches the in-app screens from card actions alone", () => {
    render(<PasskeyAuthPage />)
    // 로그인 → 문자 인증 → 확인 → 인증 완료: 패스키 경로의 성공은 서버 검증
    // 결과라 데모 전용이지만, 성공 화면 자체는 대체 경로로 도달한다.
    fireEvent.click(within(card()).getByRole("button", { name: "문자 인증으로 로그인" }))
    expect(within(card()).getByRole("heading", { level: 3, name: "문자 인증" })).toBeInTheDocument()

    fireEvent.click(within(card()).getByRole("button", { name: "다음부터 패스키 쓰기" }))
    expect(within(card()).getByRole("heading", { level: 3, name: "패스키 만들기" })).toBeInTheDocument()

    fireEvent.click(within(card()).getByRole("button", { name: "다른 기기에 만들기" }))
    expect(within(card()).getByRole("heading", { level: 3, name: "다른 기기로 인증" })).toBeInTheDocument()

    fireEvent.click(within(card()).getByRole("button", { name: "로그인으로 돌아가기" }))
    fireEvent.click(within(card()).getByRole("button", { name: "등록된 기기 관리" }))
    expect(within(card()).getByRole("heading", { level: 3, name: "등록된 기기" })).toBeInTheDocument()
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
