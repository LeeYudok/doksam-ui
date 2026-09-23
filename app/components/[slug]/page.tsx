import { notFound } from "next/navigation"

import { ComponentDetail } from "@/components/showcase/component-detail"
import { TodoNotice } from "@/components/showcase/todo-notice"
import { DEMO_LOADERS } from "@/lib/showcase/demo-loaders"
import { COMPONENT_REGISTRY, getComponentEntry } from "@/lib/showcase/registry"
import { isInRegistry } from "@/lib/showcase/registry-membership"
import { getPatternsUsingComponent } from "@/lib/patterns/registry"

interface ComponentPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return COMPONENT_REGISTRY.map((entry) => ({ slug: entry.slug }))
}

export default async function ComponentPage({ params }: Readonly<ComponentPageProps>) {
  const { slug } = await params
  const entry = getComponentEntry(slug)

  if (!entry) {
    notFound()
  }

  const loadDemo = DEMO_LOADERS[slug]

  if (entry.status !== "done" || !loadDemo) {
    return <TodoNotice title={entry.title} description={entry.description} slug={entry.slug} />
  }

  const { demo, code, dos, donts, examples } = await loadDemo()

  return (
    <ComponentDetail
      entry={entry}
      demo={demo}
      code={code}
      dos={dos}
      donts={donts}
      examples={examples}
      inRegistry={isInRegistry(slug)}
      usedByPatterns={getPatternsUsingComponent(slug).map((pattern) => ({
        slug: pattern.slug,
        title: pattern.title,
      }))}
    />
  )
}
