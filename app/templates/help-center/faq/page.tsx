import { Badge } from "@/components/ui/badge"

import { FaqList } from "../_components/faq-list"
import { FAQ_ITEMS } from "../_data/faq"

export default function HelpCenterFaqPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit">
          FAQ
        </Badge>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          자주 묻는 질문 {FAQ_ITEMS.length}건을 카테고리별로 묶었습니다.
        </p>
      </section>
      <FaqList />
    </div>
  )
}
