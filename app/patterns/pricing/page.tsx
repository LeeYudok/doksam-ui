import { PatternDetail } from "@/components/showcase/pattern-detail"
import { PRICING_SAMPLES } from "@/components/patterns/pricing-samples"

export default function PricingPatternsPage() {
  return <PatternDetail slug="pricing" samples={PRICING_SAMPLES} />
}
