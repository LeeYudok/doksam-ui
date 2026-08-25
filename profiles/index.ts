import type { ThemeMode } from "@/lib/theme-storage";
import type { PersonalityName } from "@/personalities";

/**
 * 브랜드 프로필 레지스트리 — 단일 진실원천.
 *
 * "부품"(테마 프리셋 6종 · 폰트 프리셋 5종) 조합을 프로젝트마다 자유롭게 고르면
 * 스타일이 발산한다. 프로필은 그 선택을 미리 고정해 둔 층이다 — 프로젝트는
 * 색과 폰트를 개별로 고르지 않고, 프로필 이름 하나만 지정한다.
 *
 * 새 프로필을 추가하려면:
 *   1. 아래 BRAND_PROFILES 배열에 { name, label, description, theme, font,
 *      defaultMode, examples } 항목을 추가한다.
 *   2. theme 는 themes/index.ts 의 THEME_PRESETS, font 는 fonts/index.ts 의
 *      FONT_PRESETS 에 실재하는 name 이어야 한다 — profiles/index.test.ts 가
 *      이 참조 무결성을 강제한다.
 *
 * 그러면 /profiles 페이지와 프로필 스위처(있다면)에 자동으로 반영된다.
 */
/** 정보 밀도 — compact=관리·데이터 화면, comfortable=대외 화면. */
export type ProfileDensity = "compact" | "comfortable";

export interface BrandProfile {
  /** 레지스트리 키 (예: "admin"). */
  name: string;
  /** 카드/스위처에 노출할 표시명. */
  label: string;
  /** 이 프로필의 용도 설명 — 어떤 화면 성격에 쓰는지. */
  description: string;
  /** themes/index.ts THEME_PRESETS 의 name 참조. */
  theme: string;
  /** fonts/index.ts FONT_PRESETS 의 name 참조. */
  font: string;
  /** 이 프로필의 기본 라이트/다크 모드. */
  defaultMode: ThemeMode;
  /** 프로필 단위 radius (px 문자열). <html style="--radius:…"> 오버라이드로 방출. */
  radius: string;
  /** 정보 밀도 — <html data-density> 속성 값. app/globals.css 의 밀도 토큰 층이 소비. */
  density: ProfileDensity;
  /** personalities/index.ts PERSONALITY_PRESETS 의 name 참조(#90) — 타입/스페이싱
   *  스케일·표면 성향·모션 강도를 함께 고정한다. profiles/index.test.ts 가 참조
   *  무결성을 강제한다. */
  personality: PersonalityName;
  /** /patterns/app-shell 의 권장 셸 변형(표시 타이틀) — 문서적 연결, 코드 강제 없음. */
  shell?: string;
  /** archetypes/index.ts LAYOUT_ARCHETYPES 의 name 참조 — 이 프로필의 기본 화면 뼈대. */
  archetype?: string;
  /** 이 프로필을 적용한 실제/가상 프로젝트 예시. */
  examples: string[];
}

export const BRAND_PROFILES: BrandProfile[] = [
  {
    name: "admin",
    label: "Admin",
    description: "내부 관리자 도구 · 백오피스 화면에 쓰는 프로필입니다. 차분한 무채색 톤으로 정보 밀도를 우선합니다.",
    theme: "slate",
    font: "geist",
    defaultMode: "light",
    radius: "6px",
    density: "compact",
    personality: "neutral",
    shell: "사이드바형 셸",
    archetype: "sidebar-app",
    examples: ["크롤러 관리", "배치 모니터"],
  },
  {
    name: "service",
    label: "Service",
    description: "대외 서비스 · 고객 대면 화면에 쓰는 프로필입니다. 신뢰감 있는 블루 톤과 한글 가독성을 우선합니다.",
    theme: "ocean",
    font: "noto-sans-kr",
    defaultMode: "light",
    radius: "10px",
    density: "comfortable",
    personality: "neutral",
    shell: "헤더형 셸",
    archetype: "top-nav-site",
    examples: ["bizinfo 사업자 조회"],
  },
  {
    name: "data",
    label: "Data",
    description: "데이터 대시보드 · 시세/뉴스류 화면에 쓰는 프로필입니다. 다크 기본에 대비가 뚜렷한 보라 톤을 씁니다.",
    theme: "violet",
    font: "space-grotesk",
    defaultMode: "dark",
    radius: "6px",
    density: "compact",
    personality: "neutral",
    shell: "사이드바형 셸",
    archetype: "dashboard-grid",
    examples: ["news.doksam.com", "srope"],
  },
  {
    name: "docs",
    label: "Docs",
    description: "문서 · 위키 · 블로그류 화면에 쓰는 프로필입니다. 차분한 그린 톤과 넉넉한 여백으로 긴 글 가독성을 우선합니다.",
    theme: "forest",
    font: "ibm-plex-kr",
    defaultMode: "light",
    radius: "8px",
    density: "comfortable",
    personality: "neutral",
    shell: "문서 리더 셸",
    archetype: "doc-reader",
    examples: ["위키·기술문서", "brain 문서 뷰"],
  },
  {
    name: "console",
    label: "Console",
    description: "모니터링 · 운영 콘솔류 화면에 쓰는 프로필입니다. 다크 기본에 웜 오렌지 포인트로 로그·상태 정보를 밀도 있게 담습니다.",
    theme: "ember",
    font: "geist",
    defaultMode: "dark",
    radius: "4px",
    density: "compact",
    personality: "neutral",
    shell: "사이드바형 셸",
    archetype: "sidebar-app",
    examples: ["로그 뷰어", "배치 모니터"],
  },
];

export const DEFAULT_BRAND_PROFILE = "admin";

export function getBrandProfile(name: string): BrandProfile | undefined {
  return BRAND_PROFILES.find((profile) => profile.name === name);
}
