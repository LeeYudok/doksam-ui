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
    <Card size="sm" className="w-40 shrink-0 snap-start">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground">
            <Icon size={13} className="shrink-0" />
            {item.label}
          </span>
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium whitespace-nowrap text-muted-foreground">
            {item.group}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="whitespace-nowrap text-lg font-semibold tabular-nums">{formatValue(item)}</span>
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
 * 국제금 등 주요 지표를 미니 스파크라인 + 현재값 + 등락률 카드로 가로 스크롤 배열한다.
 * 카드 폭을 고정(w-40)해 좁은 뷰포트에서도 지표명·값이 줄바꿈/잘림 없이 나오게 하고,
 * 넘치는 만큼은 페이지가 아니라 스트립 내부에서만 스크롤되게 한다(#114).
 * 등락 색은 한국식 관례(상승=적=gain, 하락=청=loss) 시맨틱 토큰만 사용한다.
 */
export function MarketStrip() {
  return (
    <section aria-label="시장 지표" className="flex min-w-0 flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">시장 지표</h2>
      <div className="scrollbar-thin flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-px-1 pb-1">
        {MARKET_INDICES.map((item) => (
          <MarketIndexCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
