import {
  ArticleIcon,
  ChatsCircleIcon,
  ColumnsIcon,
  GridFourIcon,
  ListChecksIcon,
  NewspaperClippingIcon,
  NavigationArrowIcon,
  PenNibIcon,
  SidebarIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

/**
 * 레이아웃 원형(archetype) 레지스트리 — 단일 진실원천.
 *
 * doksam-ui 의 변주 축은 오래도록 스킨 층(테마·폰트·radius·density)에만 있었다.
 * 그 결과 프로필만 바꾼 화면들은 색만 다르고 뼈대는 전부 같아진다 — 사이드바 셸
 * 하나로 수렴한다. 원형은 그 위에 얹는 **뼈대 선택 층**이다: 프로젝트는 프로필
 * 하나(색·폰트)와 원형 하나(내비게이션·정보구조)를 각각 명시적으로 고른다.
 *
 * 새 원형을 추가하려면:
 *   1. 아래 LAYOUT_ARCHETYPES 에 항목을 추가한다.
 *   2. shell 은 components/patterns/app-shell-samples.tsx 의 샘플 title,
 *      templates 는 lib/templates/registry.ts 의 실재 slug 여야 한다 —
 *      archetypes/index.test.ts 가 이 참조 무결성을 강제한다.
 *   3. 설명 번역 키(`archetype.<name>.description`)를 4개 로케일에 넣는다.
 */
export interface LayoutArchetype {
  /** 레지스트리 키 (예: "sidebar-app"). */
  name: string;
  /** 카드·스위처에 노출할 표시명. */
  label: string;
  /** 이 원형이 무엇인지 한 문단 설명. */
  description: string;
  /** 이 뼈대가 맞는 화면 성격. */
  suitedFor: string[];
  /** 주 내비게이션이 어디에 어떤 형태로 놓이는가. */
  navigation: string;
  /** components/patterns/app-shell-samples.tsx 의 권장 셸 변형 title. */
  shell: string;
  /** lib/templates/registry.ts 의 대표 템플릿 slug 목록. */
  templates: string[];
  /** 이 원형을 고르면 안 되는 상황 — 오용을 막는 반례. */
  avoidWhen: string[];
  icon: Icon;
}

export const LAYOUT_ARCHETYPES: LayoutArchetype[] = [
  {
    name: "sidebar-app",
    label: "Sidebar App",
    description:
      "좌측 상시 사이드바가 전 화면의 목적지를 나열하고 본문이 그 옆을 채우는 기본 앱 뼈대입니다. 목적지가 많고 사용자가 하루 종일 머무는 내부 도구에 맞습니다.",
    suitedFor: ["관리자·백오피스", "운영 콘솔", "목적지 6개 이상인 내부 도구"],
    navigation: "좌측 고정 사이드바(lg 미만에서는 드로어) + 본문 상단 페이지 타이틀",
    shell: "사이드바형 셸",
    templates: ["admin", "crawler-console", "rag-search"],
    avoidWhen: ["목적지가 3개 이하", "첫 방문 전환이 목적인 대외 랜딩", "모바일이 주 사용 환경"],
    icon: SidebarIcon,
  },
  {
    name: "top-nav-site",
    label: "Top-nav Site",
    description:
      "상단 가로 내비 아래로 섹션이 세로로 흐르는 사이트 뼈대입니다. 처음 온 사람에게 무엇인지 설명하고 한 가지 행동으로 이끄는 화면에 맞습니다.",
    suitedFor: ["마케팅·랜딩 사이트", "제품 소개·가격 페이지", "공개 포털 홈"],
    navigation: "상단 가로 메뉴(모바일은 햄버거 시트) + 페이지 하단 푸터 링크",
    shell: "헤더형 셸",
    templates: ["marketing-site", "saas", "bank"],
    avoidWhen: ["목적지가 8개를 넘어 가로 메뉴가 접힘", "화면당 조작이 많은 작업 도구", "상시 컨텍스트 전환이 필요한 콘솔"],
    icon: NavigationArrowIcon,
  },
  {
    name: "split-pane",
    label: "Split Pane",
    description:
      "좌측 목록과 우측 상세를 한 화면에 나란히 두고, 목록 선택이 우측만 바꾸는 뼈대입니다. 항목을 연달아 훑으며 처리하는 화면에 맞습니다.",
    suitedFor: ["메일·메시지 처리함", "이슈·티켓 트리아지", "에디터 + 미리보기"],
    navigation: "좌측 목록 패인이 곧 내비게이션 — 페이지 이동 없이 우측 상세만 교체",
    shell: "분할 패인 셸",
    templates: ["mail-workspace", "knowledge-base"],
    avoidWhen: ["상세가 목록보다 훨씬 짧아 우측이 비어 보임", "모바일 전용 화면", "항목을 하나만 열고 끝나는 흐름"],
    icon: ColumnsIcon,
  },
  {
    name: "feed-timeline",
    label: "Feed / Timeline",
    description:
      "시간순 단일 세로 스트림이 화면의 주인공이고, 필터·요약은 곁가지로 붙는 뼈대입니다. 끝이 정해지지 않은 흐름을 계속 따라가는 화면에 맞습니다.",
    suitedFor: ["활동·알림 피드", "뉴스·공시 스트림", "감사 로그·이벤트 타임라인"],
    navigation: "상단 얇은 필터 바 + 무한 스크롤 스트림, 목적지 전환은 최소화",
    shell: "피드형 셸",
    templates: ["activity-feed", "market-report"],
    avoidWhen: ["항목 간 비교가 목적인 화면", "정렬·페이징이 핵심인 표 데이터", "항목 수가 20개 미만으로 고정"],
    icon: NewspaperClippingIcon,
  },
  {
    name: "dashboard-grid",
    label: "Dashboard Grid",
    description:
      "지표 카드·차트를 격자로 배열해 한 화면에서 전체 상태를 읽는 뼈대입니다. 깊이 파고들기보다 이상 징후를 빨리 찾는 것이 목적일 때 맞습니다.",
    suitedFor: ["KPI 요약 대시보드", "시세·모니터링 보드", "경영 리포트 첫 화면"],
    navigation: "상단 기간·범위 필터 + 카드 클릭으로 상세 화면 진입",
    shell: "사이드바형 셸",
    templates: ["trading", "brokerage", "company-intel"],
    avoidWhen: ["지표가 3개 이하", "한 지표를 깊게 파는 분석 화면", "카드마다 조작 폼이 붙는 경우"],
    icon: GridFourIcon,
  },
  {
    name: "wizard-flow",
    label: "Wizard Flow",
    description:
      "한 번에 한 단계만 보여주고 진행률로 남은 길을 알리는 선형 뼈대입니다. 중간에 이탈하면 안 되는 절차형 입력에 맞습니다.",
    suitedFor: ["가입·온보딩", "이체·결제 등 다단계 거래", "설정 마법사"],
    navigation: "단계 표시기(stepper)가 유일한 내비 — 이전/다음 버튼만 허용",
    shell: "헤더형 셸",
    templates: ["shop", "crawler-console"],
    avoidWhen: ["단계가 2개 이하", "사용자가 순서를 자유롭게 오가야 하는 편집", "언제든 저장하고 나갈 수 있어야 하는 폼"],
    icon: ListChecksIcon,
  },
  {
    name: "chat-workspace",
    label: "Chat Workspace",
    description:
      "하단 고정 입력창과 위로 쌓이는 대화 스크롤러가 축이고, 대화 목록·설정이 옆에 붙는 뼈대입니다. 왕복 대화가 화면의 본체인 경우에 맞습니다.",
    suitedFor: ["AI 어시스턴트", "상담·문의 콘솔", "협업 메시징"],
    navigation: "좌측 대화 목록(모바일 드로어) + 하단 고정 컴포저",
    shell: "분할 패인 셸",
    templates: ["chat"],
    avoidWhen: ["단발성 질의응답 한 번으로 끝나는 화면", "대화 이력이 남지 않는 검색", "출력이 표·차트 위주"],
    icon: ChatsCircleIcon,
  },
  {
    name: "canvas",
    label: "Canvas",
    description:
      "무한 평면 위에 요소를 직접 배치하고 도구 팔레트·속성 패널이 그 가장자리를 감싸는 뼈대입니다. 공간 배치 자체가 산출물일 때 맞습니다.",
    suitedFor: ["와이어프레임·다이어그램 빌더", "그래프·네트워크 탐색", "보드형 편집기"],
    navigation: "좌측 도구 팔레트 + 우측 속성 패널, 이동은 팬·줌으로 대체",
    shell: "분할 패인 셸",
    templates: ["glossary", "ontology"],
    avoidWhen: ["읽기 전용 열람 화면", "모바일 우선 화면", "결과가 선형 문서로 충분한 경우"],
    icon: PenNibIcon,
  },
  {
    name: "doc-reader",
    label: "Doc Reader",
    description:
      "본문 한 칼럼을 읽기 좋은 폭으로 좁히고 좌측 문서 트리·우측 목차가 그 위치를 알려주는 뼈대입니다. 긴 글을 끝까지 읽히는 것이 목적일 때 맞습니다.",
    suitedFor: ["기술 문서·위키", "규칙·정책 문서", "블로그·아티클"],
    navigation: "좌측 문서 트리 + 우측 목차(스크롤 동기) + 본문 max-w-prose",
    shell: "문서 리더 셸",
    templates: ["knowledge-base", "kubernetes-firewall"],
    avoidWhen: ["본문이 한 화면에 들어오는 짧은 글", "표·차트가 본문보다 많은 화면", "조작이 주가 되는 도구"],
    icon: ArticleIcon,
  },
];

/** 지정이 없을 때의 기본 원형 — doksam-ui 카탈로그 자신이 쓰는 뼈대. */
export const DEFAULT_LAYOUT_ARCHETYPE = "sidebar-app";

export function getLayoutArchetype(name: string): LayoutArchetype | undefined {
  return LAYOUT_ARCHETYPES.find((archetype) => archetype.name === name);
}
