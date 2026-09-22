import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { StickyActionbar } from "@/components/sticky-actionbar"

export const STICKY_ACTIONBAR_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "주 액션 + 보조 액션",
    description: "S-05 결재 상신처럼 스크롤 컨테이너 하단에 항상 붙는 액션바입니다. 아래 회색 영역을 스크롤해 보세요.",
    demo: (
      <div className="flex h-64 w-full max-w-md flex-col overflow-y-auto rounded-lg border border-border bg-muted/30">
        <div className="flex-1 space-y-3 p-4 text-sm text-muted-foreground">
          <p>여신감리 검토 항목 1</p>
          <p>여신감리 검토 항목 2</p>
          <p>여신감리 검토 항목 3</p>
          <p>여신감리 검토 항목 4</p>
          <p>여신감리 검토 항목 5</p>
          <p>여신감리 검토 항목 6</p>
        </div>
        <StickyActionbar
          meta="3/5 단계 · 임시저장됨"
          secondaryAction={{ label: "이전" }}
          primaryAction={{ label: "결재 상신" }}
        />
      </div>
    ),
    code: `<StickyActionbar
  meta="3/5 단계 · 임시저장됨"
  secondaryAction={{ label: "이전", onClick: goToPreviousStep }}
  primaryAction={{ label: "결재 상신", onClick: submitApproval }}
/>`,
    notes: [
      "sticky bottom-0 은 fixed 가 아니다 — 스크롤 컨테이너(또는 페이지) 흐름 안에서 하단에 붙는다. iOS 소프트 키보드가 fixed 요소를 레이아웃 뷰포트 기준으로 가려버리는 문제를 피한다.",
      "primaryAction 은 항상 우측 끝 — '다음으로 진행'의 방향과 눈의 읽기 순서를 맞춘다.",
      "safe-area 하단 여백은 pb-[calc(env(safe-area-inset-bottom)+…)] 로 흡수하므로 호출부가 따로 여백을 더하지 않는다.",
    ],
  },
  {
    num: 2,
    title: "파괴적 액션 분리 배치",
    description: "반려처럼 되돌리기 어려운 액션은 주 액션과 반대쪽 끝에 둡니다.",
    demo: (
      <div className="flex h-40 w-full max-w-md flex-col overflow-y-auto rounded-lg border border-border bg-muted/30">
        <div className="flex-1 p-4 text-sm text-muted-foreground">검토 내용이 이 위에 표시됩니다.</div>
        <StickyActionbar
          destructiveAction={{ label: "반려" }}
          secondaryAction={{ label: "보류" }}
          primaryAction={{ label: "승인" }}
        />
      </div>
    ),
    code: `<StickyActionbar
  destructiveAction={{ label: "반려", onClick: reject }}
  secondaryAction={{ label: "보류", onClick: hold }}
  primaryAction={{ label: "승인", onClick: approve }}
/>`,
    notes: [
      "destructiveAction 은 좌측 끝에 분리한다 — 승인 버튼 옆에 반려를 붙이면 연속 클릭 동선에서 오조작이 난다.",
      "destructiveAction 과 primaryAction 을 같은 쪽에 두지 않는다. 이 판단 기준이 컴포넌트의 고정 레이아웃(destructive → meta → secondary → primary)이 되어 있어 호출부가 순서를 실수로 바꿀 수 없다.",
    ],
  },
]
