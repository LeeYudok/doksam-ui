import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RiskGradeBadge } from "@/components/risk-grade-badge"
import { RISK_LEVELS, riskTintBackground } from "@/lib/risk-tokens"

describe("RiskGradeBadge", () => {
  it("등급 문구를 항상 렌더한다 — 색 말고 두 번째 채널이 있어야 한다", () => {
    render(<RiskGradeBadge level="severe" label="경보" />)
    expect(screen.getByText("경보")).toBeInTheDocument()
  })

  it("tier를 주면 등급 번호를 함께, 없으면 문구만 표기한다", () => {
    const { rerender } = render(<RiskGradeBadge level="high" label="주의" tier={3} data-testid="badge" />)
    expect(screen.getByTestId("badge").textContent).toBe("Tier 3주의")

    rerender(<RiskGradeBadge level="high" label="주의" data-testid="badge" />)
    expect(screen.getByTestId("badge").textContent).toBe("주의")
  })

  it("tierPrefix로 등급 번호 앞말을 바꾼다", () => {
    render(<RiskGradeBadge level="low" label="정상" tier={1} tierPrefix="등급" data-testid="grade" />)
    expect(screen.getByTestId("grade").textContent).toBe("등급 1정상")
  })

  it.each(RISK_LEVELS)("%s: tint는 틴트 배경 + 값 토큰 글자로 칠한다", (level) => {
    render(<RiskGradeBadge level={level} label="등급" data-testid="badge" />)
    const badge = screen.getByTestId("badge")
    expect(badge.style.backgroundColor).toBe(riskTintBackground(level))
    expect(badge.style.color).toBe(`var(--risk-${level})`)
  })

  it.each(RISK_LEVELS)("%s: solid는 값 토큰 채움 + 전경 토큰 글자로 칠한다", (level) => {
    render(<RiskGradeBadge level={level} label="등급" fill="solid" data-testid="badge" />)
    const badge = screen.getByTestId("badge")
    expect(badge.style.backgroundColor).toBe(`var(--risk-${level})`)
    expect(badge.style.color).toBe(`var(--risk-${level}-foreground)`)
  })

  it("등급과 채움 방식을 data 속성으로 드러낸다", () => {
    render(<RiskGradeBadge level="moderate" label="관찰" fill="solid" data-testid="badge" />)
    const badge = screen.getByTestId("badge")
    expect(badge.dataset.riskLevel).toBe("moderate")
    expect(badge.dataset.fill).toBe("solid")
  })

  it("하드코딩 색 없이 토큰 var()만 쓴다", () => {
    render(<RiskGradeBadge level="severe" label="경보" data-testid="badge" />)
    const style = screen.getByTestId("badge").getAttribute("style") ?? ""
    // 이 레포의 토큰 값은 oklch 라, hex/rgb/hsl 만 막으면 정작 이 레포에서
    // 나올 법한 하드코딩을 놓친다.
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i)
    expect(style).toContain("var(--risk-severe)")
  })
})
