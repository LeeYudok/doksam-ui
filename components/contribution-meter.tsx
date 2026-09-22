"use client"

import * as React from "react"
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { AuditCodeTag } from "@/components/audit-code-tag"
import { useI18n } from "@/components/i18n-provider"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

/** increase = 위험을 올리는 요인 · decrease = 위험을 내리는 요인. 생략하면 방향 표기 없이 중립으로 렌더한다. */
export type ContributionDirection = "increase" | "decrease"

export interface ContributionMeterProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 기여도 퍼센트(0~100). 게이지 값과 숫자 표기를 함께 만든다. 범위를 벗어나면 clamp 한다. */
  percent: number
  /**
   * 기여 방향. S-03 의 기여 변수 랭킹처럼 위험을 올리는 요인과 내리는 요인이
   * 같은 목록에 섞일 때 준다. 생략하면 방향이 없는 중립 게이지로 렌더한다.
   */
  direction?: ContributionDirection
  /** 근거 감사코드. 주면 `AuditCodeTag`(#83) 로 함께 렌더한다. */
  code?: string
  /** `AuditCodeTag` 에 그대로 전달 — 근거 문서로 이동하는 화면에서만 준다. */
  onNavigate?: () => void
  /** `AuditCodeTag` 에 그대로 전달. 기본 false. */
  copyable?: boolean
}

/**
 * 기여도 게이지(#84) — AI 판단 근거 표기(기여도 % + 미니 게이지 + 감사코드)를
 * S-01·S-02·S-03·S-07 에서 반복돼 온 `기여도 34% [EVD-2025-0518]` 패턴으로 묶는다.
 *
 * 게이지는 `Progress` 프리미티브(#84 설계 — 새 바 구현 금지)를 그대로 쓴다.
 * `components/ui/progress.tsx` 는 인디케이터 색을 prop 으로 노출하지 않으므로,
 * 그 파일을 고치는 대신 `data-slot="progress-indicator"` 를 겨냥한 Tailwind
 * 임의 변형(`[&>[data-slot=progress-indicator]]:bg-*`)으로 색만 덮어쓴다 —
 * 프리미티브 자체는 그대로 두고 조합 층에서만 칠한다.
 *
 * 방향 색은 `--gain`/`--loss` 를 쓴다(위험등급 토큰 `--risk-*` 대신). `--risk-*`
 * 는 4단 **순서 있는 심각도**(정상→경보)를 나타내는 토큰이라 이 2진(상승/하락)
 * 방향에 두 레벨만 임의로 골라 쓰면 나머지 두 레벨이 이유 없이 비게 된다.
 * 반면 `--gain`/`--loss` 는 애초에 "값이 올라가는지 내려가는지"를 나타내는
 * 방향 토큰이라(한국식 시세 관례로 상승=빨강, 하락=파랑) 여기서 뜻하는 "기여도가
 * 위험 점수를 밀어 올리는지 끌어내리는지"와 구조가 정확히 같다. 색만으로는
 * 색각 이상 사용자에게 전달되지 않으므로 방향 아이콘(TrendUp/TrendDown)과
 * 문구를 항상 두 번째 채널로 같이 싣는다.
 *
 * 랭킹 목록 안에서 반복 렌더되는 자리라 기본이 컴팩트 밀도다 — 게이지 높이는
 * `Progress` 기본값(h-1)에서 살짝만 키운 1.5 로 고정하고, 세로 여백을 늘리지 않는다.
 */
function ContributionMeter({
  className,
  percent,
  direction,
  code,
  onNavigate,
  copyable,
  ...props
}: Readonly<ContributionMeterProps>) {
  const { t } = useI18n()
  const clamped = Math.min(100, Math.max(0, percent))

  const directionLabel =
    direction === "increase"
      ? t("chrome.contributionMeter.increase", "위험 상승 요인")
      : direction === "decrease"
        ? t("chrome.contributionMeter.decrease", "위험 하락 요인")
        : null

  const DirectionIcon = direction === "increase" ? TrendUpIcon : direction === "decrease" ? TrendDownIcon : null

  const directionTextClass =
    direction === "increase" ? "text-gain" : direction === "decrease" ? "text-loss" : "text-muted-foreground"

  const indicatorClass =
    direction === "increase"
      ? "[&>[data-slot=progress-indicator]]:bg-gain"
      : direction === "decrease"
        ? "[&>[data-slot=progress-indicator]]:bg-loss"
        : undefined

  return (
    <div data-slot="contribution-meter" className={cn("flex items-center gap-2 text-sm", className)} {...props}>
      {DirectionIcon ? (
        <DirectionIcon
          className={cn("size-3.5 shrink-0", directionTextClass)}
          weight="bold"
          aria-hidden
        />
      ) : null}
      <span className="sr-only">{directionLabel}</span>
      <Progress value={clamped} className={cn("h-1.5 w-16 shrink-0 sm:w-24", indicatorClass)} />
      <span className={cn("shrink-0 font-medium tabular-nums", directionTextClass)}>{clamped}%</span>
      {code ? (
        <AuditCodeTag code={code} onNavigate={onNavigate} copyable={copyable} className="shrink-0" />
      ) : null}
    </div>
  )
}

export { ContributionMeter }
