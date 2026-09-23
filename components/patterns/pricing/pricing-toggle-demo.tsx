"use client"

import { useState } from "react"

import { PricingTable, type BillingPeriod, type PricingTier } from "@/components/patterns/pricing/pricing-table"

const TIERS: PricingTier[] = [
  {
    name: "Starter",
    monthlyPrice: 0,
    description: "개인 또는 소규모 팀이 핵심 기능을 가볍게 시작하기 좋습니다.",
    features: ["워크스페이스 1개", "멤버 최대 5명", "기본 대시보드", "커뮤니티 지원"],
    cta: "무료로 시작하기",
  },
  {
    name: "Team",
    monthlyPrice: 29000,
    description: "성장하는 팀에 맞는 자동화와 권한 관리 기능을 제공합니다.",
    features: ["워크스페이스 무제한", "멤버 무제한", "자동화 규칙 50개", "우선 이메일 지원", "감사 로그 30일 보관"],
    highlighted: true,
    cta: "Team 플랜 시작하기",
  },
  {
    name: "Enterprise",
    monthlyPrice: 89000,
    description: "대규모 조직을 위한 전담 지원과 보안 옵션을 제공합니다.",
    features: ["Team 플랜의 모든 기능", "SSO / SCIM 연동", "전담 고객 성공 매니저", "감사 로그 무제한 보관", "99.9% SLA 보장"],
    cta: "영업팀에 문의하기",
  },
]

/** /patterns/pricing 데모용 — 3티어 SaaS 가격표. */
export function PricingToggleDemo() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly")
  return <PricingTable tiers={TIERS} period={period} onPeriodChange={setPeriod} />
}
