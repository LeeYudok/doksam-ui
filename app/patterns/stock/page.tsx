import { PatternDetail } from "@/components/showcase/pattern-detail"
import { STOCK_SAMPLES } from "./_samples"

export default function StockPatternsPage() {
  return <PatternDetail slug="stock" samples={STOCK_SAMPLES} className="max-w-3xl" />
}
