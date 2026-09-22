"use client"

import {
  EvidenceDecisionPanel,
  type DecisionOption,
  type EvidenceItem,
} from "@/components/evidence-decision-panel"

const evidence: EvidenceItem[] = [
  {
    id: "statement",
    label: "현금흐름 변동",
    source: "정형 재무자료",
    status: "verified",
    statusLabel: "검증됨",
    observedAt: "관측 2026-09-22 09:20",
    description: "최근 두 관측 구간에서 운전자본 회전이 악화되었습니다.",
  },
  {
    id: "news",
    label: "공시 원문 확인",
    source: "문서 근거",
    status: "pending",
    statusLabel: "확인 대기",
    observedAt: "수집 2026-09-22 09:32",
    description: "원문과 요약의 문맥 일치를 담당자가 확인해야 합니다.",
  },
]

const decisions: DecisionOption[] = [
  {
    id: "review",
    label: "정밀 검토 요청",
    summary: "추가 자료를 모아 담당 심사자에게 검토를 요청합니다.",
    meta: "기한: 영업일 1일 이내",
    recommended: true,
    evidenceIds: ["statement", "news"],
  },
  {
    id: "monitor",
    label: "관찰 유지",
    summary: "다음 관측 시점까지 경보를 유지하며 변화만 추적합니다.",
    meta: "재관측: 7일 후",
    evidenceIds: ["statement"],
  },
  {
    id: "automatic",
    label: "자동 승인",
    summary: "사람의 검토 없이 다음 단계로 넘깁니다.",
    constraint: "검증 대기 근거가 있어 선택할 수 없습니다.",
    evidenceIds: ["news"],
    disabled: true,
  },
]

export function EvidenceDecisionPanelDemo() {
  return (
    <EvidenceDecisionPanel
      title="경보 원인 검토"
      description="추천은 판단을 돕는 정보이며, 실제 승인과 실행은 상위 워크플로가 책임집니다."
      evidenceTitle="검토 근거"
      decisionTitle="대응 선택"
      evidence={evidence}
      decisions={decisions}
    />
  )
}
