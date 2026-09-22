import type { DecisionOption, EvidenceItem } from "@/components/evidence-decision-panel"

/** 패턴 화면용 합성 데이터. 실제 심사·경보·승인 결과를 뜻하지 않는다. */
export const EVIDENCE_DECISION_EVIDENCE: EvidenceItem[] = [
  {
    id: "cashflow",
    label: "현금흐름 변동",
    source: "정형 재무자료",
    status: "verified",
    statusLabel: "검증됨",
    observedAt: "관측 2026-09-22 09:20",
    description: "최근 두 관측 구간에서 운전자본 회전이 악화되었습니다.",
  },
  {
    id: "disclosure",
    label: "공시 원문 확인",
    source: "문서 근거",
    status: "pending",
    statusLabel: "확인 대기",
    observedAt: "수집 2026-09-22 09:32",
    description: "원문과 요약의 문맥 일치를 담당자가 확인해야 합니다.",
  },
  {
    id: "exposure",
    label: "익스포저 집계",
    source: "여신 원장",
    status: "verified",
    statusLabel: "검증됨",
    observedAt: "집계 2026-09-22 09:35",
    description: "해당 그룹의 약정·잔액·담보 정보를 기준 시점으로 고정했습니다.",
  },
]

export const EVIDENCE_DECISION_OPTIONS: DecisionOption[] = [
  {
    id: "review",
    label: "정밀 검토 요청",
    summary: "추가 자료를 모아 담당 심사자에게 검토를 요청합니다.",
    meta: "기한: 영업일 1일 이내",
    recommended: true,
    evidenceIds: ["cashflow", "disclosure", "exposure"],
  },
  {
    id: "monitor",
    label: "관찰 유지",
    summary: "다음 관측 시점까지 경보를 유지하며 변화만 추적합니다.",
    meta: "재관측: 7일 후",
    evidenceIds: ["cashflow", "exposure"],
  },
  {
    id: "automatic",
    label: "자동 승인",
    summary: "사람의 검토 없이 다음 단계로 넘깁니다.",
    constraint: "검증 대기 근거가 있어 선택할 수 없습니다.",
    evidenceIds: ["disclosure"],
    disabled: true,
  },
]
