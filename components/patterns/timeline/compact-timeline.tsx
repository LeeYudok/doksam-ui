import type { Icon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

/** 단계 점 색 — 시맨틱 토큰 4종에만 대응한다. */
export type CompactStepStatus = "success" | "warning" | "destructive" | "muted"

export interface CompactStep {
  time: string
  status: CompactStepStatus
  icon: Icon
  title: string
}

export interface CompactTimelineProps {
  steps: CompactStep[]
  className?: string
}

const DOT_CLASS: Record<CompactStepStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/40",
}

/**
 * 컴팩트 타임라인 — 날짜 그룹 없이 단일 프로세스(주문 처리 단계 등)의 진행 이력을
 * 좁은 폭(사이드 패널·카드 내부)에 담을 때 쓰는 축약 변형이다.
 */
export function CompactTimeline({ steps, className }: Readonly<CompactTimelineProps>) {
  return (
    <ol className={cn("flex max-w-sm flex-col", className)}>
      {steps.map((step, i) => {
        const StepIcon = step.icon
        return (
          <li key={step.title} className="relative flex gap-2.5 pb-4 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden className="absolute top-4 bottom-0 left-[5px] w-px bg-border" />}
            <span
              className={cn(
                "relative z-10 mt-1 flex size-2.5 shrink-0 items-center justify-center rounded-full",
                DOT_CLASS[step.status]
              )}
            />
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
              <span className="flex items-center gap-1 text-sm">
                <StepIcon size={13} className="shrink-0 text-muted-foreground" />
                {step.title}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{step.time}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
