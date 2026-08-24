"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * ScrollStack — 스크롤 연동 카드 스태킹 컴포넌트.
 *
 * 스크롤을 내리면 카드가 컨테이너 상단(stackPosition)에 차례로 핀 고정되며
 * 겹겹이 쌓이고, 뒤 카드가 올라올수록 앞 카드가 살짝 축소(scale)·회전·블러된다.
 * reactbits.dev ScrollStack(MIT) 알고리즘을 참고하되 Lenis 의존성 없이
 * 네이티브 스크롤 이벤트 + requestAnimationFrame 으로 재작성했다(#19).
 *
 * - 기본은 고정 높이 스크롤 컨테이너 모드. `useWindowScroll` 로 페이지 스크롤 연동.
 * - `prefers-reduced-motion: reduce` 환경에서는 변환을 걸지 않고 일반 목록으로 둔다.
 */

const CARD_SELECTOR = "[data-scroll-stack-card]"
const END_SELECTOR = "[data-scroll-stack-end]"

export interface ScrollStackProps {
  children: React.ReactNode
  className?: string
  /** 카드 사이 기본 간격(px). 스택 전 목록 상태의 카드 간 거리다. */
  itemDistance?: number
  /** 쌓일 때 카드 순번마다 더해지는 scale 증분. */
  itemScale?: number
  /** 쌓인 카드끼리의 상하 오프셋(px) — 겹친 카드 머리가 보이는 두께. */
  itemStackDistance?: number
  /** 카드가 핀 고정되는 위치. 컨테이너 높이 기준 % 또는 px. */
  stackPosition?: string | number
  /** scale 애니메이션이 끝나는 위치. 컨테이너 높이 기준 % 또는 px. */
  scaleEndPosition?: string | number
  /** 가장 먼저 쌓인 카드의 최종 scale. */
  baseScale?: number
  /** 카드 순번마다 더해지는 회전각(deg). 0 이면 회전 없음. */
  rotationAmount?: number
  /** 스택 깊이 1단계당 블러(px). 0 이면 블러 없음. */
  blurAmount?: number
  /** true 면 내부 스크롤러 대신 window 스크롤에 연동한다. */
  useWindowScroll?: boolean
  /** 마지막 카드가 스택에 들어올 때 1회 호출. */
  onStackComplete?: () => void
}

export function ScrollStackItem({
  children,
  itemClassName,
}: Readonly<{ children: React.ReactNode; itemClassName?: string }>) {
  return (
    <div
      data-scroll-stack-card
      className={cn(
        "relative box-border w-full origin-top rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg will-change-transform sm:p-8",
        itemClassName,
      )}
    >
      {children}
    </div>
  )
}

interface CardTransform {
  translateY: number
  scale: number
  rotation: number
  blur: number
}

function parsePosition(value: string | number, containerHeight: number): number {
  if (typeof value === "string" && value.includes("%")) {
    return (Number.parseFloat(value) / 100) * containerHeight
  }
  return typeof value === "number" ? value : Number.parseFloat(value)
}

function progressBetween(scrollTop: number, start: number, end: number): number {
  if (scrollTop < start) return 0
  if (scrollTop > end) return 1
  return (scrollTop - start) / (end - start)
}

/** 현재 스택 최상단에 올라온 카드의 인덱스. 블러 깊이 계산용. */
function findTopCardIndex(
  offsets: readonly number[],
  scrollTop: number,
  stackPositionPx: number,
  itemStackDistance: number,
): number {
  let topCardIndex = 0
  for (const [j, offset] of offsets.entries()) {
    if (scrollTop >= offset - stackPositionPx - itemStackDistance * j) topCardIndex = j
  }
  return topCardIndex
}

function computeTranslateY(
  scrollTop: number,
  pinStart: number,
  pinEnd: number,
  cardTop: number,
  stackOffset: number,
): number {
  if (scrollTop >= pinStart && scrollTop <= pinEnd) return scrollTop - cardTop + stackOffset
  if (scrollTop > pinEnd) return pinEnd - cardTop + stackOffset
  return 0
}

interface CardTransformInput {
  index: number
  cardTop: number
  scrollTop: number
  pinEnd: number
  stackPositionPx: number
  scaleEndPositionPx: number
  topCardIndex: number
  itemStackDistance: number
  itemScale: number
  baseScale: number
  rotationAmount: number
  blurAmount: number
}

function computeCardTransform(input: CardTransformInput): CardTransform {
  const {
    index,
    cardTop,
    scrollTop,
    pinEnd,
    stackPositionPx,
    scaleEndPositionPx,
    topCardIndex,
    itemStackDistance,
    itemScale,
    baseScale,
    rotationAmount,
    blurAmount,
  } = input
  const stackOffset = stackPositionPx + itemStackDistance * index
  const pinStart = cardTop - stackOffset
  const scaleProgress = progressBetween(scrollTop, pinStart, cardTop - scaleEndPositionPx)
  const targetScale = baseScale + index * itemScale
  const translateY = computeTranslateY(scrollTop, pinStart, pinEnd, cardTop, stackOffset)

  return {
    translateY: Math.round(translateY * 100) / 100,
    scale: Math.round((1 - scaleProgress * (1 - targetScale)) * 1000) / 1000,
    rotation: rotationAmount ? Math.round(index * rotationAmount * scaleProgress * 100) / 100 : 0,
    blur: blurAmount && index < topCardIndex ? (topCardIndex - index) * blurAmount : 0,
  }
}

function hasTransformChanged(prev: CardTransform | undefined, next: CardTransform): boolean {
  return (
    !prev ||
    Math.abs(prev.translateY - next.translateY) > 0.1 ||
    Math.abs(prev.scale - next.scale) > 0.001 ||
    Math.abs(prev.rotation - next.rotation) > 0.1 ||
    Math.abs(prev.blur - next.blur) > 0.1
  )
}

function applyTransform(card: HTMLElement, transform: CardTransform): void {
  card.style.transform = `translate3d(0, ${transform.translateY}px, 0) scale(${transform.scale}) rotate(${transform.rotation}deg)`
  card.style.filter = transform.blur > 0 ? `blur(${transform.blur}px)` : ""
}

export function ScrollStack({
  children,
  className,
  itemDistance = 96,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: Readonly<ScrollStackProps>) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const cardsRef = React.useRef<HTMLElement[]>([])
  const lastTransformsRef = React.useRef(new Map<number, CardTransform>())
  const stackCompletedRef = React.useRef(false)
  const frameRef = React.useRef<number | null>(null)
  const onStackCompleteRef = React.useRef(onStackComplete)
  React.useEffect(() => {
    onStackCompleteRef.current = onStackComplete
  }, [onStackComplete])

  React.useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    const root: HTMLElement = scroller
    const cards = Array.from(root.querySelectorAll<HTMLElement>(CARD_SELECTOR))
    cardsRef.current = cards
    const transforms = lastTransformsRef.current

    for (const [i, card] of cards.entries()) {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`
    }

    const getScrollData = () =>
      useWindowScroll
        ? { scrollTop: window.scrollY, containerHeight: window.innerHeight }
        : { scrollTop: scroller.scrollTop, containerHeight: scroller.clientHeight }

    const getOffset = (el: HTMLElement) =>
      useWindowScroll ? el.getBoundingClientRect().top + window.scrollY : el.offsetTop

    const syncStackCompletion = (inStack: boolean) => {
      if (inStack === stackCompletedRef.current) return
      stackCompletedRef.current = inStack
      if (inStack) onStackCompleteRef.current?.()
    }

    const update = () => {
      frameRef.current = null
      if (cards.length === 0) return

      const { scrollTop, containerHeight } = getScrollData()
      const stackPositionPx = parsePosition(stackPosition, containerHeight)
      const scaleEndPositionPx = parsePosition(scaleEndPosition, containerHeight)
      const endElement = root.querySelector<HTMLElement>(END_SELECTOR)
      const endTop = endElement ? getOffset(endElement) : 0
      const pinEnd = endTop - containerHeight / 2
      const offsets = cards.map((card) => getOffset(card))

      // 블러는 "현재 최상단으로 쌓인 카드" 대비 깊이로 계산한다.
      const topCardIndex = blurAmount
        ? findTopCardIndex(offsets, scrollTop, stackPositionPx, itemStackDistance)
        : 0

      for (const [i, card] of cards.entries()) {
        const next = computeCardTransform({
          index: i,
          cardTop: offsets[i],
          scrollTop,
          pinEnd,
          stackPositionPx,
          scaleEndPositionPx,
          topCardIndex,
          itemStackDistance,
          itemScale,
          baseScale,
          rotationAmount,
          blurAmount,
        })

        if (hasTransformChanged(transforms.get(i), next)) {
          applyTransform(card, next)
          transforms.set(i, next)
        }
      }

      const lastIndex = cards.length - 1
      const lastPinStart = offsets[lastIndex] - stackPositionPx - itemStackDistance * lastIndex
      syncStackCompletion(scrollTop >= lastPinStart && scrollTop <= pinEnd)
    }

    const requestUpdate = () => {
      frameRef.current ??= requestAnimationFrame(update)
    }

    const scrollTarget: HTMLElement | Window = useWindowScroll ? window : scroller
    scrollTarget.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    update()

    return () => {
      scrollTarget.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      cardsRef.current = []
      transforms.clear()
      stackCompletedRef.current = false
    }
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
  ])

  if (useWindowScroll) {
    return (
      <div ref={scrollerRef} className={cn("relative w-full", className)}>
        {children}
        <div data-scroll-stack-end aria-hidden className="h-px w-full" />
      </div>
    )
  }

  return (
    <div
      ref={scrollerRef}
      className={cn("relative h-full w-full overflow-y-auto overscroll-contain", className)}
    >
      <div className="px-4 pb-[36rem] pt-[16vh] sm:px-8">
        {children}
        <div data-scroll-stack-end aria-hidden className="h-px w-full" />
      </div>
    </div>
  )
}
