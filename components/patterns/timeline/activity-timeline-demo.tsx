import {
  ChatCircleIcon,
  CheckCircleIcon,
  CreditCardIcon,
  UserPlusIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr"

import { ActivityTimeline, type ActivityGroup } from "@/components/patterns/timeline/activity-timeline"

const GROUPS: ActivityGroup[] = [
  {
    date: "2026-07-13 (오늘)",
    items: [
      { time: "14:12", status: "success", icon: CheckCircleIcon, title: "결제 완료", description: "ORD-1042 주문이 정상 결제되었습니다." },
      { time: "11:05", status: "muted", icon: ChatCircleIcon, title: "댓글 등록", description: "'배송이 언제쯤 시작되나요?' 문의가 등록되었습니다." },
    ],
  },
  {
    date: "2026-07-12",
    items: [
      { time: "22:40", status: "destructive", icon: XCircleIcon, title: "결제 실패", description: "카드사 한도 초과로 ORD-1039 결제가 거절되었습니다." },
      { time: "16:18", status: "warning", icon: WarningCircleIcon, title: "재고 부족 경고", description: "SKU-2210 재고가 5개 미만으로 떨어졌습니다." },
      { time: "09:02", status: "success", icon: UserPlusIcon, title: "신규 가입", description: "새 회원 3명이 가입했습니다." },
    ],
  },
  {
    date: "2026-07-11",
    items: [
      { time: "18:30", status: "muted", icon: CreditCardIcon, title: "정기 결제 갱신", description: "구독 62건이 자동 갱신되었습니다." },
    ],
  },
]

/** /patterns/timeline 데모용 — 쇼핑몰 활동 이력 3일치. */
export function ActivityTimelineDemo() {
  return <ActivityTimeline groups={GROUPS} />
}
