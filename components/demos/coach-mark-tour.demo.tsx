import { CoachMarkTourDemo } from "./coach-mark-tour.demo.client"

export const demo = <CoachMarkTourDemo />

export const code = `const searchRef = useRef<HTMLButtonElement>(null)
const alertRef = useRef<HTMLButtonElement>(null)
const chartRef = useRef<HTMLDivElement>(null)

const steps: CoachMarkStep[] = [
  { key: "search", targetRef: searchRef, title: "거래처 검색", description: "..." },
  { key: "alerts", targetRef: alertRef, title: "위험 알림", description: "..." },
  { key: "chart", targetRef: chartRef, title: "위험 추이", description: "...", side: "top" },
]

<CoachMarkTour steps={steps} open={open} onOpenChange={setOpen} />`

export const dos = [
  "대상은 항상 targetRef(DOM ref)로 가리킨다 — 클래스명·id 셀렉터 문자열은 리팩터에 조용히 깨진다.",
  "3~5단계로 짧게 끝낸다 — 신입 가이드처럼 한 화면 위에 덧씌우는 투어에 맞는 분량이다.",
  "설명은 그 영역이 '무엇을 해주는지'가 아니라 '언제 쓰는지'로 쓴다.",
]

export const donts = [
  "새 화면을 만들어 투어 전용으로 쓰지 않는다 — 기존 화면 위에 얹는 용도다.",
  "targetRef 가 가리키는 요소를 스텝 진행 중 조건부로 언마운트하지 않는다 — 하이라이트가 좌표를 잃는다.",
]
