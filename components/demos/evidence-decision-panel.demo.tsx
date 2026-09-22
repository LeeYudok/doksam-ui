import { EvidenceDecisionPanelDemo } from "./evidence-decision-panel.demo.client"

export const demo = <EvidenceDecisionPanelDemo />

export const code = `import { EvidenceDecisionPanel, type DecisionOption, type EvidenceItem } from "@/components/evidence-decision-panel"

const evidence: EvidenceItem[] = [
  {
    id: "statement",
    label: "현금흐름 변동",
    source: "정형 재무자료",
    status: "verified",
    statusLabel: "검증됨",
  },
]

const decisions: DecisionOption[] = [
  {
    id: "review",
    label: "정밀 검토 요청",
    summary: "추가 자료를 모아 담당 심사자에게 검토를 요청합니다.",
    recommended: true,
    evidenceIds: ["statement"],
  },
]

<EvidenceDecisionPanel
  title="경보 원인 검토"
  evidenceTitle="검토 근거"
  decisionTitle="대응 선택"
  evidence={evidence}
  decisions={decisions}
  onSelectedIdChange={(id, decision) => saveDraft({ id, decision })}
/>`

export const dos = [
  "각 조치에 evidenceIds를 반드시 넣어 선택 근거가 어떤 데이터·문서인지 역추적할 수 있게 한다.",
  "recommended는 우선 검토 표시일 뿐 자동 실행이 아니다 — 실제 승인·실행은 onSelectedIdChange를 받는 상위 업무 흐름이 소유한다.",
  "확인이 끝나지 않은 자료는 pending으로 드러내고, 이를 이유로 막힌 조치는 disabled와 constraint를 함께 제공한다.",
]

export const donts = [
  "추천 조치를 클릭 한 번으로 자동 승인·실행하지 않는다 — 사람의 판단이 필요한 업무 경계를 컴포넌트가 넘지 않는다.",
  "근거 id만 남기고 제목·출처·검증 상태를 숨기지 않는다 — 감사 가능한 선택에는 사람이 읽을 수 있는 계보가 필요하다.",
  "상태 색을 하드코딩하지 않는다 — verified/pending/unavailable은 Badge의 시맨틱 variant로만 표현한다.",
  "서열이 있는 대안 목록(1순위·2순위…)을 이 컴포넌트의 RadioGroup에 억지로 넣지 않는다 — 단일 선택은 순위·동점·순위없음을 표현하지 못하고, 채택해도 나머지 후보가 사라지지 않아야 하는 화면에는 ranked-alternatives-list를 쓴다(#105).",
]
