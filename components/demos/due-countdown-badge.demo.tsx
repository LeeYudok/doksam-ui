import { DueCountdownBadge } from "@/components/due-countdown-badge"

const LABELS = {
  ahead: "기한 D-{days}",
  soon: "D-{days} 만료 임박",
  overdue: "D+{days} 경과",
}

// 데모는 서버·클라이언트에서 같은 값으로 렌더되어야 하므로 기준일을 고정한다.
const TODAY = "2026-09-22"

export const demo = (
  <div className="flex flex-wrap items-center gap-2">
    <DueCountdownBadge deadline="2026-10-05" asOf={TODAY} labels={LABELS} />
    <DueCountdownBadge deadline="2026-09-25" asOf={TODAY} labels={LABELS} />
    <DueCountdownBadge deadline="2026-09-22" asOf={TODAY} labels={LABELS} />
    <DueCountdownBadge deadline="2026-09-20" asOf={TODAY} labels={LABELS} />
    <DueCountdownBadge deadline="2026-09-25" asOf={TODAY} labels={LABELS} soonWithinDays={1} />
  </div>
)

export const code = `const LABELS = {
  ahead: "기한 D-{days}",
  soon: "D-{days} 만료 임박",
  overdue: "D+{days} 경과",
}

// 기준일은 호출측이 정한다 — 컴포넌트가 new Date()를 읽으면 hydration이 어긋난다.
const TODAY = "2026-09-22"

<DueCountdownBadge deadline="2026-10-05" asOf={TODAY} labels={LABELS} />
<DueCountdownBadge deadline="2026-09-25" asOf={TODAY} labels={LABELS} />
<DueCountdownBadge deadline="2026-09-22" asOf={TODAY} labels={LABELS} />
<DueCountdownBadge deadline="2026-09-20" asOf={TODAY} labels={LABELS} />

{/* 임박 임계값은 프로젝트가 정한다 — 1일로 좁히면 D-3은 다시 여유가 된다 */}
<DueCountdownBadge deadline="2026-09-25" asOf={TODAY} labels={LABELS} soonWithinDays={1} />`

export const dos = [
  "기준일(asOf)을 호출측에서 한 번 정해 넘긴다 — 컴포넌트가 현재 시각을 읽으면 서버·클라이언트 렌더가 날짜 경계에서 갈린다.",
  "임박 임계값(soonWithinDays)은 도메인에 맞춰 넘긴다. 기본 3일은 기본값일 뿐 표준이 아니다.",
  "문구는 labels로 주입한다 — 경과·이내·기한·만료 임박은 화면마다 다르고 번역 대상이다.",
]

export const donts = [
  "잔여일 계산을 화면 코드에서 다시 하지 않는다 — lib/due.ts의 resolveDue가 단일 진실원천이다(날짜 경계·서머타임 처리가 거기에 있다).",
  "여유 상태에까지 등급 색을 칠하지 않는다 — 목록 전체가 색으로 덮이면 임박·경과가 묻힌다.",
]
