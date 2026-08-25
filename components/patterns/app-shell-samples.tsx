import {
  AppWindowIcon,
  ArticleIcon,
  ColumnsIcon,
  NewspaperClippingIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PatternSampleData } from "@/components/showcase/pattern-sample"

const NAV_LABELS = ["홈", "Tokens", "Icons", "Components", "Patterns", "Rules"]

const PANE_ITEMS = ["배포 승인 요청", "야간 배치 실패 알림", "주간 리포트 초안"]

const FEED_ITEMS = ["crawler-worker 재기동 완료", "일일 수집 12,480건 적재", "알림 규칙 3건 변경"]

const DOC_TREE = ["규칙", "컬러 · 토큰", "아이콘", "레이아웃"]

const SPACING_SCALE = [
  { token: "gap-4", px: "16px", usage: "카드 내부 좁은 간격 (라벨-값 등)" },
  { token: "gap-6", px: "24px", usage: "카드 내부 기본 간격, 폼 필드 그리드" },
  { token: "gap-8", px: "32px", usage: "페이지 내 섹션 간 기본 간격" },
  { token: "gap-10", px: "40px", usage: "섹션이 많은 페이지의 넉넉한 섹션 간격" },
]

const BREAKPOINTS = [
  { token: "sm", px: "640px", usage: "폼 필드 1열 → 2열" },
  { token: "md", px: "768px", usage: "폼 필드 2열 → 4열, 요약 카드 3열 → 5열" },
  { token: "lg", px: "1024px", usage: "사이드바형 셸에서 사이드바 상시 노출, 차트 1열 → 2열" },
  { token: "xl", px: "1280px", usage: "헤더형 셸 본문이 max-w-[1300px]에 도달" },
]

