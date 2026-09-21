import { Sparkline } from "@/components/patterns/dataviz/sparkline"

const UPTREND_WITH_MARKER = [102, 98, 105, 110, 108, 115, 120, 118, 125, 132]
const DOWNTREND_WITH_BAND = [88, 90, 85, 82, 84, 79, 76, 78, 73, 70]
const NEUTRAL_WITH_REF = [50, 52, 49, 51, 53, 50, 48, 51, 50, 49]

export function SparklineDemo() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">상승 + 이벤트 마커</p>
        <Sparkline values={UPTREND_WITH_MARKER} marker={{ index: 6, label: "체결" }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">하락 + 예상 밴드</p>
        <Sparkline values={DOWNTREND_WITH_BAND} band={{ min: 72, max: 92 }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">횡보 + 참조선</p>
        <Sparkline values={NEUTRAL_WITH_REF} refLine={{ value: 50, label: "목표 50" }} />
      </div>
    </div>
  )
}
