"use client"

import { TrayArrowDownIcon } from "@phosphor-icons/react/dist/ssr"

import { SectionPanelHeader } from "@/components/section-panel-header"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { EwsCollectionItem } from "@/lib/templates/ews-data"

/**
 * 자료 수집 현황 — `section-panel-header`(#88) + `progress` 프리미티브 조합이다.
 *
 * 진척률을 게이지로만 보여 주지 않고 퍼센트 숫자와 상태 문구를 함께 싣는다.
 * 게이지 색은 프리미티브 기본값(primary)을 그대로 쓴다 — 여기서 말하는 것은
 * 위험 수준이 아니라 진행률이라 `--risk-*` 축을 끌어오면 뜻이 어긋난다.
 */
export function CollectionStatusCard({ items }: Readonly<{ items: EwsCollectionItem[] }>) {
  const completed = items.filter((item) => item.percent === 100).length

  return (
    <Card className="min-w-0">
      <SectionPanelHeader
        icon={TrayArrowDownIcon}
        title="자료 수집 현황"
        description="진단 확정에 필요한 추가 자료"
        meta={`${completed}/${items.length}건 완료`}
      />
      <CardContent>
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.key} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex min-w-0 items-baseline justify-between gap-2">
                <span className="min-w-0 truncate text-sm">{item.label}</span>
                <span className="shrink-0 text-xs font-medium tabular-nums">{item.percent}%</span>
              </div>
              <Progress value={item.percent} className="h-1.5" />
              <span className="text-xs text-muted-foreground">{item.status}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
