"use client"

import * as React from "react"

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DeviceMobileIcon,
  FingerprintIcon,
  FlaskIcon,
  InfoIcon,
  KeyIcon,
  ProhibitIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

import {
  ACCOUNT,
  CROSS_DEVICE_CODE,
  QR_MATRIX,
  REGISTERED_PASSKEYS,
  SCREEN_API_MAPPING,
  type PasskeyIntent,
  type PasskeyScreen,
  type RegisteredPasskey,
} from "../_data/passkey"

/**
 * 데모 컨트롤에 노출하는 화면 목록.
 *
 * `reach` 는 그 화면이 **표준 화면 경로**(카드 안의 버튼·링크)로 도달하는지,
 * 아니면 실제 환경 신호(API 결과·브라우저 기능 탐지)로만 갈라져 데모 버튼으로만
 * 도달하는지를 구분한다. 소비 프로젝트는 `demo-only` 로 표시된 화면의 전이를
 * 실제 신호에 연결해야 한다 — 카드 안에 그 버튼을 두면 안 된다(#55 M2·M3).
 *
 * `entry` 는 in-app 화면이 어느 카드의 어느 액션에서 오는지다.
 */
const SCREEN_LABELS: {
  screen: PasskeyScreen
  label: string
  reach: "in-app" | "demo-only"
  entry: string
}[] = [
  { screen: "signin", label: "로그인 진입", reach: "in-app", entry: "초기 화면 · 모든 화면의 '로그인으로 돌아가기'" },
  {
    screen: "waiting",
    label: "인증기 대기",
    reach: "in-app",
    entry: "로그인 '패스키로 계속' · 등록 '이 기기에 패스키 만들기' · 다른 기기 '휴대폰에서 스캔했습니다' · 취소/실패 '다시 시도'",
  },
  { screen: "register", label: "패스키 등록", reach: "in-app", entry: "로그인 '패스키 만들기' · 기기 관리 '패스키 추가' · 문자 인증 '다음부터 패스키 쓰기'" },
  { screen: "cross-device", label: "다른 기기", reach: "in-app", entry: "로그인 '다른 기기로 로그인' · 등록 '다른 기기에 만들기' · 실패/미지원 '다른 기기로 인증'" },
  { screen: "devices", label: "기기 관리", reach: "in-app", entry: "로그인 '등록된 기기 관리' · 실패 하단 링크 · 등록 완료 '등록된 기기 확인'" },
  { screen: "fallback", label: "문자 인증", reach: "in-app", entry: "로그인·취소·미지원 '문자 인증으로 로그인' · 실패 하단 링크" },
  { screen: "success", label: "인증 완료", reach: "in-app", entry: "문자 인증 '확인'(6자리 입력 후). 패스키 경로의 성공은 서버 검증 결과라 데모 버튼으로 본다" },
  {
    screen: "cancelled",
    label: "취소 안내",
    reach: "demo-only",
    entry: "navigator.credentials 프롬프트를 사용자가 닫았을 때(짧은 대기의 NotAllowedError)",
  },
  {
    screen: "failed",
    label: "실패 안내",
    reach: "demo-only",
    entry: "서버 assertion 검증 실패 · InvalidStateError · 타임아웃",
  },
  {
    screen: "unsupported",
    label: "미지원 환경",
    reach: "demo-only",
    entry: "window.PublicKeyCredential 부재 또는 플랫폼 인증기 미가용",
  },
]

const IN_APP_SCREENS = SCREEN_LABELS.filter((item) => item.reach === "in-app")
const DEMO_ONLY_SCREENS = SCREEN_LABELS.filter((item) => item.reach === "demo-only")

/**
 * 패스키 인증 템플릿 — focus-task 원형의 실물(#45·#46).
 *
 * 화면 하나에 과제 하나. 지속되는 내비게이션 없이 가운데 카드 한 장이 현재 상태
 * 하나만 렌더하고, 주 액션 1개·보조 액션 1개·하단 보조 링크로만 이동한다.
 *
 * 상태 전이는 전부 목(mock)이다 — 실제 navigator.credentials 호출은 하지 않는다.
 * 각 화면이 실제 API 의 어느 결과에 대응하는지는 _data/passkey.ts 의
 * SCREEN_API_MAPPING 에 적고, 이 카드 하단에도 그대로 노출한다.
 */
