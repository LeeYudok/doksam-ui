/**
 * 트레이딩 대시보드 템플릿(#27) 전용 데모 데이터 — 순수 데이터/함수 모듈.
 *
 * "use client" 없음 — 서버 컴포넌트(page.tsx)에서 바로 import 해 쓴다. React
 * 컴포넌트나 클라이언트 전용 값(훅 등)은 여기서 export 하지 않는다 — 그건
 * app/templates/trading/_components/ 쪽 클라이언트 컴포넌트가 담당한다.
 *
 * 종목명·가격·수급은 전부 가상의 예시 값이며 실제 시세가 아니다.
 */

export type Market = "KOSPI" | "KOSDAQ"

export interface Holding {
  symbol: string
  name: string
  market: Market
  sector: string
  shares: number
  avgPrice: number
  currentPrice: number
  changePercent: number
  /** 최근 10거래일 종가 — 미니 스파크라인용. */
  priceHistory: number[]
}

export const HOLDINGS: Holding[] = [
  {
    symbol: "005930",
    name: "삼성전자",
    market: "KOSPI",
    sector: "반도체",
    shares: 40,
    avgPrice: 68500,
    currentPrice: 72400,
    changePercent: 1.68,
    priceHistory: [69200, 69800, 70100, 69500, 70800, 71200, 71900, 71400, 72000, 72400],
  },
  {
    symbol: "000660",
    name: "SK하이닉스",
    market: "KOSPI",
    sector: "반도체",
    shares: 12,
    avgPrice: 178000,
    currentPrice: 195000,
    changePercent: 2.31,
    priceHistory: [182000, 185500, 188000, 186200, 190500, 191800, 193200, 190800, 192500, 195000],
  },
  {
    symbol: "035420",
    name: "NAVER",
    market: "KOSPI",
    sector: "플랫폼",
    shares: 18,
    avgPrice: 215000,
    currentPrice: 208500,
    changePercent: -0.95,
    priceHistory: [219000, 217500, 215800, 213200, 214500, 211800, 210200, 212000, 210500, 208500],
  },
  {
    symbol: "035720",
    name: "카카오",
    market: "KOSPI",
    sector: "플랫폼",
    shares: 55,
    avgPrice: 51200,
    currentPrice: 48500,
    changePercent: -1.82,
    priceHistory: [52800, 52100, 51500, 50800, 51200, 50100, 49500, 49900, 49100, 48500],
  },
  {
    symbol: "373220",
    name: "LG에너지솔루션",
    market: "KOSPI",
    sector: "2차전지",
    shares: 6,
    avgPrice: 402000,
    currentPrice: 418000,
    changePercent: 0.97,
    priceHistory: [398000, 401500, 405000, 403200, 409800, 412500, 415000, 411200, 414800, 418000],
  },
  {
    symbol: "247540",
    name: "에코프로비엠",
    market: "KOSDAQ",
    sector: "2차전지",
    shares: 22,
    avgPrice: 168000,
    currentPrice: 152400,
    changePercent: -2.14,
    priceHistory: [176000, 172500, 169800, 166200, 163500, 160800, 158200, 155500, 155900, 152400],
  },
]

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGain: number
  totalGainPercent: number
}

/** 보유 종목 목록으로부터 평가금액·매입금액·평가손익을 계산한다. */
export function getPortfolioSummary(holdings: Holding[] = HOLDINGS): PortfolioSummary {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost === 0 ? 0 : (totalGain / totalCost) * 100
  return { totalValue, totalCost, totalGain, totalGainPercent }
}

/** 포트폴리오 평가금액 기준 최근 10거래일 누적 수익률(%) — 수익률 곡선용. */
export const PORTFOLIO_RETURN_CURVE: { dayOffset: number; returnRate: number }[] = [
  { dayOffset: 0, returnRate: 0 },
  { dayOffset: 1, returnRate: 0.4 },
  { dayOffset: 2, returnRate: -0.3 },
  { dayOffset: 3, returnRate: 0.8 },
  { dayOffset: 4, returnRate: 1.6 },
  { dayOffset: 5, returnRate: 1.1 },
  { dayOffset: 6, returnRate: 2.0 },
  { dayOffset: 7, returnRate: 1.7 },
  { dayOffset: 8, returnRate: 2.4 },
  { dayOffset: 9, returnRate: 2.9 },
]

