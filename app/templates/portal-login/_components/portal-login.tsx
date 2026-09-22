"use client"

import * as React from "react"

import {
  BellIcon,
  CheckCircleIcon,
  IdentificationCardIcon,
  MegaphoneIcon,
  PushPinIcon,
  ShieldCheckIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banner } from "@/components/banner"
import { LiveIndicator } from "@/components/live-indicator"

import {
  CERTIFICATE_HELP_NOTE,
  NOTICES,
  PASSWORD_RESET_NOTE,
  ROLE_ROUTING_NOTE,
  SECURITY_NOTICE,
  SYSTEM_STATUS,
} from "../_data/portal-login-data"

type Screen = "signin" | "success"

/** 카드 안에서만 여닫는 인라인 도움말 — 다른 화면으로 이동시키지 않으므로 focus-task 의 "내비게이션 없음"을 어기지 않는다. */
type InlineNote = "certificate" | "reset" | null

/**
 * 사내 업무포털 로그인 템플릿 — focus-task 원형의 변형(#101).
 *
 * 화면 하나에 과제 하나라는 뼈대는 passkey-auth 와 같다. 다른 점은 카드 위·아래에
 * "다른 화면으로 이동시키지 않는" 정보성 표시(시스템 상태바·공지·보안 고지)가
 * 붙는다는 것뿐이다 — archetypes/index.ts 의 focus-task 경계 조정을 참고.
 *
 * 역할 분기(담당자/심사역/관리자)는 로그인 후 서버가 판단하는 분기라 화면에는
 * 선택 UI 를 두지 않고 안내 문구로만 보여준다.
 */
