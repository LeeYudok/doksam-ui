import type { Icon } from "@phosphor-icons/react"
import { ChartPieIcon, CoinsIcon, CurrencyCircleDollarIcon, PiggyBankIcon } from "@phosphor-icons/react/dist/ssr"

/** 금융상품 원형 카테고리 4종 — 예금/신탁·대출·펀드·외환. */
export interface ProductCategory {
  key: string
  label: string
  icon: Icon
  href: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { key: "deposit-trust", label: "예금/신탁", icon: PiggyBankIcon, href: "#category-deposit-trust" },
  { key: "loan", label: "대출", icon: CoinsIcon, href: "#category-loan" },
  { key: "fund", label: "펀드", icon: ChartPieIcon, href: "#category-fund" },
  { key: "forex", label: "외환", icon: CurrencyCircleDollarIcon, href: "#category-forex" },
]
