"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** 코치마크 한 단계 — 하이라이트할 대상과 설명. */
export interface CoachMarkStep {
  /** React key 이자 내부 상태 키(안정적인 문자열). */
  key: string
  /**
   * 하이라이트할 대상 DOM 요소. 셀렉터 문자열이 아니라 ref 로 받는다 —
   * 문자열 셀렉터는 클래스명 리팩터에 조용히 깨진다(#99).
   */
  targetRef: React.RefObject<HTMLElement | null>
  title: React.ReactNode
  description: React.ReactNode
  /** 팝오버가 대상 기준 어느 쪽에 뜰지. 기본 "bottom". */
  side?: "top" | "right" | "bottom" | "left"
}

export interface CoachMarkTourProps {
  /** 투어를 구성하는 단계 목록(2개 이상 권장). */
  steps: readonly CoachMarkStep[]
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 단계 인디케이터 문구. 기본 `"{현재} / {전체} 단계"`. */
  stepLabel?: (current: number, total: number) => string
  prevLabel?: string
  nextLabel?: string
  doneLabel?: string
  closeLabel?: string
}

const DEFAULT_STEP_LABEL = (current: number, total: number) => `${current} / ${total} 단계`
const HIGHLIGHT_PADDING = 8

function isInViewport(rect: DOMRect): boolean {
  const vw = window.innerWidth || document.documentElement.clientWidth
  const vh = window.innerHeight || document.documentElement.clientHeight
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= vh && rect.right <= vw
}

/** 열려 있는 동안 대상 요소의 뷰포트 좌표를 스크롤/리사이즈에 맞춰 갱신한다. */
function useTargetRect(target: HTMLElement | null, active: boolean): DOMRect | null {
  const [rect, setRect] = React.useState<DOMRect | null>(null)

  React.useLayoutEffect(() => {
    const update = () => setRect(active && target ? target.getBoundingClientRect() : null)
    update()
    if (!active || !target) return
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null
    observer?.observe(target)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
      observer?.disconnect()
    }
  }, [active, target])

  return rect
}

/**
 * 단계형 코치마크(제품 투어, #99) — 기존 화면 위에 덧씌우는 4요소 구성:
 * 딤 오버레이 · 대상 영역 하이라이트(구멍 뚫기) · 설명 팝오버 · 단계 이동 컨트롤.
 *
 * - 대상은 셀렉터가 아니라 `targetRef` 로 받는다(리팩터 안전).
 * - `Popover` 프리미티브를 `modal` 로 써서 포커스 트랩·Esc 닫기·아웃사이드
 *   포인터 차단을 재구현하지 않고 그대로 재사용한다.
 * - 열릴 때 포커스·스크롤 위치를 `useLayoutEffect` 로 저장하고, 닫힐 때
 *   복원한다 — 팝오버가 마운트되어 포커스를 가져가기 전에 커밋되므로
 *   이전 포커스 대상을 정확히 저장한다(#99 종료 게이트).
 * - 모션은 `duration-200`(모션 규칙 스케일)만 쓴다 — `data-personality-motion="none"`
 *   (crisp 성격)에서는 `app/globals.css` 의 전역 규칙이 모든 transition/animation
 *   지속시간을 강제로 줄이므로 이 컴포넌트가 별도로 분기하지 않는다.
 */
