import type { Metadata } from "next"
import Link from "next/link"
import { EyeIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityHeatmap } from "@/components/patterns/dataviz/activity-heatmap"
import { rateColor, rateText } from "@/lib/finance/rate"
import { WATCHLIST, watchlistActivityWeeks } from "@/lib/templates/trading-data"

export const metadata: Metadata = {
  title: "관심종목 · Trading Dashboard",
}

/** #27 관심종목 — 시세/등락(gain·loss 토큰) 리스트 + 알림 활동 히트맵. */
export default function TradingWatchlistPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card>
        <CardHeader className="flex-row items-center gap-2 pb-2">
          <EyeIcon size={16} className="text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">관심종목 {WATCHLIST.length}건</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {WATCHLIST.map((item) => (
            <Link
              key={item.symbol}
              href={`/templates/trading/${item.symbol}`}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-secondary/40"
            >
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {item.market}
                  </Badge>
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {item.symbol} · {item.sector} · 거래량 {item.volume.toLocaleString()}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums">{item.currentPrice.toLocaleString()}원</p>
                <p className={`text-xs font-semibold tabular-nums ${rateColor(item.changePercent)}`}>
                  {rateText(item.changePercent)}%
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">관심종목 알림 활동</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <ActivityHeatmap
            weeks={watchlistActivityWeeks()}
            rangeLabel="최근 20주 활동"
            gridLabel="최근 20주 일별 활동 건수 히트맵"
          />
        </CardContent>
      </Card>
    </div>
  )
}
