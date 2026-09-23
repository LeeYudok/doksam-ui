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

/**
 * top-nav 셸(#86) 의 글로벌 메뉴. EWS 템플릿들이 같은 메뉴를 쓴다.
 *
 * 항목에 `href` 를 박지 않는다 — 이 배열은 여러 템플릿 항목의 설치 폐포에 함께 들어가므로,
 * 특정 템플릿의 라우트를 가리키면 그 템플릿을 같이 설치하지 않은 소비 프로젝트에서 404 가
 * 된다(예: `template-ews-diagnosis` 단독 설치 시 `/templates/ews-dashboard`). 셸은 href 가
 * 없으면 `onSelect` 를 호출하는 버튼으로 렌더하므로, 목적지는 소비 프로젝트가 자신의
 * 라우트에 맞춰 주입한다.
 */
export const EWS_NAV_ITEMS: EwsNavItem[] = [
  { key: "home", label: "조기경보 홈", icon: BellRingingIcon },
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
  /** 전일 대비 증감률(%). 부호는 방향일 뿐이고, 좋고 나쁨은 `betterWhen` 이 정한다. */
  change: number
  /**
   * 값이 어느 쪽으로 움직여야 좋은 지표인지 — `metric-comparison-table` 의
   * `betterWhen` 과 같은 의미다. 색을 부호가 아니라 이 값으로 정한다: 경보 차주가
   * 늘어난 것은 악화지 이익이 아니다. 시세가 아니므로 한국식 등락 관례 토큰
   * (`--gain`/`--loss`, `lib/finance/rate.ts`)이 아니라 `--success`/`--destructive`
   * 로 칠한다.
   */
  betterWhen: "higher" | "lower"
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
    betterWhen: "lower",
    caption: "전일 대비 증가",
  },
  {
    key: "severe",
    label: "경보 등급 차주",
    value: "18개사",
    change: 5.9,
    betterWhen: "lower",
    caption: "전일 대비 1개사 증가",
  },
  {
    key: "new-signal",
    label: "신규 경보 신호",
    value: "7건",
    change: -12.5,
    betterWhen: "lower",
    caption: "전일 대비 1건 감소",
  },
  {
    key: "due",
    label: "기한 임박 과제",
    value: "4건",
    change: 0,
    betterWhen: "lower",
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

/** 진단 상세(#90) 의 화면 내 탭. 홈과 목적이 달라 서브탭 집합을 따로 둔다. */
export const EWS_DIAGNOSIS_SUB_TABS: EwsSubTab[] = [
  { key: "diagnosis", label: "원인 진단" },
  { key: "evidence", label: "근거 자료" },
  { key: "history", label: "조치 이력" },
]

export interface EwsDiagnosisFactor {
  key: string
  /** 기여 변수명. */
  label: string
  /** 위험 점수 기여도(%). */
  percent: number
  /** 위험을 올리는 요인인지 내리는 요인인지. */
  direction: "increase" | "decrease"
  /** 근거 감사코드 — contribution-meter 가 AuditCodeTag 로 함께 렌더한다. */
  code: string
  /** 관측값 요약. 색 외 두 번째 채널로 수치의 의미를 글로 남긴다. */
  note: string
}

export interface EwsEvidenceRow {
  id: string
  /** 근거 감사코드. */
  code: string
  /** 자료 출처(내부 시스템·외부 기관). */
  source: string
  /** 관측 내용. */
  observation: string
  level: RiskLevel
  /** 등급 표기 문구 — 색 외 두 번째 채널. */
  levelLabel: string
  /** 수집 시각. 화면이 상대시간을 계산하지 않도록 문자열로 고정한다. */
  collectedAt: string
}

export interface EwsCollectionItem {
  key: string
  /** 수집 대상 자료명. */
  label: string
  /** 수집 진척률(%). */
  percent: number
  /** 진척률을 색·게이지 외 문구로 다시 말해 주는 상태 표기. */
  status: string
}

export interface EwsDiagnosis {
  /** 대상 차주 id — EWS_URGENT_BORROWERS.id 와 같다. */
  borrowerId: string
  /** 진단 요약 한 문단. */
  summary: string
  /** 판단을 만든 모델·규정 버전. 감사 추적의 시작점이다. */
  modelLabel: string
  /** 종합 위험 점수 표기. */
  scoreLabel: string
  factors: EwsDiagnosisFactor[]
  evidence: EwsEvidenceRow[]
  collection: EwsCollectionItem[]
  /** 다음 단계 안내 — 하단 고정 액션바의 보조 정보로 쓴다. */
  nextStepLabel: string
}

/**
 * 차주별 경보 원인 진단 (#90). 홈 대시보드(#89) 의 긴급 처리 차주 5건과 같은 키를
 * 써서 두 화면이 한 시스템으로 읽히게 한다. 전부 가상 데이터다.
 *
 * 값 타입에 `| undefined` 를 명시한다 — 차주 목록과 진단 결과는 별개 배치라
 * 키가 비는 경우가 실제로 생기고, 그때 화면이 빈 상태를 그리도록 타입이 강제한다.
 */
export const EWS_DIAGNOSES: Record<string, EwsDiagnosis | undefined> = {
  "B-20260923-01": {
    borrowerId: "B-20260923-01",
    summary:
      "당좌 한도 초과가 3영업일 연속 관측되었고 같은 기간 주거래 입금 비중이 급락했습니다. 운전자금 경색이 매출 감소보다 먼저 나타난 유형입니다.",
    modelLabel: "EWS 스코어링 v4.2 · 여신감리 준수 지침 제2026-42호",
    scoreLabel: "종합 위험 점수 87 / 100",
    factors: [
      {
        key: "overdraft",
        label: "당좌 한도 초과 지속",
        percent: 34,
        direction: "increase",
        code: "EVD-2026-0912",
        note: "3영업일 연속 · 최대 초과액 8.2억원",
      },
      {
        key: "main-bank",
        label: "주거래 입금 비중 이탈",
        percent: 27,
        direction: "increase",
        code: "EVD-2026-0914",
        note: "68% → 31% (전월 대비)",
      },
      {
        key: "tax",
        label: "국세 체납 미발생",
        percent: 12,
        direction: "decrease",
        code: "TAX-2026-0301",
        note: "체납 이력 없음 · 최근 조회일 09-20",
      },
      {
        key: "collateral",
        label: "담보 인정가 하락",
        percent: 18,
        direction: "increase",
        code: "COL-2026-0733",
        note: "공장 부지 감정가 -11%",
      },
    ],
    evidence: [
      {
        id: "E-01-1",
        code: "EVD-2026-0912",
        source: "내부 여신관리시스템",
        observation: "당좌 한도 초과 3영업일 연속 발생",
        level: "severe",
        levelLabel: "경보",
        collectedAt: "2026-09-23 05:40:00",
      },
      {
        id: "E-01-2",
        code: "EVD-2026-0914",
        source: "내부 수신거래원장",
        observation: "주거래 입금 비중 68% → 31% 하락",
        level: "high",
        levelLabel: "주의",
        collectedAt: "2026-09-23 05:42:00",
      },
      {
        id: "E-01-3",
        code: "COL-2026-0733",
        source: "담보평가 위탁기관",
        observation: "공장 부지 감정가 11% 하향 조정",
        level: "high",
        levelLabel: "주의",
        collectedAt: "2026-09-22 17:05:00",
      },
      {
        id: "E-01-4",
        code: "TAX-2026-0301",
        source: "국세청 체납 조회",
        observation: "체납 이력 없음",
        level: "low",
        levelLabel: "정상",
        collectedAt: "2026-09-20 09:15:00",
      },
    ],
    collection: [
      { key: "financial", label: "최근 분기 재무제표", percent: 100, status: "수집 완료" },
      { key: "bank", label: "타행 거래내역 동의서", percent: 45, status: "차주 회신 대기" },
      { key: "site", label: "현장 실사 보고서", percent: 20, status: "실사 일정 조율 중" },
    ],
    nextStepLabel: "조치방안 수립 기한 D-1 · 2026-09-24 센터장 결재 필요",
  },
  "B-20260923-02": {
    borrowerId: "B-20260923-02",
    summary:
      "분기 매출이 38% 급감한 상태에서 국세 체납이 새로 확인되었습니다. 업황 요인과 세무 요인이 함께 나타나 단일 지표 경보보다 우선순위가 높습니다.",
    modelLabel: "EWS 스코어링 v4.2 · 여신감리 준수 지침 제2026-42호",
    scoreLabel: "종합 위험 점수 82 / 100",
    factors: [
      {
        key: "revenue",
        label: "분기 매출 급감",
        percent: 38,
        direction: "increase",
        code: "FIN-2026-0455",
        note: "전년 동기 대비 -38%",
      },
      {
        key: "tax-arrear",
        label: "국세 체납 발생",
        percent: 29,
        direction: "increase",
        code: "TAX-2026-0488",
        note: "부가세 2기분 1.7억원",
      },
      {
        key: "order",
        label: "수주 잔고 회복",
        percent: 15,
        direction: "decrease",
        code: "EVD-2026-0871",
        note: "분기 수주 +12% · 2개 분기 연속",
      },
    ],
    evidence: [
      {
        id: "E-02-1",
        code: "FIN-2026-0455",
        source: "외부감사 재무제표",
        observation: "2026년 2분기 매출 전년 동기 대비 38% 감소",
        level: "severe",
        levelLabel: "경보",
        collectedAt: "2026-09-22 14:20:00",
      },
      {
        id: "E-02-2",
        code: "TAX-2026-0488",
        source: "국세청 체납 조회",
        observation: "부가가치세 2기분 1.7억원 체납 확인",
        level: "severe",
        levelLabel: "경보",
        collectedAt: "2026-09-23 05:10:00",
      },
      {
        id: "E-02-3",
        code: "EVD-2026-0871",
        source: "산업 수주 통계",
        observation: "석유화학 설비 수주 잔고 2개 분기 연속 증가",
        level: "moderate",
        levelLabel: "관찰",
        collectedAt: "2026-09-19 11:00:00",
      },
    ],
    collection: [
      { key: "tax-doc", label: "체납 납부계획서", percent: 60, status: "차주 작성 중" },
      { key: "financial", label: "반기 검토보고서", percent: 100, status: "수집 완료" },
      { key: "plan", label: "자구계획서", percent: 0, status: "요청 전" },
    ],
    nextStepLabel: "조치방안 수립 기한 D-2 · 2026-09-25 센터장 결재 필요",
  },
  "B-20260923-03": {
    borrowerId: "B-20260923-03",
    summary:
      "대표이사 변경 직후 담보 부동산에 후순위 근저당이 설정되었습니다. 재무 지표는 아직 악화되지 않아 지배구조·담보 요인만으로 등급이 내려간 사례입니다.",
    modelLabel: "EWS 스코어링 v4.2 · 여신감리 준수 지침 제2026-42호",
    scoreLabel: "종합 위험 점수 64 / 100",
    factors: [
      {
        key: "ceo",
        label: "대표이사 변경",
        percent: 26,
        direction: "increase",
        code: "BIZ-2026-0219",
        note: "등기 변경일 2026-09-05",
      },
      {
        key: "junior-lien",
        label: "담보 후순위 설정",
        percent: 31,
        direction: "increase",
        code: "COL-2026-0741",
        note: "타행 근저당 24억원 추가",
      },
      {
        key: "cashflow",
        label: "영업현금흐름 유지",
        percent: 17,
        direction: "decrease",
        code: "FIN-2026-0502",
        note: "4개 분기 연속 흑자",
      },
    ],
    evidence: [
      {
        id: "E-03-1",
        code: "BIZ-2026-0219",
        source: "법인등기 변동 알림",
        observation: "대표이사 변경 등기 접수",
        level: "high",
        levelLabel: "주의",
        collectedAt: "2026-09-21 08:30:00",
      },
      {
        id: "E-03-2",
        code: "COL-2026-0741",
        source: "부동산 등기 모니터링",
        observation: "담보 부동산 후순위 근저당 24억원 설정",
        level: "high",
        levelLabel: "주의",
        collectedAt: "2026-09-22 09:45:00",
      },
      {
        id: "E-03-3",
        code: "FIN-2026-0502",
        source: "내부 재무분석",
        observation: "영업현금흐름 4개 분기 연속 흑자 유지",
        level: "low",
        levelLabel: "정상",
        collectedAt: "2026-09-18 16:00:00",
      },
    ],
    collection: [
      { key: "registry", label: "등기부 등본 재발급", percent: 100, status: "수집 완료" },
      { key: "interview", label: "신임 대표 면담 기록", percent: 35, status: "일정 확정" },
      { key: "collateral", label: "담보 재평가 의뢰", percent: 70, status: "평가기관 회신 대기" },
    ],
    nextStepLabel: "조치방안 수립 기한 D-4 · 2026-09-27 팀장 결재 필요",
  },
  "B-20260923-04": {
    borrowerId: "B-20260923-04",
    summary:
      "차입금 의존도가 68%까지 올라 이자보상배율이 1 아래로 내려갔습니다. 외부 충격이 아니라 자본구조에서 비롯된 경보입니다.",
    modelLabel: "EWS 스코어링 v4.2 · 여신감리 준수 지침 제2026-42호",
    scoreLabel: "종합 위험 점수 58 / 100",
    factors: [
      {
        key: "leverage",
        label: "차입금 의존도 상승",
        percent: 33,
        direction: "increase",
        code: "FIN-2026-0517",
        note: "54% → 68% (2개 분기)",
      },
      {
        key: "icr",
        label: "이자보상배율 1 미만",
        percent: 24,
        direction: "increase",
        code: "FIN-2026-0518",
        note: "0.8배 · 2개 분기 연속",
      },
      {
        key: "capex",
        label: "설비 투자 마무리",
        percent: 11,
        direction: "decrease",
        code: "EVD-2026-0903",
        note: "증설 완료 · 추가 투자 계획 없음",
      },
    ],
    evidence: [
      {
        id: "E-04-1",
        code: "FIN-2026-0517",
        source: "외부감사 재무제표",
        observation: "차입금 의존도 68% (직전 분기 54%)",
        level: "high",
        levelLabel: "주의",
        collectedAt: "2026-09-22 14:25:00",
      },
      {
        id: "E-04-2",
        code: "FIN-2026-0518",
        source: "내부 재무분석",
        observation: "이자보상배율 0.8배 2개 분기 연속",
        level: "high",
        levelLabel: "주의",
        collectedAt: "2026-09-22 14:26:00",
      },
      {
        id: "E-04-3",
        code: "EVD-2026-0903",
        source: "설비투자 집행 보고",
        observation: "반도체 부품 라인 증설 완료 · 추가 집행 없음",
        level: "moderate",
        levelLabel: "관찰",
        collectedAt: "2026-09-17 10:40:00",
      },
    ],
    collection: [
      { key: "loan", label: "타행 차입 약정서", percent: 80, status: "일부 미제출" },
      { key: "forecast", label: "차기 연도 자금수지 계획", percent: 25, status: "차주 작성 중" },
      { key: "financial", label: "반기 검토보고서", percent: 100, status: "수집 완료" },
    ],
    nextStepLabel: "조치방안 수립 기한 D-6 · 2026-09-29 팀장 결재 필요",
  },
  "B-20260923-05": {
    borrowerId: "B-20260923-05",
    summary:
      "원재료 단가 급등과 재고회전율 하락이 동시에 관측되었습니다. 아직 관찰 등급이며 단가 안정 시 자동 해제 후보입니다.",
    modelLabel: "EWS 스코어링 v4.2 · 여신감리 준수 지침 제2026-42호",
    scoreLabel: "종합 위험 점수 41 / 100",
    factors: [
      {
        key: "material",
        label: "원재료 단가 급등",
        percent: 29,
        direction: "increase",
        code: "MKT-2026-0344",
        note: "주요 원당 단가 +22%",
      },
      {
        key: "turnover",
        label: "재고회전율 하락",
        percent: 19,
        direction: "increase",
        code: "FIN-2026-0531",
        note: "8.1회 → 5.6회",
      },
      {
        key: "contract",
        label: "대형 납품 계약 체결",
        percent: 22,
        direction: "decrease",
        code: "BIZ-2026-0260",
        note: "연 120억원 규모 · 3년 계약",
      },
    ],
    evidence: [
      {
        id: "E-05-1",
        code: "MKT-2026-0344",
        source: "원자재 가격 지수",
        observation: "주요 원당 단가 전월 대비 22% 상승",
        level: "moderate",
        levelLabel: "관찰",
        collectedAt: "2026-09-21 07:00:00",
      },
      {
        id: "E-05-2",
        code: "FIN-2026-0531",
        source: "내부 재무분석",
        observation: "재고회전율 8.1회 → 5.6회 하락",
        level: "moderate",
        levelLabel: "관찰",
        collectedAt: "2026-09-22 14:30:00",
      },
      {
        id: "E-05-3",
        code: "BIZ-2026-0260",
        source: "공시 모니터링",
        observation: "연 120억원 규모 급식업체 납품 계약 공시",
        level: "low",
        levelLabel: "정상",
        collectedAt: "2026-09-16 13:20:00",
      },
    ],
    collection: [
      { key: "contract", label: "납품 계약서 사본", percent: 100, status: "수집 완료" },
      { key: "inventory", label: "월별 재고 명세", percent: 55, status: "차주 회신 대기" },
      { key: "price", label: "원재료 조달 계획", percent: 10, status: "요청 전" },
    ],
    nextStepLabel: "조치방안 수립 기한 D-9 · 2026-10-02 팀장 결재 필요",
  },
}
