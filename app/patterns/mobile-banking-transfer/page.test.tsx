import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import MobileBankingTransferPatternsPage from "@/app/patterns/mobile-banking-transfer/page"
import { MOBILE_BANKING_TRANSFER_SAMPLES } from "@/components/patterns/mobile-banking-transfer-samples"

describe("MobileBankingTransferPatternsPage", () => {
  it("renders the page heading and every sample section", () => {
    render(<MobileBankingTransferPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "모바일뱅킹 · 이체" })).toBeInTheDocument()
    for (const sample of MOBILE_BANKING_TRANSFER_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
    }
  })

  it("starts on the recipient step and lists recent recipients", () => {
    render(<MobileBankingTransferPatternsPage />)
    expect(screen.getByText("받는사람을 선택하세요")).toBeInTheDocument()
    expect(screen.getByText("김민지")).toBeInTheDocument()
  })

  it("walks through recipient -> amount -> confirm -> done", () => {
    render(<MobileBankingTransferPatternsPage />)

    fireEvent.click(screen.getByText("김민지"))
    expect(screen.getByText("김민지님에게 보낼 금액")).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("숫자 1"))
    fireEvent.click(screen.getByLabelText("숫자 0"))
    fireEvent.click(screen.getByLabelText("숫자 0"))
    fireEvent.click(screen.getByLabelText("숫자 0"))
    fireEvent.click(screen.getByText("다음"))

    expect(screen.getByText("이체 내용을 확인하세요")).toBeInTheDocument()
    expect(screen.getByText("1,000원")).toBeInTheDocument()

    fireEvent.click(screen.getByText("이체하기"))
    expect(screen.getByText("이체가 완료되었습니다")).toBeInTheDocument()
  })
})
