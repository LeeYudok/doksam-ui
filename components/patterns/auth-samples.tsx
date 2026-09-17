import { EnvelopeSimpleIcon, GithubLogoIcon, GoogleLogoIcon, LockSimpleIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { PasswordResetDemo } from "@/components/patterns/auth/password-reset-demo"
import { ValidationErrorDemo } from "@/components/patterns/auth/validation-error-demo"

export const AUTH_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "로그인 폼",
    description: "카드형 컨테이너 + OAuth 버튼 + 이메일/비밀번호 폼 조합입니다.",
    demo: (
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">로그인</p>
          <p className="text-xs text-muted-foreground">계정 정보를 입력하거나 소셜 계정으로 로그인하세요.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" size="sm" className="justify-start gap-2">
            <GoogleLogoIcon size={14} weight="regular" />
            Google로 계속하기
          </Button>
          <Button type="button" variant="outline" size="sm" className="justify-start gap-2">
            <GithubLogoIcon size={14} weight="regular" />
            GitHub으로 계속하기
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-[10px] text-muted-foreground">또는</span>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pattern-login-email" className="text-[10px]">
            이메일
          </Label>
          <div className="relative">
            <EnvelopeSimpleIcon
              size={14}
              weight="regular"
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input id="pattern-login-email" type="email" placeholder="user@example.com" className="h-8 pl-8 text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="pattern-login-password" className="text-[10px]">
              비밀번호
            </Label>
            <a href="#pattern-reset" className="text-[10px] text-muted-foreground hover:text-foreground hover:underline">
              비밀번호를 잊으셨나요?
            </a>
          </div>
          <div className="relative">
            <LockSimpleIcon
              size={14}
              weight="regular"
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input id="pattern-login-password" type="password" placeholder="••••••••" className="h-8 pl-8 text-xs" />
          </div>
        </div>
        <Button type="button" size="sm" className="mt-1">
          로그인
        </Button>
      </div>
    ),
    code: `<div className="rounded-xl border bg-card p-6">
  <Button variant="outline" size="sm" className="justify-start gap-2">
    <GoogleLogoIcon size={14} />
    Google로 계속하기
  </Button>

  <div className="flex items-center gap-2">
    <Separator className="flex-1" />
    <span className="text-[10px] text-muted-foreground">또는</span>
    <Separator className="flex-1" />
  </div>

  <Input type="email" placeholder="user@example.com" className="h-8 pl-8 text-xs" />
  <Input type="password" placeholder="••••••••" className="h-8 pl-8 text-xs" />
  <Button size="sm">로그인</Button>
</div>`,
    notes: [
      "카드 컨테이너는 rounded-xl border bg-card p-6, 최대 폭은 max-w-sm 이 기본값이다.",
      "OAuth 버튼은 variant='outline' + 좌측 정렬(justify-start)로 아이콘과 문구를 나란히 배치한다.",
      "OAuth 버튼과 이메일/비밀번호 폼 사이는 Separator + '또는' 텍스트로 구분한다.",
      "이메일/비밀번호 Input은 좌측 아이콘을 pointer-events-none 절대 위치로 겹쳐 pl-8 로 여백을 확보한다.",
    ],
  },
  {
    num: 2,
    title: "회원가입 폼",
    description: "카드형 컨테이너 + 이용약관 동의 체크박스가 포함된 가입 폼입니다.",
    demo: (
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">회원가입</p>
          <p className="text-xs text-muted-foreground">몇 가지 정보만 입력하면 바로 시작할 수 있어요.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="pattern-signup-name" className="text-[10px]">
              이름
            </Label>
            <Input id="pattern-signup-name" placeholder="홍길동" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pattern-signup-email" className="text-[10px]">
              이메일
            </Label>
            <Input id="pattern-signup-email" type="email" placeholder="user@example.com" className="h-8 text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pattern-signup-password" className="text-[10px]">
            비밀번호
          </Label>
          <Input id="pattern-signup-password" type="password" placeholder="8자 이상" className="h-8 text-xs" />
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="pattern-signup-terms" className="mt-0.5" />
          <Label htmlFor="pattern-signup-terms" className="text-[11px] font-normal text-muted-foreground">
            <a href="#pattern-terms" className="text-foreground underline underline-offset-2">
              이용약관
            </a>
            {" "}및{" "}
            <a href="#pattern-privacy" className="text-foreground underline underline-offset-2">
              개인정보처리방침
            </a>
            에 동의합니다.
          </Label>
        </div>
        <Button type="button" size="sm" className="mt-1">
          계정 만들기
        </Button>
      </div>
    ),
    code: `<div className="rounded-xl border bg-card p-6">
  <div className="grid grid-cols-2 gap-2">
    <Input placeholder="홍길동" className="h-8 text-xs" />
    <Input type="email" placeholder="user@example.com" className="h-8 text-xs" />
  </div>
  <Input type="password" placeholder="8자 이상" className="h-8 text-xs" />

  <div className="flex items-start gap-2">
    <Checkbox id="terms" className="mt-0.5" />
    <Label htmlFor="terms" className="text-[11px] font-normal text-muted-foreground">
      이용약관 및 개인정보처리방침에 동의합니다.
    </Label>
  </div>
  <Button size="sm">계정 만들기</Button>
</div>`,
    notes: [
      "이름/이메일처럼 짧은 필드는 grid grid-cols-2 gap-2 로 한 줄에 묶는다.",
      "약관 동의 체크박스는 items-start + mt-0.5 로 여러 줄 문구와 상단 정렬을 맞춘다.",
      "약관 링크는 text-foreground underline 으로 강조해 본문 문구와 구분한다.",
      "제출 버튼 라벨은 '가입하기'보다 '계정 만들기'처럼 결과를 명시하는 문구를 권장한다.",
    ],
  },
  {
    num: 3,
    title: "비밀번호 재설정 폼",
    description: "이메일 입력 → 발송 완료 안내로 전환되는 2단계 재설정 플로우입니다.",
    demo: <PasswordResetDemo />,
    code: `function PasswordResetDemo() {
  const [step, setStep] = useState<"form" | "sent">("form")
  const [email, setEmail] = useState("")

  if (step === "sent") {
    return (
      <div className="text-center">
        <CheckCircleIcon weight="fill" className="text-success" />
        <p>{email} 주소로 재설정 링크를 발송했습니다.</p>
        <Button variant="outline" onClick={() => setStep("form")}>다시 입력하기</Button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setStep("sent") }}>
      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Button type="submit">재설정 링크 보내기</Button>
    </form>
  )
}`,
    notes: [
      "단계는 컴포넌트 내부 useState로만 관리하고, 실제 서비스에서는 서버 액션/API 응답으로 대체한다.",
      "발송 완료 화면은 CheckCircleIcon(success 토큰) + 입력했던 이메일 주소를 재노출해 사용자가 목적지를 확인할 수 있게 한다.",
      "재입력 버튼으로 되돌아갈 수 있게 해, 오탈자로 잘못된 이메일을 입력한 경우를 구제한다.",
    ],
  },
  {
    num: 4,
    title: "검증 에러 상태 데모",
    description: "이메일/비밀번호 필드의 aria-invalid 에러 상태를 토글로 확인하는 데모입니다.",
    demo: <ValidationErrorDemo />,
    code: `<Input type="email" aria-invalid={hasError} className="h-8 text-xs" />
<Input type="password" aria-invalid={hasError} className="h-8 text-xs" />
{hasError ? (
  <p role="alert" className="flex items-center gap-1 text-[10px] text-destructive">
    <WarningCircleIcon weight="fill" />
    이메일 형식이 올바르지 않거나 비밀번호가 8자 미만입니다.
  </p>
) : null}`,
    notes: [
      "에러 상태는 Input의 aria-invalid 속성만으로 표현한다 — 별도 에러 전용 className이 필요 없다(shadcn Input이 aria-invalid 스타일을 내장).",
      "에러 메시지는 role='alert'로 스크린리더에 즉시 알리고, 어떤 필드가 문제인지보다 검증 실패 사유를 구체적으로 설명한다.",
      "실 서비스에서는 이 토글 버튼 자리에 폼 라이브러리(react-hook-form 등)의 validate 결과가 들어간다.",
    ],
  },
]
