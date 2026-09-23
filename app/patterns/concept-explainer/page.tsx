import { PatternDetail } from "@/components/showcase/pattern-detail"
import { CONCEPT_EXPLAINER_SAMPLES } from "@/components/patterns/concept-explainer-samples"

export default function ConceptExplainerPatternsPage() {
  return <PatternDetail slug="concept-explainer" samples={CONCEPT_EXPLAINER_SAMPLES} />
}
