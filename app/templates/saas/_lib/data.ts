import type { Icon } from "@phosphor-icons/react"
import {
  ArrowsClockwiseIcon,
  ChartLineUpIcon,
  CubeIcon,
  GaugeIcon,
  LightningIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"

import type { ContentItem } from "@/components/patterns/content-feed/content-feed"

/**
 * SaaS 템플릿(app/templates/saas/) 전용 데모 데이터.
 *
 * 가상 제품 "Flowbase" — 팀의 업무 흐름(워크플로)을 하나의 워크스페이스로
 * 묶어주는 협업 SaaS라는 설정. 실존 브랜드/인물과 무관한 제네릭 카피이며,
 * 순수 데이터만 담아 컴포넌트와 분리한다(테스트·재사용 용이).
 */

export const PRODUCT_NAME = "Flowbase"

// -----------------------------------------------------------------------
// 랜딩 — 기능 그리드
// -----------------------------------------------------------------------

export interface FeatureItem {
  icon: Icon
  title: string
  description: string
}

export const FEATURES: FeatureItem[] = [
  {
    icon: PuzzlePieceIcon,
    title: "워크스페이스 통합",
    description: "문서·태스크·대화를 하나의 워크스페이스에 모아 도구를 오가는 시간을 줄입니다.",
  },
  {
    icon: ArrowsClockwiseIcon,
    title: "실시간 동기화",
    description: "팀원의 변경사항이 즉시 반영돼 항상 최신 상태의 작업 현황을 볼 수 있습니다.",
  },
  {
    icon: ChartLineUpIcon,
    title: "진행률 대시보드",
    description: "프로젝트별 진행률과 병목 구간을 한눈에 파악할 수 있는 대시보드를 제공합니다.",
  },
  {
    icon: ShieldCheckIcon,
    title: "세밀한 권한 관리",
    description: "워크스페이스·프로젝트·문서 단위로 접근 권한을 세밀하게 설정할 수 있습니다.",
  },
  {
    icon: LightningIcon,
    title: "자동화 규칙",
    description: "반복 업무를 트리거·조건·액션 규칙으로 자동화해 수작업을 줄입니다.",
  },
  {
    icon: UsersThreeIcon,
    title: "게스트 협업",
    description: "외부 협업자를 프로젝트 단위로 초대해 안전하게 함께 작업할 수 있습니다.",
  },
]

// -----------------------------------------------------------------------
// 랜딩 — 가격표
// -----------------------------------------------------------------------

export interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted: boolean
  cta: string
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "0",
    period: "무료",
    description: "개인 또는 소규모 팀이 핵심 기능을 가볍게 시작하기 좋습니다.",
    features: ["워크스페이스 1개", "멤버 최대 5명", "기본 대시보드", "커뮤니티 지원"],
    highlighted: false,
    cta: "무료로 시작하기",
  },
  {
    name: "Team",
    price: "29,000",
    period: "/ 월 · 멤버당",
    description: "성장하는 팀에 맞는 자동화와 권한 관리 기능을 제공합니다.",
    features: [
      "워크스페이스 무제한",
      "멤버 무제한",
      "자동화 규칙 50개",
      "우선 이메일 지원",
      "감사 로그 30일 보관",
    ],
    highlighted: true,
    cta: "Team 플랜 시작하기",
  },
  {
    name: "Enterprise",
    price: "문의",
    period: "맞춤 견적",
    description: "대규모 조직을 위한 전담 지원과 보안 옵션을 제공합니다.",
    features: [
      "Team 플랜의 모든 기능",
      "SSO / SCIM 연동",
      "전담 고객 성공 매니저",
      "감사 로그 무제한 보관",
      "99.9% SLA 보장",
    ],
    highlighted: false,
    cta: "영업팀에 문의하기",
  },
]

