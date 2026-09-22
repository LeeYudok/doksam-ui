import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { RankedAlternativesList, type AdoptionRecord, type RankedAlternative } from "@/components/ranked-alternatives-list"

const alternatives: RankedAlternative[] = [
  {
    id: "loan-refinance",
    rank: 1,
    label: "정부지원 대환대출 연계",
    evidenceSummary: "정책자금 요건을 충족하는 차주로 분류되었습니다.",
    condition: "정책자금 한도 잔여 확인 후 신청.",
    riskLevel: "moderate",
    riskLabel: "관찰",
  },
  {
    id: "guarantee",
    rank: 2,
    label: "신보 특별협약보증",
    evidenceSummary: "보증 한도 내 협약 대상입니다.",
    condition: "신용보증기금 사전 심사 필요.",
  },
  {
    id: "collateral",
    rank: 2,
    tied: true,
    label: "추가 담보 취득",
    evidenceSummary: "담보 여력이 있는 것으로 확인됩니다.",
    condition: "담보 감정평가 완료 후 실행.",
  },
  {
    id: "reduce-limit",
    rank: null,
    label: "한도 축소·조기 회수",
    evidenceSummary: "모형이 이 대안의 순위를 계산하지 못했습니다.",
    condition: "심사역 수동 판단 필요.",
    disabled: true,
    disabledReason: "정책자금 대상 차주는 우선순위 대안을 먼저 소진해야 합니다.",
  },
]

const history: AdoptionRecord[] = [
  {
    id: "record-1",
    alternativeId: "guarantee",
    alternativeLabel: "신보 특별협약보증",
    adoptedAt: "2026-09-20 10:00",
    note: "1차 검토 채택",
  },
]

describe("RankedAlternativesList", () => {
  it("순위·동점·순위없음 상태를 함께 보여준다", () => {
    render(<RankedAlternativesList title="사후관리 조치 추천" alternatives={alternatives} />)

    expect(screen.getByText("1순위")).toBeInTheDocument()
    expect(screen.getByText("2순위")).toBeInTheDocument()
    expect(screen.getByText("2순위 · 동점")).toBeInTheDocument()
    expect(screen.getByText("순위 없음")).toBeInTheDocument()
  })

  it("채택 버튼을 누르면 id와 원본 대안을 상위로 전달한다", () => {
    const onAdopt = vi.fn()
    render(<RankedAlternativesList title="사후관리 조치 추천" alternatives={alternatives} onAdopt={onAdopt} />)

    fireEvent.click(screen.getAllByRole("button", { name: "채택" })[0])

    expect(onAdopt).toHaveBeenCalledWith("loan-refinance", alternatives[0])
  })

  it("채택해도 나머지 대안이 사라지지 않고, 이력이 함께 누적된다", () => {
    render(
      <RankedAlternativesList
        title="사후관리 조치 추천"
        alternatives={alternatives}
        adoptedId="loan-refinance"
        history={history}
      />,
    )

    expect(screen.getByText("정부지원 대환대출 연계")).toBeInTheDocument()
    expect(screen.getAllByText("신보 특별협약보증").length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText("추가 담보 취득")).toBeInTheDocument()
    expect(screen.getByText("한도 축소·조기 회수")).toBeInTheDocument()
    expect(screen.getByText("채택됨")).toBeInTheDocument()
    expect(screen.getByText("1차 검토 채택", { exact: false })).toBeInTheDocument()
  })

  it("disabled 대안은 채택할 수 없고 이유를 보여준다", () => {
    render(<RankedAlternativesList title="사후관리 조치 추천" alternatives={alternatives} />)

    const disabledButton = screen.getAllByRole("button", { name: "채택" }).find((button) => button.hasAttribute("disabled"))
    expect(disabledButton).toBeDefined()
    expect(
      screen.getByText("정책자금 대상 차주는 우선순위 대안을 먼저 소진해야 합니다."),
    ).toBeInTheDocument()
  })
})
