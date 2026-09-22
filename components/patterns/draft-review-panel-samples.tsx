import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import {
  DraftReviewPanel,
  type DraftReviewDocument,
} from "@/components/patterns/draft-review-panel/draft-review-panel"

const EWS_DOCUMENTS: DraftReviewDocument[] = [
  {
    key: "survey-report",
    label: "여신조사보고서",
    sections: [
      {
        key: "overview",
        title: "차주 개요",
        status: "final",
        statusLabel: "확정",
        content: "차주는 2019년 설립된 제조업체로, 최근 3개년 매출은 안정적인 증가세를 보이고 있습니다.",
      },
      {
        key: "cause",
        title: "원인 정밀 분석",
        status: "in_review",
        statusLabel: "검토중",
        content: "매출채권 회전율이 전분기 대비 18% 하락했으며, 주요 매출처 1곳의 결제 지연이 원인으로 파악됩니다.",
      },
      {
        key: "action",
        title: "조치방안",
        status: "draft",
        statusLabel: "초안",
        content: "매출채권 회수 계획 제출을 요청하고, 익월 재무제표 제출 시 재평가를 진행합니다.",
      },
      {
        key: "opinion",
        title: "담당자 최종 종합의견",
        status: "draft",
        statusLabel: "초안",
        content: "단기 유동성 리스크는 관리 가능한 수준이나, 매출채권 회수 지연이 지속될 경우 등급 재산정이 필요합니다.",
      },
    ],
  },
  {
    key: "followup-report",
    label: "사후관리보고서",
    sections: [
      {
        key: "overview",
        title: "차주 개요",
        status: "draft",
        statusLabel: "초안",
        content: "전기 조치방안 이행 여부를 중심으로 차주 현황을 재확인합니다.",
      },
      {
        key: "cause",
        title: "원인 정밀 분석",
        status: "draft",
        statusLabel: "초안",
        content: "전기 지적 사항이었던 매출채권 회전율은 소폭 개선되었으나 여전히 업종 평균을 하회합니다.",
      },
      {
        key: "action",
        title: "조치방안",
        status: "draft",
        statusLabel: "초안",
        content: "분기별 모니터링 주기를 유지하고, 다음 분기 재무제표 제출 시 재평가합니다.",
      },
      {
        key: "opinion",
        title: "담당자 최종 종합의견",
        status: "draft",
        statusLabel: "초안",
        content: "전기 대비 리스크 수준에 큰 변동은 없습니다.",
      },
    ],
  },
]

export const DRAFT_REVIEW_PANEL_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "문서 종류 탭 + 섹션 4개 검토·가필",
    description:
      "EWS 문서 자동생성함(S-05)처럼 문서 종류를 탭으로 바꿔가며, 문서마다 4개 섹션을 검토·가필하는 화면입니다. '편집'을 눌러 섹션을 고쳐 보고, 다른 섹션이나 다른 문서 탭으로 옮겨도 편집 중이던 내용이 그대로 남는지 확인해 보세요.",
    demo: (
      <DraftReviewPanel
        documents={EWS_DOCUMENTS}
        secondaryAction={{ label: "임시저장" }}
        primaryAction={{ label: "결재 상신" }}
      />
    ),
    code: `<DraftReviewPanel
  documents={[
    {
      key: "survey-report",
      label: "여신조사보고서",
      sections: [
        { key: "overview", title: "차주 개요", status: "final", statusLabel: "확정", content: "..." },
        { key: "cause", title: "원인 정밀 분석", status: "in_review", statusLabel: "검토중", content: "..." },
        { key: "action", title: "조치방안", status: "draft", statusLabel: "초안", content: "..." },
        { key: "opinion", title: "담당자 최종 종합의견", status: "draft", statusLabel: "초안", content: "..." },
      ],
    },
    // ... 문서 종류별로 반복
  ]}
  secondaryAction={{ label: "임시저장", onClick: saveDraft }}
  primaryAction={{ label: "결재 상신", onClick: submitApproval }}
/>`,
    notes: [
      "섹션 4개 이상을 각각 독립적으로 검토·확정해야 하고, 확정 전 단계별 상태(초안/검토중/확정)를 구분해 보여줘야 할 때 쓴다 — 문서 전체를 한 덩어리로만 다룬다면 단일 리치텍스트 에디터가 더 단순하다.",
      "'AI 가 쓴 부분'과 '사람이 고친 부분'을 섹션 단위로만 구분한다(#104 설계 판단) — 문장 단위 diff 는 LLM 재작성 특성상 근거 없는 강조를 만들어 하지 않는다. 더 세밀한 표기가 필요하면 별도 감사 추적 컴포넌트와 조합한다.",
      "출력 액션은 새로 만들지 않고 `sticky-actionbar`(#88) 를 그대로 재사용한다 — 화면마다 액션 배치가 달라지는 것을 막는다.",
      "섹션이 1~2개뿐이거나 문서 종류 전환이 없다면 이 패턴 대신 `Textarea` 하나로 충분하다 — 탭·섹션 상태 관리 비용을 들일 이유가 없다.",
    ],
  },
]
