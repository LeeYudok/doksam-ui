import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr"

/** 증상 ▶ 대응 한 행. */
export interface TroubleRow {
  symptom: string
  where: string
}

export interface TroubleTableData {
  rows: TroubleRow[]
}

/**
 * 증상 ▶ 대응 대응표 — 왼쪽 증상, 가운데 화살표, 오른쪽 확인 지점의 3열 매트릭스.
 * "문제 생겼을 때 어디부터 보라"를 빠르게 훑게 하는 트러블슈팅 패턴. 모바일(sm 미만)에선
 * 화살표를 숨기고 세로로 스택한다.
 */
export function TroubleTable({ rows }: Readonly<TroubleTableData>) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          key={row.symptom}
          className="grid grid-cols-[1fr_auto_1.2fr] items-center gap-3 rounded-md border border-border px-4 py-3 max-sm:grid-cols-1 max-sm:gap-1"
        >
          <span className="text-sm font-medium">{row.symptom}</span>
          <CaretRightIcon
            aria-hidden
            size={16}
            weight="bold"
            className="text-muted-foreground max-sm:hidden"
          />
          <span className="text-sm font-medium text-primary max-sm:text-muted-foreground sm:text-right">
            {row.where}
          </span>
        </div>
      ))}
    </div>
  )
}
