"use client"

import { ChartDonutIcon } from "@phosphor-icons/react/dist/ssr"
import { Cell, Pie, PieChart } from "recharts"

import { RiskGradeBadge } from "@/components/risk-grade-badge"
import { SectionPanelHeader } from "@/components/section-panel-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { EWS_GRADE_DISTRIBUTION, EWS_MONITORED_COUNT } from "@/lib/templates/ews-data"

const chartConfig = {
  count: { label: "차주 수" },
} satisfies ChartConfig

/**
 * 등급 분포 도넛 + 범례.
 *
 * 조각 색을 `--chart-1~5`(범주 팔레트)가 아니라 `--risk-*` 로 칠한다 — 등급은
 * 범주가 아니라 순서 있는 심각도라, 같은 화면의 표·배지와 색이 어긋나면 둘 중
 * 하나는 반드시 오독된다(`lib/risk-tokens.ts`).
 *
 * 도넛만으로는 등급 순서가 전달되지 않으므로 범례를 `RiskGradeBadge` 로 둔다 —
 * 등급 문구와 Tier 번호가 색 외 두 번째 채널이다.
 */
export function GradeDistributionCard() {
  return (
    <Card className="min-w-0">
      <SectionPanelHeader
        icon={ChartDonutIcon}
        title="등급 분포"
        description="모니터링 대상 차주의 조기경보 등급 구성"
        meta={`${EWS_MONITORED_COUNT.toLocaleString()}개사`}
        actions={
          <Button type="button" variant="ghost" size="sm">
            등급 기준 보기
          </Button>
        }
      />
      <CardContent className="flex flex-col items-center gap-4">
        <ChartContainer config={chartConfig} className="aspect-square h-[180px] w-full max-w-[180px]">
          <PieChart>
            <Pie
              data={EWS_GRADE_DISTRIBUTION}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius="82%"
              innerRadius="52%"
              paddingAngle={2}
            >
              {EWS_GRADE_DISTRIBUTION.map((slice) => (
                <Cell key={slice.level} fill={`var(--risk-${slice.level})`} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          </PieChart>
        </ChartContainer>

        <ul className="flex w-full flex-col gap-1.5">
          {EWS_GRADE_DISTRIBUTION.map((slice) => (
            <li key={slice.level} className="flex items-center justify-between gap-3">
              <RiskGradeBadge level={slice.level} label={slice.label} tier={slice.tier} />
              <span className="text-sm tabular-nums text-muted-foreground">
                {slice.count.toLocaleString()}개사
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
