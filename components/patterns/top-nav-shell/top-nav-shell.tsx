"use client"

import * as React from "react"
import { CaretDownIcon, ListIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/**
 * 글로벌 탑내비 셸 — 1단 글로벌 nav + 2단 서브탭바(현재 화면명 · 서브탭 · ask 바).
 *
 * 사내 업무 시스템에서 흔한 뼈대다: 목적지가 많고(8~12개) 화면마다 하위 탭이 붙으며,
 * 막힌 사용자가 메뉴를 뒤지는 대신 바로 질문으로 진입하는 ask 바가 상시로 떠 있다.
 * sidebar 프리미티브를 쓰지 않는다 — 사이드바형 셸과 별개 축이다.
 *
 * 오버플로 표준(#86):
 *   lg 이상 — 앞에서 `maxVisibleItems` 개만 가로로 펼치고 나머지는 "더보기" 드롭다운으로 접는다.
 *   lg 미만 — 글로벌 nav 전체를 Sheet 로 접고 헤더에는 햄버거만 남긴다.
 *   서브탭은 접지 않고 가로 스크롤(overflow-x-auto)로 둔다 — 화면 안 이동이라 목록이 짧다.
 */

/** 1단 글로벌 nav 의 목적지 하나. href 를 주면 링크, 없으면 onSelect 를 호출하는 버튼이 된다. */
export interface TopNavItem {
  /** 활성 판정·React key 로 쓰는 안정 식별자 (한글 라벨을 키로 쓰지 않는다). */
  key: string
  label: string
  icon?: Icon
  href?: string
  onSelect?: () => void
}

/** 2단 서브탭바의 하위 탭 하나. */
export interface TopNavSubTab {
  key: string
  label: string
  href?: string
  onSelect?: () => void
}

export interface TopNavShellProps {
  /** 좌측 브랜드 영역 — 로고 + 서비스명. */
  brand: React.ReactNode
  /** 글로벌 메뉴. 9개 이상이어도 좋다 — 넘치는 만큼 드롭다운으로 접힌다. */
  items: readonly TopNavItem[]
  /** 활성 메뉴의 `key`. */
  activeItem?: string
  /** 헤더 우측 도구 슬롯 — 알림·프로필 등. */
  tools?: React.ReactNode
  /** 2단 좌측의 현재 화면명. 없으면 서브탭바 좌측이 비어 있다. */
  screenTitle?: React.ReactNode
  /** 2단 가운데 하위 탭. 비우면 서브탭 영역이 렌더되지 않는다. */
  subTabs?: readonly TopNavSubTab[]
  /** 활성 서브탭의 `key`. */
  activeSubTab?: string
  /**
   * 2단 우측 ask 슬롯(#98) — 링크·버튼·다이얼로그 트리거 무엇이든 넣을 수 있다.
   * 기본 생김새가 필요하면 `TopNavAskBar` 를 그대로 넣는다.
   */
  ask?: React.ReactNode
  /** lg 이상에서 가로로 펼칠 메뉴 최대 개수. 그 뒤는 "더보기" 로 접힌다. */
  maxVisibleItems?: number
  /** 접힌 메뉴를 여는 드롭다운 트리거 라벨. */
  overflowLabel?: string
  /** 셸 루트에 덧붙일 클래스. */
  className?: string
  children: React.ReactNode
}

const DEFAULT_MAX_VISIBLE_ITEMS = 6

function itemClass(active: boolean): string {
  return cn(
    "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
    active
      ? "bg-accent font-medium text-accent-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  )
}

/** href 유무로 링크/버튼을 고르는 공용 렌더러 — 목적지는 링크, 그 외는 버튼이 접근성 기본값이다. */
function NavAction({
  href,
  onSelect,
  active,
  className,
  children,
}: Readonly<{
  href?: string
  onSelect?: () => void
  active: boolean
  className: string
  children: React.ReactNode
}>) {
  if (href) {
    return (
      <a href={href} aria-current={active ? "page" : undefined} className={className}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={onSelect} aria-current={active ? "page" : undefined} className={className}>
      {children}
    </button>
  )
}

export interface TopNavAskBarProps {
  /** 넓은 폭에서 보이는 안내 문구. 좁은 폭에서는 감추고 아이콘만 남긴다. */
  label?: string
  /** 눌렀을 때의 동작 — 도움말 화면 이동. onSelect 와 함께 쓰지 않는다. */
  href?: string
  onSelect?: () => void
  /** `/` 를 누르면 이 바로 포커스가 이동한다. 끄려면 false. */
  shortcut?: boolean
  /** 스크린리더용 이름 — label 을 감춘 좁은 폭에서도 이름이 남아야 한다. */
  ariaLabel?: string
  className?: string
}

/**
 * ask 바 기본 생김새(#98) — 입력처럼 보이지만 실제로는 링크/버튼이다.
 * 진짜 입력이 아니어도 되는 이유: 누르면 도움말 화면·다이얼로그·챗 위젯으로 넘기는
 * 진입점이지 여기서 질의를 확정하지 않는다.
 */
export function TopNavAskBar({
  label = "메뉴·기능 사용법을 물어보세요",
  href,
  onSelect,
  shortcut = true,
  ariaLabel,
  className,
}: Readonly<TopNavAskBarProps>) {
  const ref = React.useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (!shortcut) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return
      event.preventDefault()
      ref.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [shortcut])

  const content = (
    <>
      <MagnifyingGlassIcon size={15} weight="regular" className="shrink-0 text-muted-foreground" />
      <span className="hidden min-w-0 truncate md:inline">{label}</span>
      {shortcut ? <Kbd className="ml-auto hidden md:inline-flex">/</Kbd> : null}
    </>
  )
  const cls = cn(
    "flex h-8 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none md:w-64 lg:w-72",
    className,
  )
  const name = ariaLabel ?? label

  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} aria-label={name} className={cls}>
        {content}
      </a>
    )
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onSelect}
      aria-label={name}
      className={cls}
    >
      {content}
    </button>
  )
}

