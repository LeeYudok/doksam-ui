import { NewspaperClippingIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"

import { ActivityStream } from "./_components/activity-stream"
import { EVENTS } from "./_data/events"

/**
 * feed-timeline 원형 대표 템플릿(#89).
 * 시간 역순 단일 세로 스트림이 화면의 주인공이고 필터·요약은 곁가지다 —
 * 끝이 정해지지 않은 흐름을 계속 따라가는 화면의 뼈대다.
 */
export default function ActivityFeedPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          <NewspaperClippingIcon weight="fill" aria-hidden />
          feed-timeline 원형
        </Badge>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">활동 스트림</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          가상 플랫폼의 운영 활동 {EVENTS.length}건입니다. 스트림 폭은 max-w-2xl 로 좁혀 한 줄이 길어지지 않게 했고,
          상단 필터 바는 목적지 링크 없이 스트림을 좁히기만 합니다. 모든 이벤트는 로컬 placeholder 입니다.
        </p>
      </section>

      <ActivityStream />
    </div>
  )
}
