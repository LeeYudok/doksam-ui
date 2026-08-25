import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { MarketingNav } from "./_components/marketing-nav"
import {
  FAQ_ITEMS,
  FEATURES,
  METRICS,
  PRICING_PLANS,
  PRODUCT_NAME,
  WORKFLOW_STEPS,
} from "./_data/site"

/**
 * top-nav-site 원형 대표 템플릿(#89).
 * 사이드바가 없고, 상단 가로 내비 아래로 섹션이 세로로 흐른다 — 처음 온 사람에게
 * 무엇인지 설명하고 한 가지 행동(무료로 시작)으로 이끄는 뼈대다.
 */
export default function MarketingSitePage() {
  return (
    <div className="flex w-full flex-col">
      <MarketingNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-12 sm:py-16">
        {/* 히어로 — 한 화면에 한 가지 행동만 제시한다. */}
        <section className="flex flex-col items-center gap-5 text-center">
          <Badge variant="secondary" className="w-fit">
            top-nav-site 원형
          </Badge>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            흩어진 작업을 한 판 위에 올리고, 흐름을 규칙으로 굳힙니다
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            {PRODUCT_NAME} 는 쓰던 트래커를 대체하지 않고 그 위에 흐름 층만 얹습니다. 이 화면은 doksam-ui 카탈로그의
            레이아웃 예시이며 모든 값은 로컬 placeholder 입니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button>
              무료로 시작
              <ArrowRightIcon size={16} aria-hidden />
            </Button>
            <Button variant="outline">데모 보기</Button>
          </div>

          <dl className="mt-4 grid w-full max-w-xl grid-cols-3 gap-3">
            {METRICS.map((metric) => (
              <div key={metric.id} className="flex flex-col items-center gap-0.5 rounded-lg border border-border p-3">
                <dt className="order-2 text-xs text-muted-foreground">{metric.label}</dt>
                <dd className="order-1 text-lg font-semibold tracking-tight">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 기능 */}
        <section id="features" className="flex scroll-mt-20 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold tracking-tight">무엇이 달라지나</h3>
            <p className="max-w-prose text-sm text-muted-foreground">
              도구를 하나 더 늘리는 대신, 이미 있는 도구들 사이의 빈틈을 메웁니다.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card key={feature.id} className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* 동작 방식 */}
        <section id="workflow" className="flex scroll-mt-20 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold tracking-tight">동작 방식</h3>
            <p className="max-w-prose text-sm text-muted-foreground">네 단계면 첫 보드가 굴러갑니다.</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step) => (
              <li key={step.num} className="flex flex-col gap-2 rounded-lg border border-border p-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {step.num}
                </span>
                <span className="text-sm font-medium text-foreground">{step.title}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{step.description}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 요금 */}
        <section id="pricing" className="flex scroll-mt-20 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold tracking-tight">요금</h3>
            <p className="max-w-prose text-sm text-muted-foreground">
              가상 요금제입니다. 실제 판매되는 상품이 아닙니다.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={plan.featured ? "h-full border-primary shadow-sm" : "h-full"}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {plan.featured ? <Badge>추천</Badge> : null}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold tracking-tight">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <CheckIcon size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.featured ? "default" : "outline"} className="w-full">
                    {plan.price === "문의" ? "도입 문의" : "시작하기"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="flex scroll-mt-20 flex-col gap-5">
          <h3 className="text-xl font-semibold tracking-tight">자주 묻는 질문</h3>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* 마감 CTA + 푸터 — top-nav-site 원형은 푸터가 두 번째 내비게이션 역할을 한다. */}
        <section className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/40 px-6 py-10 text-center">
          <h3 className="text-xl font-semibold tracking-tight">5분이면 첫 보드가 굴러갑니다</h3>
          <p className="max-w-prose text-sm text-muted-foreground">카드 등록 없이 Starter 로 시작하세요.</p>
          <Button>
            무료로 시작
            <ArrowRightIcon size={16} aria-hidden />
          </Button>
        </section>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{PRODUCT_NAME} · doksam-ui 템플릿 예시 (가상 제품)</span>
          <span>모든 수치는 로컬 placeholder 입니다.</span>
        </div>
      </footer>
    </div>
  )
}
