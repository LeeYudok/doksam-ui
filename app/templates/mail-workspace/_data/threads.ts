/** Mail Workspace 템플릿(#89) 로컬 placeholder 데이터 — 가상 조직의 운영 메일함. */

export interface MailFolder {
  id: string
  label: string
  count: number
}

export const FOLDERS: MailFolder[] = [
  { id: "inbox", label: "받은 메일함", count: 6 },
  { id: "flagged", label: "중요 표시", count: 2 },
  { id: "sent", label: "보낸 메일함", count: 2 },
  { id: "archive", label: "보관함", count: 2 },
]

/** 폴더별 목록 필터 — 레일에 표시하는 count 와 같은 기준을 쓴다. */
export const FOLDER_FILTERS: Record<string, (message: MailMessage) => boolean> = {
  inbox: (message) => message.folder === "inbox",
  flagged: (message) => message.flagged,
  sent: (message) => message.folder === "sent",
  archive: (message) => message.folder === "archive",
}

export interface MailMessage {
  id: string
  sender: string
  initials: string
  subject: string
  preview: string
  body: string[]
  receivedAt: string
  unread: boolean
  flagged: boolean
  labels: string[]
  /** 이 메일이 속한 폴더 — flagged 는 폴더가 아니라 가로지르는 표시다. */
  folder: "inbox" | "sent" | "archive"
}

