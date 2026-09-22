import { SirenIcon } from "@phosphor-icons/react/dist/ssr"

import { RiskGradeBadge } from "@/components/risk-grade-badge"

export const demo = (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <RiskGradeBadge level="low" label="정상" />
      <RiskGradeBadge level="moderate" label="관찰" />
      <RiskGradeBadge level="high" label="주의" />
      <RiskGradeBadge level="severe" label="경보" />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <RiskGradeBadge level="low" label="정상" tier={1} fill="solid" />
      <RiskGradeBadge level="moderate" label="관찰" tier={2} fill="solid" />
      <RiskGradeBadge level="high" label="주의" tier={3} fill="solid" />
      <RiskGradeBadge
        level="severe"
        tier={4}
        fill="solid"
        label={
          <>
            <SirenIcon weight="fill" />
            경보
          </>
        }
      />
    </div>
  </div>
)

export const code = `<RiskGradeBadge level="low" label="정상" />
<RiskGradeBadge level="moderate" label="관찰" />
<RiskGradeBadge level="high" label="주의" />
<RiskGradeBadge level="severe" label="경보" />

{/* 등급 번호를 함께 쓰는 자리 + 아이콘을 얹은 최고 등급 */}
<RiskGradeBadge level="low" label="정상" tier={1} fill="solid" />
<RiskGradeBadge level="moderate" label="관찰" tier={2} fill="solid" />
<RiskGradeBadge level="high" label="주의" tier={3} fill="solid" />
<RiskGradeBadge
  level="severe"
  tier={4}
  fill="solid"
  label={
    <>
      <SirenIcon weight="fill" />
      경보
    </>
  }
/>`

export const dos = [
  "순서 있는 심각도에만 쓴다 — 4단 등급을 success/warning/danger 3단(BadgeExtended)으로 접으면 관찰과 주의가 한 색이 된다.",
  "등급 문구(label)를 항상 싣는다. 등급 색은 hue 하나로만 갈라져 색각 이상 사용자에게는 차이가 전달되지 않는다.",
  "accent·secondary처럼 이미 틴트된 표면 위에서는 fill=\"solid\"를 쓴다 — tint를 겹치면 본문 대비 4.5:1이 깨진다(background·card·muted 위에서만 tint를 약속한다).",
]

export const donts = [
  "className으로 색을 덮어쓰거나 --chart-1~5를 등급 색으로 돌려쓰지 않는다 — chart는 순서가 아니라 범주 팔레트다.",
  "등급 이름을 컴포넌트가 고정한다고 가정하지 않는다 — 문구는 도메인·로케일마다 달라 주입 대상이다.",
]
