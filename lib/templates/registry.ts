import {
  BankIcon,
  BooksIcon,
  BuildingOfficeIcon,
  GraduationCapIcon,
  BugIcon,
  GraphIcon,
  MagnifyingGlassIcon,
  ColumnsIcon,
  NavigationArrowIcon,
  NewspaperClippingIcon,
  NewspaperIcon,
  ChartLineUpIcon,
  ChartPieSliceIcon,
  ChatCircleDotsIcon,
  GaugeIcon,
  RocketLaunchIcon,
  StorefrontIcon,
  ShieldCheckIcon,
  PackageIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

/** /templates 인덱스·사이드바가 공유하는 템플릿 메타데이터. */
export interface TemplateEntry {
  href: string
  title: string
  profile: string
  description: string
  stack: string[]
  icon: Icon
}

/** 템플릿 레지스트리 — 단일 진실원천. app/templates/<slug>/ 디렉터리와 1:1. */
export const TEMPLATE_REGISTRY: TemplateEntry[] = [
  {
    href: "/templates/trading",
    title: "Trading Dashboard",
    profile: "data 프로필 · Violet 다크 · Space Grotesk",
    description:
      "포트폴리오·시세·수급을 한눈에 보는 트레이딩 대시보드. 금융 등락색 토큰, 억/조 포맷, 스파크라인·수익률곡선·발산막대·정렬 테이블을 조합했습니다.",
    stack: ["stock/pipeline", "dataviz", "finance 토큰", "table-sortable"],
    icon: ChartLineUpIcon,
  },
  {
    href: "/templates/admin",
    title: "Admin / Backoffice Pro",
    profile: "admin 프로필 · Slate · Geist",
    description:
      "관리자·백오피스용 사이드바 셸 대시보드. 정렬 테이블, 페이스티드 필터, 로그·요청·JSON 관측성 뷰어, 설정 폼을 갖췄습니다.",
    stack: ["app-shell", "table-sortable", "observability", "form-input"],
    icon: GaugeIcon,
  },
  {
    href: "/templates/saas",
    title: "SaaS Landing + Dashboard",
    profile: "service 프로필 · Ocean · Noto Sans KR",
    description:
      "대외 서비스용 랜딩(히어로·기능·가격·FAQ) + 대시보드 + 콘텐츠 피드. 뷰토글·리스트 컨트롤·카드 패턴으로 구성했습니다.",
    stack: ["content-feed", "cards", "list-controls", "pricing"],
    icon: RocketLaunchIcon,
  },
  {
    href: "/templates/chat",
    title: "Chat / AI Assistant",
    profile: "data 프로필 · Violet 다크 · Space Grotesk",
    description:
      "AI 어시스턴트 대화 화면. 말풍선·메시지 스크롤러·첨부 입력창 + 대화 목록(모바일 드로어)과 모델·프롬프트 설정 폼으로 구성했습니다.",
    stack: ["message", "bubble", "attachment", "message-scroller"],
    icon: ChatCircleDotsIcon,
  },
  {
    href: "/templates/shop",
    title: "E-commerce Storefront",
    profile: "service 프로필 · Ocean · Noto Sans KR",
    description:
      "스토어프론트·상품 상세·장바구니. 상품 그리드(페이스티드 필터)·이미지 캐러셀·리뷰 요약·결제 CTA를 갖췄습니다.",
    stack: ["carousel", "cards", "faceted-filter", "cart"],
    icon: StorefrontIcon,
  },
  {
    href: "/templates/bank",
    title: "Bank Portal",
    profile: "service 프로필 · Ocean · Noto Sans KR",
    description:
      "리테일 뱅크 포털 홈페이지. 히어로 캐러셀·퀵서비스 탭·프로모 카드·금융상품 카테고리·바로가기·뜨는 상품·새소식으로 구성했습니다(가상 은행).",
    stack: ["carousel", "tabs", "cards", "quick-links"],
    icon: BankIcon,
  },
  {
    href: "/templates/brokerage",
    title: "Brokerage Market Home",
    profile: "service 프로필 · Ocean · Noto Sans KR",
    description:
      "증권사 마켓 홈. 시장 지표 스트립·실시간 랭킹 스크리너·종목 상세(캔들·AI·커뮤니티)·관심종목 사이드바로 구성한 밀도 높은 데이터 터미널입니다(가상 증권사).",
    stack: ["dataviz", "table", "finance 토큰", "watchlist"],
    icon: ChartPieSliceIcon,
  },
  {
    href: "/templates/glossary",
    title: "Term Network Explorer",
    profile: "data 프로필 · Violet 다크 · Space Grotesk",
    description:
      "SDLC·AI 용어 50개를 6개 카테고리와 관계로 엮은 지식 그래프. 결정론적 방사형 배치의 SVG 성좌 네트워크로 노드 선택 시 이웃 강조·검색 하이라이트·범례 필터·상세 패널을 제공합니다.",
    stack: ["svg-graph", "search-filter", "detail-panel", "dataviz"],
    icon: GraphIcon,
  },
  {
    href: "/templates/market-report",
    title: "Market Intelligence Report",
    profile: "service 프로필 · Ocean 라이트 · Noto Sans KR",
    description:
      "뉴스·공시 분석을 모사한 데일리/주간 마켓 리포트. 라이트 데일리(티커 스트립·이벤트 피드·리스크 매트릭스·워치리스트)와 다크 주간(테마 랭킹·타임라인·캘린더·공시)을 프로필 재스코프로 전환합니다.",
    stack: ["live-indicator", "finance 토큰", "content-feed", "cards"],
    icon: NewspaperIcon,
  },
  {
    href: "/templates/crawler-console",
    title: "Crawler Ops Console",
    profile: "admin 프로필 · Slate · Geist",
    description:
      "수집·갱신·감지 스텝플로우와 실행 이력 테이블, 수동 트리거(실행/중단 상태 전이)를 갖춘 데이터 파이프라인 운영 콘솔입니다.",
    stack: ["live-indicator", "step-flow", "table", "form-input"],
    icon: BugIcon,
  },
  {
    href: "/templates/elearning",
    title: "E-learning Player",
    profile: "data 프로필 · Violet 다크 · Space Grotesk",
    description:
      "챕터별 강의 리스트·진행률 사이드바와 16:9 플레이어, 자동진행 카운트다운, AI 요약 모달을 갖춘 학습 콘텐츠 플레이어입니다.",
    stack: ["circular-progress", "dialog", "switch", "sidebar"],
    icon: GraduationCapIcon,
  },
  {
    href: "/templates/company-intel",
    title: "Company Intelligence",
    profile: "service 프로필 · Ocean 라이트 · Noto Sans KR",
    description:
      "가상 기업 한 곳을 KPI 요약·소재지·뉴스 피드·출자/주주 관계 그래프·연관 키워드로 심층 조망하는 기업 인텔리전스 대시보드입니다.",
    stack: ["relation-network", "keyword-cloud", "cards", "badge"],
    icon: BuildingOfficeIcon,
  },
  {
    href: "/templates/knowledge-base",
    title: "Knowledge Base",
    profile: "admin 프로필 · Slate · Geist",
    description:
      "위키 문서 트리·마크다운 본문·목차, 칸반풍 아이디어 보드, 날짜별 세션 타임라인을 탭으로 묶은 팀 지식관리 콘솔입니다.",
    stack: ["tree-view", "tabs", "kanban", "timeline"],
    icon: BooksIcon,
  },
  {
    href: "/templates/kubernetes-firewall",
    title: "K8s Firewall Blueprint",
    profile: "blueprint 스코프 · 라이트 고정 · Noto Serif KR + Gowun Dodum",
    description:
      "쿠버네티스 4겹 보안(NetworkPolicy·Security Group·Ingress·OS Firewall)을 아파트 단지 비유로 설명하는 교육용 인포그래픽. 종이 격자·하드 섀도우의 설계도면 룩을 스코프 CSS로 캡슐화했습니다.",
    stack: ["concept-explainer", "scoped-css", "vendored-fonts"],
    icon: ShieldCheckIcon,
  },
  {
    href: "/templates/docker-container",
    title: "Docker Container Blueprint",
    profile: "blueprint 스코프 · 라이트 고정 · Noto Serif KR + Gowun Dodum",
    description:
      "도커 핵심 개념(Image·Container·Volume·Registry)을 밀키트 요리 비유로 설명하는 교육용 인포그래픽. build→run 흐름 도식과 증상▶대응 표를 갖춘 블루프린트 템플릿입니다.",
    stack: ["concept-explainer", "scoped-css", "vendored-fonts"],
    icon: PackageIcon,
  },
  {
    href: "/templates/ontology",
    title: "Ontology Knowledge Console",
    profile: "admin 프로필 · Slate · Geist",
    description:
      "프로젝트 에이전트 인프라 문서 34개를 7개 타입·관계로 엮은 온톨로지. 같은 데이터를 사전(검색·타입 칩·하이라이트)과 결정론적 force 레이아웃 SVG 그래프(이웃 강조·참조/피참조 상세 패널) 두 탭으로 탐색합니다.",
    stack: ["tabs", "svg-graph", "search-filter", "detail-panel"],
    icon: TreeStructureIcon,
  },
  {
    href: "/templates/rag-search",
    title: "RAG Search Console",
    profile: "admin 프로필 · Slate · Geist",
    description:
      "하이브리드 검색으로 근거를 찾고 그 근거로 답변을 만드는 RAG 콘솔. BM25·벡터·rerank 점수 분해, 문장별 인용과 원문 청크 연결, 색인 파이프라인·인덱스 상태를 세 탭으로 묶었습니다.",
    stack: ["tabs", "contribution-bars", "stage-progress-board", "log-viewer"],
    icon: MagnifyingGlassIcon,
  },
  {
    href: "/templates/marketing-site",
    title: "Marketing Site",
    profile: "service 프로필 · Ocean 라이트 · Noto Sans KR · top-nav-site 원형",
    description:
      "사이드바 없이 상단 가로 내비 아래로 히어로·기능·동작 방식·요금·FAQ 섹션이 세로로 흐르는 마케팅 사이트. 처음 온 사람에게 설명하고 한 가지 행동으로 이끄는 뼈대입니다.",
    stack: ["top-nav-site", "accordion", "pricing", "cards"],
    icon: NavigationArrowIcon,
  },
  {
    href: "/templates/mail-workspace",
    title: "Mail Workspace",
    profile: "admin 프로필 · Slate · Geist · split-pane 원형",
    description:
      "좌측 목록과 우측 상세를 한 화면에 두고 선택이 라우팅 없이 우측만 바꾸는 2패인 작업 화면. 폴더 레일·검색으로 목록을 좁히고 lg 미만에서는 단일 패인으로 접힙니다.",
    stack: ["split-pane", "list-detail", "avatar", "input"],
    icon: ColumnsIcon,
  },
  {
    href: "/templates/activity-feed",
    title: "Activity Feed",
    profile: "data 프로필 · Violet 다크 · Space Grotesk · feed-timeline 원형",
    description:
      "시간 역순 단일 세로 스트림이 주인공인 활동 피드. 날짜 버킷 그룹핑, 종류 필터 바, 더 보기 방식의 이어 붙이기로 끝이 정해지지 않은 흐름을 다룹니다.",
    stack: ["feed-timeline", "timeline", "badge", "avatar"],
    icon: NewspaperClippingIcon,
  },
]
