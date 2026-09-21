import { ReturnCurveChart, type ReturnPoint } from "@/components/patterns/dataviz/return-curve"

const RETURN_POINTS: ReturnPoint[] = [
  { dayOffset: 0, returnRate: 0 },
  { dayOffset: 1, returnRate: 1.8 },
  { dayOffset: 2, returnRate: -0.6 },
  { dayOffset: 3, returnRate: 2.4 },
  { dayOffset: 4, returnRate: 3.1 },
  { dayOffset: 5, returnRate: 1.9 },
  { dayOffset: 6, returnRate: 4.2 },
  { dayOffset: 7, returnRate: 5.6 },
]

export function ReturnCurveDemo() {
  return <ReturnCurveChart points={RETURN_POINTS} />
}
