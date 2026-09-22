import { MatrixHeatmap, type MatrixHeatmapCell } from "@/components/matrix-heatmap"

// 결정적 표본 — S-06 업종별 조기경보 건전성 매트릭스(업종 × 등급)를 본떴다.
const ROW_KEYS = ["manufacturing", "construction", "wholesale", "service"]
const COL_KEYS = ["low", "moderate", "high", "severe"]

const ROW_LABELS: Record<string, string> = {
  manufacturing: "제조업",
  construction: "건설업",
  wholesale: "도소매업",
  service: "서비스업",
}

const COL_LABELS: Record<string, string> = {
  low: "정상",
  moderate: "관찰",
  high: "주의",
  severe: "경보",
}

const CELLS: MatrixHeatmapCell[] = [
  { rowKey: "manufacturing", colKey: "low", value: 42, valueLabel: "42건" },
  { rowKey: "manufacturing", colKey: "moderate", value: 18, valueLabel: "18건" },
  { rowKey: "manufacturing", colKey: "high", value: 7, valueLabel: "7건" },
  { rowKey: "manufacturing", colKey: "severe", value: 2, valueLabel: "2건" },
  { rowKey: "construction", colKey: "low", value: 15, valueLabel: "15건" },
  { rowKey: "construction", colKey: "moderate", value: 22, valueLabel: "22건" },
  { rowKey: "construction", colKey: "high", value: 19, valueLabel: "19건" },
  { rowKey: "construction", colKey: "severe", value: 11, valueLabel: "11건" },
  { rowKey: "wholesale", colKey: "low", value: 30, valueLabel: "30건" },
  { rowKey: "wholesale", colKey: "moderate", value: 12, valueLabel: "12건" },
  { rowKey: "wholesale", colKey: "high", value: 4, valueLabel: "4건" },
  // wholesale × severe 는 데이터 없음 — 빈 셀 렌더링을 보여준다.
  { rowKey: "service", colKey: "low", value: 51, valueLabel: "51건" },
  { rowKey: "service", colKey: "moderate", value: 9, valueLabel: "9건" },
  { rowKey: "service", colKey: "high", value: 3, valueLabel: "3건" },
  { rowKey: "service", colKey: "severe", value: 1, valueLabel: "1건" },
]

export const demo = (
  <MatrixHeatmap
    rowKeys={ROW_KEYS}
    colKeys={COL_KEYS}
    rowLabels={ROW_LABELS}
    colLabels={COL_LABELS}
    cells={CELLS}
    caption="업종별 조기경보 건전성 매트릭스 — 업종 × 등급 분포"
    legendMinLabel="적음"
    legendMaxLabel="많음"
  />
)

export const code = `const ROW_LABELS = { manufacturing: "제조업", construction: "건설업", wholesale: "도소매업", service: "서비스업" }
const COL_LABELS = { low: "정상", moderate: "관찰", high: "주의", severe: "경보" }

const cells: MatrixHeatmapCell[] = [
  { rowKey: "manufacturing", colKey: "low", value: 42, valueLabel: "42건" },
  { rowKey: "manufacturing", colKey: "severe", value: 2, valueLabel: "2건" },
  // wholesale × severe 는 넣지 않으면 빈 셀(emptyLabel)로 렌더된다.
  // ...
]

<MatrixHeatmap
  rowKeys={["manufacturing", "construction", "wholesale", "service"]}
  colKeys={["low", "moderate", "high", "severe"]}
  rowLabels={ROW_LABELS}
  colLabels={COL_LABELS}
  cells={cells}
  caption="업종별 조기경보 건전성 매트릭스 — 업종 × 등급 분포"
  legendMinLabel="적음"
  legendMaxLabel="많음"
/>`

export const dos = [
  "셀마다 valueLabel(수치 텍스트)을 반드시 채운다 — 색만으로 값을 전달하면 색각 이상 사용자에게 강도가 전달되지 않는다.",
  "행/열이 많아 가로 스크롤이 생기는 표에 쓴다 — 첫 열(행 머리글)이 스크롤 중에도 고정된다.",
  "min/max 를 데이터 도메인 전체(예: 전체 기간 최대치)로 명시하면 화면을 새로고침해도 같은 값이 같은 강도로 보인다.",
]

export const donts = [
  "일자 × 요일처럼 축 하나가 항상 시간인 단일 계열에는 activity-heatmap 을 쓴다 — matrix-heatmap 은 임의의 두 범주 축(업종 × 등급 등)을 위한 것이다.",
  "셀 배경을 --chart-1~5 로 칠하지 않는다 — 그건 순서 없는 범주 팔레트이고, 이 컴포넌트가 표현하는 것은 연속된 값의 강도다.",
  "rowKeys/colKeys 개수를 넘는 큰 표를 role=\"img\" 요약 하나로 뭉개지 않는다 — 실제 <table>/th/aria-label 로 셀 단위 정보를 유지한다.",
]
