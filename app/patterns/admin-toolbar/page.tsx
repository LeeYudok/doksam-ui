import { Badge } from "@/components/ui/badge"

import { PatternSection } from "../stock/_components/pattern-section"
import { AdminGenToolbarDemo, AdminToolbarDemo, DataTransferDemo } from "./_components/toolbar-demos"

const TRANSFER_CODE = `<DataTransferButtons
  onExport={() => downloadJson()}
  onImport={async (file) => importJson(file)} />
{/* 모바일: 아이콘만(duotone) · sm+: 아이콘+텍스트. 숨김 file input 은 컴포넌트가 소유 */}`

const TOOLBAR_CODE = `<AdminToolbar
  onExport={…} onImport={…}
  onTest={runSelfCheck} testing={testing}
  onReset={resetTable} resetting={resetting}>
  <Button size="sm" variant="ghost">캐시 갱신</Button>  {/* children 슬롯 */}
</AdminToolbar>
{/* 초기화는 window.confirm 대신 AlertDialog 로 확인 */}`

const GEN_CODE = `<AdminGenToolbar
  genCount={count} onChangeGenCount={setCount}   {/* ±1 / ±1000 스피너 */}
  generating={generating} onGenerate={generate}
  onExport={…} onImport={…}
  onDeleteAll={deleteAll} deleting={deleting} />`

export default function AdminToolbarPatternsPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          금융 도메인
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">관리자 툴바 패턴</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          srope 관리자 화면의 데이터 운영 툴바(customs)를 doksam-ui 표준으로 재작성한 모음입니다. #56 이후 번호는
          원본 UI 표준 문서(50샘플) 밖의 커스텀 컴포넌트 확장 번호입니다. 파괴적 액션 확인은 브라우저
          confirm() 대신 AlertDialog 로 처리합니다.
        </p>
      </section>

      <PatternSection
        num={56}
        title="데이터 전송 버튼"
        desc="JSON 내보내기/가져오기 공용 버튼 — 숨김 file input + 업로드 진행 상태."
        code={TRANSFER_CODE}
        usage={[
          "아이콘 색: 내보내기=chart-1, 가져오기=warning — duotone weight 로 채도를 낮춘다.",
          "모바일(<sm)은 아이콘만 노출하고 title 속성으로 라벨을 보존한다.",
          "업로드 완료/실패와 무관하게 file input 값을 비워 같은 파일 재선택을 허용한다.",
        ]}
      >
        <DataTransferDemo />
      </PatternSection>

      <PatternSection
        num={57}
        title="관리자 툴바"
        desc="내보내기/가져오기 + 기능확인 + 데이터 초기화(AlertDialog 확인) + 추가 버튼 슬롯."
        code={TOOLBAR_CODE}
        usage={[
          "초기화 같은 파괴적 액션은 AlertDialog 로 의도를 확인받고 나서 실행한다.",
          "진행 상태(testing/resetting)는 버튼 라벨과 disabled 로 동시에 표현한다.",
          "children 슬롯은 세로 구분선 뒤에 붙어 페이지별 커스텀 버튼을 수용한다.",
        ]}
      >
        <AdminToolbarDemo />
      </PatternSection>

      <PatternSection
        num={58}
        title="더미 생성 툴바"
        desc="건수 스피너(±1/±1000) + 랜덤 생성 + JSON 전송 + 전체삭제."
        code={GEN_CODE}
        usage={[
          "건수는 1~100,000 범위로 클램프하고 font-mono + aria-live 로 변경을 알린다.",
          "생성=success 톤, 전체삭제=destructive variant 로 위험도를 구분한다.",
          "좁은 화면에선 overflow-x-auto 로 가로 스크롤을 허용해 버튼을 줄이지 않는다.",
        ]}
      >
        <AdminGenToolbarDemo />
      </PatternSection>
    </div>
  )
}
