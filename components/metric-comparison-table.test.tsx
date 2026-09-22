import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MetricComparisonTable, type MetricComparisonRow } from "@/components/metric-comparison-table"

describe("MetricComparisonTable", () => {
  it("델타는 subjectB - subjectA 로 계산하고 부호를 붙여 표기한다", () => {
    const metrics: MetricComparisonRow[] = [
      { key: "ar", label: "AR", subjectA: 70, subjectB: 72.4, betterWhen: "higher", unit: "%" },
    ]
    const { container } = render(
      <MetricComparisonTable metrics={metrics} subjectALabel="챔피언" subjectBLabel="챌린저" />,
    )
    expect(within(container).getByText("+2.40%")).toBeInTheDocument()
  })

  it("클수록 좋은 지표: 값이 오르면 개선(성공) 색, 내리면 악화(위험) 색이다", () => {
    const up: MetricComparisonRow = { key: "ar", label: "AR", subjectA: 70, subjectB: 75, betterWhen: "higher" }
    const down: MetricComparisonRow = { key: "ar", label: "AR", subjectA: 75, subjectB: 70, betterWhen: "higher" }

    const { container: upContainer } = render(
      <MetricComparisonTable metrics={[up]} subjectALabel="A" subjectBLabel="B" />,
    )
    expect(within(upContainer).getByRole("row", { name: /AR/ })).toHaveAttribute("data-direction", "improved")
    expect(within(upContainer).getByText("개선")).toBeInTheDocument()

    const { container: downContainer } = render(
      <MetricComparisonTable metrics={[down]} subjectALabel="A" subjectBLabel="B" />,
    )
    expect(within(downContainer).getByRole("row", { name: /AR/ })).toHaveAttribute("data-direction", "worsened")
    expect(within(downContainer).getByText("악화")).toBeInTheDocument()
  })

  it("작을수록 좋은 지표에서 방향 색이 뒤집히지 않는다 — 값이 내려가면 개선(성공), 오르면 악화(위험)다", () => {
    // 종료 게이트(#102): 연체율처럼 betterWhen="lower" 인 지표는 델타 부호와
    // 개선/악화 판정이 반대로 간다. 부호만 보고 칠하면 여기서 오답이 난다.
    const improved: MetricComparisonRow = {
      key: "npl",
      label: "연체율",
      subjectA: 3.2,
      subjectB: 2.1,
      betterWhen: "lower",
      unit: "%",
    }
    const worsened: MetricComparisonRow = {
      key: "npl",
      label: "연체율",
      subjectA: 2.1,
      subjectB: 3.2,
      betterWhen: "lower",
      unit: "%",
    }

    const { container: improvedContainer } = render(
      <MetricComparisonTable metrics={[improved]} subjectALabel="전월" subjectBLabel="이번달" />,
    )
    const improvedRow = within(improvedContainer).getByRole("row", { name: /연체율/ })
    expect(improvedRow).toHaveAttribute("data-direction", "improved")
    expect(within(improvedRow).getByText("-1.10%")).toBeInTheDocument()
    expect(within(improvedContainer).getByText("개선")).toBeInTheDocument()

    const { container: worsenedContainer } = render(
      <MetricComparisonTable metrics={[worsened]} subjectALabel="전월" subjectBLabel="이번달" />,
    )
    const worsenedRow = within(worsenedContainer).getByRole("row", { name: /연체율/ })
    expect(worsenedRow).toHaveAttribute("data-direction", "worsened")
    expect(within(worsenedRow).getByText("+1.10%")).toBeInTheDocument()
    expect(within(worsenedContainer).getByText("악화")).toBeInTheDocument()
  })

  it("델타가 0이면 개선도 악화도 아닌 중립(변동 없음)이다", () => {
    const metrics: MetricComparisonRow[] = [
      { key: "ks", label: "KS", subjectA: 40, subjectB: 40, betterWhen: "higher" },
    ]
    const { container } = render(
      <MetricComparisonTable metrics={metrics} subjectALabel="A" subjectBLabel="B" />,
    )
    expect(within(container).getByRole("row", { name: /KS/ })).toHaveAttribute("data-direction", "unchanged")
    expect(within(container).getByText("변동 없음")).toBeInTheDocument()
  })

  it("formatValue 를 주면 기본 toFixed+unit 대신 그 포맷을 쓴다", () => {
    const metrics: MetricComparisonRow[] = [
      {
        key: "count",
        label: "건수",
        subjectA: 1000,
        subjectB: 1200,
        betterWhen: "higher",
        formatValue: (v) => `${v.toLocaleString("ko-KR")}건`,
      },
    ]
    const { container } = render(
      <MetricComparisonTable metrics={metrics} subjectALabel="A" subjectBLabel="B" />,
    )
    expect(within(container).getByText("1,000건")).toBeInTheDocument()
    expect(within(container).getByText("1,200건")).toBeInTheDocument()
  })

  it("caption 은 captionHidden 으로 시각적으로만 숨긴다", () => {
    const metrics: MetricComparisonRow[] = [
      { key: "ar", label: "AR", subjectA: 70, subjectB: 72, betterWhen: "higher" },
    ]
    const { container } = render(
      <MetricComparisonTable
        metrics={metrics}
        subjectALabel="A"
        subjectBLabel="B"
        caption="챔피언 vs 챌린저"
        captionHidden
      />,
    )
    const caption = screen.getByText("챔피언 vs 챌린저")
    expect(caption.className).toContain("sr-only")
    expect(container).toContainElement(caption)
  })

  it("하드코딩 색 없이 시맨틱 클래스(text-success/text-destructive)만 쓴다", () => {
    const metrics: MetricComparisonRow[] = [
      { key: "ar", label: "AR", subjectA: 70, subjectB: 75, betterWhen: "higher" },
    ]
    const { container } = render(
      <MetricComparisonTable metrics={metrics} subjectALabel="A" subjectBLabel="B" />,
    )
    const html = container.innerHTML
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i)
    expect(html).toContain("text-success")
  })
})
