import { PartyIdentityCell } from "@/components/party-identity-cell"

export const demo = (
  <div className="flex flex-col gap-4">
    <PartyIdentityCell name="(주)대한정밀기계" industry="기계제조" corpType="법인" bizNo="1048112345" />
    <PartyIdentityCell
      name="(주)대한정밀기계"
      industry="기계제조"
      corpType="법인"
      bizNo="1048112345"
      masked={false}
      density="compact"
    />
  </div>
)

export const code = `<PartyIdentityCell
  name="(주)대한정밀기계"
  industry="기계제조"
  corpType="법인"
  bizNo="1048112345"
/>

{/* 권한 있는 사용자에게 전체 노출 + 테이블 셀용 compact */}
<PartyIdentityCell
  name="(주)대한정밀기계"
  industry="기계제조"
  corpType="법인"
  bizNo="1048112345"
  masked={false}
  density="compact"
/>`

export const dos = [
  "테이블 셀에는 density=\"compact\", 상세 헤더처럼 여백이 있는 자리에는 기본값(default)을 쓴다.",
  "전체 사업자번호 노출이 필요한 화면(상세·권한 있는 사용자)에서만 masked={false}로 명시적으로 끈다 — 기본은 마스킹이다.",
  "사업자번호 포맷은 이 컴포넌트가 formatBizNo(#8)를 호출해 처리하므로 미리 포맷하지 않은 원본 문자열을 그대로 bizNo에 넘긴다.",
]

export const donts = [
  "masked 값을 저장·전송용 상태와 섞지 않는다 — 이 prop은 화면 표시만 바꾸고 원본 데이터에는 영향이 없다.",
  "업종·법인구분·사업자번호 순서를 컴포넌트 밖에서 다시 조합하지 않는다 — 순서는 2행 메타 정보의 고정 규약이다.",
]
