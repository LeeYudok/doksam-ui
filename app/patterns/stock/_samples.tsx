import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { StockQuoteCard } from "./_components/stock-quote-card"
import { MarketIndexList } from "./_components/market-index-list"
import { SignalList } from "./_components/signal-list"
import { CatalystAlerts } from "./_components/catalyst-alerts"
import { HoldingCardList } from "./_components/holding-card-list"
import { WatchlistGaugeGrid } from "./_components/watchlist-gauge-grid"
import { DailyTrackingTable } from "./_components/daily-tracking-table"
import { SimulationResult } from "./_components/simulation-result"

const QUOTE_CODE = `<Card>
  <CardHeader className="pb-2">
    <p className="text-sm font-semibold">{quote.name}</p>
    <p className="text-xs text-muted-foreground">{quote.code} · {quote.sector}</p>
  </CardHeader>
  <CardContent className="space-y-3">
    <span className="text-2xl font-bold tabular-nums">{quote.currentPrice.toLocaleString()}</span>
    <span className={rateColor(quote.changePercent)}>
      {rateSign(quote.priceChange)}{quote.priceChange} ({rateSign(quote.changePercent)}{quote.changePercent}%)
    </span>
    {/* 52주 범위 바 — currentPrice 위치를 low~high 사이 % 로 환산 */}
  </CardContent>
</Card>`

const MARKET_CODE = `{item.change > 0 ? (
  <TrendUpIcon size={16} weight="bold" className="text-destructive" />
) : (
  <TrendDownIcon size={16} weight="bold" className="text-chart-1" />
)}
<span className={rateColor(item.change)}>{rateSign(item.change)}{item.change}%</span>`

const SIGNAL_CODE = `<Badge variant={signal.verdictVariant}>{signal.verdictLabel}</Badge>
<div className="flex h-2 overflow-hidden rounded-full bg-secondary">
  <div className="bg-success" style={{ width: \`\${signal.buyPercent}%\` }} />
  <div className="bg-warning" style={{ width: \`\${signal.holdPercent}%\` }} />
  <div className="bg-destructive" style={{ width: \`\${signal.sellPercent}%\` }} />
</div>`

const CATALYST_CODE = `function DirectionIcon({ dir }: { dir: "bullish" | "bearish" | "neutral" }) {
  if (dir === "bullish") return <ArrowUpIcon className="text-destructive" />
  if (dir === "bearish") return <ArrowDownIcon className="text-chart-1" />
  return <MinusIcon className="text-muted-foreground" />
}
// 강도 바: >=70 destructive, >=40 warning, else muted-foreground
// 센티먼트 배지: 긍정=default, 부정=destructive, 중립=secondary`

const HOLDING_CODE = `<Card className="border-primary/30 bg-primary/5">
  <span className="tabular-nums">{h.currentPrice.toLocaleString()}</span>
  <span className={rateColor(h.returnRate)}>{rateText(h.returnRate, 1)}%</span>
  <span className="text-muted-foreground">매수 {h.buyPrice.toLocaleString()}원</span>
  <Badge variant={h.buyRatio >= 60 ? "destructive" : "secondary"}>매수비 {h.buyRatio}%</Badge>
</Card>`

const WATCHLIST_CODE = `<Progress value={item.gaugeValue} className="h-1.5" />
<p className={item.causeTone === "success" ? "text-success" : "text-destructive"}>
  {item.causeLabel} · {item.causeDescription}
</p>`

const TRACKING_CODE = `<TableCell className={rateColor(rate)}>{rateSign(rate)}{rate.toFixed(1)}%</TableCell>
<Badge variant={catalystVariant(row.catalyst)}>{row.catalyst}</Badge>
{/* 소스 아이콘: news=warning, youtube=destructive, report=chart-1 */}`

const SIMULATION_CODE = `const chartConfig = { value: { label: "포트폴리오 가치", color: "var(--chart-1)" } } satisfies ChartConfig

<ChartContainer config={chartConfig} className="max-h-48 w-full">
  <LineChart data={PORTFOLIO_VALUE}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>`

