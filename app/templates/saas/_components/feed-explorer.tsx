"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { ContentCard, ContentViewToggle, type ContentViewMode } from "@/components/patterns/content-feed/content-feed"
import { FEED_POSTS, FEED_WORKSPACES } from "@/app/templates/saas/_lib/data"

/**
 * 피드 페이지 전용 조합 — faceted 필터(워크스페이스 → 카테고리 2단계) +
 * content-feed 뷰토글을 함께 쓴다.
 *
 * components/patterns/faceted-filter/faceted-filter-demo.tsx 의 2단계 칩 필터
 * 아이디어를 가져오되, 그쪽이 쓰는 인라인 hex color(style={{backgroundColor}})는
 * 하드코딩 색상 금지 규칙 위반이라 배제하고 bg-primary/bg-accent/bg-secondary
 * 시맨틱 토큰(FEED_WORKSPACES[].toneClass)만 사용한다.
 */
export function FeedExplorer() {
  const [workspace, setWorkspace] = useState("")
  const [category, setCategory] = useState("")
  const [view, setView] = useState<ContentViewMode>("grid")

  function selectWorkspace(next: string) {
    setWorkspace(next)
    setCategory("") // 상위 축을 바꾸면 하위 카테고리 선택은 더 이상 유효하지 않을 수 있다.
  }

  const categories = useMemo(() => {
    if (!workspace) return []
    return Array.from(new Set(FEED_POSTS.filter((p) => p.workspace === workspace).map((p) => p.category)))
  }, [workspace])

  const filtered = useMemo(() => {
    return FEED_POSTS.filter((post) => {
      if (workspace && post.workspace !== workspace) return false
      if (category && post.category !== category) return false
      return true
    })
  }, [workspace, category])

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <FacetChip active={workspace === ""} onClick={() => selectWorkspace("")}>
          전체
          <CountBadge active={workspace === ""}>{FEED_POSTS.length}</CountBadge>
        </FacetChip>
        {FEED_WORKSPACES.map((ws) => (
          <FacetChip
            key={ws.key}
            active={workspace === ws.key}
            toneClass={ws.toneClass}
            onClick={() => selectWorkspace(ws.key)}
          >
            {ws.label}
            <CountBadge active={workspace === ws.key}>
              {FEED_POSTS.filter((p) => p.workspace === ws.key).length}
            </CountBadge>
          </FacetChip>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-l-2 border-primary/40 pl-3">
          <FacetChip active={category === ""} onClick={() => setCategory("")}>
            전체
          </FacetChip>
          {categories.map((cat) => (
            <FacetChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              {cat}
            </FacetChip>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{filtered.length}건</p>
        <ContentViewToggle view={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          조건에 맞는 게시물이 없습니다.
        </p>
      ) : (
        <ul data-view={view} className="group/feed grid grid-cols-1 gap-3 data-[view=grid]:sm:grid-cols-2">
          {filtered.map((post) => (
            <li key={post.id}>
              <ContentCard item={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FacetChip({
  active,
  toneClass,
  onClick,
  children,
}: Readonly<{
  active: boolean
  toneClass?: string
  onClick: () => void
  children: React.ReactNode
}>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? cn("border-transparent", toneClass ?? "bg-primary text-primary-foreground")
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}

function CountBadge({ active, children }: Readonly<{ active: boolean; children: React.ReactNode }>) {
  return (
    <span className={cn("font-mono text-[10px]", active ? "opacity-80" : "text-muted-foreground")}>{children}</span>
  )
}
