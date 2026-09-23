"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface FacetGroup {
  key: string
  label: string
  /**
   * 그룹 강조색. 시맨틱 토큰 CSS 변수 문자열만 넣는다(예: "var(--chart-1)") —
   * 인라인 style 로 테두리·칩 배경에 쓰이므로 Tailwind 클래스명을 넣으면 무시된다.
   */
  color?: string
}

export interface FacetedFilterProps {
  groups: FacetGroup[]
  /** 선택된 1단계 그룹 key. 빈 문자열이면 전체. */
  group: string
  onGroupChange: (key: string) => void
  /** 선택된 2단계 서브카테고리. 빈 문자열이면 전체. */
  sub: string
  onSubChange: (key: string) => void
  /** 현재 그룹의 서브카테고리 목록. 비어 있으면 2단계 줄을 그리지 않는다. */
  subCategories: string[]
  /** 전체 칩에 붙는 건수. */
  totalCount: number
  /** 칩별 건수 계산 — (group, sub?) 조합의 항목 수를 돌려준다. */
  countOf: (group: string, sub?: string) => number
  /** "전체" 칩 문구. */
  allLabel?: string
  className?: string
}

function CountBadge({ active, children }: Readonly<{ active: boolean; children: ReactNode }>) {
  return (
    <span className={cn("font-mono text-[10px]", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
      {children}
    </span>
  )
}

function FacetChip({
  active,
  color,
  onClick,
  children,
}: Readonly<{ active: boolean; color?: string; onClick: () => void; children: ReactNode }>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={active && color ? { backgroundColor: color } : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        active
          ? cn("border-transparent text-primary-foreground", color ? undefined : "bg-primary")
          : "border-border bg-card text-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  )
}

/**
 * 2단계(그룹 → 서브카테고리) 칩 필터 — 카운트 배지 + 그룹 컬러 강조.
 * 선택 상태는 컴포넌트가 들고 있지 않고 부모가 소유한다(URL 동기화·서버 재조회에 그대로 얹는다).
 * 1단계를 바꾸면 2단계 선택이 더 이상 유효하지 않으므로 호출부가 sub 를 함께 비운다.
 */
export function FacetedFilter({
  groups,
  group,
  onGroupChange,
  sub,
  onSubChange,
  subCategories,
  totalCount,
  countOf,
  allLabel = "전체",
  className,
}: Readonly<FacetedFilterProps>) {
  const activeGroup = groups.find((g) => g.key === group)

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <FacetChip active={group === ""} onClick={() => onGroupChange("")}>
          {allLabel}
          <CountBadge active={group === ""}>{totalCount}</CountBadge>
        </FacetChip>
        {groups.map((g) => (
          <FacetChip key={g.key} active={group === g.key} color={g.color} onClick={() => onGroupChange(g.key)}>
            {g.label}
            <CountBadge active={group === g.key}>{countOf(g.key)}</CountBadge>
          </FacetChip>
        ))}
      </div>

      {subCategories.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-1.5 overflow-x-auto border-l-2 border-border pb-1 pl-3"
          style={activeGroup?.color ? { borderColor: activeGroup.color } : undefined}
        >
          <FacetChip active={sub === ""} onClick={() => onSubChange("")}>
            {allLabel}
          </FacetChip>
          {subCategories.map((s) => (
            <FacetChip key={s} active={sub === s} onClick={() => onSubChange(s)}>
              {s}
              <CountBadge active={sub === s}>{countOf(group, s)}</CountBadge>
            </FacetChip>
          ))}
        </div>
      )}
    </div>
  )
}
