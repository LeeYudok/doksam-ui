"use client"

import { MinusIcon, TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatWon } from "@/lib/finance/format-won"
import { EWS_KPIS } from "@/lib/templates/ews-data"
import { cn } from "@/lib/utils"

/**
 * 상단 KPI 4장 — `stats` 패턴의 "압축 KPI 행"을 이 화면의 지표로 채운 것이다.
 * 새 파츠를 만들지 않는다: 카드 한 장의 구성(라벨 · 값 · 증감)은 패턴이 이미 정했고
 * 여기서 바뀌는 것은 지표 목록뿐이라 일회성 레이아웃으로 둔다.
 *
 * 증감 색은 부호가 아니라 각 지표의 `betterWhen` 으로 정한다 — 경보 등급 차주가
 * 늘어난 것은 악화지 이익이 아니므로 시세 등락 색(`--gain`=빨강=이익,
 * `lib/finance/rate.ts`)을 쓰면 의미가 뒤집힌다. `metric-comparison-table` 과 같은
 * 규칙으로 개선은 `--success`, 악화는 `--destructive`, 변동 없음은 muted 다.
 *
 * 색 하나에 의미를 몰아두지 않는다 — 방향 아이콘 · 부호 붙은 수치 · 보조 문구
 * (`caption`) · 스크린리더용 sr-only 판정 문구를 두 번째 채널로 같이 싣는다.
 */
export function EwsKpiRow() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {EWS_KPIS.map((kpi) => {
        const value = kpi.valueWon === undefined ? kpi.value : formatWon(kpi.valueWon)

        const improved =
          kpi.change !== 0 &&
          ((kpi.betterWhen === "higher" && kpi.change > 0) || (kpi.betterWhen === "lower" && kpi.change < 0))
        const worsened =
          kpi.change !== 0 &&
          ((kpi.betterWhen === "higher" && kpi.change < 0) || (kpi.betterWhen === "lower" && kpi.change > 0))

        const DirectionIcon = improved ? TrendUpIcon : worsened ? TrendDownIcon : MinusIcon
        const directionClass = improved ? "text-success" : worsened ? "text-destructive" : "text-muted-foreground"
        const directionLabel = improved ? "개선" : worsened ? "악화" : "변동 없음"
        const changeText = `${kpi.change > 0 ? "+" : ""}${kpi.change.toFixed(1)}%`

        return (
          <Card key={kpi.key} size="sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tabular-nums">{value}</span>
              <span
                data-direction={improved ? "improved" : worsened ? "worsened" : "unchanged"}
                className={cn("flex items-center gap-1 text-xs font-medium tabular-nums", directionClass)}
              >
                <DirectionIcon size={12} weight="bold" aria-hidden />
                <span className="sr-only">{directionLabel}</span>
                {changeText}
                <span className="font-normal text-muted-foreground">{kpi.caption}</span>
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
