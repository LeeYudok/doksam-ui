import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { ContentFeedDemo, ContentThumbFeedDemo } from "@/components/patterns/content-feed/content-feed-demo"
import { ContentCard } from "@/components/patterns/content-feed/content-feed"
import { CONTENT_ITEMS } from "@/components/patterns/content-feed/content-feed-data"

export const CONTENT_FEED_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "뷰토글 3종 (그리드/리스트/테이블)",
    description: "그리드·리스트·테이블 사이를 전환하는 목록 상단 뷰토글입니다. 그리드/리스트는 카드 마크업을 공유하고, 테이블만 별도 컴포넌트로 교체됩니다.",
    demo: <ContentFeedDemo />,
    code: `const [view, setView] = useState<"grid" | "list" | "table">("grid")

{view === "table" ? (
  <ContentTable items={items} />
) : (
  <ul data-view={view} className="group/feed grid grid-cols-1 gap-3 data-[view=grid]:sm:grid-cols-2">
    {items.map((item) => (
      <li key={item.id}><ContentCard item={item} /></li>
    ))}
  </ul>
)}`,
    notes: [
      "그리드/리스트는 같은 <ContentCard>를 재사용하고, 부모 <ul>의 data-view 값만 바뀐다 — 카드 자체는 분기하지 않는다.",
      "테이블 뷰는 열 구조가 근본적으로 다르므로 그리드/리스트와 별도 컴포넌트(ContentTable)로 분리한다.",
      "뷰 전환 버튼은 aria-pressed로 현재 뷰를 알리고, role=\"group\"으로 묶어 스크린리더에서 토글 그룹임을 드러낸다.",
    ],
  },
  {
    num: 2,
    title: "group-data variant 카드 비교",
    description: "동일한 ContentCard 마크업이 조상의 data-view 값만 다를 때 어떻게 레이아웃이 바뀌는지 나란히 비교합니다.",
    demo: (
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium text-muted-foreground">data-view=&quot;grid&quot;</p>
          <ul data-view="grid" className="group/feed flex flex-col gap-2">
            <li>
              <ContentCard item={CONTENT_ITEMS[0]} />
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium text-muted-foreground">data-view=&quot;list&quot;</p>
          <ul data-view="list" className="group/feed flex flex-col gap-2">
            <li>
              <ContentCard item={CONTENT_ITEMS[0]} />
            </li>
          </ul>
        </div>
      </div>
    ),
    code: `/* ContentCard.tsx — 카드 하나에 두 레이아웃이 공존한다 */
<div className="flex flex-col gap-2 p-4
  group-data-[view=list]/feed:flex-row
  group-data-[view=list]/feed:items-center
  group-data-[view=list]/feed:gap-4
  group-data-[view=list]/feed:p-3"
>
  {/* ... */}
</div>`,
    notes: [
      "group/<name>과 group-data-[key=value]/<name>: 조합으로, 별도 props 없이 조상의 data-* 속성만으로 자식 스타일을 바꾼다.",
      "조건부 렌더 대신 CSS variant로 처리하므로 그리드→리스트 전환 시 리마운트가 없고 애니메이션 전환도 자연스럽다.",
      "새 뷰를 추가할 땐 data-view 값 하나와 그에 대응하는 group-data-[view=...] 유틸리티만 추가하면 된다.",
    ],
  },
  {
    num: 3,
    title: "썸네일 카드 피드",
    description:
      "썸네일이 있는 콘텐츠 카드 변형입니다. 그리드에선 상단 16:9, 리스트에선 좌측 정사각 썸네일로 같은 group-data variant 기법으로 전환됩니다. 썸네일은 외부 이미지 대신 chart 토큰 그라디언트 + 카테고리 아이콘 플레이스홀더입니다.",
    demo: <ContentThumbFeedDemo />,
    code: `<div className={cn(
  "flex aspect-video shrink-0 items-center justify-center bg-gradient-to-br",
  "group-data-[view=list]/feed:aspect-square group-data-[view=list]/feed:w-24",
  THUMB_STYLES[item.category].gradient,   // from-chart-1/40 to-chart-1/10 등 리터럴만
)} role="img" aria-label={\`\${item.category} 썸네일\`}>
  {THUMB_STYLES[item.category].icon}
</div>
{/* 실제 이미지 연동 시 이 자리에 next/image — aspect 클래스는 그대로 유지 */}`,
    notes: [
      "썸네일 비율 전환도 group-data-[view=list]/feed: 만으로 처리한다 — 그리드=aspect-video, 리스트=aspect-square w-24.",
      "폐쇄망 원칙상 데모 썸네일은 외부 이미지 대신 chart 토큰 그라디언트 + 아이콘으로 합성하고, 실 서비스에선 같은 자리에 next/image 를 넣는다.",
      "그라디언트 클래스는 카테고리→리터럴 문자열 맵으로 관리한다 — 동적 문자열 조립은 Tailwind JIT 가 감지하지 못한다.",
    ],
  },
]