export interface WatchItem {
  symbol: string
  name: string
  market: Market
  sector: string
  currentPrice: number
  changePercent: number
  volume: number
}

export const WATCHLIST: WatchItem[] = [
  { symbol: "005930", name: "삼성전자", market: "KOSPI", sector: "반도체", currentPrice: 72400, changePercent: 1.68, volume: 12_450_000 },
  { symbol: "000660", name: "SK하이닉스", market: "KOSPI", sector: "반도체", currentPrice: 195000, changePercent: 2.31, volume: 4_820_000 },
  { symbol: "035420", name: "NAVER", market: "KOSPI", sector: "플랫폼", currentPrice: 208500, changePercent: -0.95, volume: 1_120_000 },
  { symbol: "373220", name: "LG에너지솔루션", market: "KOSPI", sector: "2차전지", currentPrice: 418000, changePercent: 0.97, volume: 890_000 },
  { symbol: "247540", name: "에코프로비엠", market: "KOSDAQ", sector: "2차전지", currentPrice: 152400, changePercent: -2.14, volume: 2_340_000 },
  { symbol: "003670", name: "포스코퓨처엠", market: "KOSPI", sector: "2차전지", currentPrice: 218500, changePercent: 3.42, volume: 1_680_000 },
  { symbol: "005380", name: "현대차", market: "KOSPI", sector: "자동차", currentPrice: 241000, changePercent: 0.21, volume: 780_000 },
]

export interface ReturnPoint {
  dayOffset: number
  returnRate: number
}

export interface SymbolDetail {
  symbol: string
  name: string
  market: Market
  sector: string
  currentPrice: number
  changePercent: number
  per: string
  pbr: string
  range52w: { low: number; high: number }
  priceHistory: number[]
  returnCurve: ReturnPoint[]
}

