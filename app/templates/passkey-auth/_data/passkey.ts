/**
 * 패스키(WebAuthn) 인증 템플릿의 목 데이터 — #46.
 *
 * 이 템플릿은 **실제 WebAuthn API 를 호출하지 않는다**. 카탈로그는 화면 표준이므로
 * 브라우저·인증기 상태를 재현하는 대신 각 화면이 실제 API 의 어느 결과에 대응하는지
 * 아래 주석과 SCREEN_API_MAPPING 에 남긴다. 소비 프로젝트는 이 화면 전이 구조를
 * 그대로 두고 전이 트리거만 실제 호출로 바꾸면 된다.
 */

/** 화면 상태 — 카드 하나가 한 번에 정확히 하나를 렌더한다. */
export type PasskeyScreen =
  | "signin"
  | "waiting"
  | "cancelled"
  | "failed"
  | "success"
  | "register"
  | "cross-device"
  | "devices"
  | "fallback"
  | "unsupported"

/** 인증기 대기·성공 화면이 로그인용인지 등록용인지 구분한다. */
export type PasskeyIntent = "signin" | "register"

/**
 * 화면 ↔ 실제 WebAuthn API 결과 대응표.
 *
 * 취소(사용자가 프롬프트를 닫음)와 실패(인증기가 자격증명을 만들거나 검증하지 못함)는
 * 브라우저에서 **둘 다 NotAllowedError 로 올 수 있다**. 그래서 서버 검증 결과와
 * 타이밍으로 갈라야 하고, 화면에서도 반드시 갈라서 안내해야 한다 — 취소를 실패로
 * 안내하면 사용자는 자기 계정이 공격받았다고 오해하고, 실패를 취소로 안내하면
 * 진짜 공격 신호를 놓친다.
 */
export const SCREEN_API_MAPPING: Record<PasskeyScreen, string> = {
  signin: "navigator.credentials.get() 호출 직전 — PublicKeyCredentialRequestOptions 를 서버에서 받아 둔 상태",
  waiting: "navigator.credentials.get()/create() 의 Promise pending — 인증기 프롬프트가 떠 있는 동안",
  cancelled: "NotAllowedError 중 사용자가 프롬프트를 닫은 경우(대기 시간이 짧고 서버 검증에 도달하지 않음)",
  failed: "서버 assertion 검증 실패, InvalidStateError, SecurityError, 또는 타임아웃된 NotAllowedError",
  success: "서버가 assertion/attestation 검증에 성공하고 세션을 발급한 직후",
  register: "navigator.credentials.create() 호출 직전 — PublicKeyCredentialCreationOptions 수신 완료",
  "cross-device": "hybrid 전송(캐로) — QR 스캔으로 다른 기기의 인증기를 연결하는 동안",
  devices: "서버가 보관한 자격증명 목록 조회 결과(credential id · AAGUID · 마지막 사용 시각)",
  fallback: "패스키 대신 SMS OTP 등 대체 수단으로 전환한 경로",
  unsupported:
    "window.PublicKeyCredential 부재 또는 isUserVerifyingPlatformAuthenticatorAvailable() === false",
}

export interface RegisteredPasskey {
  id: string
  /** 사용자가 붙인 이름 — 서버의 credential nickname. */
  label: string
  /** 인증기 종류 — AAGUID 로 식별한 플랫폼/보안키 구분. */
  authenticator: string
  /** 마지막 사용 시각 — 목록 한 줄에 들어가도록 분 단위까지만 표시한다(데모라 고정 문자열). */
  lastUsedAt: string
  /** 이 기기에서 만든 자격증명인지 — 삭제 시 경고 문구가 달라진다. */
  current: boolean
}

export const REGISTERED_PASSKEYS: RegisteredPasskey[] = [
  {
    id: "cred-01",
    label: "MacBook Pro · Touch ID",
    authenticator: "플랫폼 인증기",
    lastUsedAt: "2026-09-17 09:12",
    current: true,
  },
  {
    id: "cred-02",
    label: "iPhone 17 · Face ID",
    authenticator: "플랫폼 인증기 · 하이브리드",
    lastUsedAt: "2026-09-16 21:40",
    current: false,
  },
  {
    id: "cred-03",
    label: "YubiKey 5C",
    authenticator: "로밍 보안키 · USB-C",
    lastUsedAt: "2026-08-30 14:02",
    current: false,
  },
]

/** 로그인 대상 계정 — 서버가 세션 힌트로 내려주는 값. */
export const ACCOUNT = {
  name: "운영자",
  email: "ops@doksam.com",
}

/** 다른 기기 인증용 코드 — 실제로는 서버가 1회용으로 발급한다. */
export const CROSS_DEVICE_CODE = "K7QD-2F91"

/**
 * QR 자리표시자 매트릭스 — 외부 이미지·CDN 을 쓰지 않는 폐쇄망 전제에 맞춰
 * 고정 비트맵을 CSS 격자로 렌더한다. 난수를 쓰지 않아 서버·클라이언트 렌더가 같다.
 */
export const QR_MATRIX: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
  [0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
  [1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1],
  [0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
]
