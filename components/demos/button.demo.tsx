import { FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import type { DemoExample } from "@/lib/showcase/types"

// Keep the glossy treatment local to this example; the shared primitive stays unchanged.
const glossyButtonClassName =
  "relative isolate overflow-hidden border-primary-foreground/15 bg-linear-to-b from-primary via-primary to-primary/85 shadow-md shadow-primary/25 inset-shadow-sm inset-shadow-primary-foreground/25 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-linear-to-b before:from-primary-foreground/20 before:to-transparent transition-[filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-lg active:brightness-95 motion-reduce:transition-none motion-reduce:transform-none"

export const demo = (
  <div className="flex flex-wrap items-center gap-3">
    <Button className={glossyButtonClassName}>저장하기</Button>
    <Button variant="outline">취소</Button>
    <Button variant="secondary">임시저장</Button>
    <Button variant="ghost">더 보기</Button>
    <Button variant="destructive">계정 삭제</Button>
    <Button variant="link">자세히 보기</Button>
    <Button size="sm">
      <FloppyDiskIcon size={14} weight="regular" />
      저장
    </Button>
    <Button disabled>처리 중</Button>
  </div>
)

export const code = `<Button className="${glossyButtonClassName}">저장하기</Button>
<Button variant="outline">취소</Button>
<Button variant="secondary">임시저장</Button>
<Button variant="ghost">더 보기</Button>
<Button variant="destructive">계정 삭제</Button>
<Button variant="link">자세히 보기</Button>
<Button size="sm">
  <FloppyDiskIcon size={14} weight="regular" />
  저장
</Button>
<Button disabled>처리 중</Button>`

export const dos = [
  "주요 액션 하나에는 variant='default'만 사용해 시각적 위계를 유지한다.",
  "파괴적 액션(삭제 등)은 variant='destructive'로 명확히 구분한다.",
  "아이콘만 있는 버튼은 size='icon' 계열과 aria-label을 함께 쓴다.",
]

export const donts = [
  "한 화면에 default variant 버튼을 여러 개 나란히 두지 않는다.",
  "버튼 배경색을 className으로 직접 덮어써 토큰 체계를 깨지 않는다.",
  "disabled 버튼에 클릭 유도 문구(지금 바로!)를 쓰지 않는다.",
]

export const examples: DemoExample[] = [
  {
    name: "Variants",
    demo: (
      <div className="flex flex-wrap items-center gap-3">
        <Button className={glossyButtonClassName}>저장하기</Button>
        <Button variant="outline">취소</Button>
        <Button variant="secondary">임시저장</Button>
        <Button variant="ghost">더 보기</Button>
        <Button variant="destructive">계정 삭제</Button>
        <Button variant="link">자세히 보기</Button>
      </div>
    ),
    code: `<Button className="${glossyButtonClassName}">저장하기</Button>
<Button variant="outline">취소</Button>
<Button variant="secondary">임시저장</Button>
<Button variant="ghost">더 보기</Button>
<Button variant="destructive">계정 삭제</Button>
<Button variant="link">자세히 보기</Button>`,
  },
  {
    name: "Sizes",
    demo: (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">작게</Button>
        <Button>기본</Button>
        <Button size="lg">크게</Button>
      </div>
    ),
    code: `<Button size="sm">작게</Button>
<Button>기본</Button>
<Button size="lg">크게</Button>`,
  },
  {
    name: "States",
    demo: (
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled>처리 중</Button>
        <Button variant="outline" disabled>
          비활성
        </Button>
      </div>
    ),
    code: `<Button disabled>처리 중</Button>
<Button variant="outline" disabled>비활성</Button>`,
  },
]
