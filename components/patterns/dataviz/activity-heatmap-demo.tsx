import { ActivityHeatmap, type ActivityCell } from "@/components/patterns/dataviz/activity-heatmap"

const WEEKS = 20

/** 결정적 의사난수(시드 고정) — 데모 데이터를 항상 같은 모양으로 재현한다. */
function pseudoCount(week: number, day: number): number {
  const x = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453
  const frac = x - Math.floor(x)
  return Math.floor(frac * 11)
}

export function ActivityHeatmapDemo() {
  const weeks: ActivityCell[][] = []
  for (let w = 0; w < WEEKS; w++) {
    const col: ActivityCell[] = []
    for (let d = 0; d < 7; d++) {
      col.push({ week: w, day: d, count: pseudoCount(w, d) })
    }
    weeks.push(col)
  }

  return <ActivityHeatmap weeks={weeks} rangeLabel="최근 20주 활동" gridLabel="최근 20주 일별 활동 건수 히트맵" />
}
