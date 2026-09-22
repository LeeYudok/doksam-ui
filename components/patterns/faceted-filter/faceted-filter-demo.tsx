"use client"

import { useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface FacetItem {
  id: string
  title: string
  group: string
  sub: string
}

interface FacetGroup {
  key: string
  label: string
  color: string
}

const GROUPS: FacetGroup[] = [
  { key: "design", label: "디자인", color: "bg-chart-1" },
  { key: "engineering", label: "엔지니어링", color: "bg-chart-2" },
  { key: "operations", label: "오퍼레이션", color: "bg-chart-3" },
]

const ITEMS: FacetItem[] = [
  { id: "1", title: "컬러 시스템 v2", group: "design", sub: "토큰" },
  { id: "2", title: "아이콘 가이드라인", group: "design", sub: "아이콘" },
  { id: "3", title: "컴포넌트 스펙 정리", group: "design", sub: "컴포넌트" },
  { id: "4", title: "API 게이트웨이 마이그레이션", group: "engineering", sub: "인프라" },
  { id: "5", title: "테스트 커버리지 개선", group: "engineering", sub: "QA" },
  { id: "6", title: "타입 안정성 강화", group: "engineering", sub: "QA" },
  { id: "7", title: "배포 파이프라인 개편", group: "engineering", sub: "인프라" },
  { id: "8", title: "온콜 로테이션 정책", group: "operations", sub: "운영정책" },
  { id: "9", title: "장애 보고서 템플릿", group: "operations", sub: "운영정책" },
  { id: "10", title: "비용 모니터링 대시보드", group: "operations", sub: "모니터링" },
]

function countBy(group: string, sub?: string): number {
  return ITEMS.filter((item) => item.group === group && (sub === undefined || item.sub === sub)).length
}

function subCatsOf(group: string): string[] {
  return Array.from(new Set(ITEMS.filter((item) => item.group === group).map((item) => item.sub)))
}

/** 2단계(그룹 → 서브카테고리) 칩 필터 + 카운트 배지 + 그룹 컬러 강조 데모. */
export function FacetedFilterDemo() {
  const [group, setGroup] = useState("")
  const [sub, setSub] = useState("")

  function selectGroup(next: string) {
    setGroup(next)
    setSub("") // depth0을 바꾸면 depth1 선택은 더 이상 유효하지 않으므로 초기화한다.
  }

  const filtered = ITEMS.filter((item) => {
    if (group && item.group !== group) return false
    if (sub && item.sub !== sub) return false
    return true
  })

  const activeGroup = GROUPS.find((g) => g.key === group)
  const subCats = group ? subCatsOf(group) : []

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <FacetChip active={group === ""} onClick={() => selectGroup("")}>
          전체
          <CountBadge active={group === ""}>{ITEMS.length}</CountBadge>
        </FacetChip>
        {GROUPS.map((g) => (
          <FacetChip key={g.key} active={group === g.key} color={g.color} onClick={() => selectGroup(g.key)}>
            {g.label}
            <CountBadge active={group === g.key}>{countBy(g.key)}</CountBadge>
          </FacetChip>
        ))}
      </div>

      {subCats.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-1.5 overflow-x-auto border-l-2 pb-1 pl-3"
          style={{ borderColor: activeGroup?.color }}
        >
          <FacetChip active={sub === ""} onClick={() => setSub("")}>
            전체
          </FacetChip>
          {subCats.map((s) => (
            <FacetChip key={s} active={sub === s} onClick={() => setSub(s)}>
              {s}
              <CountBadge active={sub === s}>{countBy(group, s)}</CountBadge>
            </FacetChip>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {filtered.map((item) => {
          const itemGroup = GROUPS.find((g) => g.key === item.group)
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-card py-2 pr-3 pl-2.5"
              style={{ borderLeft: `3px solid ${itemGroup?.color ?? "var(--border)"}` }}
            >
              <span className="text-xs font-medium text-foreground">{item.title}</span>
              <span className="text-[10px] text-muted-foreground">
                {itemGroup?.label} · {item.sub}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
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
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        active
          ? cn("border-transparent text-primary-foreground", color ?? "bg-primary")
          : "border-border bg-card text-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  )
}

function CountBadge({ active, children }: Readonly<{ active: boolean; children: ReactNode }>) {
  return (
    <span className={cn("font-mono text-[10px]", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
      {children}
    </span>
  )
}
