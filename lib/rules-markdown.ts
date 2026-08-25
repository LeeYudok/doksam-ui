/** 규칙 절의 두 층(#28).
 *
 * - invariant(불변): 프로젝트가 달라도 답이 같다. 어기면 표준 위반이다.
 * - decision(선택): 프로젝트마다 정답이 다르다. 절이 명령이 아니라 선택지와
 *   고르는 기준을 주고, 각 선택지에 그 선택을 골랐을 때 지켜야 할 경계가 붙는다.
 */
export const RULE_KINDS = ["invariant", "decision"] as const;

export type RuleKind = (typeof RULE_KINDS)[number];

/** /rules 페이지의 규칙 섹션 하나 = 제목 + 층 + 항목 목록. */
export interface RulesSection {
  title: string;
  kind: RuleKind;
  items: string[];
}

/**
 * 사용 규칙 전문의 단일 진실원천.
 * /rules 페이지의 사람용 렌더링과 AI 프롬프트용 markdown 복사 버튼이
 * 둘 다 이 구조체에서 파생된다 — 내용을 고치려면 여기만 수정하면 된다.
 *
 * 첫 두 절(디자인 브리프·수렴 안티패턴)의 순서를 바꾸지 않는다 — 생성 전에
 * 무엇을 안 쓸지 고르게 하는 단계이고, scripts/gen-llms.mjs 가 디자인 브리프 절을
 * public/llms.txt 카탈로그 앞에 싣는다.
 */
