import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import StockOrderPatternsPage from "@/app/patterns/stock-order/page"
import { STOCK_ORDER_SAMPLES } from "@/components/patterns/stock-order-samples"

describe("StockOrderPatternsPage", () => {
  it("renders the page heading and every sample section", () => {
    render(<StockOrderPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "주식 · 주문" })).toBeInTheDocument()
    for (const sample of STOCK_ORDER_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
    }
  })

  it("shows the estimated settlement amount for the default price and quantity", () => {
    render(<StockOrderPatternsPage />)
    expect(screen.getByText("72,400원")).toBeInTheDocument()
  })

  it("reflects a clicked order book level into the order price and estimated amount", () => {
    render(<StockOrderPatternsPage />)
    fireEvent.click(screen.getByLabelText("매수호가 72,200원 선택"))
    expect(screen.getByText("72,200원")).toBeInTheDocument()
  })

  it("switches between buy and sell tabs", () => {
    render(<StockOrderPatternsPage />)
    expect(screen.getByRole("button", { name: "매수 주문" })).toBeInTheDocument()
    // radix TabsTrigger는 선택 전환을 onMouseDown/onFocus에서 처리한다 — 순수 click 이벤트만으로는
    // 반영되지 않으므로 mouseDown을 명시적으로 발생시킨다.
    fireEvent.mouseDown(screen.getByRole("tab", { name: "매도" }))
    expect(screen.getByRole("button", { name: "매도 주문" })).toBeInTheDocument()
  })
})
