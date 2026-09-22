/**
 * 사내 업무포털 로그인 템플릿의 목 데이터 — #101.
 *
 * focus-task 원형(카드 하나 = 과제 하나)은 그대로 지키되, 시스템 상태바·공지·보안
 * 고지처럼 다른 화면으로 이동시키지 않는 정보성 표시를 카드 위·아래에 둔다
 * (archetypes/index.ts focus-task 의 경계 조정 참고).
 */

/** 상단 시스템 상태바 — 운영 상태와 조회 기준 시각. */
export interface SystemStatus {
  /** 운영 상태 라벨. */
  label: string
  /** 환경 표기(운영계/개발계 등). */
  environment: string
  /**
   * 상태 조회 기준 시각(고정 문자열) — 컴포넌트가 `new Date()` 를 직접 읽지 않도록
   * 호출측이 한 번 정한 값을 그대로 넘긴다(서버·클라이언트 hydration 어긋남 방지).
   */
  asOf: string
}

export const SYSTEM_STATUS: SystemStatus = {
  label: "정상 운영 중",
  environment: "운영계 · PROD",
  asOf: "2026-09-22 09:41:00",
}

export interface PortalNotice {
  id: string
  title: string
  postedAt: string
  /** 정기 점검처럼 최상단에 고정할 공지. */
  pinned?: boolean
}

export const NOTICES: PortalNotice[] = [
  {
    id: "n1",
    title: "9/24(목) 02:00~03:00 정기 점검 — 해당 시간대에는 접속이 제한됩니다.",
    postedAt: "2026-09-20",
    pinned: true,
  },
  {
    id: "n2",
    title: "여신 조기경보 화면 UI 개편 안내",
    postedAt: "2026-09-18",
  },
  {
    id: "n3",
    title: "보안 정책 개정에 따른 비밀번호 규칙 변경 안내",
    postedAt: "2026-09-15",
  },
]

/**
 * 하단 보안 고지 — 장식이 아니라 법적 문구가 실제로 들어가는 자리다. 길이가 늘어나도
 * 로그인 카드가 접히지 않도록 카드와 독립된 블록으로 둔다(플로우상 하단에 위치).
 */
export const SECURITY_NOTICE =
  "이 시스템은 사내 업무 목적으로만 사용해야 합니다. 모든 접속·조회·변경 기록은 관련 법령과 사내 보안 정책에 따라 " +
  "저장·모니터링되며, 무단 접근이나 권한 밖 정보 열람이 확인되면 관련 규정에 따라 책임을 물을 수 있습니다. " +
  "공용 PC 사용 후에는 반드시 로그아웃하십시오."

/**
 * 역할 분기 안내 — 담당자/심사역/관리자 분기는 로그인 후 서버가 판단한다. 화면에는
 * 선택 UI 를 두지 않고 안내 문구로만 드러낸다(#101 설계 결정, 카드 하나=과제 하나 유지).
 */
export const ROLE_ROUTING_NOTE =
  "로그인하면 사번 권한에 따라 담당자 · 심사역 · 관리자 화면 중 해당하는 곳으로 자동 이동합니다."

export const CERTIFICATE_HELP_NOTE = "사설인증서 로그인은 IT지원팀(내선 1544)에 등록을 요청하세요."

export const PASSWORD_RESET_NOTE = "비밀번호 재설정은 본인 확인 후 IT지원팀에서 처리합니다. 사번을 준비해 문의하세요."
