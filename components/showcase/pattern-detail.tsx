import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { PatternSample, type PatternSampleData } from "@/components/showcase/pattern-sample"
import { TranslatedText } from "@/components/showcase/translated-text"
import { UseBar } from "@/components/showcase/use-bar"
import { getComponentEntry } from "@/lib/showcase/registry"
import { getPatternEntry, isPatternInRegistry } from "@/lib/patterns/registry"
import { cn } from "@/lib/utils"

interface PatternDetailProps {
  /** lib/patterns/registry.ts 의 패턴 slug — 제목·설명·설치 항목·구성 컴포넌트를 모두 여기서 읽는다. */
  slug: string
  /** 패턴 샘플 목록. 페이지 고유 데모는 이 배열이나 children 으로 넘긴다. */
  samples?: PatternSampleData[]
  /** 샘플 배열로 담기 어려운 페이지 고유 본문. */
  children?: ReactNode
  /** 본문 폭 등 페이지별 컨테이너 조정. */
  className?: string
}

/** 샘플들의 코드를 합쳐 "코드 복사"·LLM 마크다운 하나로 만든다. */
function joinSampleCode(samples: PatternSampleData[]): string {
  return samples.map((sample) => `// #${sample.num} ${sample.title}\n${sample.code}`).join("\n\n")
}

/** 이 패턴이 조합하는 카탈로그 컴포넌트로 내려가는 링크 줄. */
function ComposedOfLinks({ slugs }: Readonly<{ slugs: string[] }>) {
  const entries = slugs.map((slug) => ({ slug, entry: getComponentEntry(slug) })).filter((item) => item.entry)
  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">
        <TranslatedText k="chrome.pattern.composedOf" ko="구성 컴포넌트" />
      </span>
      {entries.map(({ slug, entry }) => (
        <Link
          key={slug}
          href={`/components/${slug}`}
          className="rounded-md border border-border px-2 py-0.5 text-xs text-foreground hover:bg-accent"
        >
          {entry?.title}
        </Link>
      ))}
    </div>
  )
}

/**
 * /patterns/<slug> 상세의 공용 셸 — 스코프 배지 + 제목/설명 + 가져다쓰기 바 +
 * 구성 컴포넌트 역참조 + 샘플 목록. 36개 패턴 페이지가 손으로 반복하던 헤더 구조를
 * 한 곳으로 모아, 설치 커맨드(registryNames)와 컴포넌트 링크(composedOf)가
 * 레지스트리에서 자동으로 따라오게 한다(#41).
 */
export function PatternDetail({ slug, samples = [], children, className }: Readonly<PatternDetailProps>) {
  const entry = getPatternEntry(slug)
  if (!entry) {
    notFound()
  }

  const code = joinSampleCode(samples)
  const notes = samples.flatMap((sample) => sample.notes)

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          {entry.scope === "finance" ? (
            <TranslatedText k="chrome.pattern.badge.finance" ko="금융 도메인" />
          ) : (
            <TranslatedText k="chrome.pattern.badge.common" ko="Patterns" />
          )}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{entry.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{entry.description}</p>

        <UseBar
          slug={entry.slug}
          title={entry.title}
          description={entry.description}
          code={code}
          dos={notes}
          donts={[]}
          inRegistry={isPatternInRegistry(entry)}
          installNames={entry.registryNames}
        />

        {entry.composedOf ? <ComposedOfLinks slugs={entry.composedOf} /> : null}
      </section>

      {samples.map((sample) => (
        <PatternSample key={sample.num} {...sample} />
      ))}

      {children}
    </div>
  )
}
