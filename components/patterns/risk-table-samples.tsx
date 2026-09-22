import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import {
  RiskTable,
  RiskTableActions,
  RiskTableRowAction,
  type RiskTableColumn,
  type RiskTableSeverity,
} from "@/components/patterns/risk-table/risk-table"
import { AuditCodeTag } from "@/components/audit-code-tag"
import { ContributionMeter } from "@/components/contribution-meter"
import { DueCountdownBadge } from "@/components/due-countdown-badge"
import { PartyIdentityCell } from "@/components/party-identity-cell"
import { RiskGradeBadge } from "@/components/risk-grade-badge"
import { formatWon } from "@/lib/finance/format-won"
import type { RiskLevel } from "@/lib/risk-tokens"

/** 데모의 "오늘". 컴포넌트가 `new Date()` 를 읽으면 서버·클라이언트 렌더가 날짜 경계에서 갈린다. */
const AS_OF = "2026-09-22"

const GRADE_LABEL: Record<RiskLevel, string> = {
  low: "정상",
  moderate: "관찰",
  high: "주의",
  severe: "경보",
}

const GRADE_TIER: Record<RiskLevel, number> = { low: 1, moderate: 2, high: 3, severe: 4 }

function severityOf(level: RiskLevel): RiskTableSeverity {
  return { level, label: `위험등급 ${GRADE_LABEL[level]}` }
}

/* ── 샘플 1 · S-01 긴급 처리 필요 차주 ───────────────────────────────────── */

interface UrgentBorrower {
  id: string
  level: RiskLevel
  name: string
  industry: string
  corpType: string
  bizNo: string
  exposureWon: number
  contributionPercent: number
  contributionCode: string
  deadline: string
}

const URGENT_BORROWERS: UrgentBorrower[] = [
  {
    id: "B-1041",
    level: "severe",
    name: "대성정밀공업",
    industry: "기계부품 제조",
    corpType: "법인",
    bizNo: "1048112345",
    exposureWon: 4_820_000_000,
    contributionPercent: 41,
    contributionCode: "EVD-2026-0518",
    deadline: "2026-09-20",
  },
  {
    id: "B-2207",
    level: "high",
    name: "한별물류",
    industry: "육상 화물운송",
    corpType: "법인",
    bizNo: "2208145512",
    exposureWon: 1_260_000_000,
    contributionPercent: 28,
    contributionCode: "EVD-2026-0523",
    deadline: "2026-09-24",
  },
  {
    id: "B-3390",
    level: "moderate",
    name: "서린바이오텍",
    industry: "의약품 도매",
    corpType: "법인",
    bizNo: "3148633071",
    exposureWon: 640_000_000,
    contributionPercent: 12,
    contributionCode: "EVD-2026-0530",
    deadline: "2026-10-08",
  },
]

const URGENT_COLUMNS: RiskTableColumn<UrgentBorrower>[] = [
  {
    key: "grade",
    header: "등급",
    cell: (row) => (
      <RiskGradeBadge level={row.level} label={GRADE_LABEL[row.level]} tier={GRADE_TIER[row.level]} />
    ),
  },
  {
    key: "party",
    header: "차주",
    kind: "wrap",
    cell: (row) => (
      <PartyIdentityCell
        density="compact"
        name={row.name}
        industry={row.industry}
        corpType={row.corpType}
        bizNo={row.bizNo}
      />
    ),
  },
  { key: "exposure", header: "여신잔액", kind: "money", cell: (row) => formatWon(row.exposureWon) },
  {
    key: "contribution",
    header: "주요 기여요인",
    cell: (row) => (
      <ContributionMeter percent={row.contributionPercent} direction="increase" code={row.contributionCode} />
    ),
  },
  {
    key: "due",
    header: "조치 기한",
    cell: (row) => (
      <DueCountdownBadge
        deadline={row.deadline}
        asOf={AS_OF}
        labels={{ ahead: "D-{days}", soon: "D-{days} 임박", overdue: "D+{days} 경과" }}
      />
    ),
  },
  {
    key: "actions",
    header: "조치",
    kind: "actions",
    cell: () => (
      <RiskTableActions>
        <RiskTableRowAction>근거 보기</RiskTableRowAction>
        <RiskTableRowAction>조치 수립</RiskTableRowAction>
      </RiskTableActions>
    ),
  },
]

/* ── 샘플 2 · S-08 판단이력 로그 ─────────────────────────────────────────── */

