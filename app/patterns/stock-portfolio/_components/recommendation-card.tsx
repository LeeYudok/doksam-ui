"use client"

import { TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { rateColor, rateText } from "@/lib/finance/rate"
import { cn } from "@/lib/utils"

import type { Recommendation } from "../_data/portfolio-data"

/** 시장 표기 — KOSDAQ 은 Q(warning), 그 외 K(chart-1). */
const MARKET_MARK: Record<"kosdaq" | "other", { letter: string; className: string }> = {
  kosdaq: { letter: "Q", className: "text-warning" },
  other: { letter: "K", className: "text-chart-1" },
}

/** 확신도 게이지 색 — 60↑ success / 40↑ warning / 그 외 destructive. */
function convictionBarClass(conviction: number): string {
  if (conviction >= 60) return "bg-success"
  if (conviction >= 40) return "bg-warning"
  return "bg-destructive"
}

/** 상단: 시장 마크 + 종목명 + 배지들 + 등급 + 확신도. */
function RecommendationHeader({ item }: Readonly<{ item: Recommendation }>) {
  const mark = MARKET_MARK[item.market === "KOSDAQ" ? "kosdaq" : "other"]

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("shrink-0 text-[9px] font-bold", mark.className)}>{mark.letter}</span>
      <span className="truncate text-sm font-semibold">{item.stockName}</span>
      {item.isNxt ? (
        <Badge variant="outline" className="h-4 shrink-0 border-chart-4/40 px-1 text-[9px] text-chart-4">
          NXT
        </Badge>
      ) : null}
      {item.sectorName ? (
        <Badge variant="outline" className="h-4 shrink-0 gap-0.5 px-1 text-[10px] text-muted-foreground">
          <TrendUpIcon aria-hidden />
          {item.sectorName}
        </Badge>
      ) : null}
      {item.isPolicySector ? (
        <Badge variant="outline" className="h-4 shrink-0 border-chart-1/40 px-1 text-[10px] text-chart-1">
          정책
        </Badge>
      ) : null}
      <GradeBadge grade={item.grade} />
      <span className="shrink-0 text-xs text-muted-foreground">{item.conviction}%</span>
    </div>
  )
}

/** 등급 배지 — buy 는 ★매수(success), 그 외는 ▶관심(warning). */
function GradeBadge({ grade }: Readonly<{ grade: Recommendation["grade"] }>) {
  if (grade === "buy") {
    return <Badge className="ml-auto shrink-0 bg-success text-primary-foreground">★매수</Badge>
  }
  return (
    <Badge variant="outline" className="ml-auto shrink-0 border-warning/40 bg-warning/15 text-warning">
      ▶관심
    </Badge>
  )
}

/** 중간: 현재가 + 등락률 + 거래대금 + 비중. */
function RecommendationStats({ item }: Readonly<{ item: Recommendation }>) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="font-medium tabular-nums">{item.currentPrice.toLocaleString()}원</span>
      <span className={cn("font-medium tabular-nums", rateColor(item.changeRate))}>{rateText(item.changeRate)}%</span>
      <span className="text-muted-foreground">{item.tradeAmountBil.toFixed(0)}억</span>
      {item.positionRatio > 0 ? (
        <span className="font-medium text-success">
          비중 {Math.round(item.positionRatio * 100)}% · {item.investAmount.toLocaleString()}원
        </span>
      ) : null}
    </div>
  )
}

/** 뉴스/유튜브/증권사 카운트 — 하나라도 있을 때만 렌더한다. */
function RecommendationCounts({ item }: Readonly<{ item: Recommendation }>) {
  if (item.newsCount <= 0 && item.youtubeCount <= 0 && item.reportCount <= 0) return null
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      {item.newsCount > 0 ? <span>뉴스 {item.newsCount}</span> : null}
      {item.youtubeCount > 0 ? <span>유튜브 {item.youtubeCount}</span> : null}
      {item.reportCount > 0 ? <span>증권사 {item.reportCount}</span> : null}
    </div>
  )
}

/**
 * 추천 종목 카드 — 등급/확신도/현재가/등락률/거래대금/한줄평.
 * dok3node customs/recommendation-card.tsx 이식 — 시장 표기(orange/blue),
 * 등급 배지(green/yellow), 확신도 게이지(green/yellow/red)의 팔레트 하드코딩을
 * warning/chart-1/success/destructive 시맨틱 토큰으로 치환.
 */
export function RecommendationCard({ item }: Readonly<{ item: Recommendation }>) {
  const isZeroWeight = item.positionRatio === 0

  return (
    <Card className={cn("cursor-pointer py-0 transition-colors hover:bg-accent/50", isZeroWeight && "opacity-60")}>
      <CardContent className="flex flex-col gap-2 p-3">
        <RecommendationHeader item={item} />

        {/* 확신도 게이지 바 — 60↑ success / 40↑ warning / 그 외 destructive */}
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-[width]", convictionBarClass(item.conviction))}
            style={{ width: `${Math.min(item.conviction, 100)}%` }}
          />
        </div>

        <RecommendationStats item={item} />
        <RecommendationCounts item={item} />

        <p className="line-clamp-2 text-xs text-muted-foreground">{item.oneLiner}</p>
      </CardContent>
    </Card>
  )
}
