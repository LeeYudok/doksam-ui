import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { ConceptCardDemo } from "@/components/patterns/concept-explainer/concept-card-demo"
import { FlowDiagramDemo } from "@/components/patterns/concept-explainer/flow-diagram-demo"
import { TroubleTableDemo } from "@/components/patterns/concept-explainer/trouble-table-demo"

export const CONCEPT_EXPLAINER_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "개념 설명 카드",
    description: "순번 + 제목 + 등가물 헤더, 한 줄 비유, 불릿 목록(주의 마커)으로 어려운 개념 하나를 친숙한 비유로 설명하는 카드입니다.",
    demo: <ConceptCardDemo />,
    code: `<ConceptCard
  num="01"
  title="Image"
  equivalent="≈ 냉동 밀키트"
  analogy="손질·계량 다 끝난 재료 묶음 — 근데 아직 안 익혔어요"
  items={[
    { text: "레시피(Dockerfile)대로 docker build 하면 만들어진다" },
    { text: "이미지 자체는 실행 상태가 아니다", warn: true },
  ]}
/>`,
    notes: [
      "헤더 순번·등가물은 font-mono, 제목은 semibold — 원본 인포그래픽의 세리프/모노 대비를 토큰 타이포로 옮긴 것이다.",
      "주의 항목(warn:true)만 text-destructive + WarningIcon으로 강조하고, 나머지는 text-muted-foreground + ArrowRightIcon(primary)로 통일한다.",
      "한 줄 비유는 border-l-2 border-primary 로 좌측 강조 바를 준다 — 카드마다 시선이 먼저 닿는 지점이다.",
      "카드 그리드는 개념 2~4개 기준 grid-cols-1 sm:grid-cols-2 가 기본값이다.",
    ],
  },
  {
    num: 2,
    title: "아키텍처 흐름 도식",
    description: "진입점(점선 알약) → 관문(gate) → 실행 노드/유닛으로 이어지는 세로 플로우. 요청/데이터가 어떤 관문을 거쳐 어디로 도달하는지 보여줍니다.",
    demo: <FlowDiagramDemo />,
    code: `<div className="flex flex-col items-center">
  <div className="rounded-full border border-dashed ...">Dockerfile · 레시피</div>
  <ArrowDownIcon />
  <Gate label="① docker build" title="IMAGE · 냉동 밀키트" tone="primary" />
  <ArrowDownIcon />
  <Gate label="② docker run" title="데우기 → 접시에" tone="secondary" />
  {/* HOST 카드 그리드(노드) + unit(컨테이너) */}
</div>`,
    notes: [
      "관문 tone은 primary(bg-primary/10)·secondary(bg-muted) 2단계로만 나눠 단계 위계를 색이 아니라 강도로 표현한다 — 하드코딩 색을 쓰지 않는다.",
      "진입점은 border-dashed 알약, 단계 전환은 ArrowDownIcon 으로 통일한다.",
      "노드(HOST) 카드 안의 unit은 bg-secondary 로 묶어 '한 노드에 여러 컨테이너'를 시각화한다.",
      "관문 라벨(① docker build 등)은 w-24 고정폭 우측정렬 모노로 붙여 세로 정렬을 맞춘다.",
    ],
  },
  {
    num: 3,
    title: "증상 ▶ 대응 대응표",
    description: "왼쪽 증상, 가운데 화살표, 오른쪽 확인 지점의 3열 매트릭스. \"문제 생겼을 때 어디부터 보라\"를 빠르게 훑게 합니다.",
    demo: <TroubleTableDemo />,
    code: `<div className="grid grid-cols-[1fr_auto_1.2fr] items-center gap-3
     rounded-md border px-4 py-3 max-sm:grid-cols-1">
  <span className="text-sm font-medium">{row.symptom}</span>
  <CaretRightIcon className="max-sm:hidden" />
  <span className="text-primary sm:text-right">{row.where}</span>
</div>`,
    notes: [
      "3열 grid-cols-[1fr_auto_1.2fr] 로 증상·화살표·대응 폭을 고정하고, sm 미만에선 grid-cols-1 로 스택하며 화살표를 숨긴다.",
      "대응 지점(where)은 text-primary 로 강조해 '여기부터 봐라'를 명확히 한다.",
      "증상/대응 문구는 한 줄로 짧게 — 표가 스캔 대상이지 읽기 대상이 아니기 때문이다.",
    ],
  },
]
