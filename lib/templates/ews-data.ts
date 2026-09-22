import {
  BellRingingIcon,
  BriefcaseIcon,
  ChartDonutIcon,
  FileTextIcon,
  GearSixIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import type { RiskLevel } from "@/lib/risk-tokens"

/**
 * EWS(여신 조기경보) 템플릿군이 공유하는 가상 데모 데이터 (#89).
 *
 * 화면 파일과 분리해 두는 이유는 두 가지다. 하나는 #58 선례대로 데모 데이터가
 * 실물 컴포넌트에 섞이면 소비 프로젝트가 `shadcn add` 로 가져갔을 때 지워야 할
 * 자리를 찾지 못하기 때문이고, 다른 하나는 이 데이터가 한 화면 전용이 아니기
 * 때문이다 — `/templates/ews-dashboard`(#89) 와 후속 EWS 템플릿(#90)이 같은
 * 가상 기관·같은 차주 목록·같은 기준시각을 써야 두 화면이 한 시스템으로 읽힌다.
 * `lib/templates/trading-data.ts` 와 같은 자리다.
 *
 * 표시되는 기관명·차주명·사업자번호·금액은 전부 가상이다.
 */

/**
 * 화면 기준시각. 컴포넌트 안에서 `new Date()` 를 읽지 않는다 — 서버와
 * 클라이언트가 서로 다른 시각을 렌더하면 hydration 이 어긋난다.
 */
export const EWS_AS_OF = "2026-09-23 06:00:00"

/** 가상 기관명. 실재 금융기관과 무관하다. */
export const EWS_ORG_NAME = "누리은행 여신 조기경보"

export interface EwsNavItem {
  key: string
  label: string
  icon: Icon
  href?: string
}

/** top-nav 셸(#86) 의 글로벌 메뉴. EWS 템플릿들이 같은 메뉴를 쓴다. */
export const EWS_NAV_ITEMS: EwsNavItem[] = [
  { key: "home", label: "조기경보 홈", icon: BellRingingIcon, href: "/templates/ews-dashboard" },
  { key: "borrowers", label: "차주 관리", icon: UsersThreeIcon },
  { key: "audit", label: "여신감리", icon: ShieldCheckIcon },
  { key: "portfolio", label: "포트폴리오", icon: ChartDonutIcon },
  { key: "reports", label: "리포트", icon: FileTextIcon },
  { key: "tasks", label: "내 업무함", icon: BriefcaseIcon },
  { key: "settings", label: "환경설정", icon: GearSixIcon },
]

export interface EwsSubTab {
  key: string
  label: string
}

/** 홈 대시보드의 화면 내 탭. */
export const EWS_HOME_SUB_TABS: EwsSubTab[] = [
  { key: "overview", label: "전체 요약" },
  { key: "severe", label: "경보 차주" },
  { key: "due", label: "기한 임박" },
]

export interface EwsKpi {
  key: string
  label: string
  /** 문자열로 고정된 표시값(건수·개사). 금액 지표는 대신 `valueWon` 을 쓴다. */
  value?: string
  /** 원 단위 금액. 표시 형식은 화면이 `formatWon` 으로 정한다. */
  valueWon?: number
  /** 전일 대비 증감률(%). 부호가 곧 방향이고 색은 rateColor 가 정한다. */
  change: number
  /** 증감의 의미를 색 없이도 읽게 하는 보조 문구. */
  caption: string
}

export interface EwsGradeSlice {
  level: RiskLevel
  /** 등급 표기 문구. 색각 이상 사용자에게 등급을 전달하는 두 번째 채널이다. */
  label: string
  tier: number
  count: number
}

/** 등급 분포 — 합계가 곧 모니터링 대상 차주 수다. */
export const EWS_GRADE_DISTRIBUTION: EwsGradeSlice[] = [
  { level: "severe", label: "경보", tier: 4, count: 18 },
  { level: "high", label: "주의", tier: 3, count: 47 },
  { level: "moderate", label: "관찰", tier: 2, count: 126 },
  { level: "low", label: "정상", tier: 1, count: 941 },
]

export const EWS_MONITORED_COUNT = EWS_GRADE_DISTRIBUTION.reduce((sum, slice) => sum + slice.count, 0)

/** 상단 KPI 4장. 금액 원본은 원 단위로 두고 표시 단위는 화면이 정한다. */
export const EWS_TOTAL_EXPOSURE_WON = 1_284_000_000_000

export const EWS_KPIS: EwsKpi[] = [
  {
    key: "exposure",
    label: "모니터링 여신잔액",
    valueWon: EWS_TOTAL_EXPOSURE_WON,
    change: 1.4,
    caption: "전일 대비 증가",
  },
  {
    key: "severe",
    label: "경보 등급 차주",
    value: "18개사",
    change: 5.9,
    caption: "전일 대비 1개사 증가",
  },
  {
    key: "new-signal",
    label: "신규 경보 신호",
    value: "7건",
    change: -12.5,
    caption: "전일 대비 1건 감소",
  },
  {
    key: "due",
    label: "기한 임박 과제",
    value: "4건",
    change: 0,
    caption: "전일과 동일",
  },
]

export interface EwsBorrowerRow {
  id: string
  name: string
  bizNo: string
  industry: string
  level: RiskLevel
  /** 등급 표기 문구 — 배지와 행 sr-only 두 번째 채널이 공유한다. */
  gradeLabel: string
  tier: number
  exposureWon: number
  /** 경보를 띄운 신호 요약. */
  signal: string
  /** 조치 기한 문구. 상대시간을 화면이 계산하지 않도록 문자열로 고정한다. */
  dueLabel: string
  owner: string
}

/** 긴급 처리 차주 — 등급 내림차순. */
export const EWS_URGENT_BORROWERS: EwsBorrowerRow[] = [
  {
    id: "B-20260923-01",
    name: "한빛정밀(주)",
    bizNo: "1234567890",
    industry: "2차전지 장비",
    level: "severe",
    gradeLabel: "경보",
    tier: 4,
    exposureWon: 42_800_000_000,
    signal: "당좌 한도 초과 3일 연속 · 주거래 이탈",
    dueLabel: "D-1 · 2026-09-24",
    owner: "김성호 심사역",
  },
  {
    id: "B-20260923-02",
    name: "대원화학공업(주)",
    bizNo: "2345678901",
    industry: "석유화학",
    level: "severe",
    gradeLabel: "경보",
    tier: 4,
    exposureWon: 31_500_000_000,
    signal: "분기 매출 -38% · 국세 체납 발생",
    dueLabel: "D-2 · 2026-09-25",
    owner: "박지연 심사역",
  },
  {
    id: "B-20260923-03",
    name: "서진물류(주)",
    bizNo: "3456789012",
    industry: "육상 운송",
    level: "high",
    gradeLabel: "주의",
    tier: 3,
    exposureWon: 18_200_000_000,
    signal: "대표이사 변경 · 담보 부동산 후순위 설정",
    dueLabel: "D-4 · 2026-09-27",
    owner: "김성호 심사역",
  },
  {
    id: "B-20260923-04",
    name: "금호테크놀로지(주)",
    bizNo: "4567890123",
    industry: "반도체 부품",
    level: "high",
    gradeLabel: "주의",
    tier: 3,
    exposureWon: 9_640_000_000,
    signal: "차입금 의존도 68% · 이자보상배율 0.8",
    dueLabel: "D-6 · 2026-09-29",
    owner: "이한결 심사역",
  },
  {
    id: "B-20260923-05",
    name: "우성식품(주)",
    bizNo: "5678901234",
    industry: "식료품 제조",
    level: "moderate",
    gradeLabel: "관찰",
    tier: 2,
    exposureWon: 3_150_000_000,
    signal: "원재료 단가 급등 · 재고회전율 하락",
    dueLabel: "D-9 · 2026-10-02",
    owner: "이한결 심사역",
  },
]
