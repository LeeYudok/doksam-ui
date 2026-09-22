/** FAQ 탭의 목 데이터. */
export interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-account-role",
    category: "계정",
    question: "권한이 부족하다는 안내가 뜨는데 어떻게 하나요?",
    answer: "소속 부서장에게 역할(Role) 부여를 요청하세요. 승인되면 별도 재로그인 없이 5분 내 권한이 반영됩니다.",
  },
  {
    id: "faq-account-password",
    category: "계정",
    question: "비밀번호를 잊었습니다.",
    answer: "로그인 화면의 '비밀번호 재설정'에서 사내 메일로 재설정 링크를 받을 수 있습니다. 링크는 10분간 유효합니다.",
  },
  {
    id: "faq-data-refresh",
    category: "데이터",
    question: "화면의 수치가 실시간이 아닌 것 같아요.",
    answer: "대부분의 집계 화면은 5분 주기 배치로 갱신됩니다. 화면 상단의 '마지막 갱신' 시각을 확인하세요. 실시간이 필요하면 라이브 인디케이터가 있는 화면인지 먼저 확인합니다.",
  },
  {
    id: "faq-data-export",
    category: "데이터",
    question: "데이터를 외부로 내보내도 되나요?",
    answer: "개인정보·고객 식별정보가 포함된 표는 마스킹된 상태로만 내보내기가 허용됩니다. 원본이 필요하면 별도 반출 승인 절차를 거쳐야 합니다.",
  },
  {
    id: "faq-support-response",
    category: "지원",
    question: "질문을 올리면 답변까지 얼마나 걸리나요?",
    answer: "평균 1영업일 이내 답변됩니다. 질문 이력 탭에서 답변 상태(대기/완료)를 확인할 수 있습니다.",
  },
]
