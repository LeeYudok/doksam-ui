import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TRENDING_PRODUCTS } from "@/app/templates/bank/_data/trending-products-data"

export function TrendingProducts() {
  return (
    <section aria-label="지금 뜨는 상품" className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">지금 뜨는 상품</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TRENDING_PRODUCTS.map((product) => (
          <Link key={product.id} href={product.href}>
            <Card className="h-full overflow-hidden py-0 transition-colors hover:bg-muted/40">
              <div aria-hidden className={`h-24 w-full ${product.gradientClass}`} />
              <CardContent className="flex flex-col gap-2 py-4">
                <Badge variant="outline" className="w-fit">
                  {product.category}
                </Badge>
                <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm font-bold text-primary">{product.rateLabel}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
