import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

import { FAQ_ITEMS } from "../_data/faq"

const CATEGORIES = [...new Set(FAQ_ITEMS.map((item) => item.category))]

/** FAQ 탭(#100) — components/ui/accordion.tsx 를 카테고리별로 그룹핑해 조합한다. */
export function FaqList() {
  return (
    <div className="flex flex-col gap-6">
      {CATEGORIES.map((category) => {
        const items = FAQ_ITEMS.filter((item) => item.category === category)
        return (
          <section key={category} aria-label={category} className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {category}
              <Badge variant="outline" className="font-mono text-[10px] font-normal">
                {items.length}
              </Badge>
            </h3>
            <Accordion type="single" collapsible className="rounded-lg border border-border">
              {items.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="px-4">{item.question}</AccordionTrigger>
                  <AccordionContent className="px-4 text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )
      })}
    </div>
  )
}