export const RULES_SECTIONS: RulesSection[] = [
  {
    title: "디자인 브리프 (생성 전 필수)",
    kind: "invariant",
    items: [
      "화면을 만들기 전에 저장소 루트에 DESIGN.md 를 만들고 원형·성격·배제 목록·이유 네 가지를 선언한다 — 선언 없이 생성을 시작하면 결과가 카탈로그의 기본 조합으로 수렴한다.",
      "원형(archetype): 이 제품의 화면 뼈대를 ui.doksam.com/archetypes 레지스트리의 원형 9종(sidebar-app, top-nav-site, split-pane, feed-timeline, dashboard-grid, wizard-flow, chat-workspace, canvas, doc-reader) 중 하나로 반드시 고른다 — 자유 문자열(\"커머스 스토어프론트\" 같은 자기 발명 이름)은 불가하다. 둘 이상에 걸치면 주 원형 1개 + 보조 원형 1개를 레지스트리 이름으로 적고, 어느 화면이 보조 원형을 쓰는지 밝힌다. 고른 원형의 내비 방식과 본문 구조(레지스트리의 뼈대 한 줄)를 그대로 따른다.",
      "성격(personality): 같은 원형도 성격에 따라 다르게 생긴다. ui.doksam.com/personalities 레지스트리의 프리셋(neutral, crisp, elevated, statement) 중 하나를 고른다 — 밀도·모션의 양·표면(테두리/그림자/평면) 성향은 이 프리셋이 결정하며 프로젝트에서 값을 임의로 재정의하지 않는다.",
      "안 쓸 컴포넌트·패턴: 최소 세 개를 이름으로 배제하되, 그중 최소 하나는 고른 원형·과제에서 기본으로 쓰일 법한 것이어야 한다(모바일 커머스라면 \"하단 탭바 안 씀\"·\"카드 그리드 안 씀\"·\"sticky CTA 안 씀\" 같은 것). 어차피 안 쓸 것(\"모바일 앱에서 사이드바 안 씀\")만 나열한 배제 목록은 결정에 영향이 없으므로 무효다. 화면의 성격은 무엇을 쓰는가보다 무엇을 안 쓰는가에서 나온다.",
      "이유: 위 세 항목 각각에 한 줄 근거를 붙인다. 취향(\"깔끔해서\")이 아니라 사용 맥락(사용 빈도·체류 시간·입력 장치·데이터 밀도·조직의 기존 도구)으로 쓴다.",
      "DESIGN.md 는 화면 코드와 같은 저장소에 두고 같은 커밋 흐름으로 갱신한다. 구현이 브리프와 어긋나면 코드부터 고치지 말고 브리프를 갱신할지 먼저 판단한다 — 어긋남이 반복되면 원형 선택이 틀린 것이다.",
      "브리프가 없는 작업은 이 문서의 [decision] 절을 판정할 수 없다 — 첫 화면을 만들기 전에 브리프를 사람과 합의한다.",
    ],
  },
  {
    title: "수렴 안티패턴",
    kind: "invariant",
    items: [
      "근거 없이 \"사이드바 + 상단바 + 카드 그리드\" 셸을 채택하지 않는다 — 그 셸은 관리 콘솔 원형의 답이지 모든 원형의 답이 아니다. DESIGN.md 의 원형이 그것을 요구할 때만 쓴다.",
      "모든 목록을 Table 로 만들지 않는다 — 열이 세 개 이하이거나 정렬·비교가 목적이 아니면 정의 목록·설명 행·카드 목록이 더 읽힌다. Table 은 열 간 비교가 실제 과업일 때 고른다.",
      "모든 섹션을 Card 로 감싸지 않는다 — 카드가 반복되면 경계선만 늘고 위계는 사라진다. 카드는 개별적으로 이동·선택·삭제되는 단위에만 쓰고, 그 외의 묶음은 여백과 제목으로 구분한다.",
      "모든 페이지를 같은 헤더(Badge + h1 + 설명 문단)로 시작하지 않는다 — 첫 화면에는 그 페이지에서 가장 자주 하는 행동이나 가장 먼저 봐야 하는 값이 온다.",
      "카탈로그를 훑으며 쓸 수 있는 컴포넌트를 모두 배치하지 않는다 — 브리프의 배제 목록이 먼저이고, 남은 것 중에서 고른다.",
      "강조를 primary 색 하나로만 처리하지 않는다 — 계열 구분이 필요한 데이터는 chart-1~5, 보조 강조는 accent·secondary 로 나눈다(색만으로 구분하지 않는 것은 접근성 절의 불변 규칙이다).",
      "여백·타이포 스케일을 전부 기본값으로 두지 않는다 — 밀도는 성격이 결정하는 값이므로 프로필의 density 를 고르고, 그 안에서 섹션 간 여백을 의도적으로 차등한다.",
      "라이브러리 데모의 문구·아이콘·색 조합을 그대로 옮기지 않는다 — 데모 카피는 예시일 뿐이고, 화면의 언어는 도메인 용어여야 한다.",
    ],
  },
  {
    title: "컬러 · 토큰",
    kind: "invariant",
    items: [
      "하드코딩 색(hex, rgb, 임의 OKLCH 값 등)을 직접 쓰지 않는다 — 항상 themes/ 의 시맨틱 토큰(bg-background, text-primary 등)만 사용한다.",
      "radius 기본값은 6px이다. 임의의 radius 값을 새로 만들지 않는다.",
      "새 프리셋이 필요하면 themes/<name>.ts 파일을 추가하고 themes/index.ts 레지스트리에 등록한다. 기존 프리셋 파일이나 app/globals.css의 다른 프리셋 블록은 건드리지 않는다.",
      "시세 등락(이익/상승, 손실/하락)을 표시할 때는 text-red-600/text-blue-600 등을 직접 쓰지 않고 --gain/--loss 토큰(lib/finance/rate.ts의 rateColor/rateText)을 쓴다 — 한국식 관례로 이익=빨강, 손실=파랑이며 모든 프리셋에서 동일한 값을 쓴다(destructive/success/warning과 같은 방식).",
      "lightweight-charts·canvas 등 CSS를 직접 해석하지 못하는 렌더러에 색을 넘길 때는 CSS 변수/유틸리티 클래스 문자열을 그대로 주지 않고 lib/finance/normalize-color.ts의 normalizeColor(또는 readCssVar/readClassColor)로 hex 값을 해소해서 넘긴다. 프리셋·다크모드 전환 시 재해소가 필요하면 observeColorScheme로 <html>의 class/data-theme/data-font 변화를 구독한다.",
      "색 외의 시각 성격(타입/스페이싱 스케일, 표면 성향, 모션 강도)은 <html data-personality>/data-personality-surface/data-personality-motion 토큰 층을 쓴다 — personalities/index.ts 레지스트리의 프리셋을 profiles/index.ts의 BrandProfile.personality가 참조하며, 프로젝트에서 값을 임의로 재정의하지 않는다.",
    ],
  },
  {
    title: "컴포넌트",
    kind: "invariant",
    items: [
      "UI 프리미티브는 shadcn/ui를 쓴다 — components/ui/ 아래 원본 파일은 수정하지 않는다.",
      "커스텀 동작이 필요하면 components/ui/ 밖에 별도 컴포넌트를 만들어 shadcn 프리미티브를 조합한다 — components/ui/customs 같은 하위 폴더를 만들어 components/ui/ 안에 끼워 넣지 않는다. shadcn 원본과 커스텀 조합은 디렉터리 레벨에서 분리한다(예: components/<feature>/ 또는 components/patterns/).",
      "테이블 헤더(thead th)는 app/globals.css의 전역 규칙으로 항상 볼드로 렌더링된다 — 컴포넌트마다 font-bold를 개별 지정하지 않는다.",
    ],
  },
  {
    title: "테마 초기화",
    kind: "decision",
    items: [
      "기본 모드·테마 프리셋·폰트를 어떻게 정할지 고른다: (1) 프로필이 정한 값으로 고정하고 사용자 토글을 두지 않는다, (2) 사용자 토글을 두고 localStorage 에 기억한다, (3) 시스템 설정(prefers-color-scheme)을 따른다. 조직 표준 화면이면 (1), 야간 사용·장시간 체류가 잦으면 (2)나 (3)이 맞는다.",
      "경계 — 어느 쪽을 고르든 결정은 hydration 이전에 끝낸다: app/layout.tsx의 <head> 인라인 <script>(THEME_INIT_SCRIPT)가 localStorage 값을 읽어 <html>에 data-theme/data-font/dark 클래스를 직접 세팅하는 방식을 표준으로 쓴다.",
      "경계 — useEffect 등 mount 이후 로직만으로 다크모드·프리셋을 적용하지 않는다: 첫 페인트가 기본값으로 그려진 뒤 바뀌는 FOUC(테마 깜빡임)가 발생한다. mount 시 useEffect는 인라인 스크립트가 이미 세팅한 <html> 상태를 React state로 동기화하는 용도로만 쓴다(hooks/use-theme-preset.ts의 mount-sync 패턴 참고).",
      "경계 — 인라인 스크립트가 읽는 localStorage 키는 lib/theme-storage.ts의 상수(THEME_PRESET_STORAGE_KEY 등)를 그대로 참조한다: 훅과 문자열이 어긋나지 않도록 값을 이원화하지 않는다. 스크립트 본문은 try/catch로 감싸 실패 시 조용히 기본값으로 폴백한다.",
      "경계 — 테마 로직은 순수 함수(우선순위 계산·값 읽기)와 IO 어댑터(document/localStorage 접근)를 분리한다: applyToDocument/readDocumentState처럼 부수효과를 별도 함수로 나눠 테스트 가능하게 유지한다.",
    ],
  },
  {
    title: "아이콘",
    kind: "invariant",
    items: [
      "아이콘은 Phosphor(@phosphor-icons/react)를 기본으로 쓴다 — regular가 기본, 강조·활성 상태는 duotone 또는 fill.",
      "서버 컴포넌트에서는 @phosphor-icons/react/dist/ssr 경로로 import한다.",
      "Lucide(lucide-react)는 shadcn 내장과 공존하며, 직접 쓸 때는 strokeWidth={1.5}로 Phosphor 굵기에 맞춘다.",
      "Tabler(@tabler/icons-react)는 Phosphor에 없는 특수 아이콘의 백업으로만 쓴다.",
      "이모지를 아이콘 대용으로 쓰지 않는다.",
    ],
  },
  {
    title: "페이지 · 라우팅",
    kind: "invariant",
    items: [
      "새 라우트를 추가하면 loading.tsx와 error.tsx를 함께 만든다.",
      "이미지는 next/image, 폰트는 next/font/local(레포 내 self-host)로 처리한다.",
    ],
  },
  {
    title: "레이아웃 · 반응형",
    kind: "decision",
    items: [
      "콘텐츠 폭을 고른다: (1) 관리 콘솔·데이터 화면은 max-w-[1300px] mx-auto(crawler-console 템플릿이 레퍼런스), (2) 읽기 중심 문서·설명 화면은 max-w-3xl 안팎의 좁은 단, (3) 실시간 모니터·차트 벽은 전폭. 한 줄에 나란히 놓고 봐야 하는 정보량이 기준이다.",
      "내비게이션 셸을 고른다: 사이드바 내비 / 상단 탭 / 내비 없는 단일 화면. 목적지가 일곱 개를 넘고 자주 오가면 사이드바, 서너 개면 상단 탭, 하나뿐이면 내비를 두지 않는다 — 셸은 브리프의 원형이 정하는 것이지 기본값이 아니다.",
      "경계 — 컨테이너는 세그먼트 layout.tsx가 소유한다: 페이지 컴포넌트에서 max-width를 하드코딩하지 않는다(화면마다 폭이 갈라지는 원인). 폼 등 좁은 콘텐츠는 컨테이너를 줄이지 말고 페이지 내부 래퍼로 좁힌다.",
      "경계 — main 랜드마크는 layout이 렌더한다: 페이지·loading.tsx·error.tsx에서 main을 중복 렌더하지 않는다(main 중첩은 invalid HTML). 에러 UI는 div role=\"alert\".",
      "경계 — 모든 화면은 모바일(기본)·태블릿(sm:/md:)·데스크톱(lg:↑) 3모드에서 깨지지 않아야 한다: Tailwind mobile-first로 무접두 클래스가 모바일, 접두로 넓은 화면을 확장한다(역방향 금지).",
      "경계 — 넓은 콘텐츠(테이블·코드블록·차트)는 자체 overflow-x-auto 래퍼로 감싼다: 페이지(body) 가로 스크롤이 생기면 안 된다.",
      "경계 — 고정 px 폭(w-[###px])은 아이콘·뱃지 등 소품 외 금지: 콘텐츠 영역은 flex/grid/상대 단위로 잡는다.",
    ],
  },
  {
    title: "모션 · 애니메이션",
    kind: "decision",
    items: [
      "모션의 양을 브리프의 성격이 정한다: (1) 없음 — 상태 변화를 즉시 반영한다, (2) 절제 — hover·focus 피드백과 오버레이 진입·퇴장에만 쓴다, (3) 표현적 — 페이지 전환·목록 재정렬까지 움직인다. 데이터 갱신이 잦고 오래 머무는 업무 화면일수록 (1)·(2) 쪽이고, 짧게 방문하는 소개형 화면일수록 (3)이 허용된다. 고른 값을 DESIGN.md 에 남긴다.",
      "경계 — 애니메이션할 속성을 반드시 명시한다: transition-all을 쓰지 않는다. 상태 피드백은 transition-colors, 위치·크기 변화는 transition-transform, 페이드는 transition-opacity를 쓰고, 비레이아웃 속성 여러 개가 동시에 바뀌면 Tailwind 기본 transition 유틸이나 transition-[color,background-color,box-shadow]처럼 목록을 좁혀 적는다. transition-all은 레이아웃 속성까지 전환 대상에 넣어 예기치 않은 리플로우를 만든다(components/ui/ 아래 shadcn 원본은 수정 금지 대상이므로 예외).",
      "경계 — 진행률 바처럼 레이아웃 속성 애니메이션이 불가피하면 transition-[width]처럼 그 속성만 명시한다: 리플로우를 감수하는 지점이 코드에 드러나야 한다. 그 외에는 합성 단계에서 끝나는 transform·opacity를 우선한다.",
      "경계 — duration은 100/200/300ms 스케일만 쓴다: hover·focus 등 즉각 피드백은 duration-100, 일반 상태 전환은 duration-200, 진입·퇴장이나 진행률처럼 눈으로 따라가는 변화는 duration-300. duration-[450ms] 같은 임의 값을 새로 만들지 않는다.",
      "경계 — 커스텀 keyframes를 넣는 컴포넌트는 @media (prefers-reduced-motion: reduce)에서 animation: none으로 멈춘다: JS로 구동하는 모션은 matchMedia(\"(prefers-reduced-motion: reduce)\")를 확인해 변환 자체를 걸지 않는다 — components/scroll-stack.tsx, components/relation-network.tsx가 레퍼런스다. 위 (1)~(3) 어느 쪽을 골라도 이 경계는 같다.",
      "경계 — 진입 애니메이션의 scale을 0에서 시작하지 않는다: shadcn animate-in 프리셋처럼 zoom-in-95(최종 크기의 95%)에서 출발해 팝오버·다이얼로그가 튀어나오지 않게 한다.",
      "경계 — 무한 반복 애니메이션(animate-spin·animate-pulse·animate-ping)은 로딩·실시간 갱신 등 '지금 진행 중'을 알리는 용도로만 쓴다: 정적 콘텐츠 강조에 쓰지 않는다.",
    ],
  },
  {
    title: "접근성",
    kind: "invariant",
    items: [
      "아이콘만 있는 버튼·링크에는 접근 가능한 이름을 준다 — aria-label을 붙이거나 sr-only 텍스트를 넣는다. 옆에 텍스트가 이미 있는 장식용 아이콘은 aria-hidden으로 중복 낭독을 막는다.",
      "포커스 표시를 제거하지 않는다 — outline-none만 남기지 말고 shadcn 프리미티브의 focus-visible:ring-*을 유지한다. 커스텀 인터랙티브 요소도 키보드 포커스가 눈에 보여야 한다.",
      "텍스트와 배경의 명도대비는 WCAG AA를 만족한다(본문 4.5:1, 18px↑ 또는 굵은 텍스트 3:1) — text-muted-foreground를 더 흐리게 덮어쓰거나 opacity-*로 본문을 죽이지 않는다. 새 테마 프리셋을 추가할 때는 라이트·다크 양쪽에서 확인한다.",
      "색만으로 정보를 전달하지 않는다 — 시세 등락(--gain/--loss)·상태 배지 등은 색과 함께 부호·아이콘·텍스트 라벨을 같이 준다(색각 이상·흑백 출력 대응).",
      "상호작용 요소는 시맨틱 태그로 만든다 — 클릭 가능한 div 대신 button/a를 쓰고, 탭·아코디언 등 복합 위젯은 role과 상태 속성(aria-selected, aria-expanded)을 함께 노출한다.",
      "폼 입력에는 연결된 label을 준다 — placeholder를 label 대용으로 쓰지 않는다(입력을 시작하면 사라져 맥락이 소실된다).",
    ],
  },
  {
    title: "폐쇄망 대응",
    kind: "invariant",
    items: [
      "금융권 등 폐쇄망 배포를 전제로 모든 리소스(폰트·아이콘·스크립트·스타일)를 self-host한다 — 빌드·런타임에 외부 CDN이나 외부 URL fetch가 없어야 한다.",
      "폰트는 next/font/google이 아닌 next/font/local을 쓰고, woff2 파일을 assets/fonts/<name>/ 에 레포로 커밋한다(라이선스 파일도 함께). npm 패키지(@fontsource 등)는 폰트 파일 취득 도구로만 쓰고 런타임 의존성으로 남기지 않는다.",
      "아이콘은 @phosphor-icons/react 등 npm 패키지로 번들한다 — 아이콘 CDN(iconify, googleapis 등) 링크를 쓰지 않는다.",
      "이미지·아바타 등 데모 콘텐츠도 외부 이미지 URL(i.pravatar.cc 등) 대신 로컬 placeholder(AvatarFallback, public/ 내 이미지)를 쓴다.",
      "next.config의 images.remotePatterns에 외부 도메인을 추가하지 않는다 — next/image는 로컬/자체 호스팅 이미지만 최적화 대상으로 둔다.",
      "빌드 산출물(.next) 외부 리소스 부재를 자동 테스트로 실증한다 — test/closed-network.test.ts가 프로덕션 정적 HTML/CSS에서 외부 <script src>/<link href>/CSS url()/CDN 힌트 문자열 0건을, test/sourcemap.test.ts가 프로덕션 청크에 sourcemap 부재를 검증한다.",
    ],
  },
  {
    title: "TypeScript",
    kind: "invariant",
    items: [
      "any 타입을 쓰지 않는다.",
      "TypeScript strict 모드를 유지한다.",
    ],
  },
  {
    title: "의존성 규율",
    kind: "invariant",
    items: [
      "새 UI 라이브러리 추가를 지양한다 — 먼저 shadcn/ui 프리미티브 조합, 아이콘 표준 3종(Phosphor 기본, Lucide, Tabler 백업), 폰트·이미지 self-host로 요구사항을 풀 수 있는지 검토한 뒤에만 새 패키지를 고려한다.",
      "새 패키지가 불가피하면 추가 전에 다음을 확인하고 PR/이슈에 근거를 남긴다: (1) 유지보수 상태(최근 커밋·이슈 대응 여부), (2) 라이선스가 MIT·Apache-2.0·BSD 계열인지(GPL 등 카피레프트 계열 제외), (3) 번들 크기·트리쉐이킹 비용, (4) 폐쇄망(금융권) 배포를 위해 self-host 가능한지(런타임에 외부 CDN·외부 URL fetch가 없는지).",
      "위 확인 항목 중 하나라도 통과하지 못하면(라이선스 불명, 유지보수 중단, self-host 불가 등) 채택하지 않는다.",
      "@tanstack/react-table·@dnd-kit(core/sortable/utilities)는 self-host 검증(MIT 라이선스, 런타임 외부 CDN/fetch 없음, 폐쇄망 빌드 테스트 그린)을 마친 승인 의존성이다 — TableSortable(#24)에서 사용한다.",
    ],
  },
  {
    title: "UI 패턴",
    kind: "decision",
    items: [
      "화면을 조립할 때는 컴포넌트 단품이 아니라 ui.doksam.com/patterns 의 조합 패턴(레이아웃·데이터 시각화·카드·상태·폼 입력)을 먼저 본다 — 다만 목록에서 고르는 것이지 전부 쓰는 것이 아니다. 브리프의 배제 목록에 걸린 패턴은 후보에서 뺀다.",
      "주식·파이프라인 등 도메인 화면은 /patterns 의 Srope 확장 패턴을 출발점으로 삼는다 — 도메인 용어나 갱신 주기가 맞지 않으면 그대로 쓰지 말고 어느 부분을 왜 바꿨는지 DESIGN.md 에 남긴다.",
      "경계 — DESIGN.md 의 원형은 ui.doksam.com/archetypes 의 권장 app-shell 변형을 프로젝트 전역 표준으로 고정한다(보조 원형이 있으면 그 화면에만 보조 원형의 셸): 화면마다 뼈대를 바꾸지 않는다.",
      "경계 — 로딩·빈 목록·에러 상태는 /patterns/state 의 표준 상태 UI 패턴을 따른다: 이 셋의 존재 자체는 선택이 아니다.",
    ],
  },
  {
    title: "도메인 확장 (Bizinfo)",
    kind: "decision",
    items: [
      "이 절은 사업자(비즈니스) 도메인을 다루는 프로젝트에만 적용한다 — 해당하지 않으면 Bizinfo 카테고리를 설치하지 않는다.",
      "적용한다면 공통 컴포넌트 대신 ui.doksam.com/components 의 Bizinfo 카테고리 확장을 먼저 찾는다.",
      "화면 사용법 안내가 필요하면 ScreenHelpDialog 패턴((?) 버튼)을 쓴다 — 도움말이 필요하다는 것은 화면이 복잡하다는 신호이므로, 먼저 화면을 줄일 수 있는지 본다.",
      "경계 — 사업자등록번호를 화면에 표시할 때는 formatBizNo(XXX-XX-XXXXX 형태)를 쓴다: 저장·API 전송값은 원본 10자리를 그대로 유지한다.",
    ],
  },
  {
    title: "AI로 설치하기 (shadcn 커스텀 레지스트리)",
    kind: "invariant",
    items: [
      "doksam-ui 고유 자산(shadcn/ui 프리미티브가 아닌 것 — badge-extended, tooltip-icon-button, table-sortable, screen-help-dialog, json-tree, log-viewer, request-inspector, finance-* 유틸, format-biz-no, profile-admin/service/data/docs/console)은 코드를 복붙하지 않고 npx shadcn add https://ui.doksam.com/r/<name>.json 으로 설치한다.",
      "설치 가능한 전체 목록과 각 install 명령은 ui.doksam.com/llms.txt(AI 발견용 카탈로그)에서 기계적으로 읽을 수 있다 — registry.json(레포 루트)이 단일 진실원천이며 pnpm gen:llms 로 동기화한다.",
      "이 레지스트리를 프로젝트에 상시 등록해두려면 components.json의 registries에 \"@doksam-ui\": \"https://ui.doksam.com/r/{name}.json\" 을 추가한다 — 이후 npx shadcn add @doksam-ui/<name> 으로 짧게 설치할 수 있다.",
      "폰트(assets/fonts/)는 registry item으로 자동 설치되지 않는다 — 프로필(profile-admin 등) cssVars는 색·radius만 적용하고, 폰트는 fonts/index.ts 안내대로 woff2를 수동 복사 후 next/font/local로 연결한다.",
    ],
  },
  {
    title: "표준 준수 체크리스트",
    kind: "invariant",
    items: [
      "[ ] DESIGN.md 에 원형·성격·안 쓸 컴포넌트/패턴·이유 선언 (첫 화면 생성 전).",
      "[ ] 수렴 안티패턴 절의 항목을 화면별로 자가 점검.",
      "[ ] 브랜드 프로필 지정 (admin/service/data/docs/console 중 1 — ui.doksam.com/profiles).",
      "[ ] 프로필이 고정한 radius·density(<html data-density>)를 프로젝트에서 임의 재정의하지 않는다 — 바꿀 필요가 생기면 doksam-ui에 프로필 추가/수정으로 반영.",
      "[ ] 셸 구조 선택 근거를 DESIGN.md 에 기록 — 사이드바 셸을 골랐다면 ui.doksam.com/patterns/app-shell 를 준수.",
      "[ ] 하드코딩 색 0건 — 시맨틱 색상 토큰만 사용.",
      "[ ] 아이콘 표준 3종(Phosphor 기본)만, 이모지 아이콘 0건.",
      "[ ] 폰트·리소스 전부 셀프호스팅 (외부 CDN 0건).",
      "[ ] 빌드 산출물 외부 리소스 부재를 자동 테스트로 실증 (test/closed-network.test.ts, test/sourcemap.test.ts).",
      "[ ] 새 페이지에 loading/error 동반, 상태 UI는 ui.doksam.com/patterns/state 를 따른다.",
      "[ ] transition-all 0건(components/ui/ shadcn 원본 제외), duration은 100/200/300 스케일만.",
      "[ ] 커스텀 애니메이션은 prefers-reduced-motion: reduce 에서 정지 — 자동 테스트로 실증 (test/motion-rules.test.ts).",
      "[ ] 아이콘 단독 버튼에 접근 가능한 이름, 포커스 표시 유지, 본문 명도대비 WCAG AA.",
      "[ ] TypeScript strict·any 0건, Sonar Quality Gate 통과.",
    ],
  },
];

