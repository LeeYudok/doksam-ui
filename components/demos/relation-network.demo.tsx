import { RelationNetwork, type RelationGroup, type RelationNode } from "@/components/relation-network"

const groups: RelationGroup[] = [
  { key: "out-invest", label: "출자한 회사", color: "var(--chart-1)" },
  { key: "out-shareholder", label: "주요 주주", color: "var(--chart-2)" },
  { key: "in-invest", label: "이 회사에 출자", color: "var(--chart-3)" },
  { key: "in-shareholder", label: "이 회사가 주주", color: "var(--chart-4)" },
]

const nodes: RelationNode[] = [
  { id: "1", label: "FADU Technology Incorporated", group: "out-invest", weight: 100 },
  { id: "2", label: "차이나크리스탈신소재홀딩스", group: "out-invest", weight: 52, href: "#" },
  { id: "3", label: "EEUM", group: "out-invest", weight: 75.9 },
  { id: "4", label: "에코프로비엠", group: "out-invest", weight: 12, href: "#" },
  { id: "5", label: "Chelsio Communications", group: "out-invest", weight: 4 },
  { id: "6", label: "남이현", group: "out-shareholder", weight: 11.7 },
  { id: "7", label: "이지효", group: "out-shareholder", weight: 9.04 },
  { id: "8", label: "KB자산운용", group: "out-shareholder", weight: 5.2, href: "#" },
  { id: "9", label: "주식회사 모레", group: "in-shareholder", weight: 8, href: "#" },
  { id: "10", label: "포레스트파트너스", group: "in-invest", weight: 2.4, href: "#" },
]

export const demo = (
  <RelationNetwork nodes={nodes} groups={groups} centerLabel="이 회사" />
)

export const code = `import { RelationNetwork, type RelationGroup, type RelationNode } from "@/components/relation-network"

const groups: RelationGroup[] = [
  { key: "out-invest", label: "출자한 회사", color: "var(--chart-1)" },
  { key: "out-shareholder", label: "주요 주주", color: "var(--chart-2)" },
]

const nodes: RelationNode[] = [
  { id: "1", label: "FADU Technology Incorporated", group: "out-invest", weight: 100 },
  { id: "2", label: "에코프로비엠", group: "out-invest", weight: 12, href: "/biz/2" },
  { id: "6", label: "남이현", group: "out-shareholder", weight: 11.7 },
]

<RelationNetwork nodes={nodes} groups={groups} centerLabel="이 회사" />`

export const dos = [
  "weight(0~100)로 중요도를 넘긴다 — 값이 클수록 노드가 크고 안쪽에 놓여 시선을 끈다.",
  "계열 색은 groups로 주입한다 — 방향·종류 등 의미 단위로 색을 나누면 범례가 자동 생성된다.",
  "상세로 이동시킬 노드에만 href를 준다 — 없는 노드는 이름만 있는 leaf로 표시된다.",
]

export const donts = [
  "수십 개 노드를 한 번에 넣지 않는다 — maxNodes(기본 10)로 가중치 상위만 도식화하고 나머지는 목록으로 보완한다.",
  "구조 색(링·중심·텍스트)을 하드코딩하지 않는다 — 시맨틱 토큰을 쓰므로 테마·다크모드에 자동 대응한다.",
  "움직임에 민감한 맥락에서 강제로 animated를 끄지 않는다 — prefers-reduced-motion을 이미 존중한다.",
]
