import { DivergingBar, type DivergingItem } from "@/components/patterns/dataviz/diverging-bar"

const FLOW_DATA: DivergingItem[] = [
  { label: "외국인", value: 1240 },
  { label: "기관", value: -860 },
  { label: "개인", value: -410 },
]

export function DivergingBarDemo() {
  return <DivergingBar items={FLOW_DATA} />
}
