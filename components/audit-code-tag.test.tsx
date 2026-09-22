import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AuditCodeTag } from "@/components/audit-code-tag"

const toastSuccess = vi.fn()

vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

describe("AuditCodeTag", () => {
  beforeEach(() => {
    toastSuccess.mockClear()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it("코드를 등폭으로 렌더한다", () => {
    render(<AuditCodeTag code="EVD-2025-0518" />)
    expect(screen.getByText("EVD-2025-0518")).toBeInTheDocument()
  })

  it("onNavigate가 없으면 span으로, 있으면 button으로 렌더한다", () => {
    const { rerender } = render(<AuditCodeTag code="EVD-2025-0518" data-testid="tag" />)
    expect(screen.getByTestId("tag").tagName).toBe("SPAN")

    rerender(<AuditCodeTag code="EVD-2025-0518" onNavigate={() => {}} data-testid="tag" />)
    expect(screen.getByTestId("tag").tagName).toBe("BUTTON")
  })

  it("onNavigate 클릭 시 핸들러를 호출한다", () => {
    const onNavigate = vi.fn()
    render(<AuditCodeTag code="EVD-2025-0518" onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole("button"))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it("copyable이 false(기본)면 복사 아이콘이 없다", () => {
    render(<AuditCodeTag code="EVD-2025-0518" />)
    expect(screen.queryByLabelText("감사코드 복사")).not.toBeInTheDocument()
  })

  it("copyable이면 클립보드에 복사하고 토스트로 피드백한다", async () => {
    render(<AuditCodeTag code="EVD-2025-0518" copyable />)
    fireEvent.click(screen.getByLabelText("감사코드 복사"))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("EVD-2025-0518")
    await Promise.resolve()
    expect(toastSuccess).toHaveBeenCalledWith("감사코드를 복사했습니다")
  })

  it("copyable + onNavigate일 때 복사 클릭이 onNavigate로 새지 않는다", () => {
    const onNavigate = vi.fn()
    render(<AuditCodeTag code="EVD-2025-0518" onNavigate={onNavigate} copyable />)
    fireEvent.click(screen.getByLabelText("감사코드 복사"))
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
