"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

/** 근거의 검증 상태. 상태의 실제 표시 문구는 호출부의 statusLabel이 소유한다. */
export type EvidenceStatus = "verified" | "pending" | "unavailable"

/** 판단에 인용되는 근거 한 건. */
export interface EvidenceItem {
  /** 근거와 조치의 연결에 쓰는 고유 식별자. */
  id: string
  /** 사람이 읽는 근거 제목. */
  label: string
  /** 출처 시스템·문서·검증 주체. */
  source: string
  /** verified/pending/unavailable 상태. */
  status: EvidenceStatus
  /** 상태의 사람이 읽는 문구. */
  statusLabel: string
  /** 관측 또는 검증 시각 등 보조 메타데이터. */
  observedAt?: string
  /** 근거가 판단에 어떤 의미인지 설명한다. */
  description?: string
}

/** 근거를 근거로 삼아 사람이 선택할 수 있는 조치 한 건. */
export interface DecisionOption {
  /** 라디오 선택값과 감사 기록에 쓰는 고유 식별자. */
  id: string
  /** 조치 이름. */
  label: string
  /** 조치의 기대 결과 또는 범위. */
  summary: string
  /** 대상·한도·사후 일정처럼 함께 표시할 보조 정보. */
  meta?: string
  /** 선택 불가인 이유. disabled일 때 함께 제공한다. */
  constraint?: string
  /** true면 우선 검토할 조치로 표시한다. 자동 실행을 뜻하지는 않는다. */
  recommended?: boolean
  /** 이 조치를 뒷받침하는 EvidenceItem id 목록. */
  evidenceIds: string[]
  /** true면 선택할 수 없다. */
  disabled?: boolean
}

export interface EvidenceDecisionPanelProps
  extends Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onChange"> {
  /** 화면 맥락을 설명하는 제목. */
  title: string
  /** 제목 아래에 표시할 상황 요약. */
  description?: string
  /** 조치 선택 전에 검토할 근거 목록. */
  evidence: EvidenceItem[]
  /** 사람이 검토할 조치 후보. */
  decisions: DecisionOption[]
  /** 근거 영역의 제목. */
  evidenceTitle: string
  /** 조치 영역의 제목(라디오 그룹 label). */
  decisionTitle: string
  /** 외부에서 선택값을 제어할 때 사용한다. */
  selectedId?: string
  /** 비제어 사용 시 최초 선택값. 생략하면 추천 조치, 그 다음 첫 선택 가능 조치다. */
  defaultSelectedId?: string
  /** 조치가 바뀔 때 id와 전체 조치를 함께 전달한다. 실제 승인/실행은 호출부가 소유한다. */
  onSelectedIdChange?: (id: string, decision: DecisionOption) => void
}

const STATUS_VARIANT: Record<EvidenceStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  verified: "secondary",
  pending: "outline",
  unavailable: "destructive",
}

function initialDecisionId(decisions: DecisionOption[], defaultSelectedId?: string): string | undefined {
  const requested = decisions.find((decision) => decision.id === defaultSelectedId && !decision.disabled)
  if (requested) return requested.id

  const recommended = decisions.find((decision) => decision.recommended && !decision.disabled)
  return recommended?.id ?? decisions.find((decision) => !decision.disabled)?.id
}

/**
 * EvidenceDecisionPanel은 추천을 자동 실행하지 않는다. 각 조치가 어떤 근거에 기대는지와
 * 근거의 검증 상태를 함께 보이고, 사용자가 선택한 id만 상위로 전달한다. 여신 심사·한도
 * 예외·모델 교체처럼 설명 가능성과 인간 승인 경계가 필요한 금융 의사결정에 재사용한다.
 */
function EvidenceDecisionPanel({
  title,
  description,
  evidence,
  decisions,
  evidenceTitle,
  decisionTitle,
  selectedId,
  defaultSelectedId,
  onSelectedIdChange,
  className,
  ...props
}: Readonly<EvidenceDecisionPanelProps>) {
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = React.useState<string | undefined>(() =>
    initialDecisionId(decisions, defaultSelectedId),
  )
  const activeId = selectedId ?? uncontrolledSelectedId
  const evidenceById = React.useMemo(() => new Map(evidence.map((item) => [item.id, item])), [evidence])
  const evidenceHeadingId = React.useId()
  const decisionHeadingId = React.useId()

  function selectDecision(id: string) {
    const decision = decisions.find((candidate) => candidate.id === id)
    if (!decision || decision.disabled) return

    if (selectedId === undefined) setUncontrolledSelectedId(id)
    onSelectedIdChange?.(id, decision)
  }

  return (
    <section
      data-slot="evidence-decision-panel"
      className={cn("grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]", className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <section aria-labelledby={evidenceHeadingId} className="flex flex-col gap-3">
            <h3 id={evidenceHeadingId} className="text-sm font-medium">
              {evidenceTitle}
            </h3>
            <ol className="flex flex-col gap-2">
              {evidence.map((item) => (
                <li key={item.id} id={`evidence-${item.id}`} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.source}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[item.status]}>{item.statusLabel}</Badge>
                  </div>
                  {item.description ? <p className="mt-2 text-sm text-muted-foreground">{item.description}</p> : null}
                  {item.observedAt ? <p className="mt-2 text-xs tabular-nums text-muted-foreground">{item.observedAt}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle id={decisionHeadingId}>{decisionTitle}</CardTitle>
          <CardDescription>선택은 상위 업무 흐름에 전달되며, 이 컴포넌트가 승인·실행하지 않습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={activeId}
            onValueChange={selectDecision}
            aria-labelledby={decisionHeadingId}
            className="gap-3"
          >
            {decisions.map((decision) => {
              const references = decision.evidenceIds
                .map((id) => evidenceById.get(id))
                .filter((item): item is EvidenceItem => item !== undefined)
              const optionId = `decision-${decision.id}`
              return (
                <label
                  key={decision.id}
                  htmlFor={optionId}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-lg border border-border p-3 transition-[border-color,box-shadow,background-color] duration-200 motion-reduce:transition-none",
                    activeId === decision.id && "border-primary bg-primary/5 ring-1 ring-primary/30",
                    decision.disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <RadioGroupItem id={optionId} value={decision.id} disabled={decision.disabled} className="mt-0.5" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{decision.label}</span>
                      {decision.recommended ? <Badge variant="secondary">권장 검토</Badge> : null}
                    </span>
                    <span className="text-sm text-muted-foreground">{decision.summary}</span>
                    {decision.meta ? <span className="text-xs text-muted-foreground">{decision.meta}</span> : null}
                    {decision.constraint ? <span className="text-xs text-destructive">{decision.constraint}</span> : null}
                    {references.length > 0 ? (
                      <span className="flex flex-wrap gap-x-2 gap-y-1 pt-1 text-xs text-muted-foreground">
                        {references.map((item) => (
                          <a key={item.id} href={`#evidence-${item.id}`} className="underline underline-offset-4 hover:text-foreground">
                            {item.label}
                          </a>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </label>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>
    </section>
  )
}

export { EvidenceDecisionPanel }
