import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  EvidenceDecisionPanel,
  type DecisionOption,
  type EvidenceItem,
} from "@/components/evidence-decision-panel"

const evidence: EvidenceItem[] = [
  {
    id: "cashflow",
    label: "최근 현금흐름 변동",
    source: "재무제표 검증",
    status: "verified",
    statusLabel: "검증됨",
    observedAt: "2026-09-22 09:20",
  },
]

const decisions: DecisionOption[] = [
  {
    id: "review",
    label: "정밀 검토 요청",
    summary: "담당 심사자가 추가 자료를 검토합니다.",
    recommended: true,
    evidenceIds: ["cashflow"],
  },
  {
    id: "monitor",
    label: "관찰 유지",
    summary: "다음 관측 시점까지 상태를 추적합니다.",
    evidenceIds: ["cashflow"],
  },
  {
    id: "auto",
    label: "자동 처리",
    summary: "검토를 생략하고 처리합니다.",
    constraint: "사람의 승인 근거가 부족해 선택할 수 없습니다.",
    evidenceIds: [],
    disabled: true,
  },
]

function renderPanel(onSelectedIdChange = vi.fn()) {
  render(
    <EvidenceDecisionPanel
      title="경보 검토"
      evidenceTitle="검토 근거"
      decisionTitle="대응 선택"
      evidence={evidence}
      decisions={decisions}
      onSelectedIdChange={onSelectedIdChange}
    />,
  )
  return onSelectedIdChange
}

describe("EvidenceDecisionPanel", () => {
  it("추천되고 선택 가능한 조치를 기본으로 선택하고 근거를 함께 보여준다", () => {
    renderPanel()

    expect(screen.getByRole("radio", { name: /정밀 검토 요청/ })).toBeChecked()
    expect(screen.getAllByText("최근 현금흐름 변동")).toHaveLength(3)
    expect(screen.getByText("검증됨")).toBeInTheDocument()
  })

  it("사람이 다른 조치를 고르면 선택 id와 원본 조치를 상위로 전달한다", () => {
    const onSelectedIdChange = renderPanel()

    fireEvent.click(screen.getByRole("radio", { name: /관찰 유지/ }))

    expect(screen.getByRole("radio", { name: /관찰 유지/ })).toBeChecked()
    expect(onSelectedIdChange).toHaveBeenCalledWith("monitor", decisions[1])
  })

  it("선택 불가 조치는 disabled 이유를 보이고 선택할 수 없다", () => {
    renderPanel()

    expect(screen.getByRole("radio", { name: /자동 처리/ })).toBeDisabled()
    expect(screen.getByText("사람의 승인 근거가 부족해 선택할 수 없습니다.")).toBeInTheDocument()
  })
})
