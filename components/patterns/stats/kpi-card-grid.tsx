import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/patterns/dataviz/sparkline"
import { formatWon } from "@/lib/finance/format-won"
import { rateColor, rateText } from "@/lib/finance/rate"

interface Kpi {
  label: string
  /** 원 단위 값이면 formatWon으로, 건수·비율 등이면 count로 표시 단위를 고른다. */
  unit: "won" | "count" | "percent"
  value: number
  /** 전기 대비 증감률(%). */
  change: number
  trend: number[]
}

const KPIS: Kpi[] = [
  { label: "이번 달 매출", unit: "won", value: 300_000_000, change: 12.4, trend: [180, 195, 210, 205, 230, 245, 260, 255, 270, 300] },
  { label: "신규 가입자", unit: "count", value: 1842, change: 6.1, trend: [1420, 1480, 1510, 1560, 1600, 1650, 1690, 1740, 1790, 1842] },
  { label: "활성 구독", unit: "count", value: 963, change: -2.3, trend: [1020, 1010, 1005, 995, 990, 985, 975, 970, 968, 963] },
  { label: "전환율", unit: "percent", value: 3.8, change: 0.4, trend: [3.1, 3.2, 3.3, 3.2, 3.4, 3.5, 3.6, 3.6, 3.7, 3.8] },
  { label: "환불 건수", unit: "count", value: 27, change: -18.2, trend: [41, 39, 38, 36, 34, 33, 31, 30, 28, 27] },
  { label: "평균 객단가", unit: "won", value: 62_400, change: 0, trend: [61000, 61500, 62000, 61800, 62200, 62400, 62100, 62300, 62400, 62400] },
]

function kpiValueText(kpi: Kpi): string {
  if (kpi.unit === "won") return formatWon(kpi.value)
  if (kpi.unit === "percent") return `${kpi.value.toFixed(1)}%`
  return kpi.value.toLocaleString()
}

function KpiCard({ kpi }: Readonly<{ kpi: Kpi }>) {
  const colorClass = rateColor(kpi.change)
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">{kpiValueText(kpi)}</span>
          <span className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${colorClass}`}>
            {kpi.change > 0 && <TrendUpIcon size={12} weight="bold" />}
            {kpi.change < 0 && <TrendDownIcon size={12} weight="bold" />}
            {rateText(kpi.change)}%
          </span>
        </div>
        <Sparkline values={kpi.trend} height={32} />
      </CardContent>
    </Card>
  )
}

/**
 * #1 KPI 카드 그리드 — 값(formatWon/건수/비율) + 전기 대비 증감(rateColor/rateText) +
 * 미니 스파크라인 6종. 증감 색은 한국식 시세 관례(상승=gain/빨강, 하락=loss/파랑)를
 * 그대로 따르는 lib/finance/rate.ts 시맨틱 토큰만 사용한다(#33).
 */
export function KpiCardGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {KPIS.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  )
}
