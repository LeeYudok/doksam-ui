export interface DivergingItem {
  label: string
  value: number
}

interface DivergingBarProps {
  items: DivergingItem[]
}

/**
 * 발산형 막대 — 여러 항목이 중앙 0축을 공유하며, 음수는 왼쪽(destructive와 반대 방향인
 * 매도), 양수는 오른쪽으로 뻗는다. 길이는 |값|/maxAbs 비례(각 절반 영역 기준 %).
 * 0/누락 값은 막대를 그리지 않는다 — 최소폭 슬리버가 가짜 신호를 주지 않게 한다.
 */
export function DivergingBar({ items }: Readonly<DivergingBarProps>) {
  const maxAbs = Math.max(...items.map((d) => Math.abs(d.value)), 1)

  return (
    <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2.5 text-sm">
      {items.map((item) => {
        const width = item.value ? Math.max((Math.abs(item.value) / maxAbs) * 100, 2) : 0
        const isPositive = item.value > 0
        const isNegative = item.value < 0
        return (
          <div key={item.label} className="contents">
            <span className="shrink-0 text-muted-foreground">{item.label}</span>
            <div className="relative h-2.5">
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" aria-hidden="true" />
              {isNegative && (
                <div
                  className="absolute inset-y-0 rounded-l-sm bg-loss"
                  style={{ right: "50%", width: `${width / 2}%` }}
                  aria-hidden="true"
                />
              )}
              {isPositive && (
                <div
                  className="absolute inset-y-0 rounded-r-sm bg-gain"
                  style={{ left: "50%", width: `${width / 2}%` }}
                  aria-hidden="true"
                />
              )}
            </div>
            <span className={`shrink-0 text-right font-semibold tabular-nums ${isNegative ? "text-loss" : "text-gain"}`}>
              {item.value >= 0 ? "+" : ""}
              {item.value.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
