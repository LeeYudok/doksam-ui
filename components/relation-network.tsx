import * as React from "react"

import { cn } from "@/lib/utils"

/** 관계 그룹 — 카테고리별 계열 색. 차트 토큰(--chart-1~5)에서 고른다. */
export interface RelationGroup {
  /** 노드의 group 값과 매칭되는 키. */
  key: string
  /** 범례에 표시할 이름. */
  label: string
  /** 계열 색 — 차트 토큰 참조만 쓴다(`"var(--chart-1)"`). 색 리터럴을 넣지 않는다. */
  color: string
}

/** 관계 노드 — 중심에서 뻗어나가는 상대. */
export interface RelationNode {
  /** 고유 식별자(React key·링크 구분용). */
  id: string
  /** 표시 이름(길어도 줄바꿈되어 전부 보인다). */
  label: string
  /** groups의 key. 색·범례 분류에 쓰인다. */
  group?: string
  /** 0~100 가중치(예: 지분율). 클수록 노드가 크고 안쪽에 놓인다. */
  weight?: number | null
  /** 있으면 노드가 이 href로 이동하는 링크가 된다. */
  href?: string
}

export interface RelationNetworkProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 중심에서 뻗어나갈 관계 노드들. */
  nodes: RelationNode[]
  /** 그룹 색·범례 정의. 생략하면 기본 4색 팔레트. */
  groups?: RelationGroup[]
  /** 중심 노드 라벨. 기본 "중심". */
  centerLabel?: string
  /** 도식화할 최대 노드 수. 기본 10. 초과분은 가중치 상위만. */
  maxNodes?: number
  /** 궤도 회전·신호 흐름 등 애니메이션. 기본 true. prefers-reduced-motion이면 자동 정지. */
  animated?: boolean
}

const DEFAULT_GROUPS: RelationGroup[] = [
  { key: "a", label: "그룹 A", color: "var(--chart-1)" },
  { key: "b", label: "그룹 B", color: "var(--chart-2)" },
  { key: "c", label: "그룹 C", color: "var(--chart-3)" },
  { key: "d", label: "그룹 D", color: "var(--chart-4)" },
]

const VW = 800
const CX = VW / 2
const LABEL_W = 152
const R_IN = 96
const R_OUT = 168

function nodeRadius(weight?: number | null): number {
  return 6 + Math.min(12, Math.sqrt(Math.max(weight ?? 2, 0)) * 1.4)
}

/**
 * 순수 SVG 관계 네트워크 시각화(#44) — 노드/엣지 데이터를 "성좌"로 그린다.
 * 중심에서 좌우 반원 아크로 노드를 배치(가중치 클수록 안쪽·크게)하고 바깥
 * 라벨 레일에 이름을 정렬해 겹침을 없앤다. 궤도 링·신호 흐름·발광 맥동은
 * CSS로만 처리하며 prefers-reduced-motion을 존중한다. 구조 색(링/중심/텍스트)은
 * 시맨틱 토큰, 계열 색만 groups로 주입한다. 데이터 props 전용 프레젠테이션.
 */
