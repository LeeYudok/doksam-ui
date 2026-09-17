import { getPersonalityPreset } from "@/personalities";
import { getBrandProfile } from "@/profiles";

/**
 * 브랜드 프로필 하나를 컨테이너 서브트리에 스코프하는 data-* 속성 묶음 (#47).
 *
 * 왜 필요한가: 템플릿 레이아웃들은 `data-theme`/`data-font` 만 손으로 적어 왔다.
 * 그 사이 프로필은 축이 늘어(밀도 · 성격 · 모서리·타입 대비) 카드에는
 * "모서리 = Pill / 타입 대비 = Dramatic" 이라고 적히는데 정작 카탈로그 간판인
 * 템플릿은 전부 기본값으로 렌더됐다. 축을 추가할 때마다 18개 레이아웃에 속성을
 * 손으로 뿌리면 같은 누락이 반복되므로, 프로필 → 속성 변환을 여기 한 곳에 둔다.
 * 축이 또 늘면 이 함수만 고치면 모든 템플릿이 따라온다.
 *
 * 반경(`--radius`)을 인라인 스타일로 내보내지 않는 이유: app/globals.css 의
 * `[data-corner="…"]` 블록이 `--radius` 와 파생값(`--radius-sm ~ --radius-4xl`)을
 * 함께 재계산한다. 즉 `data-corner` 가 표면 반경의 단일 진실원천이고, 인라인
 * `--radius` 를 덧붙이면 같은 값을 두 곳에서 말하는 중복이 된다.
 *
 * 라이트/다크는 여기서 정하지 않는다 — 템플릿마다 사이트 전역 `.dark` 를 상속할지
 * 고정할지가 다르고, 그 판단은 각 레이아웃이 이미 className 으로 갖고 있다.
 *
 * @param name profiles/index.ts BRAND_PROFILES 의 프로필 이름
 */
export function profileScopeAttributes(name: string): ProfileScopeAttributes {
  const profile = getBrandProfile(name);
  // 레지스트리에 없는 이름은 빌드 시점에 크게 실패해야 한다 — 조용히 기본값으로
  // 렌더되면 이 함수를 만든 이유(축 누락을 눈치채지 못함)가 그대로 되살아난다.
  if (!profile) throw new Error(`profileScopeAttributes: 알 수 없는 프로필 "${name}"`);

  const attributes: ProfileScopeAttributes = {
    "data-theme": profile.theme,
    "data-font": profile.font,
    "data-density": profile.density,
    "data-corner": profile.corner,
    "data-type-contrast": profile.typeContrast,
  };

  // 프리셋을 못 찾으면 성격 속성을 건드리지 않는다(밀도 층과 동일한 opt-in) —
  // profiles/index.test.ts 가 참조 무결성을 이미 강제하므로 실제로는 도달하지 않는다.
  const personality = getPersonalityPreset(profile.personality);
  if (personality) {
    attributes["data-personality"] = personality.scale;
    attributes["data-personality-surface"] = personality.surface;
    attributes["data-personality-motion"] = personality.motion;
  }

  return attributes;
}

/** 템플릿 레이아웃 래퍼 div 에 그대로 스프레드하는 속성 묶음. */
export interface ProfileScopeAttributes {
  "data-theme": string;
  "data-font": string;
  "data-density": string;
  "data-corner": string;
  "data-type-contrast": string;
  "data-personality"?: string;
  "data-personality-surface"?: string;
  "data-personality-motion"?: string;
}