export function PasskeyAuth() {
  const [screen, setScreen] = React.useState<PasskeyScreen>("signin")
  const [intent, setIntent] = React.useState<PasskeyIntent>("signin")
  const [devices, setDevices] = React.useState<RegisteredPasskey[]>(REGISTERED_PASSKEYS)
  const [otp, setOtp] = React.useState("")

  const go = React.useCallback((next: PasskeyScreen) => setScreen(next), [])

  const startCeremony = React.useCallback((next: PasskeyIntent) => {
    setIntent(next)
    setScreen("waiting")
  }, [])

  const removeDevice = React.useCallback((id: string) => {
    setDevices((prev) => prev.filter((device) => device.id !== id))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* focus-task 원형의 본체 — 가운데 카드 한 장. 내비 크롬은 상단 브랜드 표기뿐이다. */}
      <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-border bg-muted/20 px-4 py-10">
        <div className="w-full max-w-sm">
          {/* 카드 안에는 그 화면의 표준 요소만 둔다 — 데모용 버튼은 여기 들어오지
              않는다(page.test.tsx 가 이 region 안을 검사해 강제한다). */}
          <section
            aria-label="인증 카드"
            className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShieldCheckIcon size={18} weight="duotone" className="text-primary" aria-hidden />
              <span className="text-sm font-semibold tracking-tight">doksam 운영 콘솔</span>
            </div>

            {screen === "signin" ? <SigninScreen onPasskey={() => startCeremony("signin")} onFallback={() => go("fallback")} onGo={go} /> : null}
            {screen === "waiting" ? <WaitingScreen intent={intent} onGo={go} /> : null}
            {screen === "cancelled" ? <CancelledScreen intent={intent} onRetry={() => startCeremony(intent)} onGo={go} /> : null}
            {screen === "failed" ? <FailedScreen intent={intent} onRetry={() => startCeremony(intent)} onGo={go} /> : null}
            {screen === "success" ? <SuccessScreen intent={intent} onGo={go} /> : null}
            {screen === "register" ? <RegisterScreen onCreate={() => startCeremony("register")} onGo={go} /> : null}
            {screen === "cross-device" ? <CrossDeviceScreen onWaiting={() => startCeremony("signin")} onGo={go} /> : null}
            {screen === "devices" ? <DevicesScreen devices={devices} onRemove={removeDevice} onGo={go} /> : null}
            {screen === "fallback" ? <FallbackScreen otp={otp} onOtpChange={setOtp} onGo={go} /> : null}
            {screen === "unsupported" ? <UnsupportedScreen onGo={go} /> : null}
          </section>

          <p className="mt-3 px-1 text-center text-xs leading-relaxed text-muted-foreground">
            {SCREEN_API_MAPPING[screen]}
          </p>
        </div>
      </div>

      {/* 데모 컨트롤 — 전부 카드 밖에 둔다. 카드 안에는 그 화면의 표준 액션만
          남는다(주 액션 1 + 보조 액션 1 + 하단 보조 링크). 소비 프로젝트는 이
          블록을 통째로 지우고, 아래 '데모 전용' 화면의 전이를 실제 신호
          (navigator.credentials 결과 · 기능 탐지)에 연결한다. */}
      <section aria-label="데모 컨트롤" className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <InfoIcon size={14} aria-hidden />
            데모 컨트롤 — 표준 화면 경로로 도달하는 화면 (카드 안 버튼으로도 갈 수 있다)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {IN_APP_SCREENS.map((item) => (
              <Button
                key={item.screen}
                size="xs"
                variant={screen === item.screen ? "secondary" : "ghost"}
                aria-pressed={screen === item.screen}
                title={item.entry}
                onClick={() => go(item.screen)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FlaskIcon size={14} aria-hidden />
            데모 전용 — 실제로는 API 결과·환경 탐지로만 갈라지는 화면
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ONLY_SCREENS.map((item) => (
              <Button
                key={item.screen}
                size="xs"
                variant={screen === item.screen ? "secondary" : "ghost"}
                aria-pressed={screen === item.screen}
                title={item.entry}
                onClick={() => go(item.screen)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ScreenHeading({ title, description }: Readonly<{ title: string; description: string }>) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

/** 카드 하단 보조 링크 — 주/보조 액션 버튼을 셋 이상으로 늘리지 않기 위한 자리다. */
function FooterLinks({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">{children}</div>
}

function AccountLine() {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
      <span className="text-sm">{ACCOUNT.email}</span>
      <Badge variant="secondary" className="font-mono text-[11px]">
        {ACCOUNT.name}
      </Badge>
    </div>
  )
}

/** 1. 로그인 진입 — 주 액션은 패스키, 보조 액션은 대체 수단 하나뿐이다. */
function SigninScreen({
  onPasskey,
  onFallback,
  onGo,
}: Readonly<{ onPasskey: () => void; onFallback: () => void; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="로그인"
        description="이 기기에 등록한 패스키로 계속합니다. 비밀번호는 쓰지 않습니다."
      />
      <AccountLine />
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={onPasskey}>
          <FingerprintIcon weight="fill" aria-hidden />
          패스키로 계속
        </Button>
        <Button size="lg" variant="outline" onClick={onFallback}>
          <DeviceMobileIcon aria-hidden />
          문자 인증으로 로그인
        </Button>
      </div>
      <Separator />
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("cross-device")}>
          다른 기기로 로그인
        </Button>
        <Button variant="link" size="xs" onClick={() => onGo("register")}>
          패스키 만들기
        </Button>
        <Button variant="link" size="xs" onClick={() => onGo("devices")}>
          등록된 기기 관리
        </Button>
      </FooterLinks>
    </>
  )
}

/**
 * 2. 인증기 대기 — navigator.credentials.get()/create() 의 Promise 가 pending 인 동안.
 * 카드 안에는 대기 상태와 이탈용 보조 링크만 둔다. 성공·취소·실패로 갈라지는 것은
 * 실제로는 API 결과이므로, 데모에서 그 분기를 고르는 버튼은 카드 밖 데모 컨트롤에 있다.
 */
function WaitingScreen({ intent, onGo }: Readonly<{ intent: PasskeyIntent; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title={intent === "register" ? "패스키를 만드는 중" : "기기에서 확인해 주세요"}
        description="기기에 뜬 지문·얼굴 인식 창을 완료하면 이어집니다. 이 화면은 창이 닫힐 때까지 그대로 둡니다."
      />
      <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-4">
        <Spinner className="size-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">인증기 응답 대기 중</span>
          <span className="text-xs text-muted-foreground">이 창을 닫지 마세요.</span>
        </div>
      </div>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          로그인으로 돌아가기
        </Button>
      </FooterLinks>
    </>
  )
}

/**
 * 3-a. 사용자 취소 — 실패가 아니다.
 * 중립 톤으로 안내하고 재시도를 주 액션으로 둔다. 여기에 destructive 를 쓰면
 * 사용자는 자기 계정이 공격받았다고 오해한다.
 */
function CancelledScreen({
  intent,
  onRetry,
  onGo,
}: Readonly<{ intent: PasskeyIntent; onRetry: () => void; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="인증을 취소했습니다"
        description="기기의 인증 창을 닫아 중단했습니다. 계정에는 아무 변화가 없습니다."
      />
      <Alert>
        <ProhibitIcon aria-hidden />
        <AlertTitle>중단된 요청</AlertTitle>
        <AlertDescription>다시 시도하면 같은 자리에서 이어집니다.</AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={onRetry}>
          <FingerprintIcon weight="fill" aria-hidden />
          {intent === "register" ? "패스키 다시 만들기" : "다시 시도"}
        </Button>
        <Button size="lg" variant="outline" onClick={() => onGo("fallback")}>
          <DeviceMobileIcon aria-hidden />
          문자 인증으로 로그인
        </Button>
      </div>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          로그인으로 돌아가기
        </Button>
      </FooterLinks>
    </>
  )
}

/**
 * 3-b. 인증 실패 — 취소와 반드시 구분한다.
 * 실패는 경고 톤(destructive)으로 알리고, 본인이 시도하지 않았다면 대응할 경로를 준다.
 */
function FailedScreen({
  intent,
  onRetry,
  onGo,
}: Readonly<{ intent: PasskeyIntent; onRetry: () => void; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="인증하지 못했습니다"
        description="이 기기의 패스키로 신원을 확인하지 못했습니다. 기기를 바꿨거나 패스키가 삭제된 경우일 수 있습니다."
      />
      <Alert variant="destructive">
        <WarningIcon aria-hidden />
        <AlertTitle>검증 실패</AlertTitle>
        <AlertDescription>
          본인이 시도한 것이 아니라면 등록된 기기 목록을 확인하고 쓰지 않는 패스키를 삭제하세요.
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={onRetry}>
          <FingerprintIcon weight="fill" aria-hidden />
          {intent === "register" ? "패스키 다시 만들기" : "다시 시도"}
        </Button>
        <Button size="lg" variant="outline" onClick={() => onGo("cross-device")}>
          <QrCodeIcon aria-hidden />
          다른 기기로 인증
        </Button>
      </div>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("devices")}>
          등록된 기기 관리
        </Button>
        <Button variant="link" size="xs" onClick={() => onGo("fallback")}>
          문자 인증으로 로그인
        </Button>
      </FooterLinks>
    </>
  )
}

/** 4. 인증 완료 — 서버가 세션을 발급한 직후. */
function SuccessScreen({ intent, onGo }: Readonly<{ intent: PasskeyIntent; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title={intent === "register" ? "패스키를 만들었습니다" : "로그인했습니다"}
        description={
          intent === "register"
            ? "이제 이 기기에서는 비밀번호 없이 지문·얼굴 인식만으로 로그인합니다."
            : "세션이 시작되었습니다. 원래 가려던 화면으로 이동합니다."
        }
      />
      <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-4">
        <CheckCircleIcon size={22} weight="fill" className="text-success" aria-hidden />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{ACCOUNT.email}</span>
          <span className="text-xs text-muted-foreground">플랫폼 인증기 · 사용자 확인 완료</span>
        </div>
      </div>
      <Button size="lg" onClick={() => onGo(intent === "register" ? "devices" : "signin")}>
        {intent === "register" ? "등록된 기기 확인" : "콘솔로 이동"}
      </Button>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          처음으로
        </Button>
      </FooterLinks>
    </>
  )
}

/** 5. 등록 — 첫 패스키 만들기(navigator.credentials.create 직전). */
function RegisterScreen({ onCreate, onGo }: Readonly<{ onCreate: () => void; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="패스키 만들기"
        description="이 기기의 지문·얼굴 인식으로 로그인할 수 있게 자격증명을 하나 만듭니다. 키는 기기를 벗어나지 않습니다."
      />
      <AccountLine />
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <KeyIcon size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
          비밀번호를 대체합니다 — 서버에는 공개키만 저장됩니다.
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
          이 사이트에서만 쓰이므로 피싱 사이트에서는 동작하지 않습니다.
        </li>
      </ul>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={onCreate}>
          <FingerprintIcon weight="fill" aria-hidden />
          이 기기에 패스키 만들기
        </Button>
        <Button size="lg" variant="outline" onClick={() => onGo("cross-device")}>
          <QrCodeIcon aria-hidden />
          다른 기기에 만들기
        </Button>
      </div>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          나중에 하기
        </Button>
      </FooterLinks>
    </>
  )
}

/** 6. 다른 기기로 인증 — hybrid(캐로) 전송. QR 은 폐쇄망 전제라 로컬 격자로 그린다. */
function CrossDeviceScreen({ onWaiting, onGo }: Readonly<{ onWaiting: () => void; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="다른 기기로 인증"
        description="휴대폰 카메라로 아래 코드를 찍으면 그 기기의 패스키로 이 화면을 인증합니다."
      />
      <div className="flex flex-col items-center gap-3">
        <div
          className="grid w-40 gap-px rounded-md border border-border bg-background p-2"
          style={{ gridTemplateColumns: `repeat(${QR_MATRIX[0].length}, minmax(0, 1fr))` }}
          role="img"
          aria-label="다른 기기 인증용 QR 코드 자리표시자"
        >
          {QR_MATRIX.flatMap((row, y) =>
            row.map((cell, x) => (
              <span
                key={`${y}-${x}`}
                className={cell ? "aspect-square bg-foreground" : "aspect-square bg-transparent"}
              />
            )),
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">카메라를 쓸 수 없다면 이 코드를 입력하세요</span>
          <span className="font-mono text-base tracking-[0.2em]">{CROSS_DEVICE_CODE}</span>
        </div>
      </div>
      <Button size="lg" onClick={onWaiting}>
        <DeviceMobileIcon aria-hidden />
        휴대폰에서 스캔했습니다
      </Button>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          로그인으로 돌아가기
        </Button>
      </FooterLinks>
    </>
  )
}

/** 7. 등록된 기기 목록과 삭제 — 서버가 보관한 자격증명 목록. */
function DevicesScreen({
  devices,
  onRemove,
  onGo,
}: Readonly<{ devices: RegisteredPasskey[]; onRemove: (id: string) => void; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="등록된 기기"
        description="이 계정으로 로그인할 수 있는 패스키 목록입니다. 쓰지 않는 기기는 지우세요."
      />
      {devices.length === 0 ? (
        <Alert variant="destructive">
          <WarningIcon aria-hidden />
          <AlertTitle>남은 패스키가 없습니다</AlertTitle>
          <AlertDescription>마지막 패스키까지 지우면 다음 로그인은 문자 인증으로만 가능합니다.</AlertDescription>
        </Alert>
      ) : (
        <ul className="flex flex-col gap-2">
          {devices.map((device) => (
            <li
              key={device.id}
              className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <KeyIcon size={18} weight="duotone" className="shrink-0 text-primary" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{device.label}</span>
                  {device.current ? (
                    <Badge variant="secondary" className="text-[10px]">
                      이 기기
                    </Badge>
                  ) : null}
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {device.authenticator} · 마지막 사용 {device.lastUsedAt}
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon-xs" variant="ghost" aria-label={`${device.label} 삭제`}>
                    <TrashIcon aria-hidden />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{device.label} 패스키를 지울까요?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {device.current
                        ? "지금 쓰고 있는 기기의 패스키입니다. 지우면 이 기기에서는 다시 등록해야 로그인할 수 있습니다."
                        : "이 기기로는 더 이상 로그인할 수 없습니다. 되돌릴 수 없습니다."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemove(device.id)}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
      <Button size="lg" variant="outline" onClick={() => onGo("register")}>
        <FingerprintIcon aria-hidden />
        패스키 추가
      </Button>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          로그인으로 돌아가기
        </Button>
      </FooterLinks>
    </>
  )
}

/** 8. 대체 수단 — 패스키를 쓸 수 없을 때의 문자 인증 경로. */
function FallbackScreen({
  otp,
  onOtpChange,
  onGo,
}: Readonly<{ otp: string; onOtpChange: (value: string) => void; onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="문자 인증"
        description="등록된 휴대폰으로 보낸 6자리 숫자를 입력하세요. 패스키보다 안전하지 않으므로 임시 경로로만 씁니다."
      />
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={onOtpChange} aria-label="인증번호 6자리">
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button size="lg" disabled={otp.length < 6} onClick={() => onGo("success")}>
        확인
      </Button>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("register")}>
          다음부터 패스키 쓰기
        </Button>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          로그인으로 돌아가기
        </Button>
      </FooterLinks>
    </>
  )
}

/**
 * 9. 패스키 미지원 환경 — window.PublicKeyCredential 이 없거나
 * isUserVerifyingPlatformAuthenticatorAvailable() 이 false 인 브라우저.
 * 패스키 버튼을 비활성 상태로 남겨두지 않고 처음부터 대체 경로를 준다.
 */
function UnsupportedScreen({ onGo }: Readonly<{ onGo: (s: PasskeyScreen) => void }>) {
  return (
    <>
      <ScreenHeading
        title="이 브라우저에서는 패스키를 쓸 수 없습니다"
        description="패스키를 지원하지 않는 브라우저이거나 기기에 인증기가 없습니다. 다른 방법으로 로그인하세요."
      />
      <Alert>
        <InfoIcon aria-hidden />
        <AlertTitle>대체 경로</AlertTitle>
        <AlertDescription>
          지원 브라우저(최신 Chrome·Safari·Edge)에서 다시 열면 패스키 로그인이 나타납니다.
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={() => onGo("fallback")}>
          <DeviceMobileIcon aria-hidden />
          문자 인증으로 로그인
        </Button>
        <Button size="lg" variant="outline" onClick={() => onGo("cross-device")}>
          <QrCodeIcon aria-hidden />
          다른 기기로 인증
        </Button>
      </div>
      <FooterLinks>
        <Button variant="link" size="xs" onClick={() => onGo("signin")}>
          <ArrowLeftIcon aria-hidden />
          로그인으로 돌아가기
        </Button>
      </FooterLinks>
    </>
  )
}
