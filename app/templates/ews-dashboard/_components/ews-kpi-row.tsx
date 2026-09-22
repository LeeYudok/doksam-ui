"use client"

import { MinusIcon, TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatWon } from "@/lib/finance/format-won"
import { rateColor, rateText } from "@/lib/finance/rate"
import { EWS_KPIS } from "@/lib/templates/ews-data"

/**
 * 상단 KPI 4장 — `stats` 패턴의 "압축 KPI 행"을 이 화면의 지표로 채운 것이다.
 * 새 파츠를 만들지 않는다: 카드 한 장의 구성(라벨 · 값 · 증감)은 패턴이 이미 정했고
 * 여기서 바뀌는 것은 지표 목록뿐이라 일회성 레이아웃으로 둔다.
 *
 * 증감은 색 하나로 말하지 않는다 — `rateColor` 의 gain/loss 색 위에 방향 아이콘과
 * 문구(`전일 대비 증가`)를 같이 싣는다.
 */
export function EwsKpiRow() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {EWS_KPIS.map((kpi) => {
        const value = kpi.valueWon === undefined ? kpi.value : formatWon(kpi.valueWon)
        const DirectionIcon = kpi.change > 0 ? TrendUpIcon : kpi.change < 0 ? TrendDownIcon : MinusIcon

        return (
          <Card key={kpi.key} size="sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tabular-nums">{value}</span>
              <span className={`flex items-center gap-1 text-xs font-medium tabular-nums ${rateColor(kpi.change)}`}>
                <DirectionIcon size={12} weight="bold" aria-hidden />
                {rateText(kpi.change)}%
                <span className="font-normal text-muted-foreground">{kpi.caption}</span>
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
