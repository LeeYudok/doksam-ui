"use client"

import type { ReactNode } from "react"
import {
  BookOpenIcon,
  GridFourIcon,
  ListIcon,
  RocketLaunchIcon,
  TableIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface ContentItem {
  id: string
  title: string
  category: string
  author: string
  updatedAt: string
  summary: string
}

export type ContentViewMode = "grid" | "list" | "table"

const VIEW_OPTIONS: { value: ContentViewMode; label: string }[] = [
  { value: "grid", label: "그리드" },
  { value: "list", label: "리스트" },
  { value: "table", label: "테이블" },
]

export function ContentViewToggle({
  view,
  onChange,
  options = VIEW_OPTIONS,
}: Readonly<{ view: ContentViewMode; onChange: (view: ContentViewMode) => void; options?: { value: ContentViewMode; label: string }[] }>) {
  return (
    <div
      role="group"
      aria-label="보기 방식"
      className="inline-flex w-fit overflow-hidden rounded-lg border border-border bg-background"
    >
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          type="button"
          aria-label={opt.label}
          aria-pressed={view === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex h-8 items-center gap-1.5 px-3 text-xs font-medium transition-colors",
            idx > 0 && "border-l border-border",
            view === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <ViewIcon mode={opt.value} />
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function ViewIcon({ mode }: Readonly<{ mode: ContentViewMode }>) {
  if (mode === "grid") return <GridFourIcon size={14} weight="regular" />
  if (mode === "list") return <ListIcon size={14} weight="regular" />
  return <TableIcon size={14} weight="regular" />
}

/**
 * data-view가 grid든 list든 동일한 마크업을 렌더한다 — 부모 <ul data-view>가 stamp한 값을
 * group-data-[view=list]/feed: 로 읽어 레이아웃만 바꾸는 것이 이 패턴의 핵심 기법이다.
 */
export function ContentCard({ item }: Readonly<{ item: ContentItem }>) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 group-data-[view=list]/feed:flex-row group-data-[view=list]/feed:items-center group-data-[view=list]/feed:gap-4 group-data-[view=list]/feed:p-3">
      <div className="min-w-0 flex-1">
        <Badge variant="secondary" className="text-[10px]">
          {item.category}
        </Badge>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-foreground group-data-[view=list]/feed:line-clamp-1">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground group-data-[view=list]/feed:hidden">
          {item.summary}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[11px] whitespace-nowrap text-muted-foreground group-data-[view=list]/feed:flex-col group-data-[view=list]/feed:items-end">
        <span>{item.author}</span>
        <span>{item.updatedAt}</span>
      </div>
    </div>
  )
}

/**
 * 카테고리 → 썸네일 플레이스홀더 톤/아이콘. 폐쇄망 원칙상 외부 이미지 대신
 * chart 토큰 그라디언트 + 카테고리 아이콘으로 썸네일을 합성한다(리터럴 클래스만 사용).
 */
const THUMB_STYLES: Record<string, { gradient: string; icon: ReactNode }> = {
  가이드: { gradient: "from-chart-1/40 to-chart-1/10", icon: <BookOpenIcon className="size-6 text-chart-1" aria-hidden /> },
  릴리스: { gradient: "from-chart-2/40 to-chart-2/10", icon: <RocketLaunchIcon className="size-6 text-chart-2" aria-hidden /> },
  운영: { gradient: "from-chart-4/40 to-chart-4/10", icon: <WrenchIcon className="size-6 text-chart-4" aria-hidden /> },
}

/**
 * 썸네일 있는 콘텐츠 카드 — 그리드에선 상단 16:9 썸네일, 리스트에선 좌측 정사각
 * 썸네일로 group-data variant 만으로 전환된다(ContentCard 와 동일 기법).
 */
export function ContentThumbCard({ item }: Readonly<{ item: ContentItem }>) {
  const thumb = THUMB_STYLES[item.category] ?? THUMB_STYLES["가이드"]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40 group-data-[view=list]/feed:flex-row group-data-[view=list]/feed:items-stretch">
      <div
        className={cn(
          "flex aspect-video shrink-0 items-center justify-center bg-gradient-to-br",
          "group-data-[view=list]/feed:aspect-square group-data-[view=list]/feed:w-24",
          thumb.gradient,
        )}
        role="img"
        aria-label={`${item.category} 썸네일`}
      >
        {thumb.icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 group-data-[view=list]/feed:justify-center group-data-[view=list]/feed:p-3">
        <Badge variant="secondary" className="w-fit text-[10px]">
          {item.category}
        </Badge>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-data-[view=list]/feed:line-clamp-1">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground group-data-[view=list]/feed:line-clamp-1">{item.summary}</p>
        <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
          <span>{item.author}</span>
          <span>·</span>
          <span>{item.updatedAt}</span>
        </div>
      </div>
    </div>
  )
}

export function ContentTable({ items }: Readonly<{ items: ContentItem[] }>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead className="hidden w-24 sm:table-cell">카테고리</TableHead>
          <TableHead className="hidden w-24 sm:table-cell">작성자</TableHead>
          <TableHead className="w-28 text-right">갱신일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium text-foreground">{item.title}</TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">{item.category}</TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">{item.author}</TableCell>
            <TableCell className="text-right text-muted-foreground">{item.updatedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
