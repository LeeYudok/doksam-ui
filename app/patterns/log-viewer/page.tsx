import { PatternDetail } from "@/components/showcase/pattern-detail"
import { LOG_VIEWER_SAMPLES } from "@/components/patterns/log-viewer-samples"

export default function LogViewerPatternsPage() {
  return <PatternDetail slug="log-viewer" samples={LOG_VIEWER_SAMPLES} />
}
