import type { Icon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

/** 노드 색 단계 — 시맨틱 토큰 4종에만 대응한다. */
export type ActivityStatus = "success" | "warning" | "destructive" | "muted"

export interface ActivityItem {
  time: string
  status: ActivityStatus
  icon: Icon
  title: string
  description: string
}

export interface ActivityGroup {
  /** 날짜 그룹 헤더 문구. */
  date: string
  items: ActivityItem[]
}

export interface ActivityTimelineProps {
  groups: ActivityGroup[]
  className?: string
}

const NODE_CLASS: Record<ActivityStatus, string> = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
}

function ActivityNode({ item }: Readonly<{ item: ActivityItem }>) {
  const NodeIcon = item.icon
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      <span aria-hidden className="absolute top-6 bottom-0 left-[15px] w-px bg-border last:hidden" />
      <span
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
          NODE_CLASS[item.status]
        )}
      >
        <NodeIcon size={16} weight="fill" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium">{item.title}</p>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
    </li>
  )
}

/**
 * 세로 활동 타임라인 — 아이콘 노드 + 시각 + 제목/설명, 날짜별 그룹 구분.
 * 상태 4종(success/warning/destructive/muted)의 노드 테두리·배경·아이콘 색은
 * 같은 시맨틱 토큰으로 묶어 라이트/다크 양쪽에서 같은 위계를 유지한다.
 */
export function ActivityTimeline({ groups, className }: Readonly<ActivityTimelineProps>) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {groups.map((group) => (
        <section key={group.date} className="flex flex-col gap-3">
          <h3 className="sticky top-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.date}
          </h3>
          <ol className="flex flex-col">
            {group.items.map((item) => (
              <ActivityNode key={`${group.date}-${item.time}-${item.title}`} item={item} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
