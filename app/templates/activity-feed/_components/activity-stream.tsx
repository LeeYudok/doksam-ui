"use client"

import { useMemo, useState } from "react"
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { EVENTS, FILTERS, KIND_LABEL, KIND_VARIANT, SUMMARY, type FeedEvent } from "../_data/events"

/** 화면에 처음 보여줄 개수 — 피드는 끝이 정해지지 않은 스트림이므로 더 보기로 이어 붙인다. */
const PAGE_SIZE = 5

function groupByBucket(events: FeedEvent[]): [string, FeedEvent[]][] {
  const buckets = new Map<string, FeedEvent[]>()
  for (const event of events) {
    const list = buckets.get(event.bucket)
    if (list) list.push(event)
    else buckets.set(event.bucket, [event])
  }
  return [...buckets.entries()]
}

/**
 * feed-timeline 원형의 본체 — 시간 역순 단일 세로 스트림이 화면의 주인공이고,
 * 필터 바는 목적지가 아니라 스트림을 좁히는 조건이다.
 */
export function ActivityStream() {
  const [filter, setFilter] = useState<string>("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(
    () => (filter === "all" ? EVENTS : EVENTS.filter((event) => event.kind === filter)),
    [filter],
  )
  const visible = filtered.slice(0, visibleCount)
  const groups = groupByBucket(visible)
  const hasMore = visibleCount < filtered.length

  function changeFilter(next: string) {
    setFilter(next)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <dl className="grid grid-cols-3 gap-2">
        {SUMMARY.map((item) => (
          <div key={item.id} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2">
            <dt className="order-2 text-[11px] text-muted-foreground">{item.label}</dt>
            <dd className="order-1 text-base font-semibold tracking-tight">{item.value}</dd>
          </div>
        ))}
      </dl>

      {/* 얇은 필터 바 — sticky 로 남기되 다른 화면으로 나가는 링크를 섞지 않는다. */}
      <div className="sticky top-0 z-10 flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-background/85 px-2 py-1.5 backdrop-blur">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => changeFilter(item.id)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-xs transition-colors",
              filter === item.id
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          이 조건에 맞는 활동이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(([bucket, items]) => (
            <section key={bucket} className="flex flex-col gap-2">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{bucket}</h3>
              {/* 순서가 의미를 갖는 목록이므로 ol/li 로 마크업한다. */}
              <ol className="flex flex-col gap-2">
                {items.map((event) => (
                  <li key={event.id} className="flex gap-3 rounded-lg border border-border px-3 py-2.5">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="text-[11px]">{event.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={KIND_VARIANT[event.kind]} className="text-[10px]">
                          {KIND_LABEL[event.kind]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{event.actor}</span>
                        <span className="ml-auto text-[11px] text-muted-foreground">{event.at}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {hasMore ? (
        <Button variant="outline" className="w-full" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
          <ArrowClockwiseIcon size={15} aria-hidden />
          이전 활동 더 보기
        </Button>
      ) : null}
    </div>
  )
}
