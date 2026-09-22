/** 질문 이력 탭의 목 데이터 — 표가 아니라 시간순 목록으로 보여준다(#100). */
export type QuestionStatus = "answered" | "pending"

export interface QuestionHistoryItem {
  id: string
  question: string
  /** 표시용 시각 문자열 — new Date() 로 내부에서 읽지 않는다(hydration). */
  askedAt: string
  status: QuestionStatus
  answer?: string
}

export const QUESTION_HISTORY: QuestionHistoryItem[] = [
  {
    id: "q-1",
    question: "여신 심사 화면에서 반려 사유는 어디서 확인하나요?",
    askedAt: "2026-09-19 09:12",
    status: "answered",
    answer: "심사 결과 카드의 '반려 사유' 배지를 누르면 근거 조항과 감사 코드가 함께 열립니다. 매뉴얼 색인의 '반려 사유 확인하는 법' 항목도 참고하세요.",
  },
  {
    id: "q-2",
    question: "정기 리포트 발송을 일시중지하려면 어디서 하나요?",
    askedAt: "2026-09-18 16:40",
    status: "answered",
    answer: "리포트 설정 화면의 예약 카드에서 일시중지 토글을 끄면 됩니다. 다시 켜면 다음 예정 시각부터 재개됩니다.",
  },
  {
    id: "q-3",
    question: "컴플라이언스 배너의 처리 기한을 놓치면 어떤 일이 생기나요?",
    askedAt: "2026-09-17 11:05",
    status: "pending",
  },
  {
    id: "q-4",
    question: "권한 신청 승인이 5분이 지나도 반영되지 않습니다.",
    askedAt: "2026-09-15 14:22",
    status: "pending",
  },
]
