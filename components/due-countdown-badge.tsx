import * as React from "react"

import { RiskGradeBadge, type RiskGradeBadgeFill } from "@/components/risk-grade-badge"
import { Badge } from "@/components/ui/badge"
import { resolveDue, type DueInput, type DueState, type DueStatus } from "@/lib/due"
import type { RiskLevel } from "@/lib/risk-tokens"
import { cn } from "@/lib/utils"

/** 문자열이면 `{days}` 자리에 잔여일 절대값이 들어간다. 함수면 상태 전체를 받는다. */
export type DueCountdownLabel = string | ((state: DueState) => React.ReactNode)

export type DueCountdownLabels = Record<DueStatus, DueCountdownLabel>

/**
 * 여유 상태는 등급 색을 쓰지 않는다 — 기한이 남은 건 위험이 아니라 기본값이고,
 * 화면에 배지가 수십 개 깔리는 목록에서 전부 색이 있으면 임박·경과가 묻힌다.
 */
const STATUS_RISK_LEVEL: Record<DueStatus, RiskLevel | null> = {
  ahead: null,
  soon: "high",
  overdue: "severe",
}

export interface DueCountdownBadgeProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** 기한일. `Date` 또는 `YYYY-MM-DD`. */
  deadline: DueInput
  /**
   * 기준일. 필수다 — 컴포넌트가 `new Date()` 를 직접 읽으면 서버·클라이언트 렌더가
   * 날짜 경계에서 갈려 hydration 이 어긋난다. 호출측이 한 번 정한 "오늘"을 넘긴다.
   */
  asOf: DueInput
  /** 잔여일이 이 값 이하이면 임박. 기본 3일 — 도메인마다 달라 하드코딩하지 않는다. */
  soonWithinDays?: number
  /**
   * 상태별 표기. 실물에 `D-2 경과`·`D-3 이내`·`기한 D-2`·`D-3 만료 임박` 이 섞여
   * 있어 컴포넌트가 문구를 고정하지 않는다(i18n 대상).
   */
  labels: DueCountdownLabels
  /** 색이 붙는 상태(임박·경과)의 채움 방식. 기본 tint. */
  fill?: RiskGradeBadgeFill
}

function renderLabel(label: DueCountdownLabel, state: DueState): React.ReactNode {
  if (typeof label === "function") return label(state)
  return label.replaceAll("{days}", String(Math.abs(state.daysRemaining)))
}

/**
 * 기한 카운트다운 배지 (#82) — 기준일 대비 잔여일을 여유/임박/경과 3단으로
 * 표시한다. 상태 파생은 `lib/due.ts` 의 {@link resolveDue} 가 소유하고 이 컴포넌트는
 * 표시만 한다.
 *
 * 임박·경과는 위험 등급 배지와 같은 `--risk-*` 토큰을 쓴다 — 한 화면에 등급
 * 배지와 기한 배지가 같이 놓이므로 심각도 색이 두 벌이면 읽는 쪽이 둘을 다른
 * 축으로 오해한다.
 */
function DueCountdownBadge({
  className,
  deadline,
  asOf,
  soonWithinDays,
  labels,
  fill = "tint",
  ...props
}: Readonly<DueCountdownBadgeProps>) {
  const state = resolveDue(deadline, asOf, soonWithinDays === undefined ? {} : { soonWithinDays })
  const level = STATUS_RISK_LEVEL[state.status]
  const label = renderLabel(labels[state.status], state)

  if (level === null) {
    return (
      <Badge variant="secondary" data-due-status={state.status} className={cn(className)} {...props}>
        {label}
      </Badge>
    )
  }

  return (
    <RiskGradeBadge
      level={level}
      label={label}
      fill={fill}
      data-due-status={state.status}
      className={cn(className)}
      {...props}
    />
  )
}

export { DueCountdownBadge }
