import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/patterns/dataviz/sparkline"
import { rateColor, rateText } from "@/lib/finance/rate"
import { MARKET_INDICES, type MarketIndex } from "@/app/templates/brokerage/_data/market"

/** 100만 이상(비트코인 등)은 정수로, 그 외는 소수 둘째 자리까지 표기한다. */
function formatValue(item: MarketIndex): string {
  const isLarge = item.value >= 1_000_000
  return `${item.value.toLocaleString(undefined, { maximumFractionDigits: isLarge ? 0 : 2 })}${item.unit}`
}

function MarketIndexCard({ item }: Readonly<{ item: MarketIndex }>) {
  const colorClass = rateColor(item.changePercent)
  const Icon = item.icon

  return (
    <Card size="sm" className="min-w-0">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon size={13} />
            {item.label}
          </span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
            {item.group}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-lg font-semibold tabular-nums">{formatValue(item)}</span>
          <span className={`flex shrink-0 items-center gap-0.5 text-xs font-medium tabular-nums ${colorClass}`}>
            {item.changePercent > 0 && <TrendUpIcon size={11} weight="bold" />}
            {item.changePercent < 0 && <TrendDownIcon size={11} weight="bold" />}
            {rateText(item.changePercent)}%
          </span>
        </div>

        <Sparkline values={item.trend} height={28} className={colorClass} />
      </CardContent>
    </Card>
  )
}

/**
 * 시장 지표 스트립(#41-A) — 코스피·코스닥·나스닥·S&P500·VIX·달러환율·비트코인·
 * 국제금 등 주요 지표를 미니 스파크라인 + 현재값 + 등락률 카드로 그리드 배열한다.
 * 등락 색은 한국식 관례(상승=적=gain, 하락=청=loss) 시맨틱 토큰만 사용한다.
 */
export function MarketStrip() {
  return (
    <section aria-label="시장 지표" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">시장 지표</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8">
        {MARKET_INDICES.map((item) => (
          <MarketIndexCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
