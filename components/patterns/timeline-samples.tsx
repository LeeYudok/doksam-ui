import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { ActivityTimelineDemo } from "@/components/patterns/timeline/activity-timeline-demo"
import { CompactTimelineDemo } from "@/components/patterns/timeline/compact-timeline-demo"

export const TIMELINE_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "날짜별 활동 타임라인",
    description: "아이콘 노드 + 시각 + 제목/설명을 세로로 나열하고, 날짜 헤더로 그룹을 구분하는 기본형입니다.",
    demo: <ActivityTimelineDemo />,
    code: `const NODE_CLASS: Record<ActivityStatus, string> = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
}

{groups.map((group) => (
  <section key={group.date}>
    <h3 className="text-xs font-semibold text-muted-foreground uppercase">{group.date}</h3>
    <ol>
      {group.items.map((item) => (
        <li key={item.title} className="relative flex gap-3 pb-6 last:pb-0">
          <span className="absolute top-6 bottom-0 left-[15px] w-px bg-border last:hidden" />
          <span className={cn("flex size-8 items-center justify-center rounded-full border", NODE_CLASS[item.status])}>
            <item.icon size={16} weight="fill" />
          </span>
          <div>
            <p className="text-sm font-medium">{item.title} <span className="text-xs text-muted-foreground">{item.time}</span></p>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
))}`,
    notes: [
      "상태 4종(success/warning/destructive/muted)은 노드 테두리·배경·아이콘 색을 같은 시맨틱 토큰 조합({token}/40 테두리, {token}/10 배경)으로 통일한다.",
      "연결선(세로 bar)은 노드 뒤에 절대 위치로 깔고 각 그룹의 마지막 항목에서는 last:hidden으로 끊는다.",
      "날짜 헤더는 대문자 소문자 무관 tracking-wide 소제목으로 시간순 그룹을 구분한다 — 리스트 자체는 그대로 두고 헤더만 반복한다.",
    ],
  },
  {
    num: 2,
    title: "컴팩트 타임라인",
    description: "날짜 그룹 없이 단일 프로세스의 진행 이력을 좁은 폭(사이드 패널·카드 내부)에 담는 축약 변형입니다.",
    demo: <CompactTimelineDemo />,
    code: `const DOT_CLASS: Record<StepStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/40",
}

<li className="relative flex gap-2.5 pb-4 last:pb-0">
  <span className="absolute top-4 bottom-0 left-[5px] w-px bg-border" />
  <span className={cn("mt-1 size-2.5 rounded-full", DOT_CLASS[step.status])} />
  <span className="flex items-center gap-1 text-sm">
    <step.icon size={13} className="text-muted-foreground" />
    {step.title}
  </span>
  <span className="text-xs tabular-nums text-muted-foreground">{step.time}</span>
</li>`,
    notes: [
      "노드를 8px짜리 원형 도트로 줄이고 카드/아이콘 프레임을 없애 세로 공간을 아낀다.",
      "상태 색은 배경 원 대신 도트 자체의 bg-{token}로만 표현해 한 줄 높이에 맞춘다.",
      "시간이 확정되지 않은 대기 단계는 '—' 같은 placeholder 시각 + muted 도트로 표시한다.",
    ],
  },
]
