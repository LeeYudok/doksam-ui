"use client"

import { useState } from "react"

import {
  ContentCard,
  ContentTable,
  ContentThumbCard,
  ContentViewToggle,
  type ContentViewMode,
} from "@/components/patterns/content-feed/content-feed"
import { CONTENT_ITEMS } from "@/components/patterns/content-feed/content-feed-data"

/** 그리드/리스트/테이블 3종 뷰토글 + group-data variant 전환 기법을 보여주는 종합 데모. */
export function ContentFeedDemo() {
  const [view, setView] = useState<ContentViewMode>("grid")

  return (
    <div className="flex w-full flex-col gap-3">
      <ContentViewToggle view={view} onChange={setView} />

      {view === "table" ? (
        <ContentTable items={CONTENT_ITEMS} />
      ) : (
        <ul data-view={view} className="group/feed grid grid-cols-1 gap-3 data-[view=grid]:sm:grid-cols-2">
          {CONTENT_ITEMS.map((item) => (
            <li key={item.id}>
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const THUMB_VIEW_OPTIONS: { value: ContentViewMode; label: string }[] = [
  { value: "grid", label: "그리드" },
  { value: "list", label: "리스트" },
]

/** 그리드/리스트 뷰토글 + 썸네일 카드 변형 데모 — 테이블 뷰는 썸네일과 무관해 제외. */
export function ContentThumbFeedDemo() {
  const [view, setView] = useState<ContentViewMode>("grid")

  return (
    <div className="flex w-full flex-col gap-3">
      <ContentViewToggle view={view} onChange={setView} options={THUMB_VIEW_OPTIONS} />

      <ul data-view={view} className="group/feed grid grid-cols-1 gap-3 data-[view=grid]:sm:grid-cols-2 data-[view=grid]:lg:grid-cols-3">
        {CONTENT_ITEMS.map((item) => (
          <li key={item.id}>
            <ContentThumbCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}