export const STOCK_SAMPLES: PatternSampleData[] = [
  {
    num: 25,
    title: "종목 카드",
    description: "시세 + 등락 + PER/PBR + 52주 범위를 한 카드에 담은 시세 스냅샷.",
    demo: <StockQuoteCard />,
    code: QUOTE_CODE,
    notes: [
        "등락 색상은 rateColor() 유틸로 계산 — 상승 text-destructive / 하락 text-chart-1 / 보합 text-muted-foreground.",
        "52주 범위 바는 (currentPrice - low) / (high - low) 로 위치를 계산해 primary 색 막대로 표시.",
        "가격·비율은 항상 tabular-nums 로 자릿수를 정렬한다.",
    ],
  },
  {
    num: 26,
    title: "시장 방향",
    description: "선물/지수 스냅샷 — 상승/하락 방향 아이콘 + 색상.",
    demo: <MarketIndexList />,
    code: MARKET_CODE,
    notes: [
        "TrendUpIcon(상승) / TrendDownIcon(하락) 조합으로 방향을 즉시 인지 가능하게 한다.",
        "보합(0%)은 별도 아이콘 없이 text-muted-foreground 로만 표시한다.",
    ],
  },
  {
    num: 27,
    title: "매매 시그널",
    description: "verdict 배지(강력매수~강력매도) + 매수/보유/매도 비중 점수 바.",
    demo: <SignalList />,
    code: SIGNAL_CODE,
    notes: [
        "verdict 배지 매핑: 강력매수·매수=default, 보유=secondary, 매도·강력매도=destructive.",
        "점수 바는 매매 판단(신호) 색상이라 등락 색상과 별개로 success(매수)/warning(보유)/destructive(매도) 토큰을 쓴다.",
    ],
  },
  {
    num: 28,
    title: "재료 알림 + 센티먼트",
    description: "방향(호재/악재/중립) + 강도 바 + 감성 배지.",
    demo: <CatalystAlerts />,
    code: CATALYST_CODE,
    notes: [
        "방향 아이콘: bullish=ArrowUpIcon(destructive), bearish=ArrowDownIcon(chart-1), neutral=MinusIcon(muted).",
        "강도 바 임계값: 70 이상 destructive, 40 이상 warning, 그 외 muted-foreground.",
    ],
  },
  {
    num: 29,
    title: "보유 종목 카드",
    description: "현재가 + 수익률 + 매수가 + 매수비 배지 + 추적 액션을 담은 포트폴리오 보유 카드.",
    demo: <HoldingCardList />,
    code: HOLDING_CODE,
    notes: [
        "수익률 색상은 rateColor()/rateText() 유틸로 다른 섹션과 통일한다.",
        "매수비 배지는 임계값(60%) 이상이면 destructive, 미만이면 secondary.",
        "카드 강조 테두리는 팔레트색(indigo 등) 하드코딩 대신 border-primary/30 · bg-primary/5 틴트를 쓴다.",
    ],
  },
  {
    num: 31,
    title: "워치리스트 게이지",
    description: "게이지(Progress) + 원인 태그 + 활성/만료 상태.",
    demo: <WatchlistGaugeGrid />,
    code: WATCHLIST_CODE,
    notes: [
        "게이지는 components/ui/progress 를 그대로 사용 — 별도 커스텀 게이지 컴포넌트를 만들지 않는다.",
        "원인(cause) 톤은 도메인 의미(호재/악재)에 따라 success/destructive 중 선택해 직접 지정한다.",
    ],
  },
  {
    num: 30,
    title: "일별 추적 테이블",
    description: "D+1~D+5 등락률 + 재료 배지 + 소스 아이콘.",
    demo: <DailyTrackingTable />,
    code: TRACKING_CODE,
    notes: [
        "등락률 셀은 rateColor() 로 통일해 다른 섹션과 색상 규칙을 일치시킨다.",
        "재료 배지: 활성/강화=default, 약화=secondary, 소멸=destructive.",
    ],
  },
  {
    num: 32,
    title: "시뮬레이션 결과",
    description: "요약 카드 4개 + 포트폴리오 가치 추이 차트 + 거래 내역 테이블.",
    demo: <SimulationResult />,
    code: SIMULATION_CODE,
    notes: [
        "차트 시리즈 색상은 chart-1~5 토큰만 사용하고 hex를 하드코딩하지 않는다.",
        "recharts 는 브라우저 API(ResizeObserver)에 의존하므로 차트 부분만 별도 \"use client\" 파일로 분리한다.",
    ],
  },
]
