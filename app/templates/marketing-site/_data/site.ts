/** Marketing Site 템플릿(#89) 로컬 placeholder 데이터 — 가상의 제품 "Flowdeck". */

export const PRODUCT_NAME = "Flowdeck"

export interface NavLink {
  href: string
  label: string
}

/** 상단 가로 메뉴 — top-nav-site 원형은 목적지를 8개 이하로 유지한다. */
export const NAV_LINKS: NavLink[] = [
  { href: "#features", label: "기능" },
  { href: "#workflow", label: "동작 방식" },
  { href: "#pricing", label: "요금" },
  { href: "#faq", label: "FAQ" },
]

export interface Feature {
  id: string
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    id: "collect",
    title: "흩어진 작업을 한 판에",
    description: "이슈 트래커·문서·메시지에 흩어진 할 일을 하나의 보드로 모아 우선순위를 한 화면에서 정합니다.",
  },
  {
    id: "automate",
    title: "규칙으로 굴러가는 흐름",
    description: "상태 전이·담당자 배정·알림을 규칙으로 정의해 반복 작업을 사람 손에서 떼어냅니다.",
  },
  {
    id: "measure",
    title: "지연을 숫자로",
    description: "단계별 체류 시간을 집계해 어디서 흐름이 막히는지 추측이 아니라 값으로 보여줍니다.",
  },
  {
    id: "closed",
    title: "폐쇄망에서도 그대로",
    description: "외부 CDN 없이 전부 self-host 됩니다. 인터넷이 끊긴 내부망에서도 같은 화면이 뜹니다.",
  },
]

export interface WorkflowStep {
  num: number
  title: string
  description: string
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { num: 1, title: "연결", description: "쓰던 도구를 그대로 연결합니다. 데이터를 옮기지 않습니다." },
  { num: 2, title: "정리", description: "보드 하나에 모아 우선순위와 담당을 정합니다." },
  { num: 3, title: "자동화", description: "반복되는 전이를 규칙으로 굳혀 손을 뗍니다." },
  { num: 4, title: "측정", description: "단계별 지연을 집계해 다음 개선 지점을 고릅니다." },
]

export interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  featured: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "무료",
    period: "5인까지",
    description: "작은 팀이 흐름을 잡아보는 단계",
    features: ["보드 3개", "기본 규칙 5개", "30일 이력 보관"],
    featured: false,
  },
  {
    id: "team",
    name: "Team",
    price: "12,000원",
    period: "사용자/월",
    description: "여러 팀이 같은 규칙으로 움직이는 단계",
    features: ["보드 무제한", "규칙 무제한", "1년 이력 보관", "단계별 지연 리포트"],
    featured: true,
  },
  {
    id: "onprem",
    name: "On-prem",
    price: "문의",
    period: "연 단위",
    description: "폐쇄망·자체 인프라에 직접 올리는 단계",
    features: ["설치형 배포", "SSO 연동", "감사 로그", "전담 지원"],
    featured: false,
  },
]

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "migration",
    question: "쓰던 도구를 버려야 하나요?",
    answer:
      "아닙니다. Flowdeck 은 기존 트래커를 대체하지 않고 그 위에 흐름 층만 얹습니다. 원본 데이터는 원래 있던 곳에 그대로 둡니다.",
  },
  {
    id: "closed-network",
    question: "인터넷이 없는 내부망에서도 되나요?",
    answer:
      "됩니다. 폰트·아이콘을 포함한 모든 리소스를 함께 배포하며 외부 요청을 하지 않습니다. On-prem 플랜이 이 경우를 위한 것입니다.",
  },
  {
    id: "trial",
    question: "도입 전에 얼마나 써볼 수 있나요?",
    answer: "Starter 플랜은 기간 제한 없이 5인까지 무료입니다. 카드 등록 없이 시작하고, 필요해지면 그때 올리면 됩니다.",
  },
  {
    id: "data",
    question: "이 화면의 숫자는 실제인가요?",
    answer: "아닙니다. 이 템플릿은 doksam-ui 카탈로그의 레이아웃 예시이며 모든 값은 로컬 placeholder 입니다.",
  },
]

export interface Metric {
  id: string
  value: string
  label: string
}

export const METRICS: Metric[] = [
  { id: "teams", value: "1,200+", label: "사용 중인 팀" },
  { id: "lead-time", value: "-38%", label: "평균 리드타임" },
  { id: "uptime", value: "99.9%", label: "가용성" },
]
