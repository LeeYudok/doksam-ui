import { KpiCardGrid, type Kpi } from "@/components/patterns/stats/kpi-card-grid"

const KPIS: Kpi[] = [
  { label: "이번 달 매출", unit: "won", value: 300_000_000, change: 12.4, trend: [180, 195, 210, 205, 230, 245, 260, 255, 270, 300] },
  { label: "신규 가입자", unit: "count", value: 1842, change: 6.1, trend: [1420, 1480, 1510, 1560, 1600, 1650, 1690, 1740, 1790, 1842] },
  { label: "활성 구독", unit: "count", value: 963, change: -2.3, trend: [1020, 1010, 1005, 995, 990, 985, 975, 970, 968, 963] },
  { label: "전환율", unit: "percent", value: 3.8, change: 0.4, trend: [3.1, 3.2, 3.3, 3.2, 3.4, 3.5, 3.6, 3.6, 3.7, 3.8] },
  { label: "환불 건수", unit: "count", value: 27, change: -18.2, trend: [41, 39, 38, 36, 34, 33, 31, 30, 28, 27] },
  { label: "평균 객단가", unit: "won", value: 62_400, change: 0, trend: [61000, 61500, 62000, 61800, 62200, 62400, 62100, 62300, 62400, 62400] },
]

/** /patterns/stats 데모용 — 매출·가입자 등 6종 지표. */
export function KpiCardGridDemo() {
  return <KpiCardGrid items={KPIS} />
}
