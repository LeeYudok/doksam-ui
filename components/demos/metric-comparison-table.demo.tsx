import { MetricComparisonTable, type MetricComparisonRow } from "@/components/metric-comparison-table"

const metrics: MetricComparisonRow[] = [
  { key: "ar", label: "AR", subjectA: 70.2, subjectB: 72.4, betterWhen: "higher", unit: "%" },
  { key: "ks", label: "KS", subjectA: 41.5, subjectB: 39.8, betterWhen: "higher", unit: "%" },
  { key: "capture", label: "포착률", subjectA: 62.0, subjectB: 65.3, betterWhen: "higher", unit: "%" },
  { key: "npl", label: "연체율", subjectA: 3.2, subjectB: 2.1, betterWhen: "lower", unit: "%" },
]

export const demo = (
  <MetricComparisonTable
    metrics={metrics}
    subjectALabel="챔피언"
    subjectBLabel="챌린저"
    caption="챔피언 vs 챌린저 성능 비교"
    captionHidden
  />
)

export const code = `const metrics: MetricComparisonRow[] = [
  { key: "ar", label: "AR", subjectA: 70.2, subjectB: 72.4, betterWhen: "higher", unit: "%" },
  { key: "ks", label: "KS", subjectA: 41.5, subjectB: 39.8, betterWhen: "higher", unit: "%" },
  { key: "capture", label: "포착률", subjectA: 62.0, subjectB: 65.3, betterWhen: "higher", unit: "%" },
  { key: "npl", label: "연체율", subjectA: 3.2, subjectB: 2.1, betterWhen: "lower", unit: "%" },
]

<MetricComparisonTable
  metrics={metrics}
  subjectALabel="챔피언"
  subjectBLabel="챌린저"
  caption="챔피언 vs 챌린저 성능 비교"
  captionHidden
/>`

export const dos = [
  "지표마다 betterWhen(higher/lower)을 정확히 지정한다 — AR·KS·포착률은 higher, 연체율·오탐률처럼 낮을수록 좋은 지표는 lower다.",
  "기간 비교(전월 대비)·환경 비교(운영/스테이징)처럼 모형 비교가 아닌 A/B 상황에도 도메인 중립으로 쓴다.",
  "표의 목적이 한눈에 안 보이면 caption을 채운다(시각적으로는 captionHidden으로 숨겨도 스크린리더는 읽는다).",
]

export const donts = [
  "모든 지표를 습관적으로 higher로 두지 않는다 — betterWhen을 잘못 주면 개선/악화 색이 그대로 뒤집힌다.",
  "시세 등락 표시로 쓰지 않는다 — 이 컴포넌트는 --success/--destructive를 쓰고, 시세는 --gain/--loss(lib/finance/rate.ts)를 쓴다.",
  "행이 10개를 넘는 원자료 나열에는 쓰지 않는다 — 동질 행 목록은 data-table, 심각도 강조 업무 표는 risk-table을 쓴다.",
]