export function PortalLogin() {
  const [screen, setScreen] = React.useState<Screen>("signin")
  const [employeeId, setEmployeeId] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [validationError, setValidationError] = React.useState(false)
  const [inlineNote, setInlineNote] = React.useState<InlineNote>(null)

  const pinnedNotice = NOTICES.find((notice) => notice.pinned)
  const otherNotices = NOTICES.filter((notice) => !notice.pinned)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!employeeId.trim() || !password.trim()) {
      setValidationError(true)
      return
    }
    setValidationError(false)
    setScreen("success")
  }

  const restart = React.useCallback(() => {
    setScreen("signin")
    setEmployeeId("")
    setPassword("")
    setValidationError(false)
    setInlineNote(null)
  }, [])

  return (
    <div className="flex min-h-[640px] flex-col overflow-hidden rounded-lg border border-border bg-muted/20">
      {/* 시스템 상태바 — 클릭해도 다른 화면으로 이동하지 않는 정보성 표시. focus-task 의
          "크롬 없음"이 금지하는 건 목적지 전환 내비게이션이지 이런 표시가 아니다. */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon size={16} weight="duotone" className="text-primary" aria-hidden />
          <span className="text-xs font-semibold tracking-tight">doksam 사내 업무포털</span>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator status="live" label={SYSTEM_STATUS.label} updatedAt={SYSTEM_STATUS.asOf} size="sm" />
          <Badge variant="outline" className="text-[10px]">
            {SYSTEM_STATUS.environment}
          </Badge>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-8">
        {/* 공지사항 영역 — 정보성 표시. 링크가 아니라 텍스트로만 남긴다. */}
        <div className="flex w-full max-w-sm flex-col gap-2">
          {pinnedNotice ? (
            <Banner variant="warning">
              <div className="flex items-start gap-1.5">
                <PushPinIcon size={13} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
                <span className="text-xs leading-relaxed">{pinnedNotice.title}</span>
              </div>
            </Banner>
          ) : null}
          <section aria-label="공지사항" className="rounded-lg border border-border bg-card p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MegaphoneIcon size={14} aria-hidden />
              공지사항
            </div>
            <ul className="flex flex-col gap-1">
              {otherNotices.map((notice) => (
                <li key={notice.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate text-foreground/90">{notice.title}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{notice.postedAt}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* focus-task 본체 — 가운데 카드 한 장에 과제 하나. */}
        <section
          aria-label="로그인 카드"
          className="flex w-full max-w-sm flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          {screen === "signin" ? (
            <SigninScreen
              employeeId={employeeId}
              password={password}
              validationError={validationError}
              inlineNote={inlineNote}
              onEmployeeIdChange={setEmployeeId}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              onCertificateHelp={() => setInlineNote((prev) => (prev === "certificate" ? null : "certificate"))}
              onPasswordReset={() => setInlineNote((prev) => (prev === "reset" ? null : "reset"))}
            />
          ) : (
            <SuccessScreen employeeId={employeeId} onRestart={restart} />
          )}
        </section>

        {/* 역할 분기 안내 — 선택 UI 가 아니라 문구로만 드러낸다. */}
        {screen === "signin" ? (
          <p className="flex max-w-sm items-start gap-1.5 px-1 text-center text-xs leading-relaxed text-muted-foreground">
            <IdentificationCardIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
            <span>{ROLE_ROUTING_NOTE}</span>
          </p>
        ) : null}
      </div>

      {/* 보안 고지 — 법적 문구 자리. 카드와 독립된 블록이라 길이가 늘어나도 카드가 접히지 않는다. */}
      <footer className="border-t border-border bg-card px-4 py-3">
        <p className="mx-auto flex max-w-2xl items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <WarningIcon size={13} className="mt-0.5 shrink-0" aria-hidden />
          <span>{SECURITY_NOTICE}</span>
        </p>
      </footer>
    </div>
  )
}

function SigninScreen({
  employeeId,
  password,
  validationError,
  inlineNote,
  onEmployeeIdChange,
  onPasswordChange,
  onSubmit,
  onCertificateHelp,
  onPasswordReset,
}: Readonly<{
  employeeId: string
  password: string
  validationError: boolean
  inlineNote: InlineNote
  onEmployeeIdChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCertificateHelp: () => void
  onPasswordReset: () => void
}>) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold tracking-tight">로그인</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">사번 계정으로 로그인하세요.</p>
      </div>

      {validationError ? (
        <Alert variant="destructive">
          <WarningIcon aria-hidden />
          <AlertTitle>입력값을 확인하세요</AlertTitle>
          <AlertDescription>사번과 비밀번호를 모두 입력해야 합니다.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="portal-login-employee-id">사번</Label>
          <Input
            id="portal-login-employee-id"
            name="employeeId"
            placeholder="예: 20261234"
            value={employeeId}
            onChange={(event) => onEmployeeIdChange(event.target.value)}
            aria-invalid={validationError && !employeeId.trim()}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="portal-login-password">비밀번호</Label>
          <Input
            id="portal-login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            aria-invalid={validationError && !password.trim()}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg">
          로그인
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={onCertificateHelp} aria-expanded={inlineNote === "certificate"}>
          <ShieldCheckIcon aria-hidden />
          인증서로 로그인
        </Button>
      </div>

      {inlineNote === "certificate" ? (
        <Alert>
          <BellIcon aria-hidden />
          <AlertTitle>인증서 등록 안내</AlertTitle>
          <AlertDescription>{CERTIFICATE_HELP_NOTE}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
        <Button type="button" variant="link" size="xs" onClick={onPasswordReset} aria-expanded={inlineNote === "reset"}>
          비밀번호를 잊으셨나요?
        </Button>
      </div>

      {inlineNote === "reset" ? (
        <Alert>
          <BellIcon aria-hidden />
          <AlertTitle>비밀번호 재설정 안내</AlertTitle>
          <AlertDescription>{PASSWORD_RESET_NOTE}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  )
}

function SuccessScreen({ employeeId, onRestart }: Readonly<{ employeeId: string; onRestart: () => void }>) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold tracking-tight">로그인했습니다</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">해당 화면으로 이동합니다.</p>
      </div>
      <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-4">
        <CheckCircleIcon size={22} weight="fill" className="text-success" aria-hidden />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{employeeId}</span>
          <span className="text-xs text-muted-foreground">사번 확인 완료</span>
        </div>
      </div>
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <IdentificationCardIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>{ROLE_ROUTING_NOTE}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
        <Button type="button" variant="link" size="xs" onClick={onRestart}>
          처음으로
        </Button>
      </div>
    </>
  )
}