/** 가상 발신자·가상 내용. 실제 조직·인물과 무관하다. */
export const THREADS: MailMessage[] = [
  {
    id: "m-1",
    sender: "배포 파이프라인",
    initials: "배포",
    subject: "야간 배치 3건 실패 — 재시도 대기",
    preview: "collector-krx, collector-dart, notifier 순으로 실패했습니다.",
    body: [
      "02:10 KST 시작한 야간 배치에서 3개 잡이 연속 실패했습니다. 첫 실패는 collector-krx 이고, 뒤이은 두 잡은 선행 산출물이 없어 함께 넘어갔습니다.",
      "재시도는 04:00 에 자동으로 한 번 더 걸립니다. 그 전에 원인을 확인하려면 실행 이력에서 run-2481 로그를 보세요.",
      "이 메일은 doksam-ui 템플릿의 로컬 placeholder 입니다.",
    ],
    receivedAt: "02:14",
    unread: true,
    flagged: true,
    folder: "inbox",
    labels: ["운영", "장애"],
  },
  {
    id: "m-2",
    sender: "김주은",
    initials: "김주",
    subject: "주간 리포트 초안 검토 부탁드립니다",
    preview: "지표 정의가 지난주와 달라진 부분만 표시해 두었습니다.",
    body: [
      "주간 리포트 초안을 정리했습니다. 지난주 대비 지표 정의가 바뀐 항목은 본문에 표시해 두었으니 그 부분만 확인해 주시면 됩니다.",
      "금요일 오전까지 회신 주시면 배포 전에 반영하겠습니다.",
    ],
    receivedAt: "09:32",
    unread: true,
    flagged: false,
    folder: "inbox",
    labels: ["리포트"],
  },
  {
    id: "m-3",
    sender: "보안 알림",
    initials: "보안",
    subject: "만료 예정 인증서 2건 (14일 이내)",
    preview: "gateway, internal-api 인증서가 곧 만료됩니다.",
    body: [
      "gateway 와 internal-api 의 TLS 인증서가 각각 9일·13일 뒤 만료됩니다. 갱신 절차는 운영 위키의 인증서 문서를 따르세요.",
      "갱신 후에는 두 서비스 모두 무중단 리로드로 반영됩니다.",
    ],
    receivedAt: "어제",
    unread: false,
    flagged: true,
    folder: "inbox",
    labels: ["보안"],
  },
  {
    id: "m-4",
    sender: "이도현",
    initials: "이도",
    subject: "신규 대시보드 접근 권한 요청",
    preview: "운영팀 3명에게 읽기 권한을 열어주실 수 있을까요?",
    body: [
      "새로 올라간 운영 대시보드에 팀원 3명이 접근하지 못하고 있습니다. 읽기 권한만 있으면 충분합니다.",
      "필요하면 요청 티켓을 따로 열겠습니다.",
    ],
    receivedAt: "어제",
    unread: false,
    flagged: false,
    folder: "inbox",
    labels: ["요청"],
  },
  {
    id: "m-5",
    sender: "데이터 품질",
    initials: "품질",
    subject: "적재 건수 급감 감지 (전일 대비 -42%)",
    preview: "수집원 한 곳의 응답 스키마가 바뀐 것으로 보입니다.",
    body: [
      "전일 대비 적재 건수가 42% 줄었습니다. 표본을 보면 한 수집원의 응답 필드명이 바뀐 뒤부터 파싱이 비어 있습니다.",
      "매퍼 수정 전까지는 해당 수집원만 제외하고 돌리는 편이 안전합니다.",
    ],
    receivedAt: "2일 전",
    unread: false,
    flagged: false,
    folder: "inbox",
    labels: ["운영", "데이터"],
  },
  {
    id: "m-6",
    sender: "박서연",
    initials: "박서",
    subject: "다음 스프린트 범위 정리",
    preview: "이월 3건 + 신규 5건으로 잡았습니다.",
    body: [
      "다음 스프린트 범위를 이월 3건, 신규 5건으로 정리했습니다. 신규 중 두 건은 아직 설계가 열려 있어 착수 전에 한 번 더 이야기하면 좋겠습니다.",
    ],
    receivedAt: "3일 전",
    unread: false,
    flagged: false,
    folder: "inbox",
    labels: ["계획"],
  },
  {
    id: "m-7",
    sender: "나",
    initials: "나",
    subject: "Re: 신규 대시보드 접근 권한 요청",
    preview: "읽기 권한 열었습니다. 반영까지 10분 정도 걸립니다.",
    body: [
      "요청하신 3명에게 운영 대시보드 읽기 권한을 부여했습니다. 권한 캐시 때문에 반영까지 10분 정도 걸릴 수 있습니다.",
      "추가로 필요한 화면이 있으면 알려주세요.",
    ],
    receivedAt: "어제",
    unread: false,
    flagged: false,
    folder: "sent",
    labels: ["요청"],
  },
  {
    id: "m-8",
    sender: "나",
    initials: "나",
    subject: "인증서 갱신 일정 공유",
    preview: "다음 주 화요일 오전에 두 건 모두 갱신합니다.",
    body: ["gateway 와 internal-api 인증서를 다음 주 화요일 오전에 함께 갱신합니다. 무중단 리로드라 서비스 영향은 없습니다."],
    receivedAt: "2일 전",
    unread: false,
    flagged: false,
    folder: "sent",
    labels: ["보안"],
  },
  {
    id: "m-9",
    sender: "배포 파이프라인",
    initials: "배포",
    subject: "지난달 배포 요약",
    preview: "배포 41회, 롤백 2회, 평균 소요 7분 20초.",
    body: ["지난달 배포는 41회였고 그중 2회를 롤백했습니다. 평균 소요 시간은 7분 20초입니다."],
    receivedAt: "지난달",
    unread: false,
    flagged: false,
    folder: "archive",
    labels: ["운영"],
  },
  {
    id: "m-10",
    sender: "데이터 품질",
    initials: "품질",
    subject: "매퍼 수정 완료 — 적재 정상화",
    preview: "필드명 변경 반영 후 적재 건수가 회복됐습니다.",
    body: ["응답 필드명 변경을 매퍼에 반영했고, 다음 수집분부터 적재 건수가 이전 수준으로 회복됐습니다."],
    receivedAt: "지난달",
    unread: false,
    flagged: false,
    folder: "archive",
    labels: ["데이터"],
  },
]
