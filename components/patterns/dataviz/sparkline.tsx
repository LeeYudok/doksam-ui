import { cn } from "@/lib/utils"

/** 참조선(목표가·평균 등) — 대시 수평선 + 좌측 라벨. */
interface SparklineRefLine {
  value: number
  label: string
}

/** 밴드(최소~최대 예상 범위 등) — 옅게 채운 수평 영역. */
interface SparklineBand {
  min: number
  max: number
}

/** 이벤트 마커 — 특정 인덱스에 점 + 라벨을 찍는다. */
interface SparklineMarker {
  index: number
  label: string
}

interface SparklineProps {
  values: number[]
  refLine?: SparklineRefLine
  band?: SparklineBand
  marker?: SparklineMarker
  height?: number
  className?: string
}

const PAD_TOP = 14
const PAD_BOTTOM = 4

/**
 * 인라인 스파크라인 — 외부 의존성 없는 순수 SVG 미니 차트.
 * 참조선(refLine)·밴드(band)·이벤트 마커(marker)를 선택적으로 겹쳐 그린다.
 * 색상은 추세(상승/하락)에 따라 text-success / text-destructive 를 부모에 걸고 currentColor로 상속한다.
 */
export function Sparkline({ values, refLine, band, marker, height = 40, className }: Readonly<SparklineProps>) {
  if (values.length < 2) return null

  const W = 160
  const H = height
  const drawTop = PAD_TOP
  const drawBottom = H - PAD_BOTTOM
  const drawH = drawBottom - drawTop

  const allValues = [...values]
  if (refLine) allValues.push(refLine.value)
  if (band) allValues.push(band.min, band.max)

  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const range = maxVal - minVal || 1
  const pad = range * 0.1
  const yMin = minVal - pad
  const yMax = maxVal + pad

  const toY = (v: number) => drawTop + drawH - ((v - yMin) / (yMax - yMin)) * drawH
  const toX = (i: number) => (i / Math.max(values.length - 1, 1)) * W

  const firstValue = values[0]
  const lastValue = values[values.length - 1]
  const isUp = lastValue >= firstValue

  const points = values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")
  const areaPoints = `0,${drawBottom} ${points} ${W},${drawBottom}`

  const lastX = toX(values.length - 1)
  const lastY = toY(lastValue)

  const markerPoint = marker
    ? { x: toX(Math.min(marker.index, values.length - 1)), y: toY(values[Math.min(marker.index, values.length - 1)]) }
    : null

  return (
    <div className={cn("w-full", isUp ? "text-gain" : "text-loss", className)} style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="스파크라인">
        {band && (
          <rect
            x={0}
            y={toY(band.max)}
            width={W}
            height={Math.max(toY(band.min) - toY(band.max), 0)}
            className="fill-primary/10"
          />
        )}

        {refLine && (
          <g>
            <line
              x1={0}
              y1={toY(refLine.value)}
              x2={W}
              y2={toY(refLine.value)}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.6}
            />
            <text x={2} y={Math.max(toY(refLine.value) - 3, 9)} fill="var(--muted-foreground)" fontSize={7} opacity={0.8}>
              {refLine.label}
            </text>
          </g>
        )}

        <polygon points={areaPoints} fill="currentColor" opacity={0.08} />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <circle cx={lastX} cy={lastY} r={2.5} fill="currentColor" />

        {markerPoint && marker && (
          <g>
            <line
              x1={markerPoint.x}
              y1={drawTop}
              x2={markerPoint.x}
              y2={drawBottom}
              stroke="var(--chart-4)"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.7}
            />
            <circle cx={markerPoint.x} cy={markerPoint.y} r={2.5} fill="var(--chart-4)" />
            <text x={markerPoint.x} y={drawTop - 3} fill="var(--chart-4)" fontSize={7} textAnchor="middle" fontWeight={600}>
              {marker.label}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