function RelationNetwork({
  nodes,
  groups = DEFAULT_GROUPS,
  centerLabel = "중심",
  maxNodes = 10,
  animated = true,
  className,
  ...props
}: Readonly<RelationNetworkProps>) {
  const colorOf = (n: RelationNode) =>
    groups.find((g) => g.key === n.group)?.color ?? "var(--muted-foreground)"

  const shown = [...nodes]
    .sort((a, b) => (b.weight ?? -1) - (a.weight ?? -1))
    .slice(0, Math.max(1, maxNodes))

  // 좌우 균형 분배 후 각 측을 반원 아크에 배치.
  const right: RelationNode[] = []
  const left: RelationNode[] = []
  shown.forEach((n, i) => (i % 2 === 0 ? right : left).push(n))
  const maxCount = Math.max(right.length, left.length, 1)
  const height = Math.max(360, maxCount * 54 + 64)
  const cy = height / 2
  const pad = 30
  const span = height - pad * 2

  const build = (list: RelationNode[], sign: 1 | -1) => {
    const m = list.length
    const withPos = list.map((n, j) => {
      const t = m === 1 ? 0.5 : j / (m - 1)
      const ang = (-62 + t * 124) * (Math.PI / 180)
      const rad = R_IN + (1 - Math.min(n.weight ?? 0, 100) / 100) * (R_OUT - R_IN)
      return {
        n,
        x: CX + sign * rad * Math.cos(ang),
        y: cy + rad * Math.sin(ang),
        r: nodeRadius(n.weight),
        color: colorOf(n),
      }
    })
    withPos.sort((a, b) => a.y - b.y)
    return withPos.map((p, k) => {
      const railY = pad + (span * (k + 0.5)) / withPos.length
      const side: "left" | "right" = sign === 1 ? "right" : "left"
      return {
        ...p,
        railY,
        side,
        anchorX: side === "right" ? VW - LABEL_W - 6 : LABEL_W + 6,
        labelX: side === "right" ? VW - LABEL_W - 6 : 6,
      }
    })
  }

  const placed = [...build(right, 1), ...build(left, -1)]
  const stars = Array.from({ length: 46 }, (_, i) => ({
    x: (i * 149) % VW,
    y: (i * 83) % height,
    r: i % 4 === 0 ? 1.3 : 0.7,
    d: (i % 11) * 0.28,
  }))
  const rings = [R_IN, (R_IN + R_OUT) / 2, R_OUT]
  const anim = (name: string) => (animated ? `rn-${name}` : undefined)

  return (
    <div
      data-slot="relation-network"
      className={cn(
        "relative w-full overflow-hidden rounded-xl border bg-card",
        className,
      )}
      {...props}
    >
      <style>{RN_CSS}</style>
      <svg viewBox={`0 0 ${VW} ${height}`} className="relative w-full" role="img" aria-label="관계 네트워크 그래프">
        <defs>
          <filter id="rn-glow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="2.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {animated &&
          stars.map((s, i) => (
            <circle
              key={`star-${i}`}
              className="rn-twinkle fill-muted-foreground"
              cx={s.x}
              cy={s.y}
              r={s.r}
              style={{ animationDelay: `${s.d}s` }}
            />
          ))}

        <g className={anim("spin")} style={{ transformBox: "view-box", transformOrigin: `${CX}px ${cy}px` }}>
          {rings.map((rad, i) => (
            <circle
              key={`ring-${i}`}
              cx={CX}
              cy={cy}
              r={rad}
              fill="none"
              className="stroke-border"
              strokeWidth={1}
              strokeOpacity={0.55}
              strokeDasharray={i === 1 ? "3 7" : undefined}
            />
          ))}
        </g>

        {placed.map((p, i) => (
          <g key={`spoke-${i}`}>
            <path d={`M${CX},${cy} L${p.x},${p.y}`} stroke={p.color} strokeWidth={1} strokeOpacity={0.24} />
            {animated && (
              <path
                className="rn-flow"
                d={`M${CX},${cy} L${p.x},${p.y}`}
                fill="none"
                stroke={p.color}
                strokeWidth={1.4}
                strokeOpacity={0.85}
                strokeDasharray="2 14"
              />
            )}
            <path
              d={`M${p.x},${p.y} Q${(p.x + p.anchorX) / 2},${p.y} ${p.anchorX},${p.railY}`}
              fill="none"
              stroke={p.color}
              strokeWidth={1}
              strokeOpacity={0.28}
            />
          </g>
        ))}

        {placed.map((p, i) => {
          const glyph = (
            <g className="rn-node">
              <circle
                className={anim("halo")}
                cx={p.x}
                cy={p.y}
                r={p.r + 5}
                fill={p.color}
                opacity={0.16}
                style={{ animationDelay: `${(i % 5) * 0.5}s` }}
              />
              <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} filter="url(#rn-glow)" />
              <circle
                cx={p.x - p.r * 0.3}
                cy={p.y - p.r * 0.3}
                r={Math.max(1.6, p.r * 0.34)}
                fill={`color-mix(in oklch, ${p.color} 20%, white)`}
                opacity={0.85}
              />
              <foreignObject x={p.labelX} y={p.railY - 24} width={LABEL_W} height={48} style={{ overflow: "visible" }}>
                <div
                  className={cn(
                    "flex h-12 flex-col justify-center text-[11.5px] leading-tight",
                    p.side === "right" ? "items-start text-left" : "items-end text-right",
                  )}
                >
                  <span className="font-semibold break-words text-foreground">{p.n.label}</span>
                  {p.n.weight != null && (
                    <span
                      className="mt-0.5 inline-block rounded-full px-1.5 font-mono text-[9.5px] font-semibold"
                      style={{ color: p.color, background: `color-mix(in oklch, ${p.color} 14%, transparent)` }}
                    >
                      {p.n.weight}%
                    </span>
                  )}
                </div>
              </foreignObject>
            </g>
          )
          return p.n.href ? (
            <a key={`node-${i}`} href={p.n.href}>
              {glyph}
            </a>
          ) : (
            <g key={`node-${i}`}>{glyph}</g>
          )
        })}

        <circle
          // 중심 궤도 링 — 그룹 색(chart-1~4)과 겹치지 않도록 chart-5 를 쓴다.
          className={cn("stroke-chart-5", anim("orbit"))}
          cx={CX}
          cy={cy}
          r={19}
          fill="none"
          strokeWidth={1.5}
          strokeOpacity={0.7}
          strokeDasharray="4 6"
          style={{ transformBox: "view-box", transformOrigin: `${CX}px ${cy}px` }}
        />
        <g className={anim("core")} style={{ transformBox: "view-box", transformOrigin: `${CX}px ${cy}px` }}>
          <circle cx={CX} cy={cy} r={11} fill="color-mix(in oklch, var(--primary) 40%, white)" filter="url(#rn-glow)" />
          <circle cx={CX} cy={cy} r={5} className="fill-primary" />
        </g>
        <text x={CX} y={cy + 36} textAnchor="middle" className="fill-foreground" fontSize="12" fontWeight="700">
          {centerLabel}
        </text>
      </svg>

      <div className="relative flex flex-wrap gap-x-4 gap-y-1.5 px-4 pb-3">
        {groups.map((g) => {
          const count = nodes.filter((n) => n.group === g.key).length
          if (count === 0) return null
          return (
            <span key={g.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-block size-2 rounded-full" style={{ background: g.color, boxShadow: `0 0 6px ${g.color}` }} />
              {g.label} <span className="opacity-60">{count}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

const RN_CSS = `
[data-slot="relation-network"] .rn-node{transition:filter .2s ease}
[data-slot="relation-network"] a:hover .rn-node,[data-slot="relation-network"] .rn-node:hover{filter:brightness(1.3)}
[data-slot="relation-network"] .rn-spin{animation:rn-rotate 60s linear infinite}
[data-slot="relation-network"] .rn-orbit{animation:rn-rotate 24s linear infinite}
[data-slot="relation-network"] .rn-core{animation:rn-breathe 3.8s ease-in-out infinite}
[data-slot="relation-network"] .rn-halo{animation:rn-pulse 3.4s ease-in-out infinite}
[data-slot="relation-network"] .rn-twinkle{animation:rn-twinkle 3.2s ease-in-out infinite}
[data-slot="relation-network"] .rn-flow{animation:rn-flow 1.4s linear infinite}
@keyframes rn-rotate{to{transform:rotate(360deg)}}
@keyframes rn-breathe{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:1;transform:scale(1.09)}}
@keyframes rn-pulse{0%,100%{opacity:.1}50%{opacity:.24}}
@keyframes rn-twinkle{0%,100%{opacity:.2}50%{opacity:.85}}
@keyframes rn-flow{to{stroke-dashoffset:-32}}
@media (prefers-reduced-motion:reduce){[data-slot="relation-network"] .rn-spin,[data-slot="relation-network"] .rn-orbit,[data-slot="relation-network"] .rn-core,[data-slot="relation-network"] .rn-halo,[data-slot="relation-network"] .rn-twinkle,[data-slot="relation-network"] .rn-flow{animation:none}}
`

export { RelationNetwork }
