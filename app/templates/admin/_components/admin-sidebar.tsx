"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GearSixIcon,
  ListIcon,
  SquaresFourIcon,
  TableIcon,
  TerminalWindowIcon,
} from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface AdminNavItem {
  href: string
  label: string
  icon: typeof SquaresFourIcon
}

const NAV_ITEMS: AdminNavItem[] = [
  { href: "/templates/admin", label: "대시보드", icon: SquaresFourIcon },
  { href: "/templates/admin/data", label: "데이터 관리", icon: TableIcon },
  { href: "/templates/admin/logs", label: "로그·관측성", icon: TerminalWindowIcon },
  { href: "/templates/admin/settings", label: "설정", icon: GearSixIcon },
]

function isActive(pathname: string, href: string): boolean {
  if (href === "/templates/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface AdminNavLinksProps {
  pathname: string
  onNavigate?: () => void
}

/** 데스크톱 사이드바·모바일 Sheet 드로어가 공유하는 네비게이션 본문. */
function AdminNavLinks({ pathname, onNavigate }: Readonly<AdminNavLinksProps>) {
  return (
    <>
      <div className="mb-4 px-2">
        <p className="text-sm font-semibold tracking-tight">Admin Console</p>
        <p className="text-xs text-muted-foreground">백오피스 · 관리자 도구</p>
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={18} weight={active ? "duotone" : "regular"} />
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

/**
 * Admin 템플릿 전용 사이드바(#28 반응형 하드닝) — components/patterns/app-shell-samples.tsx의
 * "사이드바형 셸" 규약(w-56, border-r, bg-card)을 md 이상에서 그대로 유지하고,
 * md 미만에서는 상단 바 + 햄버거 트리거로 여는 components/ui/sheet.tsx 기반
 * 드로어로 전환한다(app-shell-samples 노트: "lg 미만에서는 사이드바를
 * 숨김/토글로 전환"). 네비게이션 항목/활성 로직은 AdminNavLinks 로 공유해 두
 * 렌더 경로가 어긋나지 않게 한다. 프로필(slate/geist)이 강제 적용된 화면이라
 * 테마/폰트 스위처는 두지 않는다 — 라이트/다크 토글은 사이트 전역 설정을 따른다.
 */
export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2.5 md:hidden">
        <span />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-sm" aria-label="Admin 메뉴 열기">
              <ListIcon size={16} weight="bold" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 gap-1 px-3 py-4">
            <SheetHeader className="p-0">
              <SheetTitle className="sr-only">Admin 메뉴</SheetTitle>
            </SheetHeader>
            <nav aria-label="Admin 템플릿 내비게이션" className="flex flex-col gap-1">
              <AdminNavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <nav
        aria-label="Admin 템플릿 내비게이션"
        className="hidden h-full w-56 shrink-0 flex-col gap-1 border-r border-border bg-card px-3 py-4 md:flex"
      >
        <AdminNavLinks pathname={pathname} />
      </nav>
    </>
  )
}
