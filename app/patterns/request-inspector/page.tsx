import { PatternDetail } from "@/components/showcase/pattern-detail"
import { REQUEST_INSPECTOR_SAMPLES } from "@/components/patterns/request-inspector-samples"

export default function RequestInspectorPatternsPage() {
  return <PatternDetail slug="request-inspector" samples={REQUEST_INSPECTOR_SAMPLES} />
}
