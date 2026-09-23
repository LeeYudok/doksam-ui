import { PatternDetail } from "@/components/showcase/pattern-detail"
import { VERIFIED_SAMPLES } from "@/components/patterns/verified-samples"

export default function VerifiedPatternsPage() {
  return <PatternDetail slug="verified" samples={VERIFIED_SAMPLES} />
}
