import { TroubleTable, type TroubleRow } from "@/components/patterns/concept-explainer/trouble-table"

/** /patterns/concept-explainer 데모용 — 도커 트러블슈팅 4행. */
export function TroubleTableDemo() {
  return <TroubleTable rows={TROUBLE_DEMO} />
}

const TROUBLE_DEMO: TroubleRow[] = [
  { symptom: "이미지 용량이 폭탄", where: "레이어 정리 / 멀티스테이지 빌드" },
  { symptom: "컨테이너 지우니 데이터 증발", where: "Volume" },
  { symptom: "localhost로 접속 안 됨", where: "포트 매핑 (-p)" },
  { symptom: "latest인데 왜 옛날 버전?", where: "이미지 태그 / 다시 pull" },
]
