const DAYS = ["일", "월", "화", "수", "목", "금", "토"]

/** 건수 → 농도 단계. 하드코딩 색 금지 — primary 알파 스케일(빈 날은 muted). */
function levelClass(n: number): string {
  if (n <= 0) return "bg-muted"
  if (n <= 2) return "bg-primary/25"
  if (n <= 5) return "bg-primary/50"
  if (n <= 9) return "bg-primary/75"
  return "bg-primary"
}

export interface ActivityCell {
  week: number
  day: number
  count: number
}

interface ActivityHeatmapProps {
  /** 주(週) 단위 열 배열 — 각 열은 요일 순서(일~토) 셀 배열이다. */
  weeks: ActivityCell[][]
  /** 헤더에 표시할 범위 라벨. 예: "최근 20주 활동". */
  rangeLabel: string
  /** role="img" 그리드의 aria-label. 예: "최근 20주 일별 활동 건수 히트맵". */
  gridLabel: string
}

/**
 * 활동 히트맵 — GitHub contribution graph 스타일. 주(週) 단위 열 × 요일 행 그리드로
 * 일별 활동 건수를 primary 알파 농도로 표현한다. 데이터는 항상 props 로 받는다 —
 * 표본 생성은 소비 측(데모/실서비스 데이터 페칭)의 책임이다.
 */
export function ActivityHeatmap({ weeks, rangeLabel, gridLabel }: Readonly<ActivityHeatmapProps>) {
  const total = weeks.flat().reduce((acc, c) => acc + c.count, 0)

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs font-medium text-muted-foreground">{rangeLabel}</span>
        <span className="text-xs tabular-nums text-muted-foreground">총 {total.toLocaleString()}건</span>
      </div>
      <div className="flex gap-[3px] overflow-x-auto" role="img" aria-label={gridLabel}>
        {weeks.map((col) => (
          <div key={`week-${col[0]?.week ?? 0}`} className="flex flex-col gap-[3px]">
            {col.map((cell) => (
              <span
                key={`${cell.week}-${DAYS[cell.day]}`}
                title={`${DAYS[cell.day]}요일 · ${cell.count}건`}
                aria-label={`${DAYS[cell.day]}요일 활동 ${cell.count}건`}
                className={`block h-2.5 w-2.5 rounded-[2px] transition-transform hover:scale-125 ${levelClass(cell.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>적음</span>
        <span className="h-2.5 w-2.5 rounded-[2px] bg-muted" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/25" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/50" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/75" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
        <span>많음</span>
      </div>
    </div>
  )
}
