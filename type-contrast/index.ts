/**
 * 타입 대비(type contrast) 레지스트리 — 단일 진실원천 (#43).
 *
 * 왜 이 축이 필요한가: 기존 시각 성격(personality)의 크기 변주는 `--personality-scale`
 * 하나로 html font-size 를 ±6.25% 움직이는 **균등 배율**이다. 전체가 같은 비율로
 * 커지거나 작아지므로 제목과 본문의 **상대 대비는 모든 프로젝트에서 동일**하다.
 * 그래서 결과물이 "다른 디자인"이 아니라 "같은 디자인의 배율"로 나온다.
 *
 * 이 축은 배율이 아니라 **비례**를 바꾼다. 제목만 키우고 본문은 그대로 두거나,
 * 굵기 격차를 벌리거나 좁힌다. 화면이 "잡지처럼" 보이는지 "대시보드처럼" 보이는지를
 * 가르는 것은 절대 크기가 아니라 이 대비다.
 *
 * 구현은 `<html data-type-contrast>` 속성 + 전역 CSS 오버라이드다. 속성이 없으면
 * 아무 규칙도 걸리지 않아 기존 렌더와 완전히 동일하다(밀도·성격 층과 같은 opt-in 원칙).
 */
export interface TypeContrastPreset {
  /** 레지스트리 키 (예: "moderate"). */
  name: string;
  /** 카드·문서에 노출할 표시명. */
  label: string;
  /** 이 대비가 주는 인상 한 문장. */
  description: string;
  /** 이 대비가 맞는 화면 성격. */
  suitedFor: string[];
  /** 이 대비를 고르면 안 되는 상황 — 오용을 막는 반례. */
  avoidWhen: string[];
  /**
   * 제목(h1~h3)에 곱하는 배율. 본문에는 곱하지 않는다 — 이것이 균등 배율과
   * 다른 점이며, 이 축이 비례를 바꾸는 유일한 이유다.
   */
  headingScale: number;
  /** 제목 굵기. 본문 굵기와의 격차가 대비의 나머지 절반이다. */
  headingWeight: number;
  /** 제목 자간. 크게 키운 제목은 자간을 좁혀야 덩어리로 읽힌다. */
  headingTracking: string;
}

export const TYPE_CONTRAST_PRESETS: TypeContrastPreset[] = [
  {
    name: "flat",
    label: "Flat",
    description: "제목과 본문의 크기 차이를 좁혀 정보가 균질하게 읽힙니다.",
    suitedFor: [
      "표·목록이 화면 대부분이라 제목이 스크롤만 잡아먹는 운영 화면",
      "한 화면에 섹션이 여러 개라 제목이 반복해서 등장하는 대시보드",
      "좁은 화면에서 세로 공간이 부족한 모바일 관리 도구",
    ],
    avoidWhen: [
      "첫 화면에서 시선을 한 곳으로 모아야 하는 랜딩이면 피한다",
      "긴 글을 읽히는 문서 화면이면 피한다 — 위계가 약해 훑어 읽기가 어려워진다",
    ],
    headingScale: 0.85,
    headingWeight: 600,
    headingTracking: "0",
  },
  {
    name: "moderate",
    label: "Moderate",
    description: "기본값입니다. 제목이 본문보다 분명히 크되 과하지 않습니다.",
    suitedFor: [
      "아직 화면 성격을 정하지 않은 초기 스캐폴드",
      "읽기와 조작이 반반 섞인 일반적인 제품 화면",
    ],
    avoidWhen: [
      "다른 프로필과 시각적으로 구분돼야 하는 제품이면 피한다 — 기본값이라 인상이 남지 않는다",
    ],
    headingScale: 1,
    headingWeight: 600,
    headingTracking: "-0.01em",
  },
  {
    name: "dramatic",
    label: "Dramatic",
    description: "제목을 크게 키우고 굵기 격차를 벌려 편집 디자인에 가까운 인상을 줍니다.",
    suitedFor: [
      "첫 화면에서 메시지 하나를 각인시켜야 하는 랜딩·소개 화면",
      "소수의 핵심 지표를 크게 보여주는 대시보드",
      "긴 글을 읽히되 섹션 경계가 또렷해야 하는 문서·리포트",
    ],
    avoidWhen: [
      "한 화면에 섹션 제목이 예닐곱 개 이상이면 피한다 — 스크롤이 과하게 늘어난다",
      "제목 텍스트가 길어 두 줄 이상 넘어가는 화면이면 피한다",
    ],
    headingScale: 1.35,
    headingWeight: 700,
    headingTracking: "-0.03em",
  },
];

export type TypeContrastName = (typeof TYPE_CONTRAST_PRESETS)[number]["name"];

/** 프로필이 대비를 고르지 않았을 때의 기본값 — 기존 렌더와 같은 인상. */
export const DEFAULT_TYPE_CONTRAST = "moderate";

export function getTypeContrastPreset(name: string): TypeContrastPreset | undefined {
  return TYPE_CONTRAST_PRESETS.find((t) => t.name === name);
}
