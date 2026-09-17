import Link from "next/link"

import { PRODUCT_CATEGORIES } from "@/app/templates/bank/_data/product-categories-data"

export function ProductCategories() {
  return (
    <section aria-label="금융상품 카테고리" className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">금융상품</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {PRODUCT_CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <Link
              key={category.key}
              href={category.href}
              className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-muted/60"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon size={28} weight="duotone" />
              </span>
              <span className="text-sm font-medium text-foreground">{category.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
