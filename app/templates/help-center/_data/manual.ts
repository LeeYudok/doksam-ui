/** 매뉴얼 색인 탭의 목 데이터 — 화면(카테고리)별 기능 문서 트리. */
export interface ManualEntry {
  id: string
  title: string
  /** 이 항목이 속한 화면 이름(디테일 패널 상단 배지용). */
  screen: string
  body: string
}

export interface ManualCategory {
  id: string
  label: string
  entries: ManualEntry[]
}

export const MANUAL_CATEGORIES: ManualCategory[] = [
  {
    id: "underwriting",
    label: "여신 심사",
    entries: [
      {
        id: "underwriting-reject-reason",
        title: "반려 사유 확인하는 법",
        screen: "여신 심사 상세",
        body: "심사 결과 카드의 '반려 사유' 배지를 누르면 근거가 된 내규 조항과 감사 코드(Audit Code)가 함께 열립니다. 감사 코드를 복사해 이력서에 남길 수 있습니다.",
      },
      {
        id: "underwriting-risk-grade",
        title: "리스크 등급 배지 읽는 법",
        screen: "여신 심사 상세",
        body: "등급 배지는 색만으로 위험도를 구분하지 않습니다. 등급 문자(A~E)와 아이콘이 함께 표시되어 색약 사용자도 구분할 수 있습니다.",
      },
      {
        id: "underwriting-audit-code",
        title: "감사 코드로 판단 근거 추적하기",
        screen: "여신 심사 상세",
        body: "감사 코드를 누르면 그 판단이 어떤 규칙·모델 버전에서 나왔는지 상세 화면으로 이동합니다. 복사 아이콘으로 코드만 따로 복사할 수도 있습니다.",
      },
    ],
  },
  {
    id: "compliance",
    label: "컴플라이언스",
    entries: [
      {
        id: "compliance-callout",
        title: "규정 안내 배너가 뜨는 조건",
        screen: "컴플라이언스 점검",
        body: "notice/warning/critical 3단계로 표시되며, critical 은 처리를 막는 필수 조치가 있을 때만 뜹니다. 배너의 '조치' 버튼을 누르면 해당 조항 원문으로 이동합니다.",
      },
      {
        id: "compliance-due-date",
        title: "처리 기한 표시 방식",
        screen: "컴플라이언스 점검",
        body: "기한이 임박하면(3일 이내) 카운트다운 배지가 경고 색으로 바뀝니다. 기한을 넘기면 배지 텍스트가 '기한 초과'로 바뀌고 담당자에게 알림이 갑니다.",
      },
    ],
  },
  {
    id: "reports",
    label: "리포트",
    entries: [
      {
        id: "reports-export",
        title: "리포트 내보내기",
        screen: "리포트 목록",
        body: "표 우측 상단의 내보내기 버튼으로 현재 필터가 적용된 목록만 CSV 로 받을 수 있습니다. 전체 데이터가 필요하면 필터를 먼저 초기화하세요.",
      },
      {
        id: "reports-schedule",
        title: "정기 발송 예약하기",
        screen: "리포트 설정",
        body: "리포트 설정에서 발송 주기(매일/매주/매월)와 수신자를 지정하면 지정 시각에 자동 발송됩니다. 예약은 언제든 일시중지할 수 있습니다.",
      },
    ],
  },
]
