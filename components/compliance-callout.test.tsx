import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ComplianceCallout } from "@/components/compliance-callout"

describe("ComplianceCallout", () => {
  it("severityLabel을 항상 렌더한다 — 색 말고 두 번째 채널이 있어야 한다", () => {
    render(
      <ComplianceCallout severity="critical" severityLabel="경보" condition="대상 조건" requirement="요구 행위" />
    )
    expect(screen.getByText("경보")).toBeInTheDocument()
  })

  it("regulationRef를 생략하면 근거번호 자리를 렌더하지 않는다", () => {
    const { container } = render(
      <ComplianceCallout severity="warning" severityLabel="주의" condition="대상 조건" requirement="요구 행위" />
    )
    expect(container.textContent).not.toMatch(/지침 제/)
  })

  it("regulationRef를 주면 근거번호를 렌더한다", () => {
    render(
      <ComplianceCallout
        severity="critical"
        severityLabel="경보"
        regulationRef="여신감리 준수 지침 제2024-42호"
        condition="대상 조건"
        requirement="요구 행위"
      />
    )
    expect(screen.getByText("여신감리 준수 지침 제2024-42호")).toBeInTheDocument()
  })

  it("dueLabel을 생략하면 기한 문구를 렌더하지 않는다", () => {
    const { container } = render(
      <ComplianceCallout severity="notice" severityLabel="안내" condition="대상 조건" requirement="요구 행위" />
    )
    expect(container.textContent).not.toMatch(/기한/)
  })

  it("actions 배열 순서대로 버튼을 렌더한다", () => {
    const { container } = render(
      <ComplianceCallout
        severity="critical"
        severityLabel="경보"
        condition="대상 조건"
        requirement="요구 행위"
        actions={[{ label: "가이드 보기" }, { label: "결재 상신" }]}
      />
    )
    const labels = Array.from(container.querySelectorAll("button")).map((btn) => btn.textContent)
    expect(labels).toEqual(["가이드 보기", "결재 상신"])
  })

  it("severity를 data 속성으로 드러낸다", () => {
    render(
      <ComplianceCallout
        severity="warning"
        severityLabel="주의"
        condition="대상 조건"
        requirement="요구 행위"
        data-testid="callout"
      />
    )
    expect(screen.getByTestId("callout").dataset.severity).toBe("warning")
  })

  it("하드코딩 색 없이 시맨틱 유틸리티만 쓴다", () => {
    render(
      <ComplianceCallout
        severity="warning"
        severityLabel="주의"
        condition="대상 조건"
        requirement="요구 행위"
        data-testid="callout"
      />
    )
    const className = screen.getByTestId("callout").className
    expect(className).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i)
  })
})
