import {
  AppWindowIcon,
  ChartBarIcon,
  CardsIcon,
  FlowArrowIcon,
  HourglassIcon,
  ListChecksIcon,
  SealCheckIcon,
  SquaresFourIcon,
  TrendUpIcon,
} from "@phosphor-icons/react/dist/ssr"
import { FunnelIcon, GridFourIcon, TagIcon } from "@phosphor-icons/react/dist/ssr"
import { NetworkIcon, TerminalWindowIcon, TreeStructureIcon } from "@phosphor-icons/react/dist/ssr"
import { BookOpenTextIcon } from "@phosphor-icons/react/dist/ssr"
import {
  BankIcon,
  BriefcaseIcon,
  WrenchIcon,
  ClockCounterClockwiseIcon,
  CurrencyKrwIcon,
  GaugeIcon,
  KanbanIcon,
  SignInIcon,
  StepsIcon,
  TableIcon,
  TrayArrowUpIcon,
  WalletIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

/**
 * common = 어떤 doksam 프로젝트에서든 재사용 가능한 일반 UI 패턴.
 * srope = srope 프로젝트에서 이식된, 도메인 색이 짙은 확장 패턴("Srope — 프로젝트 확장" 로 표기).
 */
export type PatternScope = "common" | "finance" | "srope"

/** /patterns 인덱스·상세 페이지가 공유하는 패턴 메타데이터. */
export interface PatternEntry {
  /** URL 세그먼트로 쓰이는 고유 식별자 (app/patterns/<slug>/page.tsx 와 대응). */
  slug: string
  title: string
  description: string
  icon?: Icon
  scope: PatternScope
}

/**
 * 패턴 레지스트리 — 단일 진실원천.
 * common 5종은 srope UiStandards 탭(LayoutPatternsView 등)에서 이식했고,
 * verified(실전 검증 패턴)는 bizinfo 프로덕션에서 검증된 패턴을 일반화해 편입했다.
 * srope 2종(stock·pipeline)은 srope 프로젝트 전용 확장 패턴이다.
 * 여기 항목을 추가/수정하면 /patterns 인덱스에 자동 반영된다.
 */
export const PATTERN_REGISTRY: PatternEntry[] = [
  {
    slug: "app-shell",
    title: "앱 셸 패턴",
    description: "레이아웃 원형별 셸 5종(사이드바·헤더·분할 패인·피드·문서 리더)과 페이지 타이틀·여백 밀도·브레이크포인트 표준입니다.",
    icon: AppWindowIcon,
    scope: "common",
  },
  {
    slug: "layout",
    title: "레이아웃 패턴",
    description: "대시보드·목록·상세폼·탭·빈 페이지 등 페이지 단위 레이아웃 5종입니다.",
    icon: SquaresFourIcon,
    scope: "common",
  },
  {
    slug: "dataviz",
    title: "데이터 시각화 패턴",
    description: "recharts 기반 막대·영역·원형 차트와 CSS BarList 조합 6종입니다.",
    icon: ChartBarIcon,
    scope: "common",
  },
  {
    slug: "cards",
    title: "카드 패턴",
    description: "요약·상세·상태·액션·카테고리 카드 등 자주 쓰는 카드 조합 5종입니다.",
    icon: CardsIcon,
    scope: "common",
  },
  {
    slug: "state",
    title: "상태 UI 패턴",
    description: "로딩 스켈레톤·에러·빈 상태·스피너 등 비동기 상태 표현 4종입니다.",
    icon: HourglassIcon,
    scope: "common",
  },
  {
    slug: "form-input",
    title: "폼/입력 패턴",
    description: "기본 폼·검색+필터·다이얼로그 폼·파일 업로드 등 입력 UI 4종입니다.",
    icon: ListChecksIcon,
    scope: "common",
  },
  {
    slug: "verified",
    title: "실전 검증 패턴",
    description: "프로덕션 서비스에서 검증된 테이블 헤더·자동 해제 메시지·그리드 자동완성·칩 입력 4종입니다.",
    icon: SealCheckIcon,
    scope: "common",
  },
  {
    slug: "content-feed",
    title: "콘텐츠 피드 패턴",
    description: "그리드·리스트·테이블 3종 뷰토글과 group-data variant 전환 기법입니다.",
    icon: GridFourIcon,
    scope: "common",
  },
  {
    slug: "list-controls",
    title: "리스트 컨트롤 패턴",
    description: "URLSearchParams 기반 탭·필터·페이지네이션으로 SSR 상태를 유지하는 목록 컨트롤입니다.",
    icon: FunnelIcon,
    scope: "common",
  },
  {
    slug: "faceted-filter",
    title: "페이스티드 필터 패턴",
    description: "2단계 카테고리 칩 + 카운트 배지 + 그룹 컬러로 구성하는 다면 필터입니다.",
    icon: TagIcon,
    scope: "common",
  },
  {
    slug: "json-tree",
    title: "JSON 트리 뷰어 패턴",
    description: "접기/펼치기·타입별 색·대용량 페이지네이션을 갖춘 재귀 JSON/객체 트리 뷰어입니다.",
    icon: TreeStructureIcon,
    scope: "common",
  },
  {
    slug: "log-viewer",
    title: "로그 뷰어 패턴",
    description: "레벨 색상+배경, 타임스탬프, 반복 카운트 배지, 그룹 들여쓰기를 갖춘 로그 뷰어입니다.",
    icon: TerminalWindowIcon,
    scope: "common",
  },
  {
    slug: "request-inspector",
    title: "요청 인스펙터 패턴",
    description: "요청 목록 + Accordion 상세(Headers/Query/Payload/Response) + cURL 복사를 갖춘 요청 인스펙터입니다.",
    icon: NetworkIcon,
    scope: "common",
  },
  {
    slug: "concept-explainer",
    title: "개념 설명 인포그래픽 패턴",
    description: "어려운 기술 개념을 비유로 풀어내는 교육용 조합 — 개념 설명 카드·아키텍처 흐름 도식·증상▶대응 대응표 3종입니다.",
    icon: BookOpenTextIcon,
    scope: "common",
  },
  {
    slug: "stock",
    title: "주식 패턴",
    description: "종목 시세·호가·포트폴리오 등 srope 주식 도메인 전용 UI 패턴입니다.",
    icon: TrendUpIcon,
    scope: "srope",
  },
  {
    slug: "pipeline",
    title: "파이프라인 패턴",
    description: "수집·처리 단계 진행 상황을 보여주는 srope 데이터 파이프라인 전용 UI 패턴입니다.",
    icon: FlowArrowIcon,
    scope: "srope",
  },
  {
    slug: "stock-portfolio",
    title: "포트폴리오·추천 패턴",
    description: "미니차트 포트폴리오 카드, 확신도 추천 카드, 옵티마이저 가격 5종, 비트 격자, 종목 뉴스 패널 등 srope 포트폴리오 화면 전용 UI 패턴입니다.",
    icon: BriefcaseIcon,
    scope: "srope",
  },
  {
    slug: "admin-toolbar",
    title: "관리자 툴바 패턴",
    description: "JSON 내보내기/가져오기, 더미 생성 스피너, 파괴적 초기화 확인 등 srope 관리자 데이터 운영 툴바 패턴입니다.",
    icon: WrenchIcon,
    scope: "srope",
  },
  {
    slug: "auth",
    title: "인증 패턴",
    description: "로그인·회원가입·비밀번호 재설정 폼과 OAuth 버튼·검증 에러 상태입니다.",
    icon: SignInIcon,
    scope: "common",
  },
  {
    slug: "stepper",
    title: "스텝퍼·위저드",
    description: "다단계 온보딩 위저드 — 진행 인디케이터와 단계별 폼·요약 화면입니다.",
    icon: StepsIcon,
    scope: "common",
  },
  {
    slug: "file-upload",
    title: "파일 업로드",
    description: "드래그앤드롭 드롭존·업로드 진행률·파일 목록(완료/진행/실패 상태)입니다.",
    icon: TrayArrowUpIcon,
    scope: "common",
  },
  {
    slug: "stats",
    title: "지표·KPI 카드",
    description: "값·전기대비 증감·미니 스파크라인을 담은 KPI 카드 그리드와 컴팩트 행입니다.",
    icon: GaugeIcon,
    scope: "common",
  },
  {
    slug: "timeline",
    title: "활동 타임라인",
    description: "세로 활동 타임라인 — 아이콘 노드·시각·상태별 색과 날짜 그룹 헤더입니다.",
    icon: ClockCounterClockwiseIcon,
    scope: "common",
  },
  {
    slug: "data-table",
    title: "데이터 테이블",
    description: "정렬·행 선택·일괄 액션 바·페이지네이션을 통합한 데이터 테이블입니다.",
    icon: TableIcon,
    scope: "common",
  },
  {
    slug: "pricing",
    title: "가격표",
    description: "3티어 가격 카드·월/연 토글(할인)·기능 비교·추천 티어 강조입니다.",
    icon: TagIcon,
    scope: "common",
  },
  {
    slug: "kanban",
    title: "칸반 보드",
    description: "드래그앤드롭 칸반 — 컬럼 간 카드 이동·라벨·담당자 아바타입니다.",
    icon: KanbanIcon,
    scope: "common",
  },
  {
    slug: "mobile-banking-account",
    title: "모바일뱅킹 · 계좌",
    description: "대표계좌 잔액·계좌 목록·빠른메뉴 그리드. 모바일 우선 계좌 요약 화면입니다.",
    icon: WalletIcon,
    scope: "finance",
  },
  {
    slug: "mobile-banking-transfer",
    title: "모바일뱅킹 · 이체",
    description: "받는사람 선택 → 금액 입력(키패드형) → 확인의 3단계 이체 플로우입니다.",
    icon: BankIcon,
    scope: "finance",
  },
  {
    slug: "mobile-banking-history",
    title: "모바일뱅킹 · 거래내역",
    description: "입금/출금 등락색·날짜 그룹 헤더·유형 필터 칩을 갖춘 거래 내역입니다.",
    icon: ClockCounterClockwiseIcon,
    scope: "finance",
  },
  {
    slug: "stock-order",
    title: "주식 · 주문",
    description: "매수/매도 탭·호가 클릭 가격 반영·수량/주문유형·예상 체결금액 주문 화면입니다.",
    icon: CurrencyKrwIcon,
    scope: "finance",
  },
]

export function getPatternEntry(slug: string): PatternEntry | undefined {
  return PATTERN_REGISTRY.find((entry) => entry.slug === slug)
}

export const PATTERN_SCOPE_LABEL: Record<PatternScope, string> = {
  common: "Common",
  finance: "금융 도메인",
  srope: "Srope — 프로젝트 확장",
}

export const PATTERN_SCOPE_ORDER: PatternScope[] = ["common", "finance", "srope"]
