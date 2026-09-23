"use client"

import { CheckIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export type BillingPeriod = "monthly" | "yearly"

export interface PricingTier {
  name: string
  /** 월 결제 기준 가격. 0 이면 무료 티어로 표시한다. */
  monthlyPrice: number
  description: string
  features: string[]
  /** 추천 티어 — ring 강조 + 배지. */
  highlighted?: boolean
  cta: string
}

export interface PricingTableLabels {
  monthly: string
  yearly: string
  discount: (percent: number) => string
  recommended: string
  free: string
  perUnit: string
  price: (amount: number) => string
}

export const PRICING_TABLE_DEFAULT_LABELS: PricingTableLabels = {
  monthly: "월간 결제",
  yearly: "연간 결제",
  discount: (percent) => `${percent}% 할인`,
  recommended: "추천",
  free: "무료",
  perUnit: "/ 월 · 멤버당",
  price: (amount) => `₩${amount.toLocaleString()}`,
}

export interface PricingTableProps {
  tiers: PricingTier[]
  /** 선택된 결제 주기 — 상태는 부모가 소유한다. */
  period: BillingPeriod
  onPeriodChange: (period: BillingPeriod) => void
  /** 연 결제 할인율(0~1). 기본 0.17 = 2개월치 면제. */
  yearlyDiscountRate?: number
  /** 토글 Switch 의 id — 한 화면에 둘 이상 놓을 때 구분한다. */
  toggleId?: string
  labels?: Partial<PricingTableLabels>
  className?: string
}

/** 결제 주기에 따른 월 환산 가격. */
export function pricePerMonth(tier: PricingTier, period: BillingPeriod, yearlyDiscountRate: number): number {
  if (tier.monthlyPrice === 0) return 0
  if (period === "monthly") return tier.monthlyPrice
  return Math.round((tier.monthlyPrice * 12 * (1 - yearlyDiscountRate)) / 12)
}

/**
 * 티어 가격 카드 + 월/연 결제 토글. 연간 결제를 고르면 할인율을 배지로 보여주고,
 * 추천 티어는 ring 강조 + 배지로 구분한다. 가격은 언제나 월 환산으로 표기해
 * 주기를 바꿔도 비교 기준이 흔들리지 않게 한다.
 */
export function PricingTable({
  tiers,
  period,
  onPeriodChange,
  yearlyDiscountRate = 0.17,
  toggleId = "pricing-billing-toggle",
  labels,
  className,
}: Readonly<PricingTableProps>) {
  const text = { ...PRICING_TABLE_DEFAULT_LABELS, ...labels }
  const isYearly = period === "yearly"

  return (
    <div className={cn("flex w-full flex-col items-center gap-6", className)}>
      <div className="flex items-center gap-3">
        <Label htmlFor={toggleId} className={isYearly ? "text-muted-foreground" : "text-foreground"}>
          {text.monthly}
        </Label>
        <Switch
          id={toggleId}
          checked={isYearly}
          onCheckedChange={(checked) => onPeriodChange(checked ? "yearly" : "monthly")}
        />
        <Label htmlFor={toggleId} className={isYearly ? "text-foreground" : "text-muted-foreground"}>
          {text.yearly}
        </Label>
        <Badge variant="secondary" className="text-success">
          {text.discount(Math.round(yearlyDiscountRate * 100))}
        </Badge>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className={cn(tier.highlighted && "ring-2 ring-primary")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tier.name}</CardTitle>
                {tier.highlighted && (
                  <Badge variant="default" className="gap-1 text-[10px]">
                    <SealCheckIcon size={12} weight="fill" />
                    {text.recommended}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{tier.description}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums text-foreground">
                  {tier.monthlyPrice === 0 ? text.free : text.price(pricePerMonth(tier, period, yearlyDiscountRate))}
                </span>
                {tier.monthlyPrice > 0 && <span className="text-xs text-muted-foreground">{text.perUnit}</span>}
              </p>
              <ul className="flex flex-col gap-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckIcon size={16} weight="bold" className="mt-0.5 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.highlighted ? "default" : "outline"}>
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
