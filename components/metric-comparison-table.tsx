"use client"

import * as React from "react"
import { MinusIcon, TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { useI18n } from "@/components/i18n-provider"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * higher = 값이 클수록 좋음(AR·KS·포착률 등) · lower = 값이 작을수록 좋음(연체율·오탐률 등).
 * 방향 색은 델타의 부호가 아니라 이 값으로 결정한다 — 이게 이 컴포넌트의 핵심이다.
 * 부호만 보고 칠하면 "작을수록 좋은 지표"에서 값이 줄었는데도(개선인데도) 위험 색이 뜬다.
 */
export type MetricBetterWhen = "higher" | "lower"

export interface MetricComparisonRow {
  /** React key 겸 행 식별자. */
  key: string
  label: React.ReactNode
  /** 대상 A(보통 챔피언·기준·전월) 값. */
  subjectA: number
  /** 대상 B(보통 챌린저·후보·이번달) 값. */
  subjectB: number
  betterWhen: MetricBetterWhen
  /** 값 뒤에 그대로 붙는 단위 문자열(예: "%", "bp", "일"). 구분자는 호출측이 포함한다. */
  unit?: string
  /** 표시 소수 자릿수. 행이 주지 않으면 테이블 기본값(`digits` prop, 기본 2)을 따른다. */
  digits?: number
  /** 기본 포맷(toFixed + unit) 대신 값을 직접 문자열로 만든다. */
  formatValue?: (value: number) => string
}

export interface MetricComparisonTableProps extends Omit<React.ComponentProps<"table">, "children"> {
  metrics: readonly MetricComparisonRow[]
  /** 대상 A 열 헤더(예: "챔피언", "전월"). */
  subjectALabel: React.ReactNode
  /** 대상 B 열 헤더(예: "챌린저", "이번달"). */
  subjectBLabel: React.ReactNode
  /** 표의 목적을 알리는 캡션. 시각적으로 숨기려면 `captionHidden`. */
  caption?: React.ReactNode
  captionHidden?: boolean
  /** 행이 `digits` 를 주지 않을 때 쓰는 기본 소수 자릿수. */
  digits?: number
}

function formatMetricValue(value: number, digits: number, unit: string | undefined, formatValue: MetricComparisonRow["formatValue"]) {
  if (formatValue) return formatValue(value)
  return `${value.toFixed(digits)}${unit ?? ""}`
}

/**
 * A/B 지표 비교표(#102) — EWS v2 S-07 검증리포트의 챔피언 vs 챌린저 성능 비교표를
 * 도메인 중립으로 뽑은 것이다. 모형 비교뿐 아니라 기간 비교(전월 대비)·환경 비교
 * (운영/스테이징)에도 그대로 쓴다.
 *
 * 행 = 지표, 열 = 대상 A · 대상 B · 델타. 델타는 `subjectB - subjectA` 고, 방향 색은
 * 델타의 부호가 아니라 각 행의 `betterWhen` 으로 정한다 — 연체율처럼 "작을수록 좋은"
 * 지표에서 값이 줄면(델타가 음수여도) 개선이라 `--success`, AR처럼 "클수록 좋은"
 * 지표에서 값이 줄면 악화라 `--destructive` 다. 색은 `--success`/`--destructive` 로
 * 칠한다 — 이건 시세가 아니라서 한국식 등락 관례 토큰(`--gain`/`--loss`,
 * `lib/finance/rate.ts`)과 혼동하지 않는다.
 *
 * 색만으로는 색각 이상 사용자에게 전달되지 않으므로 방향 아이콘(TrendUp/TrendDown/Minus)
 * 과 부호(+/-)를 항상 두 번째 채널로 같이 싣고, 스크린리더용 sr-only 문구(개선/악화/
 * 변동 없음)도 함께 렌더한다.
 *
 * 수치는 `tabular-nums` 로 정렬하고, 유효숫자는 `digits` prop(테이블 기본값)과 각 행의
 * `digits`(행 단위 재정의)로 받는다 — 컴포넌트가 임의로 반올림 정책을 고정하지 않는다.
 */
function MetricComparisonTable({
  className,
  metrics,
  subjectALabel,
  subjectBLabel,
  caption,
  captionHidden = false,
  digits = 2,
  ...props
}: Readonly<MetricComparisonTableProps>) {
  const { t } = useI18n()

  const improvedLabel = t("chrome.metricComparisonTable.improved", "개선")
  const worsenedLabel = t("chrome.metricComparisonTable.worsened", "악화")
  const unchangedLabel = t("chrome.metricComparisonTable.unchanged", "변동 없음")
  const metricHeader = t("chrome.metricComparisonTable.metricHeader", "지표")
  const deltaHeader = t("chrome.metricComparisonTable.deltaHeader", "델타")

  return (
    <Table className={cn(className)} {...props}>
      {caption ? <TableCaption className={cn(captionHidden && "sr-only")}>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          <TableHead>{metricHeader}</TableHead>
          <TableHead className="text-right">{subjectALabel}</TableHead>
          <TableHead className="text-right">{subjectBLabel}</TableHead>
          <TableHead className="text-right">{deltaHeader}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metrics.map((metric) => {
          const rowDigits = metric.digits ?? digits
          const delta = metric.subjectB - metric.subjectA
          const isImproved =
            delta !== 0 && ((metric.betterWhen === "higher" && delta > 0) || (metric.betterWhen === "lower" && delta < 0))
          const isWorsened =
            delta !== 0 && ((metric.betterWhen === "higher" && delta < 0) || (metric.betterWhen === "lower" && delta > 0))

          const directionLabel = isImproved ? improvedLabel : isWorsened ? worsenedLabel : unchangedLabel
          const directionTextClass = isImproved ? "text-success" : isWorsened ? "text-destructive" : "text-muted-foreground"
          const DirectionIcon = isImproved ? TrendUpIcon : isWorsened ? TrendDownIcon : MinusIcon
          const sign = delta > 0 ? "+" : ""
          const deltaText = `${sign}${formatMetricValue(delta, rowDigits, metric.unit, metric.formatValue)}`

          return (
            <TableRow key={metric.key} data-direction={isImproved ? "improved" : isWorsened ? "worsened" : "unchanged"}>
              <TableCell>{metric.label}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatMetricValue(metric.subjectA, rowDigits, metric.unit, metric.formatValue)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatMetricValue(metric.subjectB, rowDigits, metric.unit, metric.formatValue)}
              </TableCell>
              <TableCell className={cn("text-right font-mono tabular-nums", directionTextClass)}>
                <span className="inline-flex items-center justify-end gap-1">
                  <DirectionIcon className="size-3.5 shrink-0" weight="bold" aria-hidden />
                  <span className="sr-only">{directionLabel}</span>
                  {deltaText}
                </span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export { MetricComparisonTable }
