import { KpiCompactRow, type CompactKpi } from "@/components/patterns/stats/kpi-compact-row"

const COMPACT_KPIS: CompactKpi[] = [
  { label: "체결 건수", value: "12,048", change: 4.2 },
  { label: "평균 처리시간", value: "812ms", change: -8.6 },
  { label: "오류율", value: "0.31%", change: 0 },
  { label: "동시접속", value: "3,204", change: 1.9 },
]

/** /patterns/stats 데모용 — 운영 지표 4종. */
export function KpiCompactRowDemo() {
  return <KpiCompactRow items={COMPACT_KPIS} />
}
