"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export interface ReturnPoint {
  dayOffset: number
  returnRate: number
}

interface ReturnCurveChartProps {
  points: ReturnPoint[]
  height?: number
  className?: string
}

const PAD = { top: 16, bottom: 20, left: 36, right: 8 }

/**
 * 수익률 곡선 — 0% 기준선을 공유하는 시계열. ResizeObserver로 컨테이너 폭을 측정해 반응형으로 그린다.
 * 색상은 마지막 수익률 부호에 따라 text-gain / text-loss 를 걸고 currentColor로 상속한다.
 */
export function ReturnCurveChart({ points, height = 100, className }: Readonly<ReturnCurveChartProps>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(320)

  useEffect(() => {
    const el = containerRef.current
    // jsdom(테스트 환경)은 ResizeObserver를 구현하지 않으므로 feature-detect 후 폴백한다 —
    // 폴백 시 초기 width state(320)로 정적 렌더된다.
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const chart = useMemo(() => {
    if (points.length < 2 || width < 80) return null

    const W = width
    const H = height
    const drawTop = PAD.top
    const drawBottom = H - PAD.bottom
    const drawH = drawBottom - drawTop
    const drawLeft = PAD.left
    const drawRight = W - PAD.right
    const drawW = drawRight - drawLeft

    const rates = points.map((p) => p.returnRate)
    const minRate = Math.min(...rates, 0)
    const maxRate = Math.max(...rates, 0)
    const range = maxRate - minRate || 1
    const pad = range * 0.2
    const yMin = minRate - pad
    const yMax = maxRate + pad

    const toY = (rate: number) => drawTop + drawH - ((rate - yMin) / (yMax - yMin)) * drawH
    const toX = (i: number) => drawLeft + (i / Math.max(points.length - 1, 1)) * drawW

    const zeroY = toY(0)
    const linePoints = points.map((p, i) => `${toX(i)},${toY(p.returnRate)}`).join(" ")
    const areaPoints = `${toX(0)},${zeroY} ${linePoints} ${toX(points.length - 1)},${zeroY}`

    const lastRate = points[points.length - 1].returnRate
    const isUp = lastRate >= 0

    const step = Math.max(1, Math.ceil(points.length / 6))
    const xLabels = points
      .map((p, i) => ({ x: toX(i), label: `D+${p.dayOffset}`, i }))
      .filter(({ i }) => i === 0 || i === points.length - 1 || i % step === 0)

    const lastX = toX(points.length - 1)
    const lastY = toY(lastRate)

    return { W, H, zeroY, linePoints, areaPoints, isUp, lastRate, xLabels, lastX, lastY, drawLeft, drawRight, drawBottom }
  }, [points, width, height])

  return (
    <div
      ref={containerRef}
      className={cn("w-full overflow-hidden", chart?.isUp ? "text-gain" : "text-loss", className)}
      style={{ height }}
    >
      {chart && (
        <svg width={chart.W} height={chart.H} viewBox={`0 0 ${chart.W} ${chart.H}`} className="block" role="img" aria-label="수익률 곡선">
          <line
            x1={chart.drawLeft}
            y1={chart.zeroY}
            x2={chart.drawRight}
            y2={chart.zeroY}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4,3"
            opacity={0.5}
          />
          <text x={chart.drawLeft - 4} y={chart.zeroY} fill="var(--muted-foreground)" fontSize={9} textAnchor="end" dominantBaseline="middle">
            0%
          </text>

          <polygon points={chart.areaPoints} fill="currentColor" opacity={0.08} />
          <polyline points={chart.linePoints} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={chart.lastX} cy={chart.lastY} r={3} fill="currentColor" />

          {chart.xLabels.map((lbl) => (
            <text key={lbl.label} x={lbl.x} y={chart.drawBottom + 13} fill="var(--muted-foreground)" fontSize={9} textAnchor="middle" opacity={0.6}>
              {lbl.label}
            </text>
          ))}

          <text x={chart.lastX} y={chart.lastY - 8} fill="currentColor" fontSize={11} fontWeight={700} textAnchor="end">
            {chart.lastRate >= 0 ? "+" : ""}
            {chart.lastRate.toFixed(1)}%
          </text>
        </svg>
      )}
    </div>
  )
}
