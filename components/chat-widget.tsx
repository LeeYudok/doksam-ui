"use client"

import * as React from "react"
import { ChatCircleIcon, PaperPlaneRightIcon, XIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** 위젯 메시지 — chat(말풍선)/whisper(귓속말)/system(중앙 안내) 3종. */
export interface ChatWidgetMessage {
  type: "chat" | "whisper" | "system"
  /** 보낸 사람 식별자(system 제외). */
  from?: string
  /** 보낸 사람 표시 이름. */
  name?: string
  /** 귓속말 수신자 표시 이름. */
  toName?: string
  content: string
  /** 표시용 시각 문자열(예: "14:21"). */
  time: string
}

export interface ChatWidgetProps {
  /** 표시할 메시지 목록 — 실시간 연동(WebSocket 등)은 호출부가 소유한다. */
  messages: ChatWidgetMessage[]
  /** 연결 상태 — 헤더 점 색과 전송 버튼 활성화를 결정. */
  connected?: boolean
  /** 닫힘 상태에서 런처 버튼에 표시할 미읽음 수. */
  unread?: number
  /** 현재 사용자 식별자 — 내 메시지 우측 정렬 판단. */
  currentUsername: string
  onSend?: (content: string) => void
  /** 열림 시 호출(미읽음 리셋 등). */
  onOpen?: () => void
  title?: string
  /** 루트 위치 클래스 — 기본 fixed 우하단. 데모 등에서 absolute 로 덮어쓴다. */
  className?: string
}

/**
 * 플로팅 채팅 위젯 — 우하단 런처 버튼 + 미읽음 배지 + 말풍선 패널.
 * srope customs/chat-widget 이식 — WebSocket 훅을 걷어내고 messages/onSend
 * 프레젠테이션 API 로 단순화, yellow/green 하드코딩을 warning/success 토큰으로 치환.
 * 풀페이지 대화 화면은 templates/chat 을 쓰고, 이건 화면 구석 상주형이다.
 */
export function ChatWidget({
  messages,
  connected = true,
  unread = 0,
  currentUsername,
  onSend,
  onOpen,
  title = "채팅",
  className,
}: ChatWidgetProps) {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const handleSend = () => {
    const content = input.trim()
    if (!content) return
    onSend?.(content)
    setInput("")
  }

  return (
    <div className={cn("fixed right-6 bottom-6 z-50", className)}>
      {open ? (
        <div className="absolute right-0 bottom-16 flex h-[420px] w-80 flex-col overflow-hidden rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", connected ? "bg-success" : "bg-muted-foreground")} aria-hidden />
              <span className="text-sm font-medium">{title}</span>
            </div>
            <Button size="icon-sm" variant="ghost" onClick={() => setOpen(false)} aria-label="채팅 닫기">
              <XIcon aria-hidden />
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {messages.length === 0 ? (
              <p className="mt-4 text-center text-xs text-muted-foreground">아직 메시지가 없습니다</p>
            ) : null}
            {messages.map((msg, i) => (
              <MessageItem key={i} msg={msg} currentUsername={currentUsername} />
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex gap-1 border-t p-2">
            <Input
              placeholder="메시지 입력…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              className="flex-1"
              aria-label="메시지 입력"
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || !connected} aria-label="전송">
              <PaperPlaneRightIcon aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}

      <Button
        size="icon"
        className="relative size-12! rounded-full shadow-md"
        onClick={() => {
          setOpen((v) => {
            if (!v) onOpen?.()
            return !v
          })
        }}
        aria-label={open ? "채팅 접기" : "채팅 열기"}
      >
        <ChatCircleIcon className="size-5" aria-hidden />
        {!open && unread > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Button>
    </div>
  )
}

function MessageItem({ msg, currentUsername }: Readonly<{ msg: ChatWidgetMessage; currentUsername: string }>) {
  if (msg.type === "system") {
    return (
      <p className="py-0.5 text-center text-xs text-muted-foreground">
        {msg.content} · {msg.time}
      </p>
    )
  }

  const isOwn = msg.from === currentUsername

  if (msg.type === "whisper") {
    return (
      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        <p className="mx-1 mb-0.5 text-xs text-warning">{isOwn ? `귓속말 → ${msg.toName}` : `귓속말 ← ${msg.name}`}</p>
        <div className={cn("flex items-end gap-1", isOwn ? "flex-row-reverse" : "flex-row")}>
          <div className="max-w-[80%] rounded-lg border border-dashed border-warning/60 bg-warning/10 px-2 py-1 text-sm">
            {msg.content}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{msg.time}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
      {!isOwn ? <p className="mb-0.5 ml-1 text-xs text-muted-foreground">{msg.name}</p> : null}
      <div className={cn("flex items-end gap-1", isOwn ? "flex-row-reverse" : "flex-row")}>
        <div className={cn("max-w-[80%] rounded-lg px-2 py-1 text-sm", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}>
          {msg.content}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{msg.time}</span>
      </div>
    </div>
  )
}