// -----------------------------------------------------------------------
// 랜딩 — FAQ
// -----------------------------------------------------------------------

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "무료 플랜에서 유료 플랜으로 언제든 바꿀 수 있나요?",
    answer: "네, 설정 메뉴에서 언제든 플랜을 변경할 수 있습니다. 변경 즉시 남은 기간을 일할 계산해 정산합니다.",
  },
  {
    question: "기존에 쓰던 도구의 데이터를 옮겨올 수 있나요?",
    answer: "CSV 가져오기와 주요 협업 도구용 마이그레이션 가이드를 제공합니다. Enterprise 플랜은 전담 매니저가 이관을 지원합니다.",
  },
  {
    question: "게스트 협업자도 요금이 부과되나요?",
    answer: "프로젝트 단위로 초대하는 게스트는 열람·댓글 권한까지 무료이며, 편집 권한이 필요하면 정식 멤버로 전환해야 합니다.",
  },
  {
    question: "데이터는 얼마나 안전하게 보관되나요?",
    answer: "저장 데이터와 전송 구간 모두 암호화하며, Enterprise 플랜에서는 감사 로그와 SSO 연동으로 접근 이력을 통제할 수 있습니다.",
  },
  {
    question: "해지하면 데이터는 어떻게 되나요?",
    answer: "해지 후 30일 동안 데이터를 보관하며, 그 안에 다시 활성화하면 모든 워크스페이스가 그대로 복원됩니다.",
  },
]

// -----------------------------------------------------------------------
// 대시보드 — 요약 카드
// -----------------------------------------------------------------------

export interface SummaryStat {
  label: string
  value: string
  unit: string
  delta: string
  tone: "text-primary" | "text-success" | "text-warning" | "text-destructive"
  icon: Icon
}

export const DASHBOARD_SUMMARY: SummaryStat[] = [
  { label: "활성 워크스페이스", value: "128", unit: "개", delta: "+6 이번 달", tone: "text-primary", icon: CubeIcon },
  { label: "활성 사용자", value: "3,482", unit: "명", delta: "+142 이번 주", tone: "text-success", icon: UsersThreeIcon },
  { label: "자동화 실행", value: "18,940", unit: "회", delta: "+9.2%", tone: "text-warning", icon: LightningIcon },
  { label: "평균 응답 시간", value: "312", unit: "ms", delta: "-18ms", tone: "text-destructive", icon: GaugeIcon },
]

// -----------------------------------------------------------------------
// 피드 — content-feed / faceted 필터용 게시물
// -----------------------------------------------------------------------

export interface FeedWorkspace {
  key: string
  label: string
  /** 시맨틱 토큰 기반 강조 클래스 (배경+전경) — 하드코딩 색상 금지 규칙 준수. */
  toneClass: string
}

export const FEED_WORKSPACES: FeedWorkspace[] = [
  { key: "product", label: "제품", toneClass: "bg-primary text-primary-foreground" },
  { key: "engineering", label: "엔지니어링", toneClass: "bg-accent text-accent-foreground" },
  { key: "customers", label: "고객 사례", toneClass: "bg-secondary text-secondary-foreground" },
]

export interface FeedPost extends ContentItem {
  workspace: string
}

