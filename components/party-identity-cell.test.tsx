import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PartyIdentityCell } from "@/components/party-identity-cell"

describe("PartyIdentityCell", () => {
  it("업체명을 1행에 렌더한다", () => {
    render(<PartyIdentityCell name="(주)대한정밀기계" />)
    expect(screen.getByText("(주)대한정밀기계")).toBeInTheDocument()
  })

  it("업종·법인구분·사업자번호를 · 로 구분해 2행에 렌더한다", () => {
    const { container } = render(
      <PartyIdentityCell name="(주)대한정밀기계" industry="기계제조" corpType="법인" bizNo="1048112345" />
    )
    const meta = container.querySelector('[data-slot="party-identity-cell"] > span:last-child')
    expect(meta?.textContent).toBe("기계제조·법인·104-81-*****")
  })

  it("기본값은 사업자번호를 마스킹한다", () => {
    render(<PartyIdentityCell name="회사" bizNo="1048112345" />)
    expect(screen.getByText("104-81-*****")).toBeInTheDocument()
    expect(screen.queryByText("104-81-12345")).not.toBeInTheDocument()
  })

  it("masked={false} 면 formatBizNo 결과를 그대로 보여준다", () => {
    render(<PartyIdentityCell name="회사" bizNo="1048112345" masked={false} />)
    expect(screen.getByText("104-81-12345")).toBeInTheDocument()
  })

  it("bizNo가 없으면 사업자번호 없이 나머지 메타만 표시한다", () => {
    const { container } = render(<PartyIdentityCell name="회사" industry="도소매" />)
    const meta = container.querySelector('[data-slot="party-identity-cell"] > span:last-child')
    expect(meta?.textContent).toBe("도소매")
  })

  it("메타 정보가 전혀 없으면 2행을 렌더하지 않는다", () => {
    const { container } = render(<PartyIdentityCell name="회사" />)
    expect(container.querySelectorAll('[data-slot="party-identity-cell"] > span').length).toBe(1)
  })

  it("density prop을 data 속성으로 드러낸다", () => {
    const { container } = render(<PartyIdentityCell name="회사" density="compact" />)
    expect(container.querySelector('[data-slot="party-identity-cell"]')?.getAttribute("data-density")).toBe(
      "compact"
    )
  })
})
