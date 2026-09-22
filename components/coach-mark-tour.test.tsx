import { StrictMode, useRef, useState } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { CoachMarkTour, type CoachMarkStep } from "@/components/coach-mark-tour"

// jsdom은 Pointer Events capture API·scrollIntoView·ResizeObserver를 구현하지
// 않는다 — Radix Popover(modal)와 이 컴포넌트의 스크롤 로직이 이를 호출하므로
// 테스트 환경에서만 no-op으로 채운다(kebab-menu.test.tsx와 동일한 패턴).
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
})

function makeSteps(count: number): CoachMarkStep[] {
  return Array.from({ length: count }, (_, i) => ({
    key: `step-${i}`,
    targetRef: { current: document.createElement("div") },
    title: `제목 ${i + 1}`,
    description: `설명 ${i + 1}`,
  }))
}

describe("CoachMarkTour", () => {
  it("open이 false면 아무것도 렌더하지 않는다", () => {
    render(<CoachMarkTour steps={makeSteps(2)} open={false} onOpenChange={vi.fn()} />)
    expect(screen.queryByText("제목 1")).not.toBeInTheDocument()
  })

  it("열리면 첫 단계의 제목·설명·단계 인디케이터를 보여준다", () => {
    render(<CoachMarkTour steps={makeSteps(3)} open onOpenChange={vi.fn()} />)
    expect(screen.getByText("제목 1")).toBeInTheDocument()
    expect(screen.getByText("설명 1")).toBeInTheDocument()
    expect(screen.getByText("1 / 3 단계")).toBeInTheDocument()
  })

  it("다음 버튼을 누르면 다음 단계로 이동한다", () => {
    render(<CoachMarkTour steps={makeSteps(3)} open onOpenChange={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "다음" }))
    expect(screen.getByText("제목 2")).toBeInTheDocument()
    expect(screen.getByText("2 / 3 단계")).toBeInTheDocument()
  })

  it("첫 단계에서는 이전 버튼이 비활성화된다", () => {
    render(<CoachMarkTour steps={makeSteps(2)} open onOpenChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled()
  })

  it("마지막 단계에서 다음 버튼 레이블이 완료로 바뀌고 누르면 투어가 닫힌다", () => {
    const onOpenChange = vi.fn()
    render(<CoachMarkTour steps={makeSteps(2)} open onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole("button", { name: "다음" }))
    expect(screen.getByRole("button", { name: "완료" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "완료" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  // 종료 게이트(#99): 투어를 켜고 끌 때 아래 화면의 스크롤 위치·포커스가 복원될 것.
  it("투어가 열렸다 닫히면 이전 포커스와 스크롤 위치로 되돌아간다", () => {
    function ControlledHarness() {
      const [open, setOpen] = useState(false)
      const triggerRef = useRef<HTMLButtonElement>(null)
      return (
        <div>
          <button type="button" ref={triggerRef} onClick={() => setOpen(true)}>
            투어 시작
          </button>
          <CoachMarkTour steps={makeSteps(2)} open={open} onOpenChange={setOpen} />
        </div>
      )
    }

    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
    Object.defineProperty(window, "scrollX", { value: 40, configurable: true })
    Object.defineProperty(window, "scrollY", { value: 120, configurable: true })

    render(<ControlledHarness />)
    const startButton = screen.getByRole("button", { name: "투어 시작" })
    startButton.focus()
    expect(document.activeElement).toBe(startButton)

    fireEvent.click(startButton)
    expect(screen.getByText("제목 1")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "투어 닫기" }))

    expect(screen.queryByText("제목 1")).not.toBeInTheDocument()
    expect(document.activeElement).toBe(startButton)
    expect(scrollToSpy).toHaveBeenCalledWith(40, 120)

    scrollToSpy.mockRestore()
  })

  // 회귀(#111 finding 12①): 닫기 콜백을 setState 업데이터 안에서 부르면 StrictMode 가
  // 업데이터를 두 번 실행하면서 부수효과도 두 번 발화한다.
  it("StrictMode에서도 마지막 단계의 완료 클릭이 onOpenChange를 한 번만 부른다", () => {
    const onOpenChange = vi.fn()
    render(
      <StrictMode>
        <CoachMarkTour steps={makeSteps(2)} open onOpenChange={onOpenChange} />
      </StrictMode>,
    )
    fireEvent.click(screen.getByRole("button", { name: "다음" }))
    fireEvent.click(screen.getByRole("button", { name: "완료" }))
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  // 회귀(#111 finding 12②): role=dialog 인 팝오버 콘텐츠에 접근명이 없으면
  // 스크린리더가 "dialog" 로만 읽는다.
  it("팝오버 다이얼로그의 접근명이 현재 단계 제목이다", () => {
    render(<CoachMarkTour steps={makeSteps(3)} open onOpenChange={vi.fn()} />)
    expect(screen.getByRole("dialog")).toHaveAccessibleName("제목 1")
    fireEvent.click(screen.getByRole("button", { name: "다음" }))
    expect(screen.getByRole("dialog")).toHaveAccessibleName("제목 2")
  })

  it("ArrowRight/ArrowLeft로 단계를 이동할 수 있다", () => {
    render(<CoachMarkTour steps={makeSteps(3)} open onOpenChange={vi.fn()} />)
    const content = screen.getByText("제목 1").closest("[data-slot='coach-mark-content']")
    expect(content).not.toBeNull()
    fireEvent.keyDown(content as Element, { key: "ArrowRight" })
    expect(screen.getByText("제목 2")).toBeInTheDocument()
    fireEvent.keyDown(content as Element, { key: "ArrowLeft" })
    expect(screen.getByText("제목 1")).toBeInTheDocument()
  })
})
