import { PatternDetail } from "@/components/showcase/pattern-detail"
import { STATE_SAMPLES } from "@/components/patterns/state-samples"

export default function StatePatternsPage() {
  return <PatternDetail slug="state" samples={STATE_SAMPLES} />
}
