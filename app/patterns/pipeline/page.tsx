import { PatternDetail } from "@/components/showcase/pattern-detail"
import { PIPELINE_SAMPLES } from "./_samples"

export default function PipelinePatternsPage() {
  return <PatternDetail slug="pipeline" samples={PIPELINE_SAMPLES} className="max-w-3xl" />
}
