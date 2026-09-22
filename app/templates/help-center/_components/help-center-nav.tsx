"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenIcon, ChatCircleIcon, ClockCounterClockwiseIcon, QuestionIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

const TABS = [
  { href: "/templates/help-center", label: "물어보기", icon: ChatCircleIcon },
  { href: "/templates/help-center/manual", label: "매뉴얼 색인", icon: BookOpenIcon },
  { href: "/templates/help-center/faq", label: "FAQ", icon: QuestionIcon },
  { href: "/templates/help-center/history", label: "질문 이력", icon: ClockCounterClockwiseIcon },
] as const

/**
 * 도움말 센터 4탭 내비게이션(#100) — 라우트 전환이라 딥링크가 가능하다.
 * Radix Tabs(클라이언트 상태) 대신 app/templates/saas/_components/template-nav.tsx 와
 * 같은 Link 탭 패턴을 쓴다 — 이슈 설계("탭 전환이 라우트가 되도록")가 요구하는 지점.
 */
export function HelpCenterNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="도움말 센터 탭"
      className="flex w-fit items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={16} weight={active ? "duotone" : "regular"} aria-hidden />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