/** 디자인 브리프 절. scripts/gen-llms.mjs 가 llms.txt 맨 앞에 싣는다 — 문안은 여기에만 둔다. */
export const DESIGN_BRIEF_SECTION: RulesSection = RULES_SECTIONS[0];

/** 수렴 안티패턴 절 — gen-llms 가 브리프 바로 뒤에 전문을 싣는다(#34). */
export const CONVERGENCE_ANTIPATTERNS_SECTION: RulesSection = RULES_SECTIONS[1];

function sectionToMarkdown(section: RulesSection): string {
  const bullets = section.items.map((item) => `- ${item}`).join("\n");
  return `## ${section.title} [${section.kind}]\n\n${bullets}`;
}

/** AI 프롬프트에 그대로 붙여넣는 markdown 원문. RULES_SECTIONS 로부터 생성된다. */
export const RULES_MARKDOWN = [
  "# doksam-ui 사용 규칙",
  "doksam 프로젝트에서 UI를 만들 때 지키는 규칙입니다. ui.doksam.com 을 참고하세요.",
  "규칙은 두 층입니다. 절 제목 뒤에 붙은 표시를 먼저 보세요.",
  [
    "- [invariant] — 불변. 프로젝트가 달라도 답이 같습니다. 어기면 표준 위반이고, 상당수는 자동 테스트가 막습니다.",
    "- [decision] — 선택. 프로젝트마다 정답이 다릅니다. 이 절은 명령이 아니라 선택지와 고르는 기준을 주며, 무엇을 골랐는지는 DESIGN.md 에 남깁니다. 각 선택지에는 그 선택을 골랐을 때 지켜야 할 경계가 붙습니다.",
  ].join("\n"),
  '불변만 지키면 "틀리지 않은" 화면이 나올 뿐이고, 선택을 하지 않으면 모든 화면이 같은 뼈대로 수렴합니다. 무엇을 만들기 전에 "디자인 브리프" 절부터 수행하세요.',
  ...RULES_SECTIONS.map(sectionToMarkdown),
].join("\n\n");
