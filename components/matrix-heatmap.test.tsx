import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MatrixHeatmap, type MatrixHeatmapCell } from "@/components/matrix-heatmap"

const CELLS: MatrixHeatmapCell[] = [
  { rowKey: "manufacturing", colKey: "low", value: 2, valueLabel: "2건" },
  { rowKey: "manufacturing", colKey: "severe", value: 18, valueLabel: "18건" },
  { rowKey: "retail", colKey: "low", value: 9, valueLabel: "9건" },
  // retail × severe 는 의도적으로 데이터를 빼서 빈 셀 렌더링을 검증한다.
]

describe("MatrixHeatmap", () => {
  it("모든 셀에 값 텍스트를 렌더한다 — 색 말고 두 번째 채널이 있어야 한다", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing", "retail"]}
        colKeys={["low", "severe"]}
        cells={CELLS}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    expect(within(container).getByText("2건")).toBeInTheDocument()
    expect(within(container).getByText("18건")).toBeInTheDocument()
    expect(within(container).getByText("9건")).toBeInTheDocument()
  })

  it("데이터 없는 교차 칸은 emptyLabel 로 렌더한다", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing", "retail"]}
        colKeys={["low", "severe"]}
        cells={CELLS}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
        emptyLabel="데이터 없음"
      />,
    )
    expect(within(container).getByText("데이터 없음")).toBeInTheDocument()
  })

  it("셀마다 행×열 조합을 설명하는 aria-label 을 갖는다", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing"]}
        colKeys={["severe"]}
        rowLabels={{ manufacturing: "제조업" }}
        colLabels={{ severe: "경보" }}
        cells={[{ rowKey: "manufacturing", colKey: "severe", value: 18, valueLabel: "18건" }]}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    const cell = within(container).getByLabelText("제조업 × 경보: 18건")
    expect(cell.tagName).toBe("TD")
  })

  it("가장 낮은 값은 0단계, 가장 높은 값은 4단계로 정규화한다", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing", "retail"]}
        colKeys={["low", "severe"]}
        cells={CELLS}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    const low = within(container).getByText("2건")
    const high = within(container).getByText("18건")
    expect(low.getAttribute("data-step")).toBe("0")
    expect(high.getAttribute("data-step")).toBe("4")
  })

  it("min/max 를 명시하면 그 범위로 정규화한다", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing"]}
        colKeys={["low"]}
        cells={[{ rowKey: "manufacturing", colKey: "low", value: 50, valueLabel: "50건" }]}
        min={0}
        max={100}
        caption="테스트"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    // 0..100 범위에서 50은 중간(2단계)이다.
    expect(within(container).getByText("50건").getAttribute("data-step")).toBe("2")
  })

  it("첫 열(행 머리글)이 스크롤 시 고정되도록 sticky 클래스를 갖는다", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing"]}
        colKeys={["low"]}
        cells={CELLS}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    const rowHeader = container.querySelector("tbody th")
    expect(rowHeader?.className).toContain("sticky")
    expect(rowHeader?.className).toContain("left-0")
  })

  it("가로 스크롤 래퍼를 갖는다(행/열이 많을 때 대비)", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing"]}
        colKeys={["low"]}
        cells={CELLS}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    expect(container.querySelector(".overflow-x-auto")).toBeInTheDocument()
  })

  it("표 caption 은 스크린리더 전용으로 렌더한다", () => {
    render(
      <MatrixHeatmap
        rowKeys={["manufacturing"]}
        colKeys={["low"]}
        cells={CELLS}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    expect(screen.getByText("업종별 조기경보 건전성 매트릭스").className).toContain("sr-only")
  })

  it("하드코딩 색 없이 토큰 파생 함수 결과만 인라인 style 에 쓴다", () => {
    const { container } = render(
      <MatrixHeatmap
        rowKeys={["manufacturing"]}
        colKeys={["low"]}
        cells={CELLS}
        caption="업종별 조기경보 건전성 매트릭스"
        legendMinLabel="적음"
        legendMaxLabel="많음"
      />,
    )
    const cell = within(container).getByText("2건")
    const style = cell.getAttribute("style") ?? ""
    expect(style).toContain("oklch(from var(--primary)")
    expect(style).toContain("var(--heatmap-text-0)")
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it("행 머리글 sr-only 문구를 prop 으로 덮을 수 있고, 주지 않으면 한국어 기본값이다", () => {
    const baseProps = {
      rowKeys: ["manufacturing"],
      colKeys: ["low"],
      cells: CELLS,
      caption: "업종별 조기경보 건전성 매트릭스",
      legendMinLabel: "적음",
      legendMaxLabel: "많음",
    }
    const { container, rerender } = render(<MatrixHeatmap {...baseProps} />)
    expect(container.querySelector("thead .sr-only")).toHaveTextContent("행 머리글")

    rerender(<MatrixHeatmap {...baseProps} rowHeaderLabel="Row header" />)
    expect(container.querySelector("thead .sr-only")).toHaveTextContent("Row header")
  })
})
