/**
 * 시각 성격(personality) 프리셋 레지스트리 — 단일 진실원천(#90).
 *
 * 테마·폰트가 색·타이포 "무엇을"을 고정한다면, personality는 그 위에서
 * 타입/스페이싱 스케일·표면(surface) 성향·모션 강도라는 "어떤 느낌으로"를
 * 고정하는 층이다. 세 축을 프로필마다 개별로 고르면 조합이 발산하므로,
 * 여기서 이름 있는 조합(preset)으로 미리 묶어 둔다 — profiles/index.ts의
 * BrandProfile.personality가 이 레지스트리의 name을 참조한다
 * (profiles/index.test.ts가 참조 무결성을 강제한다).
 *
 * <html data-personality>(scale) · data-personality-surface · data-personality-motion
 * 3개 속성으로 app/globals.css의 personality 토큰 층이 소비한다. 속성이
 * 없으면 아무 규칙도 걸리지 않아 기존 렌더와 완전히 동일하다(밀도 토큰 층과
 * 동일한 opt-in 원칙). 런타임에는 preset 이름이 아니라 scale/surface/motion
 * 3값을 lib/theme-storage.ts의 키로 직접 저장한다(밀도가 raw 값을 저장하는
 * 것과 동일한 패턴) — ThemeInitScript가 preset을 몰라도 즉시 반영할 수 있게.
 *
 * 새 프리셋을 추가하려면 아래 PERSONALITY_PRESETS 배열에
 * { name, label, description, scale, surface, motion } 항목을 추가한다.
 */

/** 타입 스케일 + 스페이싱 스케일 — html font-size(rem 기준)를 조정해 Tailwind의
 *  rem 기반 유틸리티(text-*, p-*, gap-* 등)가 동시에 파생되게 한다. */
export type PersonalityScale = "compact" | "regular" | "bold";

/** 표면(surface) 성향 — 카드류 컴포넌트의 테두리/그림자 방식. */
export type PersonalitySurface = "border" | "shadow" | "flat";

/** 모션 강도 — transition/animation 지속시간. */
export type PersonalityMotion = "none" | "subtle" | "expressive";

export interface PersonalityPreset {
  /** 레지스트리 키 (예: "neutral"). */
  name: string;
  /** 카드/문서에 노출할 표시명. */
  label: string;
  /** 이 프리셋의 용도 설명 — 어떤 화면 성격에 쓰는지. */
  description: string;
  scale: PersonalityScale;
  surface: PersonalitySurface;
  motion: PersonalityMotion;
}

export const PERSONALITY_PRESETS = [
  {
    name: "neutral",
    label: "Neutral",
    description:
      "타입·스페이싱·표면·모션 모두 중립값입니다. 기존 5개 브랜드 프로필이 쓰는 값이며, personality 도입 이전과 렌더가 동일합니다.",
    scale: "regular",
    surface: "border",
    motion: "subtle",
  },
  {
    name: "crisp",
    label: "Crisp",
    description: "타이트한 타입·스페이싱과 테두리 위주 표면, 최소 모션 — 정보 밀도를 우선하는 관리 화면에 어울립니다.",
    scale: "compact",
    surface: "border",
    motion: "none",
  },
  {
    name: "elevated",
    label: "Elevated",
    description: "그림자로 표면 위계를 강조하고 모션을 또렷하게 씁니다 — 대외 서비스 화면에 어울립니다.",
    scale: "regular",
    surface: "shadow",
    motion: "expressive",
  },
  {
    name: "statement",
    label: "Statement",
    description: "타입·스페이싱을 한 단계 키우고 표면은 완전히 평평하게(flat) 합니다 — 강조가 필요한 대시보드용입니다.",
    scale: "bold",
    surface: "flat",
    motion: "subtle",
  },
] as const satisfies readonly PersonalityPreset[];

/** PERSONALITY_PRESETS 에 실재하는 name 만 허용하는 리터럴 유니온(#90 CodeRabbit
 *  finding) — BrandProfile.personality 를 string 대신 이 타입으로 좁혀 오탈자나
 *  존재하지 않는 프리셋 이름을 컴파일 타임에 막는다. getPersonalityPreset() 은
 *  런타임 미해소 케이스(레지스트리 불일치·무결성 테스트용 입력)를 계속 다뤄야
 *  해서 string 을 그대로 받는다. */
export type PersonalityName = (typeof PERSONALITY_PRESETS)[number]["name"];

export const DEFAULT_PERSONALITY_PRESET: PersonalityName = "neutral";

/**
 * 프리셋을 <html>(또는 스코프 컨테이너)에 걸 data-* 속성 묶음으로 변환한다.
 * app/globals.css 의 personality 토큰 층이 이 세 속성을 소비한다 —
 * data-personality(타입/스페이싱 스케일) · data-personality-surface(표면) ·
 * data-personality-motion(모션 강도). preset 이 undefined 면 빈 객체를 돌려
 * 속성이 방출되지 않게 한다(= 층 비활성, 기존 렌더 무변화).
 */
export function personalityAttrs(preset: PersonalityPreset | undefined) {
  if (!preset) return {};
  return {
    "data-personality": preset.scale,
    "data-personality-surface": preset.surface,
    "data-personality-motion": preset.motion,
  } as const;
}

export function getPersonalityPreset(name: string): PersonalityPreset | undefined {
  return PERSONALITY_PRESETS.find((preset) => preset.name === name);
}
