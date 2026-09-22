import { fireEvent, render, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import EwsDiagnosisPage from "@/app/templates/ews-diagnosis/page"
import { EWS_DIAGNOSES, EWS_URGENT_BORROWERS } from "@/lib/templates/ews-data"

const FIRST = EWS_URGENT_BORROWERS[0]
const OTHER = EWS_URGENT_BORROWERS[2]

describe("EwsDiagnosisPage (split-pane 원형)", () => {
  it("좌측 목록에 진단 대기 차주 전원을 렌더하고 첫 차주를 기본 선택한다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const list = within(container).getByRole("list", { name: "진단 대기 차주 목록" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(EWS_URGENT_BORROWERS.length)
    expect(within(container).getByText(EWS_DIAGNOSES[FIRST.id].summary)).toBeInTheDocument()
  })

  it("목록에서 다른 차주를 고르면 목록은 그대로 두고 상세만 바뀐다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const option = within(container).getAllByRole("button").find((el) => el.textContent?.includes(OTHER.name))
    expect(option).toBeDefined()
    fireEvent.click(option as HTMLElement)

    expect(within(container).getByText(EWS_DIAGNOSES[OTHER.id].summary)).toBeInTheDocument()
    expect(within(container).queryByText(EWS_DIAGNOSES[FIRST.id].summary)).not.toBeInTheDocument()
    expect(option).toHaveAttribute("aria-current", "true")
  })

  it("기여 변수 개수만큼 contribution-meter 를 반복 렌더한다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    expect(container.querySelectorAll('[data-slot="contribution-meter"]')).toHaveLength(
      EWS_DIAGNOSES[FIRST.id].factors.length
    )
  })

  it("다음 단계 안내를 담은 하단 고정 액션바를 둔다", () => {
    const { container } = render(<EwsDiagnosisPage />)
    const bar = container.querySelector('[data-slot="sticky-actionbar"]')
    expect(bar).not.toBeNull()
    expect(bar).toHaveTextContent(EWS_DIAGNOSES[FIRST.id].nextStepLabel)
  })
})