const SYMBOL_DETAILS: Record<string, SymbolDetail> = {
  "005930": {
    symbol: "005930",
    name: "삼성전자",
    market: "KOSPI",
    sector: "반도체",
    currentPrice: 72400,
    changePercent: 1.68,
    per: "12.5",
    pbr: "1.32",
    range52w: { low: 55800, high: 89000 },
    priceHistory: [69200, 69800, 70100, 69500, 70800, 71200, 71900, 71400, 72000, 72400],
    returnCurve: PORTFOLIO_RETURN_CURVE,
  },
  "000660": {
    symbol: "000660",
    name: "SK하이닉스",
    market: "KOSPI",
    sector: "반도체",
    currentPrice: 195000,
    changePercent: 2.31,
    per: "9.8",
    pbr: "2.05",
    range52w: { low: 121000, high: 228000 },
    priceHistory: [182000, 185500, 188000, 186200, 190500, 191800, 193200, 190800, 192500, 195000],
    returnCurve: [
      { dayOffset: 0, returnRate: 0 },
      { dayOffset: 1, returnRate: 1.9 },
      { dayOffset: 2, returnRate: 3.3 },
      { dayOffset: 3, returnRate: 2.3 },
      { dayOffset: 4, returnRate: 4.7 },
      { dayOffset: 5, returnRate: 5.4 },
      { dayOffset: 6, returnRate: 6.2 },
      { dayOffset: 7, returnRate: 4.8 },
      { dayOffset: 8, returnRate: 5.8 },
      { dayOffset: 9, returnRate: 7.1 },
    ],
  },
  "035420": {
    symbol: "035420",
    name: "NAVER",
    market: "KOSPI",
    sector: "플랫폼",
    currentPrice: 208500,
    changePercent: -0.95,
    per: "21.6",
    pbr: "1.48",
    range52w: { low: 158000, high: 251000 },
    priceHistory: [219000, 217500, 215800, 213200, 214500, 211800, 210200, 212000, 210500, 208500],
    returnCurve: [
      { dayOffset: 0, returnRate: 0 },
      { dayOffset: 1, returnRate: -0.7 },
      { dayOffset: 2, returnRate: -1.5 },
      { dayOffset: 3, returnRate: -2.6 },
      { dayOffset: 4, returnRate: -2.1 },
      { dayOffset: 5, returnRate: -3.3 },
      { dayOffset: 6, returnRate: -4.0 },
      { dayOffset: 7, returnRate: -3.2 },
      { dayOffset: 8, returnRate: -3.9 },
      { dayOffset: 9, returnRate: -4.8 },
    ],
  },
  "035720": {
    symbol: "035720",
    name: "카카오",
    market: "KOSPI",
    sector: "플랫폼",
    currentPrice: 48500,
    changePercent: -1.82,
    per: "28.4",
    pbr: "1.05",
    range52w: { low: 36200, high: 61400 },
    priceHistory: [52800, 52100, 51500, 50800, 51200, 50100, 49500, 49900, 49100, 48500],
    returnCurve: [
      { dayOffset: 0, returnRate: 0 },
      { dayOffset: 1, returnRate: -1.3 },
      { dayOffset: 2, returnRate: -2.5 },
      { dayOffset: 3, returnRate: -3.8 },
      { dayOffset: 4, returnRate: -3.0 },
      { dayOffset: 5, returnRate: -5.1 },
      { dayOffset: 6, returnRate: -6.3 },
      { dayOffset: 7, returnRate: -5.5 },
      { dayOffset: 8, returnRate: -7.0 },
      { dayOffset: 9, returnRate: -8.1 },
    ],
  },
  "373220": {
    symbol: "373220",
    name: "LG에너지솔루션",
    market: "KOSPI",
    sector: "2차전지",
    currentPrice: 418000,
    changePercent: 0.97,
    per: "62.1",
    pbr: "3.42",
    range52w: { low: 312000, high: 512000 },
    priceHistory: [398000, 401500, 405000, 403200, 409800, 412500, 415000, 411200, 414800, 418000],
    returnCurve: [
      { dayOffset: 0, returnRate: 0 },
      { dayOffset: 1, returnRate: 0.9 },
      { dayOffset: 2, returnRate: 1.8 },
      { dayOffset: 3, returnRate: 1.3 },
      { dayOffset: 4, returnRate: 2.9 },
      { dayOffset: 5, returnRate: 3.6 },
      { dayOffset: 6, returnRate: 4.3 },
      { dayOffset: 7, returnRate: 3.4 },
      { dayOffset: 8, returnRate: 4.2 },
      { dayOffset: 9, returnRate: 5.0 },
    ],
  },
  "247540": {
    symbol: "247540",
    name: "에코프로비엠",
    market: "KOSDAQ",
    sector: "2차전지",
    currentPrice: 152400,
    changePercent: -2.14,
    per: "45.2",
    pbr: "4.18",
    range52w: { low: 98000, high: 218000 },
    priceHistory: [176000, 172500, 169800, 166200, 163500, 160800, 158200, 155500, 155900, 152400],
    returnCurve: [
      { dayOffset: 0, returnRate: 0 },
      { dayOffset: 1, returnRate: -2.0 },
      { dayOffset: 2, returnRate: -3.5 },
      { dayOffset: 3, returnRate: -5.6 },
      { dayOffset: 4, returnRate: -7.1 },
      { dayOffset: 5, returnRate: -8.6 },
      { dayOffset: 6, returnRate: -10.1 },
      { dayOffset: 7, returnRate: -11.6 },
      { dayOffset: 8, returnRate: -11.4 },
      { dayOffset: 9, returnRate: -13.4 },
    ],
  },
  "003670": {
    symbol: "003670",
    name: "포스코퓨처엠",
    market: "KOSPI",
    sector: "2차전지",
    currentPrice: 218500,
    changePercent: 3.42,
    per: "58.7",
    pbr: "2.91",
    range52w: { low: 142000, high: 265000 },
    priceHistory: [198000, 202500, 206800, 204200, 210500, 213800, 212200, 215500, 213900, 218500],
    returnCurve: [
      { dayOffset: 0, returnRate: 0 },
      { dayOffset: 1, returnRate: 2.3 },
      { dayOffset: 2, returnRate: 4.4 },
      { dayOffset: 3, returnRate: 3.1 },
      { dayOffset: 4, returnRate: 6.3 },
      { dayOffset: 5, returnRate: 8.0 },
      { dayOffset: 6, returnRate: 7.2 },
      { dayOffset: 7, returnRate: 8.8 },
      { dayOffset: 8, returnRate: 8.0 },
      { dayOffset: 9, returnRate: 10.4 },
    ],
  },
  "005380": {
    symbol: "005380",
    name: "현대차",
    market: "KOSPI",
    sector: "자동차",
    currentPrice: 241000,
    changePercent: 0.21,
    per: "5.4",
    pbr: "0.68",
    range52w: { low: 178000, high: 268000 },
    priceHistory: [238500, 239800, 237200, 240500, 239100, 241800, 240200, 242500, 240800, 241000],
    returnCurve: [
      { dayOffset: 0, returnRate: 0 },
      { dayOffset: 1, returnRate: 0.5 },
      { dayOffset: 2, returnRate: -0.5 },
      { dayOffset: 3, returnRate: 0.8 },
      { dayOffset: 4, returnRate: 0.3 },
      { dayOffset: 5, returnRate: 1.4 },
      { dayOffset: 6, returnRate: 0.7 },
      { dayOffset: 7, returnRate: 1.7 },
      { dayOffset: 8, returnRate: 1.0 },
      { dayOffset: 9, returnRate: 1.1 },
    ],
  },
}

