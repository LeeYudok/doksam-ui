import { render, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

/**
 * PR #111 finding 15d — 차주 목록과 진단 결과는 별개 배치라 `EWS_DIAGNOSES` 에
 * 키가 빌 수 있다. 그때 `.summary` 로 바로 들어가 TypeError 로 화면이 죽지 않고
 * 빈 상태를 그리는지 고정한다. 목 데이터에는 전 차주 진단이 다 들어 있으므로
 * 모듈 모킹으로 첫 차주의 진단만 지운 상황을 만든다.
 */
vi.mock("@/lib/templates/ews-data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/templates/ews-data")>()
  const diagnoses = { ...actual.EWS_DIAGNOSES }
  delete diagnoses[actual.EWS_URGENT_BORROWERS[0].id]
  return { ...actual, EWS_DIAGNOSES: diagnoses }
})

describe("EwsDiagnosisPage — 진단 결과가 없는 차주", () => {
  it("빈 상태를 그리고 액션바 메타를 대기 문구로 바꾼다", async () => {
    const { default: EwsDiagnosisPage } = await import("@/app/templates/ews-diagnosis/page")
    const { container } = render(<EwsDiagnosisPage />)

    expect(within(container).getByText("이 차주의 진단 결과가 아직 없습니다")).toBeInTheDocument()
    const bar = container.querySelector('[data-slot="sticky-actionbar"]')
    expect(bar).toHaveTextContent("진단 결과 생성 대기")
  })
})
