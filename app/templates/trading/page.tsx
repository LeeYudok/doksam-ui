import type { Metadata } from "next"
import { WalletIcon, ChartLineUpIcon, PercentIcon } from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReturnCurveChart } from "@/components/patterns/dataviz/return-curve"
import { formatWon } from "@/lib/finance/format-won"
import { rateColor, rateText } from "@/lib/finance/rate"
import { getPortfolioSummary, HOLDINGS, PORTFOLIO_RETURN_CURVE } from "@/lib/templates/trading-data"
import { HoldingsTable } from "./_components/holdings-table"

export const metadata: Metadata = {
  title: "대시보드 · Trading Dashboard",
}

/** #27 트레이딩 대시보드 — 포트폴리오 요약 + 보유종목 테이블 + 수익률 곡선. */
export default function TradingDashboardPage() {
  const summary = getPortfolioSummary(HOLDINGS)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">평가금액</CardTitle>
            <WalletIcon size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums sm:text-2xl">{formatWon(summary.totalValue)}</p>
            <p className="text-xs text-muted-foreground">매입금액 {formatWon(summary.totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">평가손익</CardTitle>
            <ChartLineUpIcon size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold tabular-nums sm:text-2xl ${rateColor(summary.totalGain)}`}>
              {summary.totalGain >= 0 ? "+" : ""}
              {formatWon(summary.totalGain)}
            </p>
            <p className="text-xs text-muted-foreground">보유 {HOLDINGS.length}종목</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">수익률</CardTitle>
            <PercentIcon size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold tabular-nums sm:text-2xl ${rateColor(summary.totalGainPercent)}`}>
              {rateText(summary.totalGainPercent)}%
            </p>
            <p className="text-xs text-muted-foreground">최근 10거래일 누적</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">수익률 곡선</CardTitle>
        </CardHeader>
        <CardContent>
          <ReturnCurveChart points={PORTFOLIO_RETURN_CURVE} height={140} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">보유 종목</CardTitle>
        </CardHeader>
        <CardContent>
          <HoldingsTable holdings={HOLDINGS} />
        </CardContent>
      </Card>
    </div>
  )
}
