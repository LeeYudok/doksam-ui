import { PatternDetail } from "@/components/showcase/pattern-detail"
import { FACETED_FILTER_SAMPLES } from "@/components/patterns/faceted-filter-samples"

export default function FacetedFilterPatternsPage() {
  return <PatternDetail slug="faceted-filter" samples={FACETED_FILTER_SAMPLES} />
}