export const FEED_POSTS: FeedPost[] = [
  {
    id: "f1",
    workspace: "product",
    category: "릴리스",
    title: "Flowbase 3.4 — 자동화 규칙 조건 분기 추가",
    author: "김도현",
    updatedAt: "2026-07-10",
    summary: "자동화 규칙에 IF/ELSE 조건 분기를 추가해 복잡한 업무 흐름도 자동화할 수 있습니다.",
  },
  {
    id: "f2",
    workspace: "product",
    category: "가이드",
    title: "워크스페이스 초대 링크 관리 가이드",
    author: "이서연",
    updatedAt: "2026-07-05",
    summary: "만료 기한과 참여 승인 방식을 설정해 초대 링크를 안전하게 운영하는 방법을 정리합니다.",
  },
  {
    id: "f3",
    workspace: "product",
    category: "로드맵",
    title: "2026 하반기 제품 로드맵 공개",
    author: "박지훈",
    updatedAt: "2026-06-28",
    summary: "모바일 오프라인 모드와 캘린더 통합 등 하반기 주요 계획을 미리 소개합니다.",
  },
  {
    id: "f4",
    workspace: "engineering",
    category: "엔지니어링",
    title: "동기화 지연을 240ms에서 40ms로 줄인 방법",
    author: "최민아",
    updatedAt: "2026-07-08",
    summary: "실시간 동기화 파이프라인을 이벤트 기반으로 재설계한 과정을 공유합니다.",
  },
  {
    id: "f5",
    workspace: "engineering",
    category: "보안",
    title: "SCIM 프로비저닝 연동 아키텍처",
    author: "정우성",
    updatedAt: "2026-06-30",
    summary: "Enterprise 고객사의 사용자 자동 프로비저닝을 지원하는 SCIM 연동 구조를 설명합니다.",
  },
  {
    id: "f6",
    workspace: "engineering",
    category: "엔지니어링",
    title: "감사 로그 파이프라인 이중화",
    author: "한지민",
    updatedAt: "2026-06-22",
    summary: "리전 장애 상황에서도 감사 로그 유실 없이 이중화하는 구조를 정리합니다.",
  },
  {
    id: "f7",
    workspace: "customers",
    category: "고객 사례",
    title: "50인 스타트업이 온보딩 기간을 절반으로 줄인 방법",
    author: "오세훈",
    updatedAt: "2026-07-01",
    summary: "자동화 규칙과 템플릿을 활용해 신규 입사자 온보딩을 표준화한 사례입니다.",
  },
  {
    id: "f8",
    workspace: "customers",
    category: "베스트 프랙티스",
    title: "대규모 조직의 워크스페이스 구조 설계 팁",
    author: "윤태오",
    updatedAt: "2026-06-24",
    summary: "부서·프로젝트·외부 협업자를 어떻게 워크스페이스 단위로 나눌지 실전 팁을 정리합니다.",
  },
  {
    id: "f9",
    workspace: "customers",
    category: "고객 사례",
    title: "고객 지원팀의 응답 시간을 단축한 자동화 규칙",
    author: "김도현",
    updatedAt: "2026-06-12",
    summary: "문의 유형별 자동 라우팅과 알림 규칙으로 1차 응답 시간을 40% 줄인 사례입니다.",
  },
]


/** 문서 목록 1건 — 대시보드의 문서 탐색 영역이 쓴다. */
export interface DocItem {
  id: string
  title: string
  type: "guide" | "update" | "notice"
  updatedAt: string
}

/** 문서 목록 탭 축 — 빈 key 는 "전체". */
export const DOC_TABS: { key: string; label: string }[] = [
  { key: "", label: "전체" },
  { key: "guide", label: "가이드" },
  { key: "update", label: "업데이트" },
  { key: "notice", label: "공지" },
]

/** 한 페이지에 보여줄 문서 수. */
export const DOC_PAGE_SIZE = 4

export const DOC_ITEMS: DocItem[] = [
  { id: "d1", title: "Flowbase 설치 가이드", type: "guide", updatedAt: "2026-07-01" },
  { id: "d2", title: "환경 변수 설정 가이드", type: "guide", updatedAt: "2026-06-29" },
  { id: "d3", title: "v3.2 업데이트 노트", type: "update", updatedAt: "2026-06-27" },
  { id: "d4", title: "정기 점검 공지", type: "notice", updatedAt: "2026-06-25" },
  { id: "d5", title: "API 마이그레이션 가이드", type: "guide", updatedAt: "2026-06-20" },
  { id: "d6", title: "v3.1 업데이트 노트", type: "update", updatedAt: "2026-06-18" },
  { id: "d7", title: "요금제 변경 공지", type: "notice", updatedAt: "2026-06-15" },
  { id: "d8", title: "보안 패치 업데이트", type: "update", updatedAt: "2026-06-10" },
  { id: "d9", title: "권한 관리 가이드", type: "guide", updatedAt: "2026-06-05" },
  { id: "d10", title: "서비스 점검 완료 공지", type: "notice", updatedAt: "2026-06-01" },
]
