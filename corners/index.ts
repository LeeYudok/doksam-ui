/**
 * 모서리(corner) 계열 레지스트리 — 단일 진실원천 (#43).
 *
 * 기존에도 프로필이 `radius: "6px"` 같은 **자유 문자열**로 모서리를 정했다. 자유
 * 문자열은 두 가지를 못 한다: (1) 어떤 값이 허용되는지 에이전트가 알 수 없고,
 * (2) 모서리 성격을 "고르는" 행위가 되지 못해 결국 다들 기본값 근처로 모인다.
 * 이 레지스트리는 그 축을 이산 enum 으로 승격한다 — #37 에서 원형을 자유 문자열에서
 * 레지스트리 이름으로 승격했을 때 수렴이 실제로 풀린 것과 같은 처방이다.
 *
 * `surface` 와 `control` 을 나눈 이유: pill 계열은 버튼·입력만 완전히 둥글어야 하고
 * 카드까지 둥글면 레이아웃이 무너진다. 표면(카드·팝오버)과 컨트롤(버튼·입력)의
 * 모서리는 같은 계열 안에서도 다른 값을 가질 수 있다.
 */
export interface CornerPreset {
  /** 레지스트리 키 (예: "soft"). */
  name: string;
  /** 카드·문서에 노출할 표시명. */
  label: string;
  /** 이 계열이 주는 인상 한 문장. */
  description: string;
  /** 이 계열이 맞는 화면 성격. */
  suitedFor: string[];
  /** 이 계열을 고르면 안 되는 상황 — 오용을 막는 반례. */
  avoidWhen: string[];
  /** 카드·팝오버 등 표면의 기준 반경. `--radius` 로 방출된다. */
  surface: string;
  /** 버튼·입력 등 컨트롤의 반경. surface 와 같으면 오버라이드하지 않는다. */
  control: string;
}

export const CORNER_PRESETS: CornerPreset[] = [
  {
    name: "sharp",
    label: "Sharp",
    description: "모서리를 거의 남기지 않아 정보가 격자에 정렬된 인상을 줍니다.",
    suitedFor: [
      "표·로그·터미널처럼 격자 정렬 자체가 읽기 단서인 화면",
      "한 화면에 컨트롤이 빽빽해 모서리 곡률이 여백을 잡아먹는 운영 콘솔",
      "기존 사내 도구와 나란히 놓여 이질감이 없어야 하는 화면",
    ],
    avoidWhen: [
      "첫인상에서 친근함·부드러움을 줘야 하는 대외 서비스면 피한다",
      "터치 입력이 주된 모바일 화면이면 피한다 — 날카로운 모서리가 타겟을 작아 보이게 한다",
    ],
    surface: "2px",
    control: "2px",
  },
  {
    name: "soft",
    label: "Soft",
    description: "기본값입니다. 모서리를 살짝만 깎아 어느 화면에도 튀지 않습니다.",
    suitedFor: [
      "아직 브랜드 인상을 정하지 않은 초기 스캐폴드",
      "관리 화면과 대외 화면이 한 제품에 섞여 있어 중간값이 필요한 경우",
    ],
    avoidWhen: [
      "다른 프로필과 시각적으로 구분돼야 하는 제품이면 피한다 — 가장 기본값이라 인상이 남지 않는다",
    ],
    surface: "6px",
    control: "6px",
  },
  {
    name: "rounded",
    label: "Rounded",
    description: "곡률을 뚜렷하게 키워 부드럽고 접근하기 쉬운 인상을 줍니다.",
    suitedFor: [
      "일반 사용자 대상 서비스라 친근함이 전환에 영향을 주는 화면",
      "카드형 콘텐츠가 중심이라 곡률이 콘텐츠 경계를 부드럽게 하는 화면",
      "터치가 주 입력인 모바일 화면",
    ],
    avoidWhen: [
      "밀도 높은 데이터 표가 화면 대부분이면 피한다 — 곡률이 행 정렬을 흐린다",
      "한 줄 높이의 작은 컨트롤이 많으면 피한다 — 곡률이 높이를 먹는다",
    ],
    surface: "12px",
    control: "12px",
  },
  {
    name: "pill",
    label: "Pill",
    description: "컨트롤만 완전히 둥글게 하고 표면은 적당한 곡률로 남깁니다.",
    suitedFor: [
      "버튼이 화면의 주인공이라 액션을 또렷하게 분리해야 하는 랜딩·온보딩",
      "브랜드 인상을 강하게 남겨야 하는 소개 화면",
    ],
    avoidWhen: [
      "한 화면에 버튼이 여러 개 나란히 놓이면 피한다 — 전부 알약이면 위계가 사라진다",
      "버튼 안에 아이콘과 긴 라벨이 함께 들어가면 피한다 — 좌우 여백이 과하게 늘어난다",
    ],
    surface: "12px",
    control: "9999px",
  },
];

export type CornerName = (typeof CORNER_PRESETS)[number]["name"];

/** 프로필이 모서리 계열을 고르지 않았을 때의 기본값 — 기존 렌더와 같은 인상. */
export const DEFAULT_CORNER = "soft";

export function getCornerPreset(name: string): CornerPreset | undefined {
  return CORNER_PRESETS.find((c) => c.name === name);
}
