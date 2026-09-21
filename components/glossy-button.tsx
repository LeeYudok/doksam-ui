import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * 광택 버튼 — 기본 `Button` 에 그라데이션과 상단 하이라이트를 얹은 변형이다.
 *
 * 프리미티브(`components/ui/button.tsx`)는 건드리지 않고 조합만 한다. 규칙의
 * 컴포넌트 절("커스텀은 components/ui/ 밖에서 조합한다")을 따른 배치다.
 *
 * **고르는 쪽이 알아야 할 것** — 이 광택은 프로필의 표면(surface) 축
 * (`personalities/index.ts` 의 `border | shadow | flat`) 바깥에 있다.
 * `data-personality-surface="flat"` 인 프로필에서도 그라데이션은 유지된다
 * (그림자만 축을 따라 꺼진다). 평면을 고른 프로필에서 이 버튼을 쓰면
 * 그 자리만 성격이 달라진다는 뜻이므로, 화면 전체의 표면 성향을 바꾸려는
 * 의도라면 이 컴포넌트가 아니라 프로필 쪽을 골라야 한다.
 *
 * 강조 하나를 의도적으로 띄우는 자리(가입·결제 등 단일 주행동 CTA)에 쓴다.
 * 한 화면에 여러 개를 두면 강조가 상쇄된다.
 */
function GlossyButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="glossy-button"
      className={cn(
        // 바탕: 위에서 아래로 primary → primary/85 로 떨어지는 그라데이션.
        "relative isolate overflow-hidden border-primary-foreground/15",
        "bg-linear-to-b from-primary via-primary to-primary/85",
        // 입체: 바깥 그림자 + 안쪽 상단 하이라이트.
        "shadow-md shadow-primary/25 inset-shadow-sm inset-shadow-primary-foreground/25",
        // 상단 절반을 덮는 광택 띠. 클릭을 가로채지 않도록 pointer-events 를 끈다.
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2",
        "before:bg-linear-to-b before:from-primary-foreground/20 before:to-transparent",
        // 상태 피드백은 전환할 속성을 좁혀 명시한다 (규칙: 모션 절).
        "transition-[filter,box-shadow] duration-100",
        "hover:brightness-110 hover:shadow-lg active:brightness-95",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export { GlossyButton }
