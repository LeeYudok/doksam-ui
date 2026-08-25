"use client"

import { useState } from "react"
import { ListIcon, StackSimpleIcon, XIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { NAV_LINKS, PRODUCT_NAME } from "../_data/site"

/**
 * top-nav-site 원형의 주 내비게이션 — 상단 가로 메뉴 하나가 전 목적지를 나열하고,
 * md 미만에서는 햄버거로 접힌다. 사이드바를 두지 않는 것이 이 원형의 핵심이다.
 */
export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <StackSimpleIcon size={14} weight="fill" aria-hidden />
          </span>
          {PRODUCT_NAME}
        </span>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="메인 메뉴">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            로그인
          </Button>
          <Button size="sm">무료로 시작</Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <XIcon size={18} aria-hidden /> : <ListIcon size={18} aria-hidden />}
          </Button>
        </div>
      </div>

      <nav
        id="marketing-mobile-nav"
        aria-label="메인 메뉴 (모바일)"
        className={cn("border-t border-border px-4 py-2 md:hidden", open ? "block" : "hidden")}
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
