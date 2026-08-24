"use client"

import {
  CrosshairIcon,
  CrosshairSimpleIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { rateColor, rateText } from "@/lib/finance/rate"
import { cn } from "@/lib/utils"

import type { PortfolioStock } from "../_data/portfolio-data"
import { MiniChart } from "./mini-chart"

/** 시그널 톤 → 배지 색 토큰 매핑(danger=destructive, warning=warning, success=success). */
const SIGNAL_TONE: Record<"danger" | "warning" | "success", string> = {
  danger: "border-destructive/30 text-destructive",
  warning: "border-warning/30 text-warning",
  success: "border-success/30 text-success",
}

/** ⋯ 액션 메뉴 — 매수정보 수정 / 추적 토글 / 종목 삭제. */
function StockActionsMenu({ isTracking }: Readonly<{ isTracking: boolean }>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground" aria-label="종목 액션 메뉴">
          <DotsThreeIcon weight="bold" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-1">
        <Button size="sm" variant="ghost" className="h-8 w-full justify-start gap-2 px-3 text-xs">
          <PencilSimpleIcon aria-hidden />
          매수정보 수정
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={cn("h-8 w-full justify-start gap-2 px-3 text-xs", isTracking ? "text-success" : "text-muted-foreground")}
        >
          {isTracking ? <CrosshairIcon aria-hidden /> : <CrosshairSimpleIcon aria-hidden />}
          {isTracking ? "추적 중지" : "추적 시작"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-full justify-start gap-2 px-3 text-xs text-destructive hover:text-destructive"
        >
          <TrashIcon aria-hidden />
          종목 삭제
        </Button>
      </PopoverContent>
    </Popover>
  )
}

/** 헤더 좌측 — 종목명 + 코드 + 시그널 배지. */
function StockIdentity({ stock }: Readonly<{ stock: PortfolioStock }>) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold">{stock.name}</span>
      <button
        type="button"
        className="cursor-pointer text-[9px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {stock.code}
      </button>
      {stock.signal ? (
        <Badge
          variant="outline"
          className={cn("px-1.5 py-0 text-[9px] font-bold", SIGNAL_TONE[stock.signal.tone], stock.signal.pulse && "animate-pulse")}
        >
          {stock.signal.label}
        </Badge>
      ) : null}
    </div>
  )
}

/** 헤더 우측 — 추적/마켓/NXT 배지 + ⋯ 메뉴. */
function StockStatusBadges({ stock }: Readonly<{ stock: PortfolioStock }>) {
  return (
    <div className="flex items-center gap-1">
      {stock.isTracking ? (
        <Badge variant="outline" className="border-success/30 px-1.5 py-0 text-[9px] text-success">
          추적중
        </Badge>
      ) : null}
      <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
        {stock.market}
      </Badge>
      {stock.isNxt ? (
        <Badge variant="outline" className="border-chart-4/30 px-1.5 py-0 text-[9px] text-chart-4">
          NXT
        </Badge>
      ) : null}
      <StockActionsMenu isTracking={stock.isTracking} />
    </div>
  )
}

/** 섹터 + 뉴스 건수. */
function StockSectorRow({ stock }: Readonly<{ stock: PortfolioStock }>) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <span className="text-[9px] text-muted-foreground">{stock.sector}</span>
      {stock.newsCount > 0 ? (
        <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
          뉴스 {stock.newsCount}
        </Badge>
      ) : null}
    </div>
  )
}

/** 현재가 + 등락률 + 매수비. */
function StockPriceRow({ stock }: Readonly<{ stock: PortfolioStock }>) {
  return (
    <div className="mb-1.5 flex items-baseline gap-1.5">
      <span className={cn("text-base font-black tabular-nums", rateColor(stock.changeRate))}>
        {stock.price.toLocaleString()}
      </span>
      <span className="text-[10px] text-muted-foreground">원</span>
      {stock.changeRate !== 0 ? (
        <span className={cn("text-xs font-semibold tabular-nums", rateColor(stock.changeRate))}>
          {rateText(stock.changeRate)}%
        </span>
      ) : null}
      {stock.buyRatio !== null ? (
        <Badge variant={stock.buyRatio >= 60 ? "destructive" : "secondary"} className="ml-auto px-1.5 py-0 text-[9px]">
          매수비 {stock.buyRatio}%
        </Badge>
      ) : null}
    </div>
  )
}

/** 매수 정보 + 수익률 — 매수단가가 있을 때만 렌더한다. */
function StockBuyInfoRow({ stock }: Readonly<{ stock: PortfolioStock }>) {
  if (stock.buyPrice <= 0) return null
  return (
    <div className="mt-2 flex items-center justify-between text-[10px]">
      <span className="text-muted-foreground">
        매수 {stock.buyPrice.toLocaleString()}원 × {stock.buyQuantity}주
      </span>
      {stock.returnRate !== 0 ? (
        <span className={cn("font-semibold tabular-nums", rateColor(stock.returnRate))}>
          {rateText(stock.returnRate, 1)}% ({stock.returnAmount > 0 ? "+" : ""}
          {stock.returnAmount.toLocaleString()}원)
        </span>
      ) : null}
    </div>
  )
}

/**
 * 포트폴리오 종목 카드 — 미니차트 + 시그널 배지 + 매수정보 + ⋯ 액션 메뉴.
 * dok3node customs/portfolio-stock-card.tsx 이식 — 실시간 훅(tickerMap)을 정적
 * 스냅샷 props 로, emerald/violet 하드코딩을 success/chart-4 토큰으로 치환.
 */
export function PortfolioStockCard({ stock }: Readonly<{ stock: PortfolioStock }>) {
  return (
    <Card className="py-0 transition-shadow hover:shadow-md">
      <CardContent className="px-3 py-2.5">
        {/* 헤더: 종목명 + 코드 + 시그널 배지 + 추적/마켓/NXT + ⋯ 메뉴 */}
        <div className="mb-1.5 flex items-center justify-between">
          <StockIdentity stock={stock} />
          <StockStatusBadges stock={stock} />
        </div>

        <StockSectorRow stock={stock} />
        <StockPriceRow stock={stock} />

        <MiniChart
          prices={stock.prices}
          targetBuyPrice={stock.targetBuyPrice}
          takeProfitPrice={stock.takeProfitPrice}
          stopLossPrice={stock.stopLossPrice}
          showBollinger
          height={80}
        />

        <StockBuyInfoRow stock={stock} />
      </CardContent>
    </Card>
  )
}
