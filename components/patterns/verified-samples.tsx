import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { TableHeaderDemo } from "@/components/patterns/verified/table-header-demo"
import { AutoDismissDemo } from "@/components/patterns/verified/auto-dismiss-demo"
import { GridAutocompleteDemo } from "@/components/patterns/verified/grid-autocomplete-demo"
import { ChipInputDemo } from "@/components/patterns/verified/chip-input-demo"

export const VERIFIED_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "테이블 헤더 전역 볼드",
    description: "모든 테이블의 thead th를 전역 규칙으로 볼드 처리해 헤더/본문을 일관되게 구분합니다.",
    demo: <TableHeaderDemo />,
    code: `/* app/globals.css @layer base */
thead th {
  @apply font-bold;
}

/* 컴포넌트에서는 font-bold를 개별로 붙일 필요가 없다 */
<TableHeader>
  <TableRow>
    <TableHead>플랜</TableHead>
    <TableHead className="text-right">가격</TableHead>
  </TableRow>
</TableHeader>`,
    notes: [
      "components/ui/table.tsx 는 화면 작업 중 손대지 않는 영역이라, 헤더 볼드는 app/globals.css @layer base의 전역 규칙으로만 통제한다.",
      "TableHead에 font-bold를 개별로 지정하지 않는다 — 전역 규칙과 중복/불일치 우려가 있다.",
      "규칙 문서(/rules 컴포넌트 섹션)에도 함께 반영되어 있다.",
    ],
  },
  {
    num: 2,
    title: "auto-dismiss 상태 메시지",
    description: "액션 직후 표시한 성공/실패 메시지를 useAutoDismiss 훅으로 일정 시간 후 자동으로 지웁니다.",
    demo: <AutoDismissDemo />,
    code: `const [submittedAt, setSubmittedAt] = useState<number | null>(null)
const showMessage = useAutoDismiss(submittedAt !== null, submittedAt)

<Button onClick={() => setSubmittedAt(Date.now())}>저장</Button>
{showMessage && <p>저장되었습니다.</p>}`,
    notes: [
      "key에는 클릭 시각처럼 액션마다 달라지는 값을 넣어, 연속 액션에도 타이머가 매번 재시작되게 한다.",
      "기본 지연은 4초(delayMs 인자로 조정 가능)이며, 언마운트/재호출 시 이전 타이머는 자동 정리된다.",
      "토스트 라이브러리 없이 인라인 메시지에도 적용할 수 있는 가벼운 패턴이다.",
    ],
  },
  {
    num: 3,
    title: "그리드 자동완성 + 카운트",
    description: "접두어 검색 결과를 2~3열 그리드 카드로 보여주고, 전체 건수 대비 표시 건수를 안내합니다.",
    demo: <GridAutocompleteDemo />,
    code: `const matches = scoped.filter((item) => item.code.includes(query))
const visible = matches.slice(0, 6)

<p className="text-xs text-muted-foreground">
  {\`전체 \${matches.length}건 중 \${visible.length}건 표시\${
    matches.length > visible.length ? " — 더 입력해 좁혀보세요" : ""
  }\`}
</p>
<div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">{/* 카드 버튼 */}</div>`,
    notes: [
      "결과가 많을 때는 상위 N건만 그리드로 보여주고, 카운트 라인으로 나머지 존재를 안내한다.",
      "필터 토글(예: 단종 포함)은 드롭다운 헤더에 나란히 둬 검색 범위를 즉시 넓힐 수 있게 한다.",
      "실제 서비스에서는 디바운스된 서버 쿼리로 교체하되, 카운트/그리드 레이아웃은 그대로 재사용한다.",
    ],
  },
  {
    num: 4,
    title: "칩 입력 폼",
    description: "입력값을 자동 포맷팅해 펜딩 칩으로 쌓고 한 번에 제출합니다. 붙여넣기 분할과 중복 사전검증을 포함합니다.",
    demo: <ChipInputDemo />,
    code: `function addByDigits(digits: string) {
  if (isDuplicate(digits, chips)) {
    setNotice({ tone: "destructive", text: "이미 추가된 번호입니다." })
    return
  }
  setChips((prev) => [...prev, formatPhoneTyping(digits)])
}

function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
  const tokens = splitTokens(e.clipboardData.getData("text"))
  if (tokens.length <= 1) return
  e.preventDefault()
  addBatch(tokens)
}`,
    notes: [
      "타이핑 중에도 자동 포맷팅(formatPhoneTyping 등)을 적용해 입력 즉시 최종 형태를 보여준다.",
      "붙여넣기로 여러 값이 들어오면 줄바꿈/쉼표/공백 기준으로 분할해 한 번에 칩으로 변환한다.",
      "칩 추가 전 중복을 사전 검증해, 제출 시점이 아니라 입력 시점에 바로 피드백한다.",
    ],
  },
]
