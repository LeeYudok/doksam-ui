import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { EvidenceDecisionPanel } from "@/components/evidence-decision-panel"
import { EVIDENCE_DECISION_EVIDENCE, EVIDENCE_DECISION_OPTIONS } from "@/lib/patterns/evidence-decision-data"

export const EVIDENCE_DECISION_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "근거 확인 후 대응 선택",
    description: "근거의 출처·검증 상태를 먼저 읽고, 연결된 조치 후보 중 하나를 사람이 선택하는 상세 작업면입니다.",
    demo: (
      <EvidenceDecisionPanel
        title="경보 원인 검토"
        description="추천은 판단을 돕는 정보이며, 실제 승인과 실행은 상위 워크플로가 책임집니다."
        evidenceTitle="검토 근거"
        decisionTitle="대응 선택"
        evidence={EVIDENCE_DECISION_EVIDENCE}
        decisions={EVIDENCE_DECISION_OPTIONS}
      />
    ),
    code: `const evidence: EvidenceItem[] = [
  { id: "cashflow", label: "현금흐름 변동", source: "정형 재무자료", status: "verified", statusLabel: "검증됨" },
]

const decisions: DecisionOption[] = [
  {
    id: "review",
    label: "정밀 검토 요청",
    summary: "추가 자료를 모아 담당 심사자에게 검토를 요청합니다.",
    recommended: true,
    evidenceIds: ["cashflow"],
  },
]

<EvidenceDecisionPanel
  title="경보 원인 검토"
  evidenceTitle="검토 근거"
  decisionTitle="대응 선택"
  evidence={evidence}
  decisions={decisions}
  onSelectedIdChange={(id, decision) => saveDraft({ id, decision })}
/>`,
    notes: [
      "진단·조치·승인 단계가 분리된 업무에는 조치보다 근거를 먼저 배치한다 — 추천 자체가 근거를 대체하지 않는다.",
      "조치의 evidenceIds를 통해 어떤 데이터·문서·검증 상태에 기대는지 즉시 확인하고, 항목을 누르면 근거 목록으로 이동한다.",
      "자동화 경계를 넘는 후보는 disabled와 constraint를 함께 둔다 — 선택 불가 사유를 숨기거나 alert로 대체하지 않는다.",
      "onSelectedIdChange는 초안 상태만 전달한다 — 승인 기록·문서 생성·실행 결과는 업무 애플리케이션이 별도 저장한다.",
    ],
  },
]
