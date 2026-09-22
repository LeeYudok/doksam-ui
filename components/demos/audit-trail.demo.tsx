import { AuditTrail, type AuditTrailEntry } from "@/components/audit-trail"

const ENTRIES: AuditTrailEntry[] = [
  {
    id: "1",
    timestamp: "2026-09-22 09:14:02",
    actor: { type: "model", name: "EWS-Scoring v3.2" },
    action: "위험등급 산출",
    target: "차주 A-1042",
    code: "EVD-2026-0918",
  },
  {
    id: "2",
    timestamp: "2026-09-22 09:15:40",
    actor: { type: "human", name: "김민지 심사역" },
    action: "위험등급 확인",
    target: "차주 A-1042",
    code: "EVD-2026-0918",
  },
  {
    id: "3",
    timestamp: "2026-09-22 09:20:11",
    actor: { type: "system", name: "야간 배치" },
    action: "재무제표 자동 수집",
    target: "차주 A-1042",
    code: "TAX-2026-0917",
  },
  {
    id: "4",
    timestamp: "2026-09-21 18:02:55",
    actor: { type: "model", name: "EWS-Scoring v3.2" },
    action: "기여 변수 재계산",
    target: "차주 A-1042",
    code: "EVD-2026-0915",
  },
  {
    id: "5",
    timestamp: "2026-09-21 09:03:19",
    actor: { type: "human", name: "박도현 팀장" },
    action: "등급 예외 승인",
    target: "차주 A-1042",
    code: "EVD-2026-0910",
  },
  {
    id: "6",
    timestamp: "2026-09-20 14:11:07",
    actor: { type: "system", name: "정기 배치" },
    action: "감사 로그 아카이빙",
    target: "차주 A-1042",
  },
  {
    id: "7",
    timestamp: "2026-09-18 11:40:29",
    actor: { type: "model", name: "EWS-Scoring v3.1" },
    action: "최초 위험등급 산출",
    target: "차주 A-1042",
    code: "EVD-2026-0902",
  },
]

export const demo = <AuditTrail entries={ENTRIES} />

export const code = `const entries: AuditTrailEntry[] = [
  {
    id: "1",
    timestamp: "2026-09-22 09:14:02",
    actor: { type: "model", name: "EWS-Scoring v3.2" },
    action: "위험등급 산출",
    target: "차주 A-1042",
    code: "EVD-2026-0918",
  },
  {
    id: "2",
    timestamp: "2026-09-22 09:15:40",
    actor: { type: "human", name: "김민지 심사역" },
    action: "위험등급 확인",
    target: "차주 A-1042",
    code: "EVD-2026-0918",
  },
  // ...
]

<AuditTrail entries={entries} visibleCount={5} />`

export const dos = [
  "AI 판단과 사람 확인이 이어지는 화면(EWS 등)에서 actor.type 을 반드시 채운다 — 아이콘(User/Desktop/Robot)과 라벨이 색 없이도 주체를 구분시킨다.",
  "시각은 호출부에서 `YYYY-MM-DD HH:MM:SS` 로 이미 포맷한 문자열을 넘긴다 — 컴포넌트가 내부에서 `new Date()` 를 읽지 않으므로 서버/클라 렌더가 어긋나지 않는다.",
  "판단 근거가 있는 항목마다 code 를 채운다 — AuditCodeTag(#83) 가 그대로 근거 문서 이동/복사를 담당한다.",
]

export const donts = [
  "일반 활동 로그(가입·댓글·결제 상태 변경 등)에는 쓰지 않는다 — 구조가 감사 업무(시각+주체+행위+대상+코드) 전용이라 그 외 목록에는 `timeline` 패턴을 쓴다.",
  "주체 구분을 색으로만 시도하지 않는다(예: className 으로 human 만 강조) — actor.type 이 없으면 라벨/아이콘 자체가 비어 색맹 사용자에게 정보가 전달되지 않는다.",
  "visibleCount 를 넘는 항목을 조건부로 렌더에서 아예 빼지 않는다 — 인쇄 시 전부 펼쳐져야 하므로 DOM 에는 항상 남기고 CSS 로만 접는다.",
]
