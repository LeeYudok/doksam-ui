import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { BitGrid } from "./_components/bit-grid"
import { OptimRecommendationCard } from "./_components/optim-recommendation-card"
import { PortfolioStockCard } from "./_components/portfolio-stock-card"
import { RecommendationCard } from "./_components/recommendation-card"
import { StockNewsPanel } from "./_components/stock-news-panel"
import {
  ACTIVE_BITS,
  MODULE_IDS,
  MODULE_LABELS,
  OPTIM_RECOMMENDATION,
  PORTFOLIO_STOCKS,
  RECOMMENDATIONS,
  STOCK_NEWS,
} from "./_data/portfolio-data"

const PORTFOLIO_CODE = `<MiniChart prices={stock.prices} targetBuyPrice={…} takeProfitPrice={…} stopLossPrice={…} showBollinger />
<Badge className={signal.tone === "success" ? "border-success/30 text-success" : …}>{signal.label}</Badge>
<span className={rateColor(stock.changeRate)}>{rateText(stock.changeRate)}%</span>
{/* ⋯ 메뉴: Popover + ghost Button(수정/추적/삭제) */}`

const RECOMMENDATION_CODE = `<div className="h-1.5 w-full rounded-full bg-muted">
  <div className={conviction >= 60 ? "bg-success" : conviction >= 40 ? "bg-warning" : "bg-destructive"}
    style={{ width: \`\${conviction}%\` }} />
</div>
{grade === "buy"
  ? <Badge className="bg-success text-primary-foreground">★매수</Badge>
  : <Badge variant="outline" className="border-warning/40 bg-warning/15 text-warning">▶관심</Badge>}`

const OPTIM_CODE = `<PriceRow label="익절가" color="text-success" value="41,200원 (보유의 50% 매도)" />
<PriceRow label="손절가" color="text-destructive" value="36,700원 (즉시 100%)" />
<ReturnLine label="D+1" ret={1.84} hit={1} />  {/* 적중=success 배지 */}
<Button onClick={() => setOpenBits(v => !v)}>왜 추천됐는가? ({activeBits.length}개 비트)</Button>`

const BITGRID_CODE = `const GROUP_ON = { F: "bg-chart-1", S: "bg-success", X: "bg-destructive", R: "bg-chart-4" }
<BitGrid moduleIds={MODULE_IDS} activeBits={ACTIVE_BITS} labels={LABELS}
  orientation="horizontal" showLabels />  {/* 셀 호버 → ID/설명 툴팁 */}`

const NEWS_CODE = `<SentimentBadge label="positive" />  {/* border-success/50 text-success */}
<div className="line-clamp-2 font-medium">{n.title}</div>
<a aria-label="원문 열기"><ArrowSquareOutIcon /></a>`

export const STOCK_PORTFOLIO_SAMPLES: PatternSampleData[] = [
  {
    num: 51,
    title: "포트폴리오 종목 카드",
    description: "미니차트(목표가 수평선+볼린저) + 시그널 배지 + 매수정보 + ⋯ 액션 메뉴.",
    demo: (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {PORTFOLIO_STOCKS.map((s) => (
      <PortfolioStockCard key={s.code} stock={s} />
      ))}
      </div>
    ),
    code: PORTFOLIO_CODE,
    notes: [
        "미니차트 수평선 색: 매수=var(--success), 익절=var(--gain), 손절=var(--loss) — SVG 속성에서도 CSS 토큰으로 해소한다.",
        "시그널 배지 톤: danger=destructive, warning=warning, success=success. 임박 시그널은 animate-pulse.",
        "실시간 훅 대신 스냅샷 props 를 받는다 — 실제 연동 시 tickerMap 값을 매핑해 주입.",
    ],
  },
  {
    num: 52,
    title: "추천 종목 카드",
    description: "등급(★매수/▶관심) + 확신도 게이지 + 등락률 + 소스 카운트 + 한줄평.",
    demo: (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {RECOMMENDATIONS.map((r) => (
      <RecommendationCard key={r.stockName} item={r} />
      ))}
      </div>
    ),
    code: RECOMMENDATION_CODE,
    notes: [
        "확신도 게이지 임계값: 60 이상 success, 40 이상 warning, 미만 destructive.",
        "시장 표기: KOSDAQ=Q(warning), KOSPI=K(chart-1). NXT·정책 배지는 chart-4·chart-1 틴트.",
        "비중 0(미편입) 종목은 카드 전체 opacity-60 으로 가라앉힌다.",
    ],
  },
  {
    num: 53,
    title: "옵티마이저 추천 카드",
    description: "가격 5종(매수범위·익절·손절·트레일링·안전망) + D+1/3/5 추적 적중 배지 + 활성 비트 펼침.",
    demo: (
      <div className="max-w-md">
      <OptimRecommendationCard rec={OPTIM_RECOMMENDATION} />
      </div>
    ),
    code: OPTIM_CODE,
    notes: [
        "가격 행 색: 익절=text-success, 손절=text-destructive, 트레일링=text-warning, 안전망=muted.",
        "적중 배지: 적중=success 배경, 미적중=destructive, 집계전=outline.",
        "비트 펼침은 로컬 state 토글 — 펼치면 BitGrid(vertical) 로 근거 모듈을 나열한다.",
    ],
  },
  {
    num: 54,
    title: "비트 격자",
    description: "모듈 비트 ON/OFF 격자 — 그룹(F/S/X/R)별 색 + 경계 간격 + 호버 툴팁, 수평/수직 두 방향.",
    demo: (
      <div className="flex flex-col gap-4">
      <BitGrid moduleIds={MODULE_IDS} activeBits={ACTIVE_BITS} labels={MODULE_LABELS} showLabels size="lg" />
      <BitGrid
      moduleIds={MODULE_IDS.slice(0, 7)}
      activeBits={ACTIVE_BITS}
      labels={MODULE_LABELS}
      orientation="vertical"
      className="max-w-md"
      />
      </div>
    ),
    code: BITGRID_CODE,
    notes: [
        "그룹 색 매핑: F(필터)=chart-1, S(매수)=success, X(매도)=destructive, R(회전)=chart-4.",
        "수평 방향은 여러 시나리오 비교용, 수직 방향은 1비트 1행이라 근거 읽기용.",
        "OFF 셀은 같은 그룹색의 /15 틴트 + 보더로 표시해 그룹 소속을 유지한다.",
    ],
  },
  {
    num: 55,
    title: "종목 뉴스 패널",
    description: "종목 펼침 시 노출되는 뉴스 리스트 — 날짜·소스·감성 배지 + 제목/한줄평 + 원문 링크.",
    demo: (
      <div className="max-w-xl rounded-lg border bg-muted/30">
      <StockNewsPanel items={STOCK_NEWS} periodLabel="2026-07-21 이전 30일" />
      </div>
    ),
    code: NEWS_CODE,
    notes: [
        "감성 배지: 긍정=success 톤, 부정=destructive 톤, 중립=기본 outline.",
        "제목·한줄평은 line-clamp-2 로 잘라 리스트 높이를 일정하게 유지한다.",
        "API 로딩·빈 상태는 이 컴포넌트 밖(state 패턴)에서 처리하고, 여기는 items 만 받는다.",
    ],
  },
]
