import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { ComplianceCallout } from "@/components/compliance-callout"

export const COMPLIANCE_CALLOUT_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "규정 근거가 있는 경보",
    description: "S-01 여신감리 콜아웃처럼 근거 규정 번호와 기한, 액션 버튼을 모두 갖춘 최대 구성입니다.",
    demo: (
      <ComplianceCallout
        severity="critical"
        severityLabel="경보"
        regulationRef="여신감리 준수 지침 제2024-42호"
        condition="[경보] 등급 차주는"
        requirement="조치방안을 수립하여 센터장 결재를 득하여야 합니다."
        dueLabel="제출 기한 D-3 · 2026-09-25"
        actions={[{ label: "조치 수립 가이드" }, { label: "결재 상신", variant: "default" }]}
      />
    ),
    code: `<ComplianceCallout
  severity="critical"
  severityLabel="경보"
  regulationRef="여신감리 준수 지침 제2024-42호"
  condition="[경보] 등급 차주는"
  requirement="조치방안을 수립하여 센터장 결재를 득하여야 합니다."
  dueLabel="제출 기한 D-3 · 2026-09-25"
  actions={[
    { label: "조치 수립 가이드" },
    { label: "결재 상신", variant: "default", onClick: openApprovalDrawer },
  ]}
/>`,
    notes: [
      "severity=critical 은 --destructive, warning 은 --warning 토큰을 쓴다 — #81 의 --risk-* 는 신용등급 전용 순서 토큰이라 여기서는 쓰지 않는다(설계 판단, PR 본문 참고).",
      "severityLabel 은 색과 별개인 두 번째 채널이라 생략할 수 없다. 색만으로 경보/주의를 구분하지 않는다.",
      "actions 의 첫 항목이 보조, 마지막 항목이 주 액션이다 — 결재·승인처럼 되돌리기 어려운 액션을 배열 끝에 둔다.",
    ],
  },
  {
    num: 2,
    title: "근거 규정 없는 주의 안내",
    description: "regulationRef 를 생략한 warning 심각도 — 모든 콜아웃이 규정 근거를 갖지는 않는다.",
    demo: (
      <ComplianceCallout
        severity="warning"
        severityLabel="주의"
        condition="최근 30일 내 재무제표 미갱신 차주는"
        requirement="다음 심사 전까지 최신 재무제표를 등록해야 합니다."
        actions={[{ label: "재무제표 등록", variant: "outline" }]}
      />
    ),
    code: `<ComplianceCallout
  severity="warning"
  severityLabel="주의"
  condition="최근 30일 내 재무제표 미갱신 차주는"
  requirement="다음 심사 전까지 최신 재무제표를 등록해야 합니다."
  actions={[{ label: "재무제표 등록", variant: "outline" }]}
/>`,
    notes: [
      "regulationRef 는 optional prop 이다 — 생략하면 근거번호 자리 자체가 렌더되지 않는다.",
      "dueLabel·actions 도 선택이다. 안내만 필요하면 severity/severityLabel/condition/requirement 4개만으로 충분하다.",
    ],
  },
  {
    num: 3,
    title: "정보성 안내",
    description: "notice 심각도 — 규정 위반이 아니라 업무 절차 안내에 쓴다.",
    demo: (
      <ComplianceCallout
        severity="notice"
        severityLabel="안내"
        condition="이번 분기부터"
        requirement="여신감리 결과는 월 1회가 아니라 격주로 갱신됩니다."
      />
    ),
    code: `<ComplianceCallout
  severity="notice"
  severityLabel="안내"
  condition="이번 분기부터"
  requirement="여신감리 결과는 월 1회가 아니라 격주로 갱신됩니다."
/>`,
    notes: [
      "notice 는 규정 위반을 알리지 않는 일반 공지에 쓴다 — 경보/주의와 같은 자리에서 혼동되지 않도록 severity 를 반드시 명시한다.",
    ],
  },
]
