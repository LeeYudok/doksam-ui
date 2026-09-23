import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { KpiCardGridDemo } from "@/components/patterns/stats/kpi-card-grid-demo"
import { KpiCompactRowDemo } from "@/components/patterns/stats/kpi-compact-row-demo"

export const STATS_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "KPI 카드 그리드",
    description: "값 + 전기 대비 증감 + 미니 스파크라인을 한 카드에 담은 지표 그리드 6종입니다.",
    demo: <KpiCardGridDemo />,
    code: `const colorClass = rateColor(kpi.change)   // change > 0 → text-gain, < 0 → text-loss, 0 → text-muted-foreground

<Card>
  <CardHeader className="pb-1">
    <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
  </CardHeader>
  <CardContent className="flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-2xl font-semibold tabular-nums">{formatWon(kpi.value)}</span>
      <span className={\`flex items-center gap-0.5 text-xs font-medium tabular-nums \${colorClass}\`}>
        {kpi.change > 0 && <TrendUpIcon size={12} weight="bold" />}
        {kpi.change < 0 && <TrendDownIcon size={12} weight="bold" />}
        {rateText(kpi.change)}%
      </span>
    </div>
    <Sparkline values={kpi.trend} height={32} />
  </CardContent>
</Card>`,
    notes: [
      "금액 지표는 formatWon(억/조 축약), 건수는 toLocaleString, 비율은 toFixed(1)+%로 값 종류별 표시 단위를 나눈다.",
      "증감 색은 항상 lib/finance/rate.ts의 rateColor/rateText로만 계산한다 — 한국식 관례대로 상승(gain)=빨강, 하락(loss)=파랑이며 하드코딩 색을 쓰지 않는다.",
      "미니 스파크라인은 components/patterns/dataviz의 Sparkline을 그대로 재사용해 카드 높이에 맞춰 32px로 눌러 쓴다.",
      "카드 그리드는 4~6개 지표 기준 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 이 기본값이다.",
    ],
  },
  {
    num: 2,
    title: "압축 KPI 행",
    description: "스파크라인 없이 라벨·값·증감만 한 줄로 배치하는 밀도 높은 변형입니다.",
    demo: <KpiCompactRowDemo />,
    code: `<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
  {kpis.map((kpi) => (
    <Card key={kpi.label} size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold tabular-nums">{kpi.value}</span>
          <span className={\`text-[11px] font-medium tabular-nums \${rateColor(kpi.change)}\`}>{rateText(kpi.change)}%</span>
        </div>
      </CardContent>
    </Card>
  ))}
</div>`,
    notes: [
      "지표 개수가 많거나 세로 공간이 좁은 운영 대시보드 상단에서는 카드 그리드 대신 이 압축 행을 쓴다.",
      "Card size='sm'으로 패딩을 줄여(--card-spacing) 4개 이상의 지표도 한 줄에 배치할 수 있다.",
      "0% 증감은 rateColor가 자동으로 text-muted-foreground를 반환해 상승/하락과 시각적으로 구분된다.",
    ],
  },
]
