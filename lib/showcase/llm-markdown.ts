export interface LlmMarkdownInput {
  title: string
  slug: string
  description: string
  code: string
  dos: string[]
  donts: string[]
  /** registry.json 편입 여부 — 설치 안내 문구 분기용. */
  inRegistry: boolean
  /** 설치 커맨드를 만들 registry.json 항목 이름들. 생략하면 slug 하나를 쓴다. */
  installNames?: string[]
}

/** slug → shadcn CLI 설치 커맨드. */
export function shadcnAddCommand(slug: string): string {
  return `npx shadcn@latest add https://ui.doksam.com/r/${slug}.json`
}

/**
 * 컴포넌트 한 개를 AI agent 프롬프트에 통째로 붙여넣을 마크다운으로 조립한다.
 * 설명 + 설치(또는 수동 복사) + 코드 + Do/Don't 규칙.
 */
export function buildLlmMarkdown(input: LlmMarkdownInput): string {
  const lines: string[] = [`# ${input.title} (${input.slug})`, "", input.description, "", "## 설치"]

  if (input.inRegistry) {
    const names = input.installNames?.length ? input.installNames : [input.slug]
    for (const name of names) lines.push(shadcnAddCommand(name))
  } else {
    lines.push(`아직 레지스트리 미편입 — components/${input.slug}.tsx 를 수동 복사한다.`)
  }

  lines.push("", "## 사용 예시", input.code, "", "## 규칙")
  for (const item of input.dos) lines.push(`Do: ${item}`)
  for (const item of input.donts) lines.push(`Don't: ${item}`)

  return lines.join("\n")
}
