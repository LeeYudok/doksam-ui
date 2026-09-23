import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/patterns/dataviz/sparkline"
import { formatWon } from "@/lib/finance/format-won"
import { rateColor, rateText } from "@/lib/finance/rate"
import { cn } from "@/lib/utils"

export interface Kpi {
  label: string
  /** 원 단위 값이면 formatWon으로, 건수·비율 등이면 count/percent로 표시 단위를 고른다. */
  unit: "won" | "count" | "percent"
  value: number
  /** 전기 대비 증감률(%). */
  change: number
  /** 미니 스파크라인에 그릴 추세값. 비우면 스파크라인을 그리지 않는다. */
  trend?: number[]
}

export interface KpiCardGridProps {
  items: Kpi[]
  className?: string
}

function kpiValueText(kpi: Kpi): string {
  if (kpi.unit === "won") return formatWon(kpi.value)
  if (kpi.unit === "percent") return `${kpi.value.toFixed(1)}%`
  return kpi.value.toLocaleString()
}

/** KPI 카드 한 장 — 라벨 + 값 + 전기 대비 증감 + 미니 스파크라인. */
export function KpiCard({ kpi }: Readonly<{ kpi: Kpi }>) {
  const colorClass = rateColor(kpi.change)
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">{kpiValueText(kpi)}</span>
          <span className={cn("flex items-center gap-0.5 text-xs font-medium tabular-nums", colorClass)}>
            {kpi.change > 0 && <TrendUpIcon size={12} weight="bold" />}
            {kpi.change < 0 && <TrendDownIcon size={12} weight="bold" />}
            {rateText(kpi.change)}%
          </span>
        </div>
        {kpi.trend && kpi.trend.length > 0 ? <Sparkline values={kpi.trend} height={32} /> : null}
      </CardContent>
    </Card>
  )
}

/**
 * KPI 카드 그리드 — 값(formatWon/건수/비율) + 전기 대비 증감(rateColor/rateText) +
 * 미니 스파크라인. 증감 색은 한국식 시세 관례(상승=gain, 하락=loss)를 따르는
 * lib/finance/rate.ts 시맨틱 토큰만 사용한다.
 */
export function KpiCardGrid({ items, className }: Readonly<KpiCardGridProps>) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  )
}
