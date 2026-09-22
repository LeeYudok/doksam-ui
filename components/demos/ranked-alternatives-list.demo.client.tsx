"use client"

import * as React from "react"

import {
  RankedAlternativesList,
  type AdoptionRecord,
  type RankedAlternative,
} from "@/components/ranked-alternatives-list"

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
    riskLevel: "severe",
    riskLabel: "경보",
    disabled: true,
    disabledReason: "정책자금 대상 차주는 우선순위 대안을 먼저 소진해야 합니다.",
  },
]

const initialHistory: AdoptionRecord[] = [
  {
    id: "record-1",
    alternativeId: "guarantee",
    alternativeLabel: "신보 특별협약보증",
    adoptedAt: "2026-09-20 10:00",
    note: "1차 검토 시 채택",
  },
]

export function RankedAlternativesListDemo() {
  const [adoptedId, setAdoptedId] = React.useState<string | undefined>("guarantee")
  const [history, setHistory] = React.useState<AdoptionRecord[]>(initialHistory)

  function handleAdopt(id: string, alternative: RankedAlternative) {
    setAdoptedId(id)
    setHistory((prev) => [
      ...prev,
      {
        id: `record-${prev.length + 1}`,
        alternativeId: id,
        alternativeLabel: alternative.label,
        adoptedAt: "2026-09-23 09:00",
      },
    ])
  }

  return (
    <RankedAlternativesList
      title="사후관리 조치 추천"
      description="모형이 계산한 순위 순으로 대안을 검토하고, 담당자가 하나를 채택합니다."
      alternatives={alternatives}
      adoptedId={adoptedId}
      history={history}
      onAdopt={handleAdopt}
    />
  )
}