export const APP_SHELL_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "사이드바형 셸",
    description: "관리자·데이터 도구처럼 상시 내비게이션이 필요한 화면의 기본 셸입니다 — doksam-ui 자체가 이 구조입니다.",
    demo: (
      <div className="flex h-[160px] w-full overflow-hidden rounded-md border border-border">
        <div className="flex w-24 shrink-0 flex-col gap-1 border-r border-border bg-card px-2 py-3">
          <div className="mb-2 flex items-center gap-1 px-1">
            <SidebarSimpleIcon size={12} weight="regular" className="text-primary" />
            <span className="text-[9px] font-semibold tracking-tight">doksam-ui</span>
          </div>
          {NAV_LABELS.map((label, i) => (
            <div
              key={label}
              className={`rounded px-1.5 py-1 text-[8px] ${
                i === 4 ? "bg-accent text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-hidden px-3 py-3">
          <Badge variant="secondary" className="w-fit px-1.5 py-0 text-[8px]">
            Patterns
          </Badge>
          <p className="mt-1 text-[10px] font-semibold tracking-tight">앱 셸 패턴</p>
          <p className="mt-0.5 text-[8px] text-muted-foreground">본문은 max-w 로 폭을 제한하고 좌측 정렬합니다.</p>
          <div className="mt-2 h-[70px] rounded bg-muted/40" />
        </div>
      </div>
    ),
    code: `<div className="flex min-h-screen">
  <SiteSidebar /> {/* w-56 shrink-0, border-r border-border bg-card px-3 py-4 */}
  <main className="flex-1 px-6 py-8">
    {/* 페이지 콘텐츠 — 텍스트 위주 페이지는 max-w-3xl, 대시보드류는 max-w-6xl/w-full */}
    {children}
  </main>
</div>`,
    notes: [
      "사이드바는 폭 w-56(224px) 고정, shrink-0, border-r border-border bg-card px-3 py-4 이 기본값이다 — components/site-sidebar.tsx 참고.",
      "본문 컨테이너는 flex-1 px-6 py-8 로 셸을 채우고, 개별 페이지가 max-w-3xl(텍스트 위주)~max-w-6xl/w-full(대시보드·표)로 본문 폭을 다시 좁힌다.",
      "관리자 도구·내부 데이터 서비스·doksam-ui 자체처럼 메뉴 항목이 5개 이상이거나 상시 내비게이션이 필요한 화면에 쓴다.",
      "lg 미만에서는 사이드바를 숨김/토글(Sheet 등)로 전환하는 것을 기본으로 하되, 이 페이지 데모는 고정폭만 다룬다.",
    ],
  },
  {
    num: 2,
    title: "헤더형 셸",
    description: "메뉴가 적은 단순 서비스·모바일 우선 화면에 쓰는 셸 — 상단 헤더 + 중앙 정렬 본문입니다.",
    demo: (
      <div className="flex h-[160px] w-full flex-col overflow-hidden rounded-md border border-border">
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-border bg-card px-3">
          <div className="flex items-center gap-1">
            <AppWindowIcon size={12} weight="regular" className="text-primary" />
            <span className="text-[9px] font-semibold tracking-tight">서비스명</span>
          </div>
          <span className="text-[8px] text-muted-foreground">메뉴</span>
        </div>
        <div className="flex-1 overflow-hidden px-3 py-3">
          <div className="mx-auto flex h-full max-w-[220px] flex-col gap-2">
            <Badge variant="secondary" className="w-fit px-1.5 py-0 text-[8px]">
              Section
            </Badge>
            <p className="text-[10px] font-semibold tracking-tight">중앙 정렬 콘텐츠</p>
            <div className="h-[60px] rounded bg-muted/40" />
          </div>
        </div>
      </div>
    ),
    code: `<div className="flex min-h-screen flex-col">
  <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
    <span className="text-sm font-semibold tracking-tight">서비스명</span>
    {/* 메뉴 · 사용자 액션 */}
  </header>
  <main className="flex-1 px-4 py-6">
    <div className="mx-auto flex max-w-[1300px] flex-col gap-8">
      {children}
    </div>
  </main>
</div>`,
    notes: [
      "헤더는 높이 h-14(56px) 고정, border-b border-border bg-card px-4 가 기본값이다.",
      "본문은 mx-auto max-w-[1300px] 로 중앙 정렬한다 — 사이드바형처럼 페이지마다 max-w 를 새로 정하지 않고 셸 레벨에서 한 번만 고정한다.",
      "메뉴 항목이 적은(3~5개 이내) 단순 서비스, 모바일 우선 화면, 랜딩성 페이지에 쓴다.",
      "사이드바형과 동시에 쓰지 않는다 — 한 프로젝트는 두 셸 중 하나를 프로젝트 전역 표준으로 고정한다.",
    ],
  },
  {
    num: 3,
    title: "분할 패인 셸",
    description:
      "좌측 목록과 우측 상세를 한 화면에 두고, 목록 선택이 페이지 이동 없이 우측만 바꾸는 셸입니다 — split-pane 원형의 기본 뼈대입니다.",
    demo: (
      <div className="flex h-[160px] w-full overflow-hidden rounded-md border border-border">
        <div className="flex w-28 shrink-0 flex-col border-r border-border bg-card">
          <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
            <ColumnsIcon size={11} weight="regular" className="text-primary" />
            <span className="text-[8px] font-semibold tracking-tight">받은 항목</span>
          </div>
          {PANE_ITEMS.map((item, i) => (
            <div
              key={item}
              className={`border-b border-border/60 px-2 py-1.5 text-[8px] ${
                i === 1 ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-hidden px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-tight">{PANE_ITEMS[1]}</p>
          <p className="mt-0.5 text-[8px] text-muted-foreground">우측 패인만 교체된다 — URL 은 목록 상태를 유지한다.</p>
          <div className="mt-2 h-[80px] rounded bg-muted/40" />
        </div>
      </div>
    ),
    code: `<div className="flex min-h-screen">
  <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-card">
    {/* 목록 패인 — 자체 overflow-y-auto */}
  </aside>
  <section className="min-w-0 flex-1 overflow-y-auto px-6 py-6">
    {/* 상세 패인 — 선택된 항목만 렌더 */}
  </section>
</div>`,
    notes: [
      "목록 패인은 w-72(288px) 안팎으로 고정하고 shrink-0 을 준다 — 상세가 길어져도 목록 폭이 흔들리지 않아야 한다.",
      "상세 패인에는 min-w-0 을 반드시 준다. 없으면 긴 코드·표가 flex 자식의 최소 폭을 밀어 페이지 가로 스크롤이 생긴다.",
      "lg 미만에서는 두 패인을 나란히 두지 않는다 — 목록만 보이고 선택 시 상세로 전환하는 단일 패인 흐름으로 접는다.",
      "메일 처리함·티켓 트리아지처럼 항목을 연달아 훑는 화면에 쓴다. 항목을 하나만 열고 끝나는 흐름이면 그냥 목록→상세 라우팅이 낫다.",
    ],
  },
  {
    num: 4,
    title: "피드형 셸",
    description:
      "시간순 단일 세로 스트림이 화면의 주인공이고 필터·요약이 곁가지로 붙는 셸입니다 — feed-timeline 원형의 기본 뼈대입니다.",
    demo: (
      <div className="flex h-[160px] w-full flex-col overflow-hidden rounded-md border border-border">
        <div className="flex shrink-0 items-center gap-1 border-b border-border bg-card px-2.5 py-1.5">
          <NewspaperClippingIcon size={11} weight="regular" className="text-primary" />
          <span className="text-[8px] font-semibold tracking-tight">전체</span>
          <span className="rounded bg-muted px-1 py-0.5 text-[7px] text-muted-foreground">배포</span>
          <span className="rounded bg-muted px-1 py-0.5 text-[7px] text-muted-foreground">알림</span>
        </div>
        <div className="flex-1 overflow-hidden px-2.5 py-2">
          <div className="mx-auto flex max-w-[240px] flex-col gap-1.5">
            {FEED_ITEMS.map((item) => (
              <div key={item} className="flex gap-1.5 rounded border border-border/60 px-2 py-1.5">
                <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[8px] text-foreground">{item}</p>
                  <p className="text-[7px] text-muted-foreground">방금 전</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    code: `<div className="flex min-h-screen flex-col">
  <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
    {/* 얇은 필터 바 — 목적지가 아니라 스트림의 좁힘 조건 */}
  </div>
  <main className="flex-1 px-4 py-6">
    <ol className="mx-auto flex max-w-2xl flex-col gap-3">
      {/* 항목 하나 = <li> — 시간 역순 */}
    </ol>
  </main>
</div>`,
    notes: [
      "스트림 폭은 max-w-2xl 안팎으로 좁힌다 — 한 줄이 길어지면 시간 흐름을 따라가기 어려워진다.",
      "필터 바는 sticky top-0 로 남기되 목적지 링크를 섞지 않는다. 피드에서 다른 화면으로 나가는 링크는 항목 안에만 둔다.",
      "항목 목록은 <ol>/<li> 로 마크업해 순서가 의미를 갖는다는 것을 보조기술에 알린다.",
      "항목 간 비교나 정렬이 목적이면 이 셸이 아니라 표(data-table 패턴)를 쓴다.",
    ],
  },
  {
    num: 5,
    title: "문서 리더 셸",
    description:
      "좌측 문서 트리·우측 목차가 본문 한 칼럼을 감싸는 셸입니다 — doc-reader 원형의 기본 뼈대입니다.",
    demo: (
      <div className="flex h-[160px] w-full overflow-hidden rounded-md border border-border">
        <div className="flex w-20 shrink-0 flex-col gap-1 border-r border-border bg-card px-1.5 py-2">
          <div className="flex items-center gap-1 px-0.5">
            <ArticleIcon size={11} weight="regular" className="text-primary" />
            <span className="text-[8px] font-semibold tracking-tight">문서</span>
          </div>
          {DOC_TREE.map((node, i) => (
            <div
              key={node}
              className={`rounded px-1 py-0.5 text-[7px] ${
                i === 2 ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
              style={{ paddingLeft: i === 0 ? undefined : "0.5rem" }}
            >
              {node}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-tight">규칙 원문</p>
          <div className="mt-1.5 flex flex-col gap-1">
            <div className="h-1 w-full rounded bg-muted" />
            <div className="h-1 w-11/12 rounded bg-muted" />
            <div className="h-1 w-10/12 rounded bg-muted" />
            <div className="h-1 w-full rounded bg-muted" />
            <div className="h-1 w-9/12 rounded bg-muted" />
          </div>
        </div>
        <div className="hidden w-16 shrink-0 flex-col gap-1 border-l border-border px-1.5 py-2 sm:flex">
          <span className="text-[7px] font-medium uppercase tracking-wider text-muted-foreground/70">목차</span>
          <span className="text-[7px] text-primary">컬러</span>
          <span className="text-[7px] text-muted-foreground">아이콘</span>
          <span className="text-[7px] text-muted-foreground">레이아웃</span>
        </div>
      </div>
    ),
    code: `<div className="flex min-h-screen">
  <aside className="hidden w-60 shrink-0 border-r border-border px-3 py-6 lg:block">
    {/* 문서 트리 */}
  </aside>
  <article className="min-w-0 flex-1 px-4 py-8">
    <div className="mx-auto max-w-prose">{children}</div>
  </article>
  <aside className="hidden w-56 shrink-0 border-l border-border px-3 py-8 xl:block">
    {/* 목차 — 스크롤 위치 동기 */}
  </aside>
</div>`,
    notes: [
      "본문은 max-w-prose 로 줄 길이를 제한한다 — 문서 리더에서 이 폭 제한은 선택이 아니라 요건이다.",
      "좌측 트리는 lg 이상, 우측 목차는 xl 이상에서만 노출하고 그 아래에서는 본문만 남긴다.",
      "본문에 들어가는 넓은 요소(표·코드블록)는 자체 overflow-x-auto 래퍼로 감싼다 — max-w-prose 를 넘겨 페이지를 밀지 않게 한다.",
      "본문이 한 화면에 들어오는 짧은 글에는 쓰지 않는다 — 트리·목차가 본문보다 커진다.",
    ],
  },
  {
    num: 6,
    title: "페이지 타이틀 패턴",
    description: "셸 종류와 무관하게 모든 페이지 상단에 반복되는 타이틀 3요소 구조입니다.",
    demo: (
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Badge variant="secondary" className="w-fit px-1.5 py-0 text-[9px]">
            Patterns
          </Badge>
          <h3 className="text-lg font-semibold tracking-tight">사이드바형 페이지 제목</h3>
          <p className="text-[10px] text-muted-foreground">text-xl~2xl 크기, 대시보드·목록 등 정보 밀도가 높은 페이지.</p>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <Badge variant="secondary" className="w-fit px-1.5 py-0 text-[9px]">
            Section
          </Badge>
          <h3 className="text-base font-semibold tracking-tight">헤더형 페이지 제목</h3>
          <p className="text-[10px] text-muted-foreground">text-xl 크기, 중앙 정렬 본문의 단순 서비스 페이지.</p>
        </div>
      </div>
    ),
    code: `<section className="flex flex-col gap-3">
  <Badge variant="secondary" className="w-fit">{sectionLabel}</Badge>
  <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
  <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
</section>`,
    notes: [
      "섹션 라벨(Badge variant=\"secondary\") → h1(font-semibold tracking-tight) → 설명(text-sm text-muted-foreground) 순서를 항상 지킨다.",
      "h1 크기는 text-xl~text-2xl 범위에서 고른다 — 정보 밀도가 높은 사이드바형 대시보드는 text-2xl, 단순 서비스·헤더형 셸은 text-xl 이 기본값이다.",
      "설명 문단은 max-w-prose 로 줄 길이를 제한해 가독성을 유지한다.",
    ],
  },
  {
    num: 7,
    title: "여백 밀도 스케일",
    description: "섹션 간격과 카드 내부 간격에 쓰는 gap 토큰 4단계입니다 — 임의의 gap 값을 새로 만들지 않는다.",
    demo: (
      <div className="flex w-full flex-col gap-3">
        {SPACING_SCALE.map((item) => (
          <div key={item.token} className="flex items-center gap-3">
            <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">{item.token}</span>
            <div className="h-2 rounded bg-primary/70" style={{ width: item.px }} />
            <span className="text-[9px] text-muted-foreground">{item.usage}</span>
          </div>
        ))}
      </div>
    ),
    code: `// 카드 내부
<CardContent className="flex flex-col gap-4">   {/* 좁은 간격: 라벨-값 */}
<CardContent className="flex flex-col gap-6">   {/* 기본 간격 */}

// 페이지 섹션 사이
<div className="flex flex-col gap-8">   {/* 기본 */}
<div className="flex flex-col gap-10">  {/* 섹션이 많은 페이지 */}`,
    notes: [
      "카드·필드 그룹 등 좁은 스코프의 내부 간격은 gap-4~gap-6 범위에서 고른다.",
      "페이지 내 섹션(타이틀 블록, 각 패턴 샘플 등) 사이 간격은 gap-8~gap-10 범위에서 고른다 — 이 페이지 자체가 gap-8 을 쓴다.",
      "이 4단계(gap-4/6/8/10) 밖의 임의 값(gap-5, gap-7 등)은 쓰지 않는다.",
    ],
  },
  {
    num: 8,
    title: "반응형 브레이크포인트 규칙",
    description: "셸·그리드가 열을 바꾸는 기준점을 sm/md/lg/xl 4단계로 고정합니다.",
    demo: (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[10px]">브레이크포인트</TableHead>
            <TableHead className="text-[10px]">기준폭</TableHead>
            <TableHead className="text-[10px]">용도</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BREAKPOINTS.map((bp) => (
            <TableRow key={bp.token}>
              <TableCell className="py-1.5 font-mono text-[10px]">{bp.token}</TableCell>
              <TableCell className="py-1.5 text-[10px] text-muted-foreground">{bp.px}</TableCell>
              <TableCell className="py-1.5 text-[10px] text-muted-foreground">{bp.usage}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ),
    code: `<div className="grid grid-cols-2 gap-3 md:grid-cols-4">      {/* 폼 필드 */}
<div className="grid grid-cols-3 gap-1.5 md:grid-cols-5">   {/* 요약 카드 */}
<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">     {/* 차트 · 사이드바 노출 */}
<div className="mx-auto max-w-[1300px]">                     {/* 헤더형 셸 본문, xl 근방에서 폭 도달 */}`,
    notes: [
      "새 그리드·셸을 만들 때 sm/md/lg/xl 4단계 밖의 임의 브레이크포인트(예: min-[900px])를 만들지 않는다.",
      "사이드바형 셸은 lg 를 기준으로 사이드바 상시 노출 여부를 가른다.",
      "표·카드 그리드의 열 수 변경은 md(4~5열 진입)와 lg(2열 이상 큰 블록)를 기본 기준으로 쓴다.",
    ],
  },
]
