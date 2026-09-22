/**
 * Company Intelligence 대시보드 데모 데이터(#53) — 순수 데이터 모듈(컴포넌트 로직 없음).
 * bizinfo 기업 상세 화면의 카드 조합만 참고했으며, 기업명·사업자번호·주소·수치는
 * 전부 가상이다(실존 기업·실데이터 미포함). 실제 연동 시 이 파일을 교체한다.
 */

import type { Icon } from "@phosphor-icons/react"
import {
  BuildingOfficeIcon,
  CalendarBlankIcon,
  CoinsIcon,
  ShieldCheckIcon,
  TrendUpIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"

import type { RelationGroup, RelationNode } from "@/components/relation-network"
import type { KeywordCloudKeyword } from "@/components/keyword-cloud"

/** 가상 기업 프로필 — 헤더 식별 정보. */
export const COMPANY = {
  name: "한빛정밀(주)",
  /** 가상 사업자번호(실존 번호 아님). */
  bizNo: "217-88-04519",
  ceo: "정하윤",
  industry: "정밀기계 부품 제조",
  sector: "제조 · 기계",
  status: "계속사업자",
  /** 가상 신용등급. */
  creditGrade: "BBB+",
  /** 지도 placeholder 에 표시할 가상 주소. */
  address: "경기도 안산시 단원구 산단로 128, 3층 (성곡동)",
} as const

/** KPI 요약 카드 항목. */
export interface Kpi {
  key: string
  label: string
  value: string
  /** 값 아래 보조 설명(증감·기준일 등). */
  hint: string
  icon: Icon
}

export const KPIS: Kpi[] = [
  { key: "workers", label: "임직원", value: "184명", hint: "전년 대비 +12명", icon: UsersThreeIcon },
  { key: "founded", label: "설립연도", value: "2004년", hint: "업력 21년", icon: CalendarBlankIcon },
  { key: "revenue", label: "매출액", value: "742억원", hint: "2024 회계연도", icon: CoinsIcon },
  { key: "operating", label: "영업이익", value: "58억원", hint: "영업이익률 7.8%", icon: TrendUpIcon },
  { key: "credit", label: "신용등급", value: "BBB+", hint: "안정적 · 2025-03 평가", icon: ShieldCheckIcon },
  { key: "capital", label: "자본금", value: "35억원", hint: "비상장 · 주식회사", icon: BuildingOfficeIcon },
]

/** 뉴스 피드 항목 — 전부 가상 헤드라인. */
export interface NewsItem {
  id: string
  title: string
  source: string
  /** YYYY-MM-DD. */
  date: string
  /** 논조 태그(정보성). */
  tag: "실적" | "투자" | "계약" | "인사" | "ESG"
}

export const NEWS: NewsItem[] = [
  { id: "n1", title: "한빛정밀, 2차전지 장비용 초정밀 부품 신규 라인 증설 착수", source: "가상경제신문", date: "2025-06-28", tag: "투자" },
  { id: "n2", title: "1분기 매출 191억원…전년 동기 대비 9.4% 성장", source: "데모산업일보", date: "2025-05-14", tag: "실적" },
  { id: "n3", title: "국내 완성차 협력사와 3년 장기 공급계약 체결", source: "목업오토데일리", date: "2025-04-30", tag: "계약" },
  { id: "n4", title: "정하윤 대표, 스마트공장 고도화 로드맵 발표", source: "가상경제신문", date: "2025-04-11", tag: "인사" },
  { id: "n5", title: "탄소저감 공정 전환으로 온실가스 14% 감축 인증", source: "데모환경뉴스", date: "2025-03-22", tag: "ESG" },
  { id: "n6", title: "베트남 생산법인 설립…해외 수출 비중 확대 추진", source: "목업글로벌비즈", date: "2025-02-18", tag: "투자" },
  { id: "n7", title: "품질경영시스템 재인증 획득, 불량률 0.3%대 유지", source: "데모산업일보", date: "2025-01-27", tag: "실적" },
  { id: "n8", title: "정밀가공 인력 40명 신규 채용 계획 공고", source: "가상채용소식", date: "2025-01-09", tag: "인사" },
]

/** 출자·주주 관계 그룹(계열 색). */
export const RELATION_GROUPS: RelationGroup[] = [
  { key: "out-invest", label: "출자한 회사", color: "var(--chart-1)" },
  { key: "shareholder", label: "주요 주주", color: "var(--chart-2)" },
  { key: "affiliate", label: "계열·관계사", color: "var(--chart-3)" },
  { key: "in-invest", label: "이 회사에 출자", color: "var(--chart-4)" },
]

/** 출자·주주 관계 노드 — weight 는 지분율(%). 전부 가상. */
export const RELATION_NODES: RelationNode[] = [
  { id: "r1", label: "한빛테크솔루션(주)", group: "out-invest", weight: 100 },
  { id: "r2", label: "정밀몰드공업(주)", group: "out-invest", weight: 68.5 },
  { id: "r3", label: "안산스마트팩토리(주)", group: "out-invest", weight: 45 },
  { id: "r4", label: "베트남 HANBIT VINA", group: "out-invest", weight: 30 },
  { id: "r5", label: "정하윤 (대표이사)", group: "shareholder", weight: 41.2 },
  { id: "r6", label: "정우성 (특수관계인)", group: "shareholder", weight: 12.8 },
  { id: "r7", label: "새길인베스트먼트", group: "shareholder", weight: 9.6 },
  { id: "r8", label: "동행성장펀드 2호", group: "shareholder", weight: 6.3 },
  { id: "r9", label: "우리사주조합", group: "shareholder", weight: 4.5 },
  { id: "r10", label: "한빛물류(주)", group: "affiliate", weight: 22 },
  { id: "r11", label: "한빛소재개발(주)", group: "affiliate", weight: 18 },
  { id: "r12", label: "대성머티리얼즈(주)", group: "in-invest", weight: 7.4 },
]

/** 연관 키워드 — keyword-cloud 용. count 는 언급 빈도(가상). */
export const KEYWORDS: KeywordCloudKeyword[] = [
  {
    label: "2차전지 장비",
    count: 24,
    items: [
      { title: "초정밀 부품 신규 라인 증설", meta: "2025-06-28" },
      { title: "장비용 가공 수주 확대", meta: "2025-05-14" },
    ],
  },
  {
    label: "스마트공장",
    count: 18,
    items: [
      { title: "스마트공장 고도화 로드맵", meta: "2025-04-11" },
      { title: "공정 자동화 설비 투자", meta: "2025-02-18" },
    ],
  },
  { label: "정밀가공", count: 16, items: [{ title: "정밀가공 인력 신규 채용", meta: "2025-01-09" }] },
  { label: "수출 확대", count: 13, items: [{ title: "베트남 생산법인 설립", meta: "2025-02-18" }] },
  { label: "완성차 협력", count: 11, items: [{ title: "3년 장기 공급계약 체결", meta: "2025-04-30" }] },
  { label: "ESG", count: 9, items: [{ title: "온실가스 14% 감축 인증", meta: "2025-03-22" }] },
  { label: "품질경영", count: 7, items: [{ title: "QMS 재인증 획득", meta: "2025-01-27" }] },
  { label: "설비투자", count: 6 },
  { label: "해외법인", count: 5 },
]

/** 내부 메모(가상 애널리스트 코멘트). */
export const MEMOS = [
  { id: "m1", author: "김담당", date: "2025-06-30", text: "2차전지 장비 수요 확대로 라인 증설 진행 중. 하반기 수주잔고 모니터링 필요." },
  { id: "m2", author: "이심사", date: "2025-05-16", text: "1분기 매출 성장세 양호. 영업이익률 7%대 유지, 신용등급 안정적." },
  { id: "m3", author: "박관리", date: "2025-04-12", text: "스마트공장 투자로 단기 CAPEX 부담 있으나 중장기 원가 개선 기대." },
]
