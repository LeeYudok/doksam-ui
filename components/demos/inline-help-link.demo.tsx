import { TooltipProvider } from "@/components/ui/tooltip"

import { InlineHelpLinkDemo } from "./inline-help-link.demo.client"

export const demo = (
  <TooltipProvider>
    <InlineHelpLinkDemo />
  </TooltipProvider>
)

export const code = `<div className="flex items-center gap-1.5">
  <h2 className="text-lg font-semibold">여신 한도 산정</h2>
  <InlineHelpLink label="여신 한도 산정 방식 보기" onOpen={() => openHelp("credit-limit")} />
</div>

<div className="flex items-center gap-1.5">
  <h2 className="text-lg font-semibold">담보 평가 이력</h2>
  <InlineHelpLink label="담보 평가 이력 사용법 문서로 이동" href="/help/collateral-history" />
</div>`

export const dos = [
  "섹션 제목(h2) 바로 옆, 같은 baseline 위에 배치한다 — 어느 섹션의 도움말인지 시각적으로 붙인다.",
  "label 에 섹션 이름을 반복해 '무엇의 사용법인지' 담는다 — 툴팁·aria-label·title 세 곳에 그대로 쓰인다.",
  "화면 전체가 아니라 지금 보이는 섹션 하나의 사용법만 가리킬 때 쓴다.",
]

export const donts = [
  "화면 제목 옆 (?) 버튼 자리에 대신 쓰지 않는다 — 화면 전체 매뉴얼은 ScreenHelpDialog 몫이고, 이 컴포넌트는 섹션 단위다. 한 화면에 섹션이 하나뿐이라도 화면 헤더 자리는 ScreenHelpDialog 가 소유한다.",
  "href 와 onOpen 을 동시에 주지 않는다 — 이동인지 열기인지 하나로 고정해야 클릭 결과가 예측 가능하다.",
  "아이콘만으로 충분하다고 label 을 생략하지 않는다 — 라벨 없는 아이콘 단독이라 접근 가능한 이름이 없으면 스크린리더에서 의미가 사라진다.",
]
