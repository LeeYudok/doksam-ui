"use client"

import { useMemo, useState } from "react"
import {
  ArrowBendUpLeftIcon,
  ArchiveIcon,
  CaretLeftIcon,
  MagnifyingGlassIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { FOLDERS, FOLDER_FILTERS, THREADS, type MailMessage } from "../_data/threads"

function matches(message: MailMessage, query: string): boolean {
  if (!query.trim()) return true
  const needle = query.trim().toLowerCase()
  return [message.sender, message.subject, message.preview].some((field) => field.toLowerCase().includes(needle))
}

/**
 * split-pane 원형의 본체 — 좌측 목록 선택이 페이지 이동 없이 우측 상세만 바꾼다.
 * lg 미만에서는 두 패인을 나란히 두지 않고, 목록 → 상세 단일 패인 흐름으로 접는다.
 */
export function MailSplitPane() {
  const [folder, setFolder] = useState(FOLDERS[0].id)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(THREADS[0].id)
  const [readIds, setReadIds] = useState<string[]>([])
  const [mobileDetail, setMobileDetail] = useState(false)

  const visible = useMemo(() => {
    const inFolder = FOLDER_FILTERS[folder] ?? (() => true)
    return THREADS.filter((m) => inFolder(m) && matches(m, query))
  }, [folder, query])

  const selected = visible.find((m) => m.id === selectedId) ?? visible[0]

  function openMessage(id: string) {
    setSelectedId(id)
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setMobileDetail(true)
  }

  return (
    <div className="flex min-h-[520px] w-full overflow-hidden rounded-lg border border-border">
      {/* 폴더 레일 — 목적지가 아니라 목록의 좁힘 조건이다. */}
      <nav
        aria-label="메일 폴더"
        className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border bg-card px-2 py-3 md:flex"
      >
        {FOLDERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={folder === item.id ? "true" : undefined}
            onClick={() => setFolder(item.id)}
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors",
              folder === item.id
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
            {item.count > 0 ? <span className="text-xs text-muted-foreground">{item.count}</span> : null}
          </button>
        ))}
      </nav>

      {/* 목록 패인 */}
      <section
        aria-label="메일 목록"
        className={cn(
          "w-full shrink-0 flex-col border-r border-border lg:flex lg:w-80",
          mobileDetail ? "hidden lg:flex" : "flex",
        )}
      >
        <div className="border-b border-border px-3 py-2.5">
          <div className="relative">
            <MagnifyingGlassIcon
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="메일 검색"
              aria-label="메일 검색"
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              {query.trim() ? "검색 결과가 없습니다." : "이 폴더에 메일이 없습니다."}
            </li>
          ) : (
            visible.map((message) => {
              const unread = message.unread && !readIds.includes(message.id)
              const active = selected?.id === message.id
              return (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => openMessage(message.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full flex-col gap-1 border-b border-border/60 px-3 py-2.5 text-left transition-colors",
                      active ? "bg-accent" : "hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {unread ? <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden /> : null}
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm",
                          unread ? "font-semibold text-foreground" : "text-foreground",
                        )}
                      >
                        {message.sender}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{message.receivedAt}</span>
                    </span>
                    <span className="truncate text-sm text-foreground">{message.subject}</span>
                    <span className="truncate text-xs text-muted-foreground">{message.preview}</span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </section>

      {/* 상세 패인 — min-w-0 이 없으면 긴 본문이 목록 폭을 밀어 가로 스크롤이 생긴다. */}
      <section
        aria-label="메일 상세"
        className={cn("min-w-0 flex-1 flex-col lg:flex", mobileDetail ? "flex" : "hidden lg:flex")}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileDetail(false)}
              >
                <CaretLeftIcon size={15} aria-hidden />
                목록
              </Button>
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="답장">
                  <ArrowBendUpLeftIcon size={16} aria-hidden />
                </Button>
                <Button variant="ghost" size="icon" aria-label="중요 표시">
                  <StarIcon size={16} weight={selected.flagged ? "fill" : "regular"} aria-hidden />
                </Button>
                <Button variant="ghost" size="icon" aria-label="보관">
                  <ArchiveIcon size={16} aria-hidden />
                </Button>
                <Button variant="ghost" size="icon" aria-label="삭제">
                  <TrashIcon size={16} aria-hidden />
                </Button>
              </div>
            </div>

            <article className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
              <header className="flex flex-col gap-3">
                <h2 className="text-base font-semibold tracking-tight">{selected.subject}</h2>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px]">{selected.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{selected.sender}</p>
                    <p className="text-xs text-muted-foreground">{selected.receivedAt} 수신</p>
                  </div>
                  <div className="ml-auto flex flex-wrap justify-end gap-1">
                    {selected.labels.map((label) => (
                      <Badge key={label} variant="outline" className="text-[11px]">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </header>

              <Separator />

              <div className="flex max-w-prose flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                {selected.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </article>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 py-10 text-sm text-muted-foreground">
            표시할 메일이 없습니다.
          </div>
        )}
      </section>
    </div>
  )
}
