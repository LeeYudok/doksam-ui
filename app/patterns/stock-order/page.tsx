import { PatternDetail } from "@/components/showcase/pattern-detail"
import { STOCK_ORDER_SAMPLES } from "@/components/patterns/stock-order-samples"

export default function StockOrderPatternsPage() {
  return <PatternDetail slug="stock-order" samples={STOCK_ORDER_SAMPLES} />
}
