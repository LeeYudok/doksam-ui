/** Activity Feed 템플릿(#89) 로컬 placeholder 데이터 — 가상 플랫폼의 활동 스트림. */

export type EventKind = "deploy" | "alert" | "data" | "member"

export interface FeedFilter {
  id: EventKind | "all"
  label: string
}

export const FILTERS: FeedFilter[] = [
  { id: "all", label: "전체" },
  { id: "deploy", label: "배포" },
  { id: "alert", label: "알림" },
  { id: "data", label: "데이터" },
  { id: "member", label: "멤버" },
]

/** 뱃지 변형은 시맨틱 토큰 기반 variant 로만 고른다 — 팔레트 색을 직접 쓰지 않는다. */
export const KIND_VARIANT: Record<EventKind, "default" | "secondary" | "destructive" | "outline"> = {
  deploy: "default",
  alert: "destructive",
  data: "secondary",
  member: "outline",
}

export const KIND_LABEL: Record<EventKind, string> = {
  deploy: "배포",
  alert: "알림",
  data: "데이터",
  member: "멤버",
}

export interface FeedEvent {
  id: string
  kind: EventKind
  actor: string
  initials: string
  title: string
  detail: string
  at: string
  /** 그룹 헤딩으로 쓰는 날짜 버킷 — 피드는 시간이 1차 정렬축이다. */
  bucket: string
}

/**
 * 시간 역순(최신 → 과거)으로 정렬돼 있다. ActivityStream 은 입력 순서를 그대로
 * 렌더하므로 이 배열의 순서가 곧 화면 순서다 — 항목을 추가할 때 순서를 지킬 것.
 */
export const EVENTS: FeedEvent[] = [
  {
    id: "e-1",
    kind: "deploy",
    actor: "release-bot",
    initials: "RB",
    title: "collector v2.14.0 배포 완료",
    detail: "카나리 10% → 100% 승격까지 6분 12초. 롤백 없음.",
    at: "방금 전",
    bucket: "오늘",
  },
  {
    id: "e-2",
    kind: "alert",
    actor: "monitor",
    initials: "MO",
    title: "응답 지연 임계값 초과 (p95 1.8s)",
    detail: "internal-api 에서 3분간 지속. 자동 완화로 워커 2대가 추가됐습니다.",
    at: "12분 전",
    bucket: "오늘",
  },
  {
    id: "e-3",
    kind: "data",
    actor: "pipeline",
    initials: "PL",
    title: "일일 적재 12,480건 완료",
    detail: "전일 대비 +3.1%. 중복 제거로 제외된 건은 214건입니다.",
    at: "1시간 전",
    bucket: "오늘",
  },
  {
    id: "e-4",
    kind: "member",
    actor: "김주은",
    initials: "김주",
    title: "운영 대시보드 읽기 권한 부여",
    detail: "운영팀 3명에게 읽기 권한이 열렸습니다.",
    at: "3시간 전",
    bucket: "오늘",
  },
  {
    id: "e-5",
    kind: "deploy",
    actor: "release-bot",
    initials: "RB",
    title: "notifier v1.9.3 롤백",
    detail: "알림 중복 발송이 확인돼 직전 버전으로 되돌렸습니다.",
    at: "18:41",
    bucket: "어제",
  },
  {
    id: "e-6",
    kind: "data",
    actor: "pipeline",
    initials: "PL",
    title: "스키마 변경 감지 — 매퍼 수정 필요",
    detail: "수집원 한 곳의 응답 필드명이 바뀌어 해당 소스 파싱이 비었습니다.",
    at: "11:07",
    bucket: "어제",
  },
  {
    id: "e-7",
    kind: "alert",
    actor: "monitor",
    initials: "MO",
    title: "야간 배치 3건 실패",
    detail: "collector-krx 선행 실패로 후속 2건이 함께 넘어갔습니다. 04:00 자동 재시도 예정.",
    at: "02:14",
    bucket: "어제",
  },
  {
    id: "e-8",
    kind: "member",
    actor: "박서연",
    initials: "박서",
    title: "새 멤버 2명 합류",
    detail: "온보딩 체크리스트가 자동 생성됐습니다.",
    at: "09:20",
    bucket: "이번 주",
  },
  {
    id: "e-9",
    kind: "deploy",
    actor: "release-bot",
    initials: "RB",
    title: "gateway v3.2.0 배포 완료",
    detail: "무중단 리로드로 반영. 인증서 갱신도 함께 적용됐습니다.",
    at: "월요일",
    bucket: "이번 주",
  },
]

/** 스트림 상단 요약 — 피드는 지표 화면이 아니므로 3개를 넘기지 않는다. */
export interface FeedSummary {
  id: string
  label: string
  value: string
}

export const SUMMARY: FeedSummary[] = [
  { id: "today", label: "오늘 이벤트", value: "4건" },
  { id: "alerts", label: "미확인 알림", value: "2건" },
  { id: "deploys", label: "이번 주 배포", value: "3건" },
]