export function getSymbolDetail(symbol: string): SymbolDetail | undefined {
  return SYMBOL_DETAILS[symbol]
}

export function listSymbols(): string[] {
  return Object.keys(SYMBOL_DETAILS)
}

/** 52주 범위 안에서 현재가 위치를 퍼센트로 계산한다(범위 게이지용). */
export function rangePosition(currentPrice: number, range52w: { low: number; high: number }): number {
  const { low, high } = range52w
  if (high <= low) return 0
  return Math.min(Math.max(((currentPrice - low) / (high - low)) * 100, 0), 100)
}

/** 관심종목 알림 활동 히트맵용 표본 셀 1건. */
export interface WatchlistActivityCell {
  week: number
  day: number
  count: number
}

/** 결정적 의사난수(시드 고정) — 표본 데이터를 항상 같은 모양으로 재현한다. */
function pseudoActivityCount(week: number, day: number): number {
  const x = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453
  const frac = x - Math.floor(x)
  return Math.floor(frac * 11)
}

/** 최근 N주 관심종목 알림 활동 표본 — 주(週) 단위 열 × 요일(일~토) 행. */
export function watchlistActivityWeeks(weeks = 20): WatchlistActivityCell[][] {
  const out: WatchlistActivityCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: WatchlistActivityCell[] = []
    for (let d = 0; d < 7; d++) {
      col.push({ week: w, day: d, count: pseudoActivityCount(w, d) })
    }
    out.push(col)
  }
  return out
}

/** 투자자 주체별 순매수 1건 — 양수는 순매수, 음수는 순매도(억 원). */
export interface InvestorFlowItem {
  label: string
  value: number
}

/**
 * 종목별 투자자 수급 표본.
 *
 * 종목 코드에서 시드를 만들어 결정적으로 생성한다 — 표본이지만 종목마다 다른
 * 모양이 나오고, 같은 종목은 언제 렌더해도 같은 값이라 SSR 과 클라이언트가
 * 어긋나지 않는다.
 */
export function investorFlowFor(symbol: string): InvestorFlowItem[] {
  const seed = [...symbol].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const at = (i: number) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    return Math.round((x - Math.floor(x) - 0.5) * 2600)
  }
  return [
    { label: "외국인", value: at(1) },
    { label: "기관", value: at(2) },
    { label: "개인", value: at(3) },
  ]
}
