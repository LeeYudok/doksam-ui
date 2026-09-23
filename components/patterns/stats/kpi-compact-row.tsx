import { Card, CardContent } from "@/components/ui/card"
import { rateColor, rateText } from "@/lib/finance/rate"
import { cn } from "@/lib/utils"

export interface CompactKpi {
  label: string
  /** 이미 포맷된 표시 문자열 — 단위·자릿수 규칙은 호출부가 정한다. */
  value: string
  /** 전기 대비 증감률(%). */
  change: number
}

export interface KpiCompactRowProps {
  items: CompactKpi[]
  className?: string
}

/**
 * 압축 KPI 행 — 스파크라인 없이 라벨·값·증감만 한 줄로 배치하는 밀도 높은 변형.
 * 운영 대시보드 상단처럼 지표 개수가 많거나 세로 공간이 좁을 때 KpiCardGrid 대신 쓴다.
 */
export function KpiCompactRow({ items, className }: Readonly<KpiCompactRowProps>) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {items.map((kpi) => (
        <Card key={kpi.label} size="sm">
          <CardContent className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tabular-nums">{kpi.value}</span>
              <span className={cn("text-[11px] font-medium tabular-nums", rateColor(kpi.change))}>
                {rateText(kpi.change)}%
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
