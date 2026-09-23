import { FlowDiagram, type FlowGate, type FlowNode } from "@/components/patterns/concept-explainer/flow-diagram"

const GATES: FlowGate[] = [
  { label: "① docker build", title: "IMAGE · 냉동 밀키트", tone: "primary" },
  { label: "② docker run", title: "데우기 → 접시에 담기", tone: "secondary" },
]

const NODES: FlowNode[] = [
  { name: "HOST A · 주방", units: ["web 컨테이너", "api 컨테이너"] },
  { name: "HOST B · 주방", units: ["db 컨테이너", "cache 컨테이너"] },
]

/** /patterns/concept-explainer 데모용 — docker build → run 흐름을 예로 든다. */
export function FlowDiagramDemo() {
  return <FlowDiagram entry="Dockerfile · 레시피 카드" gates={GATES} nodes={NODES} />
}
