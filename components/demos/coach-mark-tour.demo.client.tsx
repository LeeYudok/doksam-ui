"use client"

import { useRef, useState } from "react"
import { BellIcon, ChartLineUpIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"

import { CoachMarkTour, type CoachMarkStep } from "@/components/coach-mark-tour"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** 업무 화면 축소판 위에서 3단계 투어를 시연한다 — 화면을 새로 만들지 않고
 *  기존 화면 요소를 targetRef 로 가리키는 실제 사용 형태 그대로다. */
export function CoachMarkTourDemo() {
  const [open, setOpen] = useState(false)
  const searchRef = useRef<HTMLButtonElement>(null)
  const alertRef = useRef<HTMLButtonElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const steps: CoachMarkStep[] = [
    {
      key: "search",
      targetRef: searchRef,
      title: "거래처 검색",
      description: "사업자번호나 상호로 거래처를 바로 찾을 수 있습니다.",
      side: "bottom",
    },
    {
      key: "alerts",
      targetRef: alertRef,
      title: "위험 알림",
      description: "등급이 바뀌거나 기한이 임박한 건은 여기서 실시간으로 알려드려요.",
      side: "bottom",
    },
    {
      key: "chart",
      targetRef: chartRef,
      title: "위험 추이",
      description: "최근 6개월 등급 변화 추이를 한눈에 확인할 수 있습니다.",
      side: "top",
    },
  ]

  return (
    <div>
      <Button size="sm" onClick={() => setOpen(true)}>
        신입 가이드 투어 시작
      </Button>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm">여신 모니터링</CardTitle>
          <div className="flex items-center gap-2">
            <Button ref={searchRef} variant="outline" size="icon-sm" aria-label="거래처 검색">
              <MagnifyingGlassIcon />
            </Button>
            <Button ref={alertRef} variant="outline" size="icon-sm" aria-label="위험 알림">
              <BellIcon />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={chartRef}
            className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground"
          >
            <ChartLineUpIcon size={28} />
          </div>
        </CardContent>
      </Card>

      <CoachMarkTour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  )
}
