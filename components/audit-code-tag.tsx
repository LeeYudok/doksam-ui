"use client"

import * as React from "react"
import { CopyIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"

import { useI18n } from "@/components/i18n-provider"
import { badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface AuditCodeTagProps extends Omit<React.ComponentProps<"span">, "onClick" | "children"> {
  /** 감사코드 원문(`EVD-2025-0518` 등). 등폭 글꼴로만 그대로 렌더한다 — 코드 체계를 이 컴포넌트가 해석하지 않는다. */
  code: string
  /**
   * 클릭 시 근거 문서로 이동하는 핸들러. 주면 태그 전체가 버튼이 된다.
   * 색으로 상태를 구분하지 않으므로(코드 체계가 프로젝트마다 다름) 클릭 가능 여부는
   * 항상 이 prop 유무로만 정해진다.
   */
  onNavigate?: () => void
  /** 코드 옆에 복사 아이콘을 붙일지. 기본 false — 목록에 여러 개가 촘촘히 나열될 때는 끄는 화면이 많다. */
  copyable?: boolean
}

/**
 * 감사코드 태그(#83) — 판단 근거를 추적하는 코드를 9개 화면에서 반복해 온
 * `font-code-audit` 패턴을 컴포넌트화한다.
 *
 * 등폭 글꼴 + 시맨틱 토큰(`bg-muted`/`text-muted-foreground`) 배경만 쓰고 색으로
 * 의미를 나누지 않는다 — 감사코드 체계(`EVD-`/`TAX-`/`BIO-` 등 접두어)는 프로젝트마다
 * 달라서, 이 컴포넌트가 접두어를 해석해 색을 배정하면 표준이 아니라 특정 화면의
 * 우연한 규칙을 전체에 강제하게 된다.
 *
 * `copyable` 을 켜면 복사 버튼이 태그 밖 형제로 렌더되고 둘을 감싸는
 * `audit-code-tag-group` 래퍼가 생긴다 — `onNavigate` 와 함께 쓰면 태그 자신이
 * `<button>` 이라, 복사 컨트롤을 그 안에 두면 중첩 인터랙티브가 되기 때문이다.
 * 이때 `className` 은 래퍼에, 나머지 props 는 태그 요소에 붙는다.
 */
function AuditCodeTag({ className, code, onNavigate, copyable = false, ...props }: Readonly<AuditCodeTagProps>) {
  const { t } = useI18n()

  const handleCopy = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      void navigator.clipboard.writeText(code).then(() => {
        toast.success(t("chrome.auditCodeTag.copied", "감사코드를 복사했습니다"))
      })
    },
    [code, t]
  )

  const tagClassName = cn(
    badgeVariants({ variant: "outline" }),
    "gap-1 bg-muted text-muted-foreground",
    onNavigate && "cursor-pointer hover:bg-accent hover:text-accent-foreground",
    copyable ? undefined : className
  )

  const tag = onNavigate ? (
    <button
      type="button"
      data-slot="audit-code-tag"
      onClick={onNavigate}
      className={tagClassName}
      {...(props as React.ComponentProps<"button">)}
    >
      <span className="font-mono">{code}</span>
    </button>
  ) : (
    <span data-slot="audit-code-tag" className={tagClassName} {...props}>
      <span className="font-mono">{code}</span>
    </span>
  )

  if (!copyable) return tag

  // 복사 컨트롤은 태그 "안"이 아니라 형제 버튼으로 둔다 — onNavigate 가 있으면 태그
  // 자신이 <button> 이라, 안에 또 하나의 조작 요소를 넣으면 중첩 인터랙티브가 된다
  // (스크린리더가 이름을 합쳐 읽고, 키보드 포커스 순서도 어긋난다).
  return (
    <span
      data-slot="audit-code-tag-group"
      className={cn("inline-flex items-center gap-1 align-middle", className)}
    >
      {tag}
      <button
        type="button"
        data-slot="audit-code-tag-copy"
        aria-label={t("chrome.auditCodeTag.copy", "감사코드 복사")}
        onClick={handleCopy}
        className="inline-flex shrink-0 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <CopyIcon size={12} weight="regular" />
      </button>
    </span>
  )
}

export { AuditCodeTag }
