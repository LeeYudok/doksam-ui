import { PatternDetail } from "@/components/showcase/pattern-detail"
import { TIMELINE_SAMPLES } from "@/components/patterns/timeline-samples"

export default function TimelinePatternsPage() {
  return <PatternDetail slug="timeline" samples={TIMELINE_SAMPLES} />
}
