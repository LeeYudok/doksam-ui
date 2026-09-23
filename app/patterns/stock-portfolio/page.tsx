import { PatternDetail } from "@/components/showcase/pattern-detail"
import { STOCK_PORTFOLIO_SAMPLES } from "./_samples"

export default function StockPortfolioPatternsPage() {
  return <PatternDetail slug="stock-portfolio" samples={STOCK_PORTFOLIO_SAMPLES} className="max-w-3xl" />
}
