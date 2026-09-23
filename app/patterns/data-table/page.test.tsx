import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import DataTablePatternsPage from "@/app/patterns/data-table/page"
import { DATA_TABLE_SAMPLES } from "@/components/patterns/data-table-samples"

// jsdom은 Pointer Events capture API를 구현하지 않는다 — Radix Checkbox가 내부적으로
// hasPointerCapture 등을 호출하므로 테스트 환경에서만 no-op으로 채운다(table-sortable.test.tsx와 동일).
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
})

function getBodyRows() {
  const table = screen.getByRole("table")
  return within(table).getAllByRole("row").slice(1)
}

describe("DataTablePatternsPage", () => {
  it("renders the page heading", () => {
    render(<DataTablePatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "데이터 테이블" })).toBeInTheDocument()
  })

  it("renders every data-table sample as a numbered section", () => {
    render(<DataTablePatternsPage />)
    for (const sample of DATA_TABLE_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("shows only the first page (5 rows) of orders by default with a page indicator", () => {
    render(<DataTablePatternsPage />)
    expect(getBodyRows()).toHaveLength(5)
    expect(screen.getByText("1 / 3")).toBeInTheDocument()
    expect(screen.getByText("ORD-1001")).toBeInTheDocument()
    expect(screen.queryByText("ORD-1006")).not.toBeInTheDocument()
  })

  it("hides the bulk action bar until a row is selected, then shows it with the selected count", () => {
    render(<DataTablePatternsPage />)
    expect(screen.queryByText("행을 선택하면 일괄 작업 도구가 나타납니다.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /삭제/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("checkbox", { name: "ORD-1001 선택" }))
    expect(screen.getByText("1건 선택됨")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /삭제/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /내보내기/ })).toBeInTheDocument()
  })

  it("selects every row on the current page via the header checkbox", () => {
    render(<DataTablePatternsPage />)
    fireEvent.click(screen.getByRole("checkbox", { name: "현재 페이지 전체 선택" }))
    expect(screen.getByText("5건 선택됨")).toBeInTheDocument()
  })

  it("moves to the next page and keeps prior selection intact", () => {
    render(<DataTablePatternsPage />)
    fireEvent.click(screen.getByRole("checkbox", { name: "ORD-1001 선택" }))
    fireEvent.click(screen.getByRole("button", { name: "다음" }))

    expect(screen.getByText("2 / 3")).toBeInTheDocument()
    expect(screen.getByText("ORD-1006")).toBeInTheDocument()
    expect(screen.getByText("1건 선택됨")).toBeInTheDocument()
  })

  it("sorts rows when a sortable column header is clicked", () => {
    render(<DataTablePatternsPage />)
    // "강시우"(ORD-1006)는 한글 유니코드 코드포인트 순서상(가장 앞선 초성 ㄱ + 가장 앞선 중성 ㅏ)
    // 데이터셋 전체에서 가장 먼저 오는 고객명이다 — 오름차순 정렬 시 항상 1행이 된다.
    fireEvent.click(screen.getByRole("button", { name: /고객/ }))

    const rows = getBodyRows()
    expect(within(rows[0]).getByText("ORD-1006")).toBeInTheDocument()
  })
})
