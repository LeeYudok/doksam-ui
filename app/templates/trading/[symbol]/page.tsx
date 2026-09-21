import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/patterns/dataviz/sparkline"
import { ReturnCurveChart } from "@/components/patterns/dataviz/return-curve"
import { DivergingBar } from "@/components/patterns/dataviz/diverging-bar"
import { rateColor, rateText } from "@/lib/finance/rate"
import { getSymbolDetail, investorFlowFor, listSymbols, rangePosition } from "@/lib/templates/trading-data"

interface SymbolPageProps {
  params: Promise<{ symbol: string }>
}

export function generateStaticParams() {
  return listSymbols().map((symbol) => ({ symbol }))
}

export async function generateMetadata({ params }: Readonly<SymbolPageProps>): Promise<Metadata> {
  const { symbol } = await params
  const detail = getSymbolDetail(symbol)
  return { title: detail ? `${detail.name} · Trading Dashboard` : "종목상세 · Trading Dashboard" }
}

/** #27 종목상세 — 스파크라인 + 수익률 곡선 + 발산막대(수급) dataviz 조합. */
export default async function TradingSymbolPage({ params }: Readonly<SymbolPageProps>) {
  const { symbol } = await params
  const detail = getSymbolDetail(symbol)

  if (!detail) {
    notFound()
  }

  const gaugePosition = rangePosition(detail.currentPrice, detail.range52w)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card>
        <CardHeader className="flex-col items-start gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{detail.name}</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {detail.market}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {detail.symbol} · {detail.sector}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl font-bold tabular-nums sm:text-2xl">{detail.currentPrice.toLocaleString()}원</p>
            <p className={`text-sm font-semibold tabular-nums ${rateColor(detail.changePercent)}`}>
              {rateText(detail.changePercent)}%
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>PER {detail.per}</span>
            <span>PBR {detail.pbr}</span>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-secondary">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${gaugePosition}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>52주 최저 {detail.range52w.low.toLocaleString()}</span>
              <span>52주 최고 {detail.range52w.high.toLocaleString()}</span>
            </div>
          </div>
          <Sparkline values={detail.priceHistory} height={48} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">수익률 곡선</CardTitle>
        </CardHeader>
        <CardContent>
          <ReturnCurveChart points={detail.returnCurve} height={140} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">수급 동향</CardTitle>
        </CardHeader>
        <CardContent>
          <DivergingBar items={investorFlowFor(detail.symbol)} />
        </CardContent>
      </Card>
    </div>
  )
}
