import { ArrowDownIcon, FileTextIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

/** 흐름 도식의 관문(gate) 한 칸 — 진입점과 노드 사이 단계. */
export interface FlowGate {
  /** 좌측 고정폭 모노 라벨(예: "① docker build"). */
  label: string
  title: string
  /** primary=주 강조 관문, secondary=보조 관문. */
  tone?: "primary" | "secondary"
}

/** 흐름의 종착 노드 한 칸과 그 안에서 도는 유닛들. */
export interface FlowNode {
  name: string
  units: string[]
}

export interface FlowDiagramProps {
  /** 최상단 점선 알약에 들어갈 진입점 라벨. */
  entry: string
  gates: FlowGate[]
  nodes: FlowNode[]
  className?: string
}

function Gate({ label, title, tone = "primary" }: Readonly<FlowGate>) {
  return (
    <div className="flex w-full max-w-md items-center gap-3">
      <span className="w-24 shrink-0 text-right font-mono text-[11px] text-muted-foreground">{label}</span>
      <div
        className={cn(
          "flex-1 rounded-md border px-3 py-2 text-center text-sm font-medium",
          tone === "primary"
            ? "border-primary/30 bg-primary/10 text-foreground"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {title}
      </div>
    </div>
  )
}

function FlowArrow() {
  return <ArrowDownIcon aria-hidden size={16} weight="bold" className="my-1 text-muted-foreground" />
}

/**
 * 아키텍처 흐름 도식 — 진입점(점선 알약) → 관문(gate) → 실행 노드/유닛으로 이어지는
 * 세로 플로우. 어떤 요청/데이터가 어떤 관문을 거쳐 어디로 도달하는지를 한눈에 보여준다.
 * 단계 위계는 색이 아니라 tone 2단계(primary/secondary)의 강도로만 표현한다.
 */
export function FlowDiagram({ entry, gates, nodes, className }: Readonly<FlowDiagramProps>) {
  return (
    <div className={cn("flex flex-col items-center gap-0", className)}>
      <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-dashed border-muted-foreground/50 px-3 py-1 font-mono text-[11px] text-muted-foreground">
        <FileTextIcon aria-hidden size={14} />
        {entry}
      </div>
      {gates.map((gate) => (
        <div key={gate.label} className="flex w-full flex-col items-center">
          <FlowArrow />
          <Gate {...gate} />
        </div>
      ))}

      {nodes.length > 0 ? (
        <div className="mt-3 flex w-full max-w-md justify-center gap-3">
          {nodes.map((node) => (
            <div key={node.name} className="flex-1 rounded-md border border-border p-2">
              <div className="border-b border-border pb-1.5 text-center font-mono text-[10px] text-muted-foreground">
                {node.name}
              </div>
              <div className="flex flex-col gap-1 pt-1.5">
                {node.units.map((unit) => (
                  <div
                    key={unit}
                    className="rounded-sm bg-secondary px-1 py-1 text-center text-[10px] text-secondary-foreground"
                  >
                    {unit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
