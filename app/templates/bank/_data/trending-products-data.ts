/** "지금 뜨는 상품" 카드 3종 — 예금·적금·대출. 이미지는 CSS 그라디언트로 대체한다. */
export interface TrendingProduct {
  id: string
  category: "예금" | "적금" | "대출"
  name: string
  rateLabel: string
  description: string
  /** 카드 상단 이미지 대체 그라디언트(시맨틱 토큰 조합). */
  gradientClass: string
  href: string
}

export const TRENDING_PRODUCTS: TrendingProduct[] = [
  {
    id: "steady-deposit",
    category: "예금",
    name: "누리 든든 정기예금",
    rateLabel: "연 3.8%",
    description: "가입 기간 1년, 중도해지도 최소한의 이자를 보장하는 정기예금입니다.",
    gradientClass: "bg-gradient-to-br from-primary/70 to-primary/20",
    href: "#trending-steady-deposit",
  },
  {
    id: "goal-saving",
    category: "적금",
    name: "누리 목표달성 자유적금",
    rateLabel: "최대 연 5.2%",
    description: "저축 목표를 설정하면 달성률에 따라 우대금리를 추가로 제공합니다.",
    gradientClass: "bg-gradient-to-br from-accent/70 to-accent/20",
    href: "#trending-goal-saving",
  },
  {
    id: "home-loan",
    category: "대출",
    name: "누리 보금자리 주택담보대출",
    rateLabel: "연 3.5%~",
    description: "고정금리와 변동금리 중 선택 가능한 실수요자 전용 주택담보대출입니다.",
    gradientClass: "bg-gradient-to-br from-secondary to-secondary/40",
    href: "#trending-home-loan",
  },
]
