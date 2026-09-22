import { RankedAlternativesListDemo } from "./ranked-alternatives-list.demo.client"

export const demo = <RankedAlternativesListDemo />

export const code = `import { RankedAlternativesList, type AdoptionRecord, type RankedAlternative } from "@/components/ranked-alternatives-list"

const alternatives: RankedAlternative[] = [
  {
    id: "loan-refinance",
    rank: 1,
    label: "정부지원 대환대출 연계",
    evidenceSummary: "정책자금 요건을 충족하는 차주로 분류되었습니다.",
    condition: "정책자금 한도 잔여 확인 후 신청.",
    riskLevel: "moderate",
    riskLabel: "관찰",
  },
  {
    id: "reduce-limit",
    rank: null,
    label: "한도 축소·조기 회수",
    evidenceSummary: "모형이 이 대안의 순위를 계산하지 못했습니다.",
    condition: "심사역 수동 판단 필요.",
    disabled: true,
    disabledReason: "정책자금 대상 차주는 우선순위 대안을 먼저 소진해야 합니다.",
  },
]

<RankedAlternativesList
  title="사후관리 조치 추천"
  alternatives={alternatives}
  adoptedId={adoptedId}
  history={history}
  onAdopt={(id, alternative) => appendAdoption(id, alternative)}
/>`

export const dos = [
  "순위는 모형이 계산한 값 그대로 전달한다 — 동점은 tied로, 순위를 매기지 못했으면 rank: null로 표현하고 컴포넌트가 임의로 순서를 매기지 않는다.",
  "채택은 상호배타 선택이 아니다 — onAdopt로 새 대안을 채택해도 나머지 대안은 목록에 남기고, history에 이전 채택 기록을 계속 누적해 판단 이력을 보존한다.",
  "대안에 위험 등급을 표시할 때는 riskLevel과 riskLabel을 함께 준다 — 등급 색은 hue 하나로만 구분되어 문구 없이 색만으로는 전달되지 않는다.",
]

export const donts = [
  "채택 시 나머지 대안을 목록에서 지우거나 history를 덮어쓰지 않는다 — 이력이 사라지면 S-08 환류 로그로 이어질 감사 근거가 끊긴다.",
  "여러 대안이 동점인데 화면상 순서로 우선순위가 있는 것처럼 보이게 하지 않는다 — tied를 주지 않으면 '2순위'가 하나뿐인 것처럼 오독된다.",
  "근거의 출처·검증 상태별로 단일 조치를 라디오로 고르는 화면이면 이 컴포넌트가 아니라 evidence-decision-panel을 쓴다 — 그쪽은 근거 중심 단일 선택이고, 이쪽은 서열이 있는 대안 목록에서 채택 이력을 누적하는 화면이다.",
]
