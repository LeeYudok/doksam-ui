"use client"

import type { FormEvent, ReactNode } from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export interface ListControlsTab {
  key: string
  label: string
}

interface ListControlsProps<T> {
  items: T[]
  getItemKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  tabs: ListControlsTab[]
  activeTab: string
  onTabChange: (key: string) => void
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchSubmit: (event: FormEvent) => void
  onSearchReset: () => void
  searchPlaceholder?: string
  emptyMessage?: string
  page: number
  pageCount: number
  onPrevPage: () => void
  onNextPage: () => void
  /** 페이지네이션 링크의 href — 없으면 "#"으로 렌더하고 클릭 핸들러만 동작한다. */
  buildPageHref?: (page: number) => string
  /** 현재 상태를 요약한 URL 등 — 표기용이며 없으면 생략한다. */
  footer?: ReactNode
}

/**
 * URL 기반 탭 + 검색 필터 + 페이지네이션 조합 — 데이터·정렬·필터링 로직은 소비 측이
 * 갖고, 이 컴포넌트는 이미 필터링·페이지 분할된 items 를 그대로 렌더한다.
 * 실서비스에서는 buildPageHref 가 만든 값이 <Link href> 가 되고, 서버 컴포넌트가
 * searchParams prop 으로 같은 값을 읽어 SSR 결과에 반영한다 — 클라이언트 상태가
 * 아니라 URL 이 단일 진실원천이다.
 */
export function ListControls<T>({
  items,
  getItemKey,
  renderItem,
  tabs,
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchReset,
  searchPlaceholder = "검색",
  emptyMessage = "조건에 맞는 항목이 없습니다.",
  page,
  pageCount,
  onPrevPage,
  onNextPage,
  buildPageHref,
  footer,
}: Readonly<ListControlsProps<T>>) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key || "all"}
            type="button"
            aria-pressed={activeTab === tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form role="search" onSubmit={onSearchSubmit} className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[160px] flex-1">
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button type="submit" size="sm">
          검색
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onSearchReset}>
          초기화
        </Button>
      </form>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {items.length === 0 ? (
          <li className="p-4 text-center text-xs text-muted-foreground">{emptyMessage}</li>
        ) : (
          items.map((item) => <li key={getItemKey(item)}>{renderItem(item)}</li>)
        )}
      </ul>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={buildPageHref?.(Math.max(0, page - 1)) ?? "#"}
              onClick={(e) => {
                e.preventDefault()
                onPrevPage()
              }}
              aria-disabled={page === 0}
              className={page === 0 ? "pointer-events-none opacity-40" : undefined}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 text-xs text-muted-foreground">
              {page + 1} / {pageCount}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={buildPageHref?.(Math.min(pageCount - 1, page + 1)) ?? "#"}
              onClick={(e) => {
                e.preventDefault()
                onNextPage()
              }}
              aria-disabled={page >= pageCount - 1}
              className={page >= pageCount - 1 ? "pointer-events-none opacity-40" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {footer}
    </div>
  )
}
