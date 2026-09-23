import { PatternDetail } from "@/components/showcase/pattern-detail"
import { STATS_SAMPLES } from "@/components/patterns/stats-samples"

export default function StatsPatternsPage() {
  return <PatternDetail slug="stats" samples={STATS_SAMPLES} />
}
