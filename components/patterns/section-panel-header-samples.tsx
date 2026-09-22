import { FunnelIcon, GaugeIcon, LinkIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { SectionPanelHeader } from "@/components/section-panel-header"

export const SECTION_PANEL_HEADER_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "메타 텍스트 우측 슬롯",
    description: "필터가 아니라 요약 정보(건수·기준일)만 우측에 필요한 경우입니다.",
    demo: (
      <Card className="w-full">
        <SectionPanelHeader
          icon={GaugeIcon}
          title="여신감리 대상 차주"
          description="이번 회차 심사 대상"
          meta="총 128건 · 2026-09-22 기준"
        />
        <CardContent className="text-sm text-muted-foreground">본문 목록/테이블은 이 아래에 놓입니다.</CardContent>
      </Card>
    ),
    code: `<Card>
  <SectionPanelHeader
    icon={GaugeIcon}
    title="여신감리 대상 차주"
    description="이번 회차 심사 대상"
    meta="총 128건 · 2026-09-22 기준"
  />
  <CardContent>{/* 본문 */}</CardContent>
</Card>`,
    notes: [
      "meta 는 텍스트 전용 슬롯이다 — 클릭 가능한 요소가 필요하면 actions 를 쓴다.",
      "icon 은 Phosphor(@phosphor-icons/react/dist/ssr)만 받는다. 이모지로 대체하지 않는다.",
    ],
  },
  {
    num: 2,
    title: "필터·링크 액션 우측 슬롯",
    description: "우측에 버튼형 액션이 여러 개 있을 때, 좁은 폭에서 제목 아래로 줄바꿈됩니다.",
    demo: (
      <Card className="w-full max-w-sm">
        <SectionPanelHeader
          icon={FunnelIcon}
          title="증빙 서류"
          actions={
            <>
              <Button size="sm" variant="ghost">
                <LinkIcon size={14} />
                원본 링크
              </Button>
              <Button size="sm" variant="outline">
                필터
              </Button>
            </>
          }
        />
        <CardContent className="text-sm text-muted-foreground">좁은 카드에서 우측 액션이 줄바꿈되는 예시입니다.</CardContent>
      </Card>
    ),
    code: `<SectionPanelHeader
  icon={FunnelIcon}
  title="증빙 서류"
  actions={
    <>
      <Button size="sm" variant="ghost"><LinkIcon size={14} />원본 링크</Button>
      <Button size="sm" variant="outline">필터</Button>
    </>
  }
/>`,
    notes: [
      "actions 는 여러 인터랙티브 요소를 담을 수 있다 — 내부 gap 은 컴포넌트가 관리하므로 호출부가 각 요소 사이 여백을 따로 넣지 않는다.",
      "좌측 아이콘·제목은 폭이 좁아져도 줄어들지 않는다(shrink-0) — 대신 우측 슬롯이 다음 줄로 내려간다.",
    ],
  },
]
