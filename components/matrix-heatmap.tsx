import * as React from "react"

import {
  MATRIX_HEATMAP_STEPS,
  matrixHeatmapCellBackground,
  matrixHeatmapCellForeground,
  matrixHeatmapStep,
  type MatrixHeatmapStepIndex,
} from "@/lib/heatmap-tokens"
import { cn } from "@/lib/utils"

export interface MatrixHeatmapCell {
  /** 행 키 — `rowKeys` 의 값과 일치해야 한다. */
  rowKey: string
  /** 열 키 — `colKeys` 의 값과 일치해야 한다. */
  colKey: string
  /** 강도(색)를 계산할 원본 값. */
  value: number
  /**
   * 셀에 적을 값 텍스트. 색만으로 값을 전달하지 않기 위한 두 번째 채널이라
   * 필수다 — 포맷팅(퍼센트·단위 등)은 소비 측 책임이다.
   */
  valueLabel: string
}

export interface MatrixHeatmapProps {
  /** 행 순서(위에서 아래). */
  rowKeys: string[]
  /** 열 순서(왼쪽에서 오른쪽). */
  colKeys: string[]
  /** 행 머리글 표시 텍스트. 없으면 `rowKey` 를 그대로 쓴다. */
  rowLabels?: Record<string, string>
  /** 열 머리글 표시 텍스트. 없으면 `colKey` 를 그대로 쓴다. */
  colLabels?: Record<string, string>
  /** 격자 데이터. `rowKey`×`colKey` 쌍이 없으면 그 칸은 빈 셀로 렌더한다. */
  cells: MatrixHeatmapCell[]
  /** 강도 스케일의 최솟값. 기본은 `cells` 값 중 최솟값. */
  min?: number
  /** 강도 스케일의 최댓값. 기본은 `cells` 값 중 최댓값. */
  max?: number
  /** 표 전체를 설명하는 caption(시각적으로는 숨기고 스크린리더에만 노출). */
  caption: string
  /** 빈 셀(데이터 없음)에 표시할 텍스트/aria 값. */
  emptyLabel?: string
  /** 범례의 "낮음" 쪽 라벨. */
  legendMinLabel: string
  /** 범례의 "높음" 쪽 라벨. */
  legendMaxLabel: string
  /** 행 머리글 열(좌상단 빈 칸)의 스크린리더 전용 이름. */
  rowHeaderLabel?: string
  className?: string
}

function cellStyle(step: MatrixHeatmapStepIndex): React.CSSProperties {
  return {
    backgroundColor: matrixHeatmapCellBackground(step),
    color: matrixHeatmapCellForeground(step),
  }
}

/**
 * 범주 × 범주 분포 매트릭스 (#103) — 행/열 두 범주 축의 교차 셀에 값의 강도를
 * 면색으로 얹는 격자. `activity-heatmap`(일자 × 요일 단일 계열, 색만으로 강도를
 * 전달)과 달리 이쪽은 **임의의 두 범주 축**을 다루고, 셀마다 수치 텍스트를
 * 반드시 함께 표기한다 — 색각 이상 사용자에게는 강도 색이 전달되지 않기 때문이다.
 *
 * 강도 색은 `lib/heatmap-tokens.ts` 가 정한 명도(L) 단계로 `--primary` 에서
 * `oklch(from var(--primary) <L> c h)` 로 파생한다. `--chart-1~5`(범주 팔레트)나
 * `--risk-*`(4단 고정 심각도)를 재사용하지 않는다 — 이 컴포넌트가 다루는 것은
 * 그 둘과 다른 "연속 값 강도"다.
 */
export function MatrixHeatmap({
  rowKeys,
  colKeys,
  rowLabels,
  colLabels,
  cells,
  min,
  max,
  caption,
  emptyLabel = "–",
  legendMinLabel,
  legendMaxLabel,
  rowHeaderLabel = "행 머리글",
  className,
}: Readonly<MatrixHeatmapProps>) {
  const cellMap = React.useMemo(() => {
    const map = new Map<string, MatrixHeatmapCell>()
    for (const cell of cells) map.set(`${cell.rowKey}\u0000${cell.colKey}`, cell)
    return map
  }, [cells])

  const values = cells.map((cell) => cell.value)
  const resolvedMin = min ?? (values.length ? Math.min(...values) : 0)
  const resolvedMax = max ?? (values.length ? Math.max(...values) : 0)

  const rowLabel = (rowKey: string) => rowLabels?.[rowKey] ?? rowKey
  const colLabel = (colKey: string) => colLabels?.[colKey] ?? colKey

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 border-b border-border bg-card p-2 text-left text-xs font-medium text-muted-foreground"
              >
                <span className="sr-only">{rowHeaderLabel}</span>
              </th>
              {colKeys.map((colKey) => (
                <th
                  key={colKey}
                  scope="col"
                  className="border-b border-border bg-card p-2 text-center text-xs font-medium whitespace-nowrap text-muted-foreground"
                >
                  {colLabel(colKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowKeys.map((rowKey) => (
              <tr key={rowKey}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-border bg-card p-2 text-left text-xs font-medium whitespace-nowrap text-muted-foreground"
                >
                  {rowLabel(rowKey)}
                </th>
                {colKeys.map((colKey) => {
                  const cell = cellMap.get(`${rowKey}\u0000${colKey}`)
                  if (!cell) {
                    return (
                      <td
                        key={colKey}
                        className="border-b border-border p-2 text-center text-xs text-muted-foreground"
                        aria-label={`${rowLabel(rowKey)} × ${colLabel(colKey)}: ${emptyLabel}`}
                      >
                        {emptyLabel}
                      </td>
                    )
                  }
                  const step = matrixHeatmapStep(cell.value, resolvedMin, resolvedMax)
                  return (
                    <td
                      key={colKey}
                      data-step={step}
                      style={cellStyle(step)}
                      className="border-b border-border p-2 text-center text-xs font-medium tabular-nums"
                      aria-label={`${rowLabel(rowKey)} × ${colLabel(colKey)}: ${cell.valueLabel}`}
                    >
                      {cell.valueLabel}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>{legendMinLabel}</span>
        {Array.from({ length: MATRIX_HEATMAP_STEPS }, (_, step) => (
          <span
            key={step}
            aria-hidden="true"
            className="h-2.5 w-4 rounded-[2px]"
            style={cellStyle(step as MatrixHeatmapStepIndex)}
          />
        ))}
        <span>{legendMaxLabel}</span>
      </div>
    </div>
  )
}