export function TopNavShell({
  brand,
  items,
  activeItem,
  tools,
  screenTitle,
  subTabs,
  activeSubTab,
  ask,
  maxVisibleItems = DEFAULT_MAX_VISIBLE_ITEMS,
  overflowLabel = "더보기",
  className,
  children,
}: Readonly<TopNavShellProps>) {
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const visible = items.slice(0, maxVisibleItems)
  const overflow = items.slice(maxVisibleItems)
  const hasSubBar = Boolean(screenTitle) || (subTabs?.length ?? 0) > 0 || Boolean(ask)

  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-card">
        {/* 1단 — 브랜드 · 글로벌 메뉴 · 도구 */}
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="flex shrink-0 items-center gap-2">{brand}</div>

          <nav className="ml-4 hidden min-w-0 items-center gap-0.5 lg:flex" aria-label="글로벌 내비게이션">
            {visible.map((item) => {
              const ItemIcon = item.icon
              const active = item.key === activeItem
              return (
                <NavAction
                  key={item.key}
                  href={item.href}
                  onSelect={item.onSelect}
                  active={active}
                  className={itemClass(active)}
                >
                  {ItemIcon ? <ItemIcon size={16} weight={active ? "duotone" : "regular"} /> : null}
                  {item.label}
                </NavAction>
              )
            })}

            {overflow.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={itemClass(overflow.some((item) => item.key === activeItem))}
                  aria-label="나머지 메뉴"
                >
                  {overflowLabel}
                  <CaretDownIcon size={12} weight="bold" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  {overflow.map((item) => {
                    const ItemIcon = item.icon
                    const active = item.key === activeItem
                    return (
                      <DropdownMenuItem key={item.key} asChild={Boolean(item.href)} onSelect={item.onSelect}>
                        {item.href ? (
                          <a href={item.href} aria-current={active ? "page" : undefined}>
                            {ItemIcon ? <ItemIcon size={16} weight={active ? "duotone" : "regular"} /> : null}
                            {item.label}
                          </a>
                        ) : (
                          <>
                            {ItemIcon ? <ItemIcon size={16} weight={active ? "duotone" : "regular"} /> : null}
                            {item.label}
                          </>
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {tools}
            {/* lg 미만 — 글로벌 nav 전체를 시트로 접는다 */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="메뉴 열기" className="lg:hidden">
                  <ListIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-72 flex-col gap-3 overflow-y-auto px-3 py-4">
                <SheetTitle className="px-2 text-sm font-semibold tracking-tight">메뉴</SheetTitle>
                <nav className="flex flex-col gap-0.5" aria-label="모바일 글로벌 내비게이션">
                  {items.map((item) => {
                    const ItemIcon = item.icon
                    const active = item.key === activeItem
                    return (
                      <NavAction
                        key={item.key}
                        href={item.href}
                        onSelect={() => {
                          setSheetOpen(false)
                          item.onSelect?.()
                        }}
                        active={active}
                        className={cn(itemClass(active), "w-full justify-start")}
                      >
                        {ItemIcon ? <ItemIcon size={17} weight={active ? "duotone" : "regular"} /> : null}
                        {item.label}
                      </NavAction>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* 2단 — 현재 화면명 · 서브탭 · ask 바 */}
        {hasSubBar ? (
          <div className="flex h-11 items-center gap-3 border-t border-border bg-background px-4">
            {screenTitle ? (
              <span className="hidden shrink-0 text-sm font-semibold tracking-tight sm:inline">{screenTitle}</span>
            ) : null}
            {(subTabs?.length ?? 0) > 0 ? (
              <nav
                className="-mx-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1"
                aria-label="화면 내 탭"
              >
                {subTabs?.map((tab) => {
                  const active = tab.key === activeSubTab
                  return (
                    <NavAction
                      key={tab.key}
                      href={tab.href}
                      onSelect={tab.onSelect}
                      active={active}
                      className={cn(
                        "shrink-0 rounded-md px-2.5 py-1 text-xs transition-colors",
                        active
                          ? "bg-secondary font-medium text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {tab.label}
                    </NavAction>
                  )
                })}
              </nav>
            ) : (
              <div className="min-w-0 flex-1" />
            )}
            {ask ? <div className="shrink-0">{ask}</div> : null}
          </div>
        ) : null}
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto flex max-w-[1300px] flex-col gap-8">{children}</div>
      </main>
    </div>
  )
}
