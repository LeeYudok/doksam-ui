import { ConceptCard, type ConceptCardData } from "@/components/patterns/concept-explainer/concept-card"

/** /patterns/concept-explainer 데모용 — 도커 개념 2종을 카드로 보여준다. */
export function ConceptCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CONCEPT_CARD_DEMO.map((card) => (
        <ConceptCard key={card.num} {...card} />
      ))}
    </div>
  )
}

const CONCEPT_CARD_DEMO: ConceptCardData[] = [
  {
    num: "01",
    title: "Image",
    equivalent: "≈ 냉동 밀키트",
    analogy: "손질·계량 다 끝난 재료 묶음 — 근데 아직 안 익혔어요",
    items: [
      { text: "레시피(Dockerfile)대로 docker build 하면 만들어진다" },
      { text: "여러 layer로 쌓이고, 안 바뀐 재료는 캐시로 재사용된다" },
      { text: "이미지 자체는 실행 상태가 아니다 — 냉동고에 든 상태일 뿐", warn: true },
    ],
  },
  {
    num: "02",
    title: "Container",
    equivalent: "≈ 데워서 접시에 담은 요리",
    analogy: "밀키트를 실제로 데우고 조리해 먹을 수 있게 된 상태",
    items: [
      { text: "docker run 하면 이미지가 컨테이너로 살아난다" },
      { text: "같은 이미지 하나로 컨테이너 여러 개를 띄울 수 있다" },
      { text: "컨테이너를 지우면 그 안에서 만든 건 다 증발한다 → Volume 필요", warn: true },
    ],
  },
]
