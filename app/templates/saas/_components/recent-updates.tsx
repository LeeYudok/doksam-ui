"use client"

import { useState } from "react"

import {
  ContentCard,
  ContentTable,
  ContentViewToggle,
  type ContentViewMode,
} from "@/components/patterns/content-feed/content-feed"
import { FEED_POSTS } from "@/app/templates/saas/_lib/data"

/**
 * 대시보드 "최근 업데이트" 영역 — 실물 content-feed 프리미티브에 이 템플릿의
 * 데이터(`_lib/data.ts` 의 FEED_POSTS)를 물린다.
 *
 * 카탈로그 데모(`content-feed-demo.tsx`)를 그대로 쓰지 않는 이유는 #58 이다.
 * 데모는 카탈로그 전용 표본 데이터를 품고 있어서, 템플릿이 그것을 쓰면 설치본에
 * 쓰지도 않을 데모 데이터가 함께 실려 나간다.
 */
export function RecentUpdates() {
  const [view, setView] = useState<ContentViewMode>("grid")
  const items = FEED_POSTS.slice(0, 6)

  return (
    <div className="flex w-full flex-col gap-3">
      <ContentViewToggle view={view} onChange={setView} />

      {view === "table" ? (
        <ContentTable items={items} />
      ) : (
        <ul data-view={view} className="group/feed grid grid-cols-1 gap-3 data-[view=grid]:sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