export function CoachMarkTour({
  steps,
  open,
  onOpenChange,
  stepLabel = DEFAULT_STEP_LABEL,
  prevLabel = "이전",
  nextLabel = "다음",
  doneLabel = "완료",
  closeLabel = "투어 닫기",
}: Readonly<CoachMarkTourProps>) {
  const [activeStep, setActiveStep] = React.useState(0)

  const savedFocusRef = React.useRef<HTMLElement | null>(null)
  const savedScrollRef = React.useRef<{ x: number; y: number } | null>(null)
  const wasOpenRef = React.useRef(false)

  // 열고 닫을 때 아래 화면의 포커스·스크롤 위치를 저장/복원한다. 이 훅은
  // useTargetRect 의 훅보다 먼저 선언되어 같은 커밋에서 먼저 실행되므로,
  // 하이라이트 rect 가 아직 없어 팝오버 콘텐츠가 마운트되지 않은 시점에
  // document.activeElement 를 저장한다(포커스 도둑맞기 전에 캡처).
  React.useLayoutEffect(() => {
    if (open && !wasOpenRef.current) {
      setActiveStep(0)
      savedFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      savedScrollRef.current = { x: window.scrollX, y: window.scrollY }
    } else if (!open && wasOpenRef.current) {
      const scroll = savedScrollRef.current
      if (scroll) window.scrollTo(scroll.x, scroll.y)
      savedFocusRef.current?.focus()
      savedFocusRef.current = null
      savedScrollRef.current = null
    }
    wasOpenRef.current = open
  }, [open])

  const total = steps.length
  const clampedStep = Math.min(activeStep, Math.max(total - 1, 0))
  const current = steps[clampedStep] as CoachMarkStep | undefined
  const target = open ? (current?.targetRef.current ?? null) : null
  const rect = useTargetRect(target, open)

  // 하이라이트가 뷰포트 밖이면 스크롤로 데려온다.
  React.useEffect(() => {
    if (!open || !target) return
    if (!isInViewport(target.getBoundingClientRect())) {
      target.scrollIntoView({ block: "center", inline: "nearest" })
    }
  }, [open, target, clampedStep])

  // virtualAnchorRef 는 최초 1회만 만들고 이후 렌더에서 다시 쓰지 않는다(렌더 중
  // ref 변형 금지) — 대신 rectRef 를 별도 effect 에서 갱신하고 클로저가 그걸 읽는다.
  const rectRef = React.useRef<DOMRect | null>(rect)
  React.useLayoutEffect(() => {
    rectRef.current = rect
  }, [rect])
  const virtualAnchorRef = React.useRef({
    getBoundingClientRect: () => rectRef.current ?? new DOMRect(),
  })

  const goPrev = React.useCallback(() => {
    setActiveStep((value) => Math.max(0, value - 1))
  }, [])

  const goNext = React.useCallback(() => {
    setActiveStep((value) => {
      if (value >= total - 1) {
        onOpenChange(false)
        return value
      }
      return value + 1
    })
  }, [total, onOpenChange])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      goNext()
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      goPrev()
    }
  }

  if (!open || total === 0 || !current) return null

  const isFirst = clampedStep === 0
  const isLast = clampedStep === total - 1

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange} modal>
      <PopoverPrimitive.Anchor virtualRef={virtualAnchorRef} />
      <PopoverPrimitive.Portal>
        {rect ? (
          <>
            {/*
              딤 오버레이 + 하이라이트 "구멍 뚫기"를 한 요소로 처리한다 — box-shadow
              spread(9999px)가 대상 rect 바깥 전체를 덮어 딤 처리하고, rect 안쪽은
              그림자가 닿지 않아 자연히 하이라이트된다(SVG mask 없이 CSS만으로 해결).
            */}
            <div
              aria-hidden="true"
              data-slot="coach-mark-highlight"
              className="pointer-events-none fixed z-40 rounded-lg outline outline-2 outline-offset-2 outline-primary duration-200 animate-in fade-in-0"
              style={{
                top: rect.top - HIGHLIGHT_PADDING,
                left: rect.left - HIGHLIGHT_PADDING,
                width: rect.width + HIGHLIGHT_PADDING * 2,
                height: rect.height + HIGHLIGHT_PADDING * 2,
                boxShadow: "0 0 0 9999px color-mix(in oklch, var(--foreground) 45%, transparent)",
              }}
            />
            <PopoverPrimitive.Content
              data-slot="coach-mark-content"
              side={current.side ?? "bottom"}
              sideOffset={12}
              onKeyDown={handleKeyDown}
              onCloseAutoFocus={(event) => event.preventDefault()}
              className={cn(
                "z-50 flex w-80 flex-col gap-3 rounded-lg bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-200",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-none">{current.title}</p>
                <PopoverPrimitive.Close asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={closeLabel} className="-mt-1 -mr-1">
                    <XIcon />
                  </Button>
                </PopoverPrimitive.Close>
              </div>
              <div className="text-muted-foreground">{current.description}</div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  {stepLabel(clampedStep + 1, total)}
                </span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={goPrev} disabled={isFirst}>
                    <ArrowLeftIcon />
                    {prevLabel}
                  </Button>
                  <Button type="button" variant="default" size="sm" onClick={goNext}>
                    {isLast ? doneLabel : nextLabel}
                    {isLast ? null : <ArrowRightIcon />}
                  </Button>
                </div>
              </div>
            </PopoverPrimitive.Content>
          </>
        ) : null}
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
