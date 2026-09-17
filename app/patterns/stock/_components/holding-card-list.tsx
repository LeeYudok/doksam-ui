import { StarIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { rateColor, rateText } from "@/lib/finance/rate"
import { cn } from "@/lib/utils"

interface Holding {
  name: string
  code: string
  sector: string
  currentPrice: number
  returnRate: number
  buyPrice: number
  /** 매수비(%) — 임계값(60) 이상이면 destructive 배지. */
  buyRatio: number
  tracking: boolean
}

const HOLDINGS: Holding[] = [
  { name: "한빛반도체", code: "042700", sector: "반도체", currentPrice: 187_500, returnRate: 12.4, buyPrice: 166_800, buyRatio: 75, tracking: true },
  { name: "두리조선", code: "010140", sector: "조선", currentPrice: 21_350, returnRate: -3.2, buyPrice: 22_050, buyRatio: 48, tracking: false },
  { name: "가온바이오", code: "196170", sector: "바이오", currentPrice: 812_000, returnRate: 0, buyPrice: 812_000, buyRatio: 62, tracking: false },
]

/**
 * #29 보유 종목 카드 — 이름/코드/섹터 + 현재가 + 수익률 + 매수가 + 매수비 배지 + 우측 추적 액션.
 * dok3node customs/holding-card.tsx 이식 — indigo 하드코딩 테두리는 primary 토큰 틴트로 치환.
 */
export function HoldingCardList() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {HOLDINGS.map((h) => (
        <Card key={h.code} className="border-primary/30 bg-primary/5 py-0">
          <CardContent className="px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">{h.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {h.code} · {h.sector}
                </p>
              </div>
              <Button
                size="xs"
                variant={h.tracking ? "secondary" : "ghost"}
                className="text-[10px]"
              >
                <StarIcon weight={h.tracking ? "fill" : "regular"} aria-hidden />
                {h.tracking ? "추적중" : "추적"}
              </Button>
            </div>

            <div className="mb-1 flex items-baseline gap-1.5">
              <span className="text-base font-black tabular-nums">{h.currentPrice.toLocaleString()}</span>
              <span className={cn("text-xs font-semibold tabular-nums", rateColor(h.returnRate))}>
                {rateText(h.returnRate, 1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">매수 {h.buyPrice.toLocaleString()}원</span>
              <Badge variant={h.buyRatio >= 60 ? "destructive" : "secondary"} className="px-1.5 py-0 text-[9px]">
                매수비 {h.buyRatio}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