interface DecisionLogEntry {
  id: string
  level?: RiskLevel
  at: string
  actor: string
  decision: string
  reason: string
  code: string
}

const DECISION_LOG: DecisionLogEntry[] = [
  {
    id: "L-9014",
    level: "severe",
    at: "2026-09-22 09:12:04.118",
    actor: "김선우 (여신심사)",
    decision: "등급 하향 확정",
    reason: "3분기 매출이 직전 분기 대비 38% 감소했고 어음 연체가 2건 발생해 모형 등급을 그대로 수용했습니다.",
    code: "AUD-2026-1142",
  },
  {
    id: "L-9008",
    level: "high",
    at: "2026-09-21 17:40:51.002",
    actor: "모형 자동판단",
    decision: "등급 하향 제안",
    reason: "현금흐름 지표가 임계선을 이틀 연속 밑돌아 재검토 대상으로 올렸습니다.",
    code: "AUD-2026-1139",
  },
  {
    id: "L-8997",
    at: "2026-09-19 11:03:22.640",
    actor: "박지훈 (센터장)",
    decision: "이의 반려",
    reason: "제출된 보완자료가 판단 근거를 뒤집지 못해 기존 등급을 유지했습니다.",
    code: "AUD-2026-1130",
  },
]

const DECISION_LOG_COLUMNS: RiskTableColumn<DecisionLogEntry>[] = [
  { key: "at", header: "일시", cell: (row) => <span className="font-mono text-xs">{row.at}</span> },
  {
    key: "decision",
    header: "판단",
    cell: (row) =>
      row.level ? (
        <RiskGradeBadge level={row.level} label={row.decision} />
      ) : (
        <span className="text-muted-foreground">{row.decision}</span>
      ),
  },
  { key: "reason", header: "사유", kind: "wrap", cell: (row) => row.reason },
  { key: "actor", header: "처리자", cell: (row) => row.actor },
  { key: "code", header: "감사코드", cell: (row) => <AuditCodeTag code={row.code} /> },
]

/* ── 샘플 3 · 빈 상태 ───────────────────────────────────────────────────── */

