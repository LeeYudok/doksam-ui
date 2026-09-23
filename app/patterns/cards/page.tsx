import { PatternDetail } from "@/components/showcase/pattern-detail"
import { CARDS_SAMPLES } from "@/components/patterns/cards-samples"

export default function CardsPatternsPage() {
  return <PatternDetail slug="cards" samples={CARDS_SAMPLES} />
}
