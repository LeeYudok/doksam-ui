import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ContributionMeter } from "@/components/contribution-meter"

describe("ContributionMeter", () => {
  it("기여도 퍼센트를 숫자로 렌더한다", () => {
    const { container } = render(<ContributionMeter percent={34} />)
    expect(screen.getByText("34%")).toBeInTheDocument()
    expect(container.querySelector('[data-slot="progress"]')).toBeInTheDocument()
  })

  it("0%와 100% 경계값을 그대로 표기한다(clamp가 지우지 않는다)", () => {
    const { container: zero } = render(<ContributionMeter percent={0} data-testid="zero" />)
    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(zero.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({ transform: "translateX(-100%)" })

    const { container: full } = render(<ContributionMeter percent={100} />)
    expect(screen.getByText("100%")).toBeInTheDocument()
    expect(full.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({ transform: "translateX(-0%)" })
  })

  it("범위를 벗어난 값을 0~100으로 clamp한다", () => {
    const { container: over } = render(<ContributionMeter percent={140} />)
    expect(screen.getByText("100%")).toBeInTheDocument()
    void over

    const { container: under } = render(<ContributionMeter percent={-20} />)
    expect(screen.getByText("0%")).toBeInTheDocument()
    void under
  })

  it("direction이 없으면 방향 아이콘 없이 중립 텍스트 색으로 렌더한다", () => {
    render(<ContributionMeter percent={34} data-testid="meter" />)
    const percentText = screen.getByText("34%")
    expect(percentText.className).toContain("text-muted-foreground")
  })

  it.each([
    ["increase", "text-gain"],
    ["decrease", "text-loss"],
  ] as const)("direction=%s면 %s 텍스트 색과 방향 문구(sr-only)를 함께 낸다", (direction, colorClass) => {
    render(<ContributionMeter percent={34} direction={direction} />)
    const percentText = screen.getByText("34%")
    expect(percentText.className).toContain(colorClass)
  })

  it("increase/decrease는 각각 위험 상승/하락 요인 문구를 sr-only로 싣는다", () => {
    const { rerender } = render(<ContributionMeter percent={34} direction="increase" />)
    expect(screen.getByText("위험 상승 요인")).toBeInTheDocument()

    rerender(<ContributionMeter percent={34} direction="decrease" />)
    expect(screen.getByText("위험 하락 요인")).toBeInTheDocument()
  })

  it("code를 주면 AuditCodeTag로 감사코드를 렌더한다", () => {
    render(<ContributionMeter percent={34} code="EVD-2025-0518" />)
    expect(screen.getByText("EVD-2025-0518")).toBeInTheDocument()
  })

  it("code가 없으면 감사코드 태그를 렌더하지 않는다", () => {
    render(<ContributionMeter percent={34} />)
    expect(screen.queryByText(/EVD-|TAX-|BIO-/)).not.toBeInTheDocument()
  })

  it("onNavigate를 AuditCodeTag에 그대로 전달한다", () => {
    const onNavigate = vi.fn()
    render(<ContributionMeter percent={34} code="EVD-2025-0518" onNavigate={onNavigate} />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("하드코딩 색 없이 시맨틱 유틸리티 클래스만 쓴다", () => {
    const { container } = render(<ContributionMeter percent={34} direction="increase" code="EVD-2025-0518" />)
    const html = container.innerHTML
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/i)
  })
})
