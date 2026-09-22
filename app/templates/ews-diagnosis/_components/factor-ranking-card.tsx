"use client"

import { RankingIcon } from "@phosphor-icons/react/dist/ssr"

import { ContributionMeter } from "@/components/contribution-meter"
import { SectionPanelHeader } from "@/components/section-panel-header"
import { Card, CardContent } from "@/components/ui/card"
import type { EwsDiagnosisFactor } from "@/lib/templates/ews-data"

/**
 * 경보 기여 변수 랭킹 — `contribution-meter`(#84) 를 목록으로 반복하는 자리다.
 *
 * 게이지·퍼센트·감사코드·방향 아이콘은 전부 파츠가 소유하고, 이 화면이 더하는
 * 것은 순위 번호와 변수명·관측값 두 줄뿐이다. 기여 방향을 색으로만 구분하지
 * 않도록 `direction` 을 그대로 넘겨 파츠가 아이콘과 sr-only 문구를 싣게 한다.
 */
export function FactorRankingCard({
  factors,
  scoreLabel,
  modelLabel,
}: Readonly<{ factors: EwsDiagnosisFactor[]; scoreLabel: string; modelLabel: string }>) {
  return (
    <Card className="min-w-0">
      <SectionPanelHeader
        icon={RankingIcon}
        title="경보 기여 변수"
        description={modelLabel}
        meta={scoreLabel}
      />
      <CardContent>
        <ol className="flex flex-col gap-4">
          {factors.map((factor, index) => (
            <li key={factor.key} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {index + 1}위
                </span>
                <span className="min-w-0 truncate text-sm font-medium">{factor.label}</span>
              </div>
              <ContributionMeter
                percent={factor.percent}
                direction={factor.direction}
                code={factor.code}
                copyable
              />
              <p className="text-xs text-muted-foreground">{factor.note}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
