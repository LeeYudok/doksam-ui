import { ContributionMeter } from "@/components/contribution-meter"

export const demo = (
  <div className="flex flex-col gap-2">
    <ContributionMeter percent={34} direction="increase" code="EVD-2025-0518" />
    <ContributionMeter percent={21} direction="decrease" code="TAX-DELINQ-01" />
    <ContributionMeter percent={9} direction="increase" code="BIO-AUDIT-44" />
    {/* 0% 경계값 — 게이지·숫자 모두 사라지지 않고 그대로 표기된다 */}
    <ContributionMeter percent={0} direction="decrease" code="EVD-2025-0519" />
    {/* 방향 없이 중립으로만 쓰는 자리 */}
    <ContributionMeter percent={12} />
  </div>
)

export const code = `{/* 위험을 올리는 요인 */}
<ContributionMeter percent={34} direction="increase" code="EVD-2025-0518" />

{/* 위험을 내리는 요인 */}
<ContributionMeter percent={21} direction="decrease" code="TAX-DELINQ-01" />

{/* 0% 경계값도 게이지·숫자가 그대로 남는다 */}
<ContributionMeter percent={0} direction="decrease" code="EVD-2025-0519" />

{/* 방향이 의미 없는 자리는 direction을 생략 — 중립 색으로 렌더된다 */}
<ContributionMeter percent={12} />

{/* 근거 문서로 이동 */}
<ContributionMeter percent={34} direction="increase" code="EVD-2025-0518" onNavigate={() => router.push("/evidence/EVD-2025-0518")} />`

export const dos = [
  "기여 변수 랭킹처럼 위험 상승/하락 요인이 한 목록에 섞일 때 direction을 준다 — 색(--gain/--loss)과 아이콘 모양(TrendUp/TrendDown)이 함께 바뀌어 색각 이상 사용자에게도 방향이 전달된다.",
  "게이지는 Progress 프리미티브를 그대로 쓴다 — 새 바를 Tailwind로 다시 그리지 않는다.",
  "근거 문서로 이동하는 화면에서만 onNavigate를 준다. 목록에 촘촘히 나열될 때는 copyable을 켜지 않는다(AuditCodeTag와 같은 기준).",
]

export const donts = [
  "위험 등급(RiskGradeBadge, --risk-*)과 방향 색을 섞어 쓰지 않는다 — 등급은 4단 순서 있는 심각도, 이 컴포넌트의 방향은 2진 상승/하락으로 축이 다르다.",
  "direction 없이도 색만으로 방향을 암시하는 문구(className 등)를 임의로 얹지 않는다 — 방향이 없으면 중립으로 두고, 방향이 있으면 항상 direction prop으로 명시한다.",
]
