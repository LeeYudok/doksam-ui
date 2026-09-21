import type { ContentItem } from "@/components/patterns/content-feed/content-feed"

export type { ContentItem }

/** 뉴스/문서 등 특정 도메인에 묶이지 않는 제네릭 콘텐츠 목록 — 사내 문서/가이드를 예시로 든다. */
export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "1",
    title: "온보딩 체크리스트 작성 가이드",
    category: "가이드",
    author: "김도현",
    updatedAt: "2026-07-02",
    summary: "신규 합류자가 첫 주에 완료해야 할 항목을 단계별로 정리합니다.",
  },
  {
    id: "2",
    title: "릴리스 노트 자동화 파이프라인",
    category: "릴리스",
    author: "이서연",
    updatedAt: "2026-06-28",
    summary: "태그 푸시 시 CHANGELOG를 자동 생성하는 CI 구성을 설명합니다.",
  },
  {
    id: "3",
    title: "디자인 토큰 네이밍 규칙",
    category: "가이드",
    author: "박지훈",
    updatedAt: "2026-06-20",
    summary: "색상·간격·타이포 토큰을 일관되게 명명하는 규칙입니다.",
  },
  {
    id: "4",
    title: "장애 대응 런북 v3",
    category: "운영",
    author: "최민아",
    updatedAt: "2026-06-15",
    summary: "서비스 장애 발생 시 1차 대응자가 따라야 할 절차입니다.",
  },
  {
    id: "5",
    title: "API 레이트리밋 정책",
    category: "운영",
    author: "정우성",
    updatedAt: "2026-06-10",
    summary: "엔드포인트별 호출 제한과 초과 시 처리 방식을 안내합니다.",
  },
  {
    id: "6",
    title: "v2.4 릴리스 하이라이트",
    category: "릴리스",
    author: "이서연",
    updatedAt: "2026-06-01",
    summary: "이번 릴리스의 주요 변경점과 마이그레이션 가이드입니다.",
  },
]