export const RISK_TABLE_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "S-01 긴급 처리 필요 차주",
    description:
      "등급 배지·차주 식별 셀·금액·기여도 게이지·기한 배지·행 액션을 모두 얹은 최대 구성입니다. 행 강조는 등급 컬럼과 같은 심각도를 쓰고, 정상 등급 행은 칠하지 않습니다.",
    demo: (
      <RiskTable
        caption="긴급 처리 필요 차주 3건"
        captionHidden
        columns={URGENT_COLUMNS}
        rows={URGENT_BORROWERS}
        getRowKey={(row) => row.id}
        getRowSeverity={(row) => severityOf(row.level)}
      />
    ),
    code: `const columns: RiskTableColumn<UrgentBorrower>[] = [
  { key: "grade", header: "등급", cell: (row) => <RiskGradeBadge level={row.level} label={GRADE_LABEL[row.level]} tier={GRADE_TIER[row.level]} /> },
  { key: "party", header: "차주", kind: "wrap", cell: (row) => <PartyIdentityCell density="compact" name={row.name} bizNo={row.bizNo} /> },
  { key: "exposure", header: "여신잔액", kind: "money", cell: (row) => formatWon(row.exposureWon) },
  { key: "contribution", header: "주요 기여요인", cell: (row) => <ContributionMeter percent={row.contributionPercent} direction="increase" code={row.contributionCode} /> },
  { key: "due", header: "조치 기한", cell: (row) => <DueCountdownBadge deadline={row.deadline} asOf={asOf} labels={DUE_LABELS} /> },
  {
    key: "actions",
    header: "조치",
    kind: "actions",
    cell: (row) => (
      <RiskTableActions>
        <RiskTableRowAction onClick={() => openEvidence(row.id)}>근거 보기</RiskTableRowAction>
        <RiskTableRowAction onClick={() => openPlan(row.id)}>조치 수립</RiskTableRowAction>
      </RiskTableActions>
    ),
  },
]

<RiskTable
  caption="긴급 처리 필요 차주 3건"
  captionHidden
  columns={columns}
  rows={rows}
  getRowKey={(row) => row.id}
  getRowSeverity={(row) => ({ level: row.level, label: \`위험등급 \${GRADE_LABEL[row.level]}\` })}
/>`,
    notes: [
      "getRowSeverity 의 label 은 sr-only 두 번째 채널이다. 그것만으로 접근성이 끝나지 않는다 — 보이는 등급 배지 컬럼이 같은 행에 반드시 있어야 한다. 행 tint 는 hue 하나로만 등급을 구분하므로 색각 이상 사용자에게는 전달되지 않는다.",
      "행 강조는 '지금 손대야 하는 행'을 고르는 장치다. 전 행에 등급이 있어도 정상·관찰까지 칠하면 어느 행도 강조되지 않는다 — 주의 이상만 getRowSeverity 가 값을 돌려주게 두는 화면이 많다.",
      "금액은 kind=\"money\" 로만 만든다. 우측정렬·등폭을 셀마다 className 으로 다시 쓰면 표마다 자릿수 정렬이 어긋난다. 값 포맷은 formatWon 이 소유한다.",
      "행 액션은 RiskTableRowAction 하나로 수렴한다 — variant·size 를 열지 않은 것이 의도다. 행마다 버튼 모양이 갈리면 심각도 강조가 버튼에 묻힌다.",
      "셀 세로 패딩을 직접 주지 않는다. 밀도는 프로필의 data-density 층이 --cell-py 로 소유한다.",
    ],
  },
  {
    num: 2,
    title: "S-08 판단이력 로그",
    description:
      "같은 RiskTable 에 컬럼 구성만 바꾼 이력 테이블입니다. 금액·기여도·행 액션이 없고 긴 사유 문장이 줄바꿈되며, 심각도가 없는 행(사람 판단 기록)이 섞입니다.",
    demo: (
      <RiskTable
        caption="판단이력 로그"
        captionHidden
        columns={DECISION_LOG_COLUMNS}
        rows={DECISION_LOG}
        getRowKey={(row) => row.id}
        getRowSeverity={(row) => (row.level ? severityOf(row.level) : undefined)}
      />
    ),
    code: `const columns: RiskTableColumn<DecisionLogEntry>[] = [
  { key: "at", header: "일시", cell: (row) => <span className="font-mono text-xs">{row.at}</span> },
  { key: "decision", header: "판단", cell: (row) => (row.level ? <RiskGradeBadge level={row.level} label={row.decision} /> : <span className="text-muted-foreground">{row.decision}</span>) },
  { key: "reason", header: "사유", kind: "wrap", cell: (row) => row.reason },
  { key: "actor", header: "처리자", cell: (row) => row.actor },
  { key: "code", header: "감사코드", cell: (row) => <AuditCodeTag code={row.code} /> },
]

<RiskTable
  columns={columns}
  rows={log}
  getRowKey={(row) => row.id}
  getRowSeverity={(row) => (row.level ? { level: row.level, label: LEVEL_LABEL[row.level] } : undefined)}
/>`,
    notes: [
      "getRowSeverity 가 undefined 를 돌려준 행은 기본 표면으로 남는다 — 심각도가 없는 기록에 억지로 등급을 배정하지 않는다.",
      "긴 문장 컬럼만 kind=\"wrap\" 을 준다. 나머지는 줄바꿈 금지가 기본이라 일시·코드 같은 짧은 값이 두 줄로 쪼개지지 않는다.",
      "같은 패턴에 컬럼 배열만 갈아 끼운 구성이다. 한쪽 화면 전용 분기(prop)를 추가해야 한다면 컬럼 정의로 풀 수 있는지 먼저 본다.",
    ],
  },
  {
    num: 3,
    title: "빈 상태",
    description: "조치 대상이 없을 때. 표 골격(헤더)을 유지한 채 본문 한 줄로 알립니다.",
    demo: (
      <RiskTable
        caption="긴급 처리 필요 차주"
        captionHidden
        columns={URGENT_COLUMNS}
        rows={[]}
        getRowKey={(row) => row.id}
        emptyLabel="긴급 처리가 필요한 차주가 없습니다."
      />
    ),
    code: `<RiskTable
  columns={columns}
  rows={[]}
  getRowKey={(row) => row.id}
  emptyLabel="긴급 처리가 필요한 차주가 없습니다."
/>`,
    notes: [
      "emptyLabel 을 주면 헤더가 남아 어떤 표가 비었는지 읽힌다. 표 전체를 감추면 '조치 대상 없음'과 '아직 불러오지 못함'이 구분되지 않는다.",
      "로딩·에러 상태는 이 패턴이 맡지 않는다 — /patterns/state 표준을 표 바깥에서 쓴다.",
    ],
  },
]
