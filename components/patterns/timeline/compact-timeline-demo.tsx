import { CheckCircleIcon, CircleIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr"

import { CompactTimeline, type CompactStep } from "@/components/patterns/timeline/compact-timeline"

const STEPS: CompactStep[] = [
  { time: "09:00", status: "success", icon: CheckCircleIcon, title: "주문 접수" },
  { time: "09:12", status: "success", icon: CheckCircleIcon, title: "결제 확인" },
  { time: "10:40", status: "warning", icon: WarningCircleIcon, title: "재고 확인 지연" },
  { time: "13:05", status: "destructive", icon: XCircleIcon, title: "배송 실패 — 주소 오류" },
  { time: "—", status: "muted", icon: CircleIcon, title: "재배송 대기" },
]

/** /patterns/timeline 데모용 — 주문 한 건의 처리 단계. */
export function CompactTimelineDemo() {
  return <CompactTimeline steps={STEPS} />
}
