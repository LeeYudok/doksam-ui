import { fireEvent, render, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import EwsDiagnosisPage from "@/app/templates/ews-diagnosis/page"
import { EWS_DIAGNOSES, EWS_URGENT_BORROWERS } from "@/lib/templates/ews-data"

const FIRST = EWS_URGENT_BORROWERS[0]
const OTHER = EWS_URGENT_BORROWERS[2]

/** EWS_DIAGNOSES 는 키가 빌 수 있는 Record 라(#111 finding 15d) 테스트에서 명시적으로 단언한다. */
function diagnosisOf(id: string) {
  const diagnosis = EWS_DIAGNOSES[id]
  if (!diagnosis) throw new Error(`테스트 전제 위반: ${id} 진단 데이터 없음`)
  return diagnosis
}

describe("EwsDiagnosisPage (split-pane 원형)", () => {
  it("좌측 목록에 진단 대기 차주 전원을 렌더하고 첫 차주를 기본 선택한다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const list = within(container).getByRole("list", { name: "진단 대기 차주 목록" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(EWS_URGENT_BORROWERS.length)
    expect(within(container).getByText(diagnosisOf(FIRST.id).summary)).toBeInTheDocument()
  })

  it("목록에서 다른 차주를 고르면 목록은 그대로 두고 상세만 바뀐다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const option = within(container).getAllByRole("button").find((el) => el.textContent?.includes(OTHER.name))
    expect(option).toBeDefined()
    fireEvent.click(option as HTMLElement)

    expect(within(container).getByText(diagnosisOf(OTHER.id).summary)).toBeInTheDocument()
    expect(within(container).queryByText(diagnosisOf(FIRST.id).summary)).not.toBeInTheDocument()
    expect(option).toHaveAttribute("aria-current", "true")
  })

  it("기여 변수 개수만큼 contribution-meter 를 반복 렌더한다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    expect(container.querySelectorAll('[data-slot="contribution-meter"]')).toHaveLength(
      diagnosisOf(FIRST.id).factors.length
    )
  })

  it("다음 단계 안내를 담은 하단 고정 액션바를 둔다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const bar = container.querySelector('[data-slot="sticky-actionbar"]')
    expect(bar).not.toBeNull()
    expect(bar).toHaveTextContent(diagnosisOf(FIRST.id).nextStepLabel)
  })

  /** PR #111 finding 3 — Card 기본 display(flex flex-col)를 className 으로 덮지 않는다. */
  it("좌측 목록 카드의 display 를 block 으로 덮지 않는다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const list = within(container).getByRole("list", { name: "진단 대기 차주 목록" })
    const card = list.closest('[data-slot="card"]') as HTMLElement
    expect(card).not.toBeNull()
    expect(card).toHaveClass("flex")
    expect(card.className).not.toMatch(/(^|\s)block(\s|$)/)
    expect(card.className).not.toMatch(/(^|\s)lg:block(\s|$)/)
  })

  /** PR #111 finding 5 — hidden 토글로 패인이 사라질 때 포커스가 body 로 떨어지지 않는다. */
  it("차주를 고르면 상세 제목으로, 목록으로 돌아가면 목록 제목으로 포커스를 옮긴다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const option = within(container)
      .getAllByRole("button")
      .find((el) => el.textContent?.includes(OTHER.name))
    fireEvent.click(option as HTMLElement)

    const detailHeading = within(container).getByRole("heading", { level: 2, name: `${OTHER.name} 진단 상세` })
    expect(detailHeading).toHaveAttribute("tabindex", "-1")
    expect(document.activeElement).toBe(detailHeading)

    fireEvent.click(within(container).getByRole("button", { name: /차주 목록으로/ }))
    const listHeading = within(container).getByRole("heading", { level: 2, name: "진단 대기 차주 목록" })
    expect(listHeading).toHaveAttribute("tabindex", "-1")
    expect(document.activeElement).toBe(listHeading)
  })
})
