import { ChartBarIcon, FileCodeIcon, ListIcon, TabsIcon, TextAaIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PatternSampleData } from "@/components/showcase/pattern-sample"

const EMPLOYEES = [
  { name: "김철수", dept: "개발팀", status: "재직" },
  { name: "이영희", dept: "디자인팀", status: "재직" },
  { name: "박민수", dept: "기획팀", status: "휴직" },
  { name: "정수진", dept: "마케팅", status: "재직" },
  { name: "최동우", dept: "인사팀", status: "재직" },
]

const FORM_FIELDS = ["이름", "이메일", "부서", "직위"]

export const LAYOUT_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "대시보드 레이아웃",
    description: "요약 카드 + 차트 그리드로 구성하는 기본 대시보드 구조입니다.",
    demo: (
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <ChartBarIcon size={16} weight="regular" className="text-primary" />
          <span className="text-sm font-bold">대시보드 제목</span>
          <Badge variant="secondary" className="px-2 py-0 text-[10px]">
            총 1,234건
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-1.5 md:grid-cols-5">
          {["매출", "주문", "사용자", "방문", "전환"].map((label, i) => (
            <Card key={label}>
              <CardContent className="px-2 py-2">
                <p className="text-[9px] font-medium text-muted-foreground">{label}</p>
                <span className="text-base font-black text-primary">{(1000 * (i + 1)).toLocaleString()}</span>
                <span className="ml-0.5 text-[8px] text-muted-foreground">건</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {["일별 추이", "카테고리 분포"].map((title) => (
            <Card key={title}>
              <CardContent className="px-2 pt-2 pb-1">
                <p className="px-1 text-[11px] font-bold text-foreground">{title}</p>
                <div className="flex h-[60px] items-center justify-center rounded bg-muted/50 text-[10px] text-muted-foreground">
                  차트 영역
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ),
    code: `<div className="flex flex-col gap-3">
  <div className="flex items-center gap-2">
    <ChartBarIcon size={16} className="text-primary" />
    <span className="text-sm font-bold">대시보드 제목</span>
    <Badge variant="secondary">총 1,234건</Badge>
  </div>
  <div className="grid grid-cols-3 gap-1.5 md:grid-cols-5">
    {summaries.map((s) => (
      <Card key={s.label}>
        <CardContent className="px-2 py-2">
          <p className="text-[9px] text-muted-foreground">{s.label}</p>
          <span className="text-base font-black text-primary">{s.value}</span>
        </CardContent>
      </Card>
    ))}
  </div>
  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
    {charts.map((c) => (
      <Card key={c.title}>
        <CardContent className="px-2 pt-2 pb-1">{/* 차트 */}</CardContent>
      </Card>
    ))}
  </div>
</div>`,
    notes: [
      "최상위 컨테이너는 flex flex-col gap-3 로 세로 리듬을 통일한다.",
      "요약 카드 그리드는 grid-cols-3 md:grid-cols-5, 차트 그리드는 grid-cols-1 lg:grid-cols-2 가 기본이다.",
      "숫자는 toLocaleString() 으로 천단위 콤마를 넣는다.",
    ],
  },
  {
    num: 2,
    title: "목록 페이지",
    description: "고정 헤더 테이블 + ScrollArea + 페이징으로 구성하는 목록 화면입니다.",
    demo: (
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListIcon size={16} weight="regular" className="text-primary" />
            <span className="text-sm font-bold">직원 관리</span>
            <Badge variant="secondary" className="px-2 py-0 text-[10px]">
              전체 50건
            </Badge>
          </div>
          <Button size="sm" variant="outline">
            등록
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[140px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-10 text-[10px]">#</TableHead>
                    <TableHead className="text-[10px]">이름</TableHead>
                    <TableHead className="text-[10px]">부서</TableHead>
                    <TableHead className="text-right text-[10px]">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EMPLOYEES.map((row, i) => (
                    <TableRow key={row.name}>
                      <TableCell className="py-1 text-[10px] text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="py-1 text-xs font-medium">{row.name}</TableCell>
                      <TableCell className="py-1 text-xs">{row.dept}</TableCell>
                      <TableCell className="py-1 text-right">
                        <Badge variant={row.status === "재직" ? "default" : "secondary"} className="px-1.5 py-0 text-[9px]">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between py-1 text-[10px] text-muted-foreground">
          <span>1-5 / 50건</span>
          <div className="flex gap-1">
            <Button size="xs" variant="outline" className="text-[10px]">
              이전
            </Button>
            <Button size="xs" variant="outline" className="text-[10px]">
              다음
            </Button>
          </div>
        </div>
      </div>
    ),
    code: `<div className="flex flex-col flex-1 min-h-0 gap-2">
  <div className="flex items-center justify-between">
    <span className="text-sm font-bold">직원 관리</span>
    <Button size="sm" variant="outline">등록</Button>
  </div>
  <Card>
    <CardContent className="p-0">
      <ScrollArea className="h-[140px]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>{/* ... */}</TableRow>
          </TableHeader>
          <TableBody>{/* ... */}</TableBody>
        </Table>
      </ScrollArea>
    </CardContent>
  </Card>
</div>`,
    notes: [
      "페이지 루트는 flex flex-col flex-1 min-h-0 gap-2 로 남은 높이를 ScrollArea 에 위임한다.",
      "TableHeader 는 sticky top-0 z-10 bg-background 로 스크롤 시 고정한다.",
      "행 상태는 Badge variant 로 구분(재직=default, 그 외=secondary)한다.",
    ],
  },
  {
    num: 3,
    title: "상세/폼 페이지",
    description: "2~4컬럼 폼 레이아웃으로 구성하는 등록/수정 화면입니다.",
    demo: (
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <TextAaIcon size={16} weight="regular" className="text-primary" />
          <span className="text-sm font-bold">사용자 등록</span>
        </div>
        <div className="rounded-md border bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {FORM_FIELDS.map((label) => (
              <div key={label} className="space-y-1">
                <label htmlFor={`field-${label}`} className="text-[10px] font-medium text-muted-foreground">
                  {label}
                </label>
                <div id={`field-${label}`} className="flex h-8 items-center rounded border bg-background px-2 text-xs text-muted-foreground">
                  입력값
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="outline">
              취소
            </Button>
            <Button size="sm">저장</Button>
          </div>
        </div>
      </div>
    ),
    code: `<div className="rounded-md border bg-muted/30 p-4">
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {fields.map((field) => (
      <div key={field.label} className="space-y-1">
        <Label className="text-[10px]">{field.label}</Label>
        <Input className="h-8 text-xs" />
      </div>
    ))}
  </div>
  <div className="mt-3 flex justify-end gap-2">
    <Button size="sm" variant="outline">취소</Button>
    <Button size="sm">저장</Button>
  </div>
</div>`,
    notes: [
      "폼 영역은 rounded-md border p-4 bg-muted/30 으로 본문과 시각적으로 구분한다.",
      "필드 그리드는 grid grid-cols-2 md:grid-cols-4 gap-3 이 기본값이다.",
      "액션 버튼은 우측 정렬(justify-end)하고 취소를 먼저, 저장을 나중에 둔다.",
    ],
  },
  {
    num: 4,
    title: "탭 페이지",
    description: "여러 탭으로 화면을 분리하는 레이아웃 — 탭별로 파일을 분리해 구현합니다.",
    demo: (
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <TabsIcon size={16} weight="regular" className="text-primary" />
          <span className="text-sm font-bold">데이터 관리</span>
        </div>
        <div className="flex gap-1 border-b border-border">
          {["수집 실행", "결과", "수집 데이터"].map((tab, i) => (
            <div
              key={tab}
              className={`rounded-t border-b-2 px-3 py-1.5 text-xs font-medium ${
                i === 0 ? "border-primary bg-accent/50 text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="flex h-[60px] items-center justify-center rounded bg-muted/30 text-[10px] text-muted-foreground">
          탭 콘텐츠 영역 (탭마다 별도 파일로 분리)
        </div>
      </div>
    ),
    code: `<div className="flex gap-1 border-b border-border">
  {tabs.map((tab) => (
    <button
      key={tab.value}
      className={cn(
        "rounded-t border-b-2 px-3 py-1.5 text-xs font-medium",
        tab.active
          ? "border-primary bg-accent/50 text-foreground"
          : "border-transparent text-muted-foreground",
      )}
    >
      {tab.label}
    </button>
  ))}
</div>`,
    notes: [
      "shadcn Tabs 프리미티브(components/ui/tabs.tsx)로 접근성 있는 탭을 구성한다.",
      "탭이 많거나 각 탭 로직이 복잡하면 탭별로 별도 컴포넌트 파일로 분리한다.",
      "활성 탭은 border-primary bg-accent/50, 비활성은 border-transparent text-muted-foreground 로 구분한다.",
    ],
  },
  {
    num: 5,
    title: "빈 페이지 템플릿",
    description: "새 화면을 시작할 때 쓰는 최소 구조 스켈레톤입니다.",
    demo: (
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <FileCodeIcon size={16} weight="regular" className="text-primary" />
          <span className="text-sm font-bold">새 페이지</span>
        </div>
        <div className="space-y-1">
          <Skeleton className="h-8 w-[160px]" />
          <Skeleton className="h-4 w-[240px]" />
        </div>
        <div className="grid grid-cols-3 gap-1.5 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-1 px-2 py-2">
                <Skeleton className="h-3 w-[40px]" />
                <Skeleton className="h-5 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 px-2 pt-2 pb-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-[60px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ),
    code: `<div className="flex flex-col gap-3">
  <div className="space-y-1">
    <Skeleton className="h-8 w-[160px]" />
    <Skeleton className="h-4 w-[240px]" />
  </div>
  <div className="grid grid-cols-3 gap-1.5 md:grid-cols-5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="space-y-1 px-2 py-2">
          <Skeleton className="h-3 w-[40px]" />
          <Skeleton className="h-5 w-[60px]" />
        </CardContent>
      </Card>
    ))}
  </div>
</div>`,
    notes: [
      "실제 페이지의 레이아웃 구조(제목·요약 카드·차트)를 그대로 미러링해 스켈레톤을 만든다.",
      "반복 요소는 Array.from({ length: N }).map() 으로 개수를 명시한다.",
      "이 구조를 그대로 app/<route>/loading.tsx 초안으로 활용할 수 있다.",
    ],
  },
]
