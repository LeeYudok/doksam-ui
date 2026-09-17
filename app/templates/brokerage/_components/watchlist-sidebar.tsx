"use client"

import { useState } from "react"
import { HeartIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { rateColor, rateText } from "@/lib/finance/rate"
import { cn } from "@/lib/utils"
import { WATCHLIST_BY_TAB, WATCHLIST_TABS, type WatchlistStock } from "@/app/templates/brokerage/_data/watchlist"

/** 종목명 해시 기반 로고 이니셜 배경 색 — chart-1~5 시맨틱 토큰을 순환한다. */
function logoColorClass(name: string): string {
  const palette = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i)) % palette.length
  return palette[hash]
}

function StockLogo({ name }: Readonly<{ name: string }>) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
        logoColorClass(name)
      )}
    >
      {name.slice(0, 1)}
    </span>
  )
}

function WatchlistRow({ stock, rank }: Readonly<{ stock: WatchlistStock; rank: number }>) {
  const [liked, setLiked] = useState(stock.liked)

  return (
    <li className="flex items-center gap-2 py-2">
      <span className="w-4 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">{rank}</span>
      <StockLogo name={stock.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{stock.name}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{stock.price.toLocaleString()}원</span>
      </div>
      <span className={cn("shrink-0 text-xs font-semibold tabular-nums", rateColor(stock.changePercent))}>
        {rateText(stock.changePercent)}%
      </span>
      <button
        type="button"
        aria-label={liked ? `${stock.name} 관심종목 해제` : `${stock.name} 관심종목 추가`}
        aria-pressed={liked}
        onClick={() => setLiked((prev) => !prev)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-gain"
      >
        <HeartIcon size={16} weight={liked ? "fill" : "regular"} className={liked ? "text-gain" : undefined} />
      </button>
    </li>
  )
}

function WatchlistList({ stocks }: Readonly<{ stocks: WatchlistStock[] }>) {
  return (
    <ol className="flex flex-col divide-y divide-border">
      {stocks.slice(0, 10).map((stock, index) => (
        <WatchlistRow key={stock.symbol} stock={stock} rank={index + 1} />
      ))}
    </ol>
  )
}

/** 관심종목 사이드바(C영역) — 내투자/관심/최근본/실시간 탭 + TOP 10 종목 리스트 + 추가하기 버튼. */
export function WatchlistSidebar() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">관심종목</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            TOP 10
          </Badge>
        </div>
        <Tabs defaultValue={WATCHLIST_TABS[0].id}>
          <TabsList className="w-full">
            {WATCHLIST_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex-1 text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {WATCHLIST_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <WatchlistList stocks={WATCHLIST_BY_TAB[tab.id]} />
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" className="w-full gap-1.5">
          <PlusIcon size={14} />
          종목 추가하기
        </Button>
      </CardContent>
    </Card>
  )
}
