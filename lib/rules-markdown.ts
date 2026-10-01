// 상대 경로 + 명시적 확장자 — `@/` 별칭은 tsc/Next 번들러 전용이고,
// scripts/gen-llms.mjs 가 이 파일을 plain `node --experimental-strip-types` 로
// import 하면 해소되지 않는다(lib/profile-registry-css-vars.ts 와 같은 이유).
import { CORNER_PRESETS } from "../corners/index.ts";
import { PERSONALITY_PRESETS } from "../personalities/index.ts";
import { BRAND_PROFILES } from "../profiles/index.ts";

/** 규칙 절의 두 층(#28).
 *
 * - invariant(불변): 프로젝트가 달라도 답이 같다. 어기면 표준 위반이다.
 * - decision(선택): 프로젝트마다 정답이 다르다. 절이 명령이 아니라 선택지와
 *   고르는 기준을 주고, 각 선택지에 그 선택을 골랐을 때 지켜야 할 경계가 붙는다.
 */
export const RULE_KINDS = ["invariant", "decision"] as const;

export type RuleKind = (typeof RULE_KINDS)[number];

/** /rules 페이지의 규칙 섹션 하나 = 제목 + 층 + 항목 목록. */
export interface RulesSection {
  title: string;
  kind: RuleKind;
  items: string[];
}

/** "모서리 · 밀도 · 타입 대비" 절이 인용하는 corner 프리셋 이름 목록 (#110 finding 4). */
export const CORNER_PRESET_NAMES: string = CORNER_PRESETS.map((c) => c.name).join(", ");

/**
 * "모서리 · 밀도 · 타입 대비" 절이 인용하는 프로필별 corner 고정값 요약 (#110 finding 4).
 *
 * 손으로 적으면 프로필이 추가될 때마다 규칙 원문이 뒤처진다 — 실제로 finance 프로필
 * (#91)이 추가된 뒤에도 목록은 5종에 머물러 있었다. profiles/index.ts 에서 파생하고,
 * lib/rules-markdown.test.ts 가 전 프로필이 문장에 등장하는지 잠근다.
 */
export const PROFILE_CORNER_SUMMARY: string = BRAND_PROFILES.map((p) => `${p.name}=${p.corner}`).join(", ");

/**
 * "모션 · 애니메이션" 절이 인용하는 personality 별 motion 고정값 (#110 finding 5).
 *
 * 모션 강도의 소유자는 personality 프리셋이다 — app/globals.css 의
 * data-personality-motion 층이 실제 강제자이고, 규칙 문장은 그 값을 인용만 한다.
 */
export const PERSONALITY_MOTION_SUMMARY: string = PERSONALITY_PRESETS.map((p) => `${p.name}=${p.motion}`).join(", ");

/**
 * 사용 규칙 전문의 단일 진실원천.
 * /rules 페이지의 사람용 렌더링과 AI 프롬프트용 markdown 복사 버튼이
 * 둘 다 이 구조체에서 파생된다 — 내용을 고치려면 여기만 수정하면 된다.
 *
 * 첫 두 절(디자인 브리프·수렴 안티패턴)의 순서를 바꾸지 않는다 — 생성 전에
 * 무엇을 안 쓸지 고르게 하는 단계이고, scripts/gen-llms.mjs 가 디자인 브리프 절을
 * public/llms.txt 카탈로그 앞에 싣는다.
 */
export const RULES_SECTIONS: RulesSection[] = [
  {
    title: "디자인 브리프 (생성 전 필수)",
    kind: "invariant",
    items: [
      "ui.doksam.com 은 디자인의 기반이다. AI 에이전트는 시맨틱 토큰·프리미티브·접근성·폐쇄망 기준을 지키면서 정보 구조, 내비게이션, 화면 구성, 타이포 위계, 여백, 표면과 모션을 제품의 사용자 과업에 맞게 새로 설계한다. 템플릿과 데모의 외형을 그대로 복제할 의무는 없다. 새 제품·주요 화면을 만들기 전에 DESIGN.md 에 사용자 과업·사용 맥락·설계 방향과 이유를 짧게 기록한다. 작은 수정은 기존 기록을 활용하며 정해진 문서 분량은 없다.",
      "원형(archetype): ui.doksam.com/archetypes 의 sidebar-app, top-nav-site, split-pane, feed-timeline, dashboard-grid, wizard-flow, chat-workspace, canvas, doc-reader, focus-task 는 참고 출발점이다. 그대로 채택하거나 여러 원형을 조합·변형해도 되고, 과업에 더 맞으면 카탈로그에 없는 새 구조를 설계해도 된다. 새 구조는 DESIGN.md 에 내비게이션·본문 구성·사용 흐름을 설명한다. 원형 이름이나 뼈대를 목록에 맞추기 위해 과업을 바꾸지 않는다.",
      "성격(personality): ui.doksam.com/profiles 와 personalities 의 neutral, crisp, elevated, statement 를 출발점으로 고르고 제품에 맞게 조합·조정한다. personality는 타입·여백 배율, 표면, 모션의 기본값이고 density는 컨트롤 높이·패딩·--control-fs 및 섹션 세로 여백 --stack-gap 의 기본값이다. 프로필은 완성된 외형을 강제하지 않는다. 카탈로그에 없는 성격도 프로젝트 범위의 이름 있는 토큰·스타일로 정의할 수 있고, 폰트는 self-host 조건 안에서 제품에 맞게 고른다.",
      "안 쓸 컴포넌트·패턴: 기본 조합 중 과업에 맞지 않는 것이 있으면 제외하거나 바꾼 이유를 적는다. 배제 개수는 강제하지 않는다. 화면을 일부러 낯설게 만들거나 쓸모 있는 패턴을 버려 차이를 만들지 않는다.",
      "이유: 구조·성격·조합을 사용 빈도, 체류 시간, 입력 장치, 정보 우선순위와 데이터 밀도로 설명한다. 예를 들어 모니터링은 빠른 비교, 읽기 화면은 문장 흐름, 입력 화면은 단계와 오류 회복을 우선한다. 색만 바꾼 템플릿 복제에 머물지 않는다.",
      "DESIGN.md 는 화면 코드와 같은 저장소에서 갱신한다. 구현하며 더 나은 사용자 흐름을 찾으면 브리프와 화면을 함께 발전시킨다. 초안의 구조가 이후 탐색을 막는 승인 문서가 되지 않게 한다.",
      "요구사항이 충분하면 AI가 설계 방향을 정해 구현하고 선택 이유를 남긴다. 제품 목표나 핵심 사용자 흐름이 불명확할 때만 사람에게 확인한다. 기존 카탈로그와 다르다는 이유만으로 별도 승인이나 카탈로그 등록을 기다리지 않는다.",
    ],
  },
  {
    title: "수렴 안티패턴",
    kind: "invariant",
    items: [
      "사이드바 + 상단바 + 카드 그리드를 모든 제품의 기본 셸로 자동 채택하지 않는다. 내비게이션과 정보 위계는 실제 목적지·사용 흐름에 맞게 설계한다. 관리 화면에서도 비교·입력·읽기 과업에 따라 본문 구성이 달라질 수 있다.",
      "모든 목록을 Table 로 만들지 않는다 — 열이 세 개 이하이거나 정렬·비교가 목적이 아니면 정의 목록·설명 행·카드 목록이 더 읽힌다. Table 은 열 간 비교가 실제 과업일 때 고른다.",
      "Card 는 묶음의 의미와 시각적 위계를 만들 때 사용한다. 모든 섹션을 관성적으로 Card 로 감싸지 말고 여백·구분선·배경·제목 등과 비교해 고른다. 이동·선택·삭제되지 않는 묶음도 과업에 도움이 되면 카드로 표현할 수 있다.",
      "모든 페이지를 같은 헤더(Badge + h1 + 설명 문단)로 시작하지 않는다 — 첫 화면에는 그 페이지에서 가장 자주 하는 행동이나 가장 먼저 봐야 하는 값이 온다.",
      "카탈로그 항목을 많이 쓰는 것을 목표로 삼지 않는다. 사용자 흐름에 필요한 것만 고르고 기존 조합이 맞지 않으면 프리미티브로 새 조합을 만든다.",
      "강조를 primary 색 하나로만 처리하지 않는다 — 계열 구분이 필요한 데이터는 범주형 팔레트인 chart-1~5, 보조 강조는 accent·secondary 로 나눈다. chart-1~5 는 브랜드 hue(chart-1)를 기준으로 색상환을 72°씩 도는 다섯 색이고 명도도 계단식으로 벌어져 있어 계열 구분에 쓰라고 만든 축이다(#93). 색만으로 구분하지 않는 것은 접근성 절의 불변 규칙이다.",
      "프로필의 density와 personality를 그대로 쓰는 것도 하나의 선택이다. 화면의 위계·리듬·입력 환경을 검토해 여백·타이포·표면을 조정한다. 모든 화면에 동일한 카드 크기·헤더·섹션 간격을 반복하거나 색상 교체만으로 제품 차이를 만들지 않는다.",
      "라이브러리 데모의 문구·아이콘·색 조합을 그대로 옮기지 않는다 — 데모 카피는 예시일 뿐이고, 화면의 언어는 도메인 용어여야 한다.",
    ],
  },
  {
    title: "컬러 · 토큰",
    kind: "invariant",
    items: [
      "하드코딩 색(hex, rgb, 임의 OKLCH 값 등)을 직접 쓰지 않는다 — 항상 시맨틱 토큰만 사용한다: themes/ 의 프리셋 27키(bg-background, text-primary 등)와 그 밖의 보조 층(sidebar-*, risk-*, heatmap-l-*/heatmap-text-*)이다. 보조 층은 소유자가 갈린다 — sidebar-* 는 프리셋마다 값이 다르고(themes/<name>.ts 의 sidebar 필드가 SSOT, [data-theme=\"*\"] 블록이 재정의한다), risk-*·heatmap-* 는 브랜드와 무관한 관례 층이라 globals.css 의 :root/.dark 에만 정의된다. 보조 층은 닫힌 목록이 아니라 확장되는 층이다 — 기존 토큰 중 어느 것으로도 표현할 수 없는 성격(연속 값 강도 등)이면 lib/<층>-tokens.ts 로 층을 새로 만들고 PROFILE_CSS_VAR_KEYS 에 합류시킨다.",
      "새 테마가 필요하면 시맨틱 토큰 이름을 유지하고 프로젝트의 테마 파일에 라이트·다크 값을 정의해도 된다. 소비 프로젝트만의 테마를 만들기 위해 카탈로그 변경을 기다릴 필요는 없다. 공통 재사용 가치가 있으면 themes/<name>.ts 와 themes/index.ts 에 등록하며 기존 프리셋은 덮어쓰지 않는다.",
      "시세 등락(이익/상승, 손실/하락)을 표시할 때는 text-red-600/text-blue-600 등을 직접 쓰지 않고 --gain/--loss 토큰(lib/finance/rate.ts의 rateColor/rateText)을 쓴다 — 한국식 관례로 이익=빨강, 손실=파랑이며 모든 프리셋에서 동일한 값을 쓴다(destructive/success/warning과 같은 방식).",
      "lightweight-charts·canvas 등 CSS를 직접 해석하지 못하는 렌더러에 색을 넘길 때는 CSS 변수/유틸리티 클래스 문자열을 그대로 주지 않고 lib/finance/normalize-color.ts의 normalizeColor(또는 readCssVar/readClassColor)로 hex 값을 해소해서 넘긴다. 프리셋·다크모드 전환 시 재해소가 필요하면 observeColorScheme로 <html>의 class/data-theme/data-font 변화를 구독한다.",
      "위험·심각도 등급(정상/관찰/주의/경보 같은 순서 있는 단계)을 chart-1~5로 표현하지 않는다 — chart 토큰은 계열을 나누는 범주형 팔레트라 다섯 색이 색상환에 흩어져 있고(기본 테마는 hue 262/46/190/334/118) 어느 색이 위인지를 싣지 못한다. 등급에는 --risk-low/--risk-moderate/--risk-high/--risk-severe 와 각각의 -foreground 쌍(lib/risk-tokens.ts)을 쓴다. 같은 화면에서 등급 색과 계열 색이 같은 토큰을 쓰면 둘 중 하나는 반드시 오독된다.",
      "위험등급 토큰은 gain/loss와 같은 도메인 관례 토큰이지만 층의 위치가 다르다 — gain/loss는 프리셋 27키에 들어 있고 모든 프리셋이 같은 값을 적는 방식이고(themes/*.ts가 SSOT), risk-*는 프리셋 27키에서 빠져 globals.css의 :root/.dark에만 정의된다(lib/risk-tokens.ts가 SSOT). sidebar-*도 27키 밖이지만 층이 또 다르다 — 프리셋마다 명시값을 갖고 [data-theme=\"*\"] 블록이 재정의한다. 그래서 [data-theme=\"*\"] 블록에서 risk-*를 재정의하지 않는다 — 브랜드에 맞춰 경보를 초록으로 바꾸는 식의 오버라이드는 표준 위반이다.",
      "소비 프로젝트에서 bg-risk-severe·text-risk-low 같은 유틸리티를 쓰려면 globals.css의 @theme inline에 --color-risk-* 매핑을 함께 넣는다 — 프로필(profile-*) 설치는 cssVars로 값만 :root/.dark에 넣어 주므로 var(--risk-severe)는 바로 쓸 수 있지만 유틸리티 클래스는 생기지 않는다. gain/loss·sidebar-*도 같다.",
      "값의 강도를 면색으로 얹는 격자(matrix-heatmap 등)는 chart-1~5 나 risk-* 를 빌려 쓰지 않고 --heatmap-l-0~4 / --heatmap-text-0~4 층(lib/heatmap-tokens.ts)을 쓴다 — 셀 배경은 oklch(from var(--primary) var(--heatmap-l-<n>) c h) 로 프로필의 --primary 에서 파생시키고 값(hue/chroma)을 이 층이 고정하지 않는다. risk-* 와 같은 층이라 [data-theme=\"*\"] 블록에서 재정의하지 않는다(프리셋마다 값이 갈리는 sidebar-* 와는 다른 층이다).",
      "색 외의 시각 성격은 data-personality·data-personality-surface·data-personality-motion 토큰 층을 출발점으로 쓴다. 프로필의 기본값을 제품에 맞게 조합하거나 프로젝트 범위의 토큰·스타일로 확장할 수 있다. 공통 토큰의 의미를 유지하고 조정 범위와 이유를 DESIGN.md 에 남긴다.",
    ],
  },
  {
    title: "위험등급 표기",
    kind: "decision",
    items: [
      "등급을 몇 단계로 나눌지, 어느 단계를 기본값으로 둘지 프로젝트가 정한다: 카탈로그는 심각도 오름차순 4단(low=정상, moderate=관찰, high=주의, severe=경보)을 제공하지만 3단만 쓰는 도메인이면 low·high·severe처럼 부분집합을 고른다. 단계 수는 사람이 실제로 다르게 행동하는 경계의 수로 정한다 — 행동이 같은 두 단계는 하나로 합친다. 고른 단계와 그 뜻(무슨 조치를 부르는 단계인가)은 DESIGN.md에 남긴다.",
      "경계 — 단계 이름은 --risk-* 토큰 이름을 그대로 쓰고 자체 번호 토큰(--grade-1 등)을 만들지 않는다: 화면에 보이는 라벨(\"1등급\", \"Tier 2\")은 도메인 용어로 자유롭게 쓰되, 그것을 토큰 이름으로 끌어오면 다른 프로젝트가 같은 색을 다른 번호로 부르게 된다.",
      "경계 — 등급을 색으로만 구분하지 않는다: 네 등급은 밝기가 같고 hue로만 갈리므로 색각 이상 사용자에게는 차이가 전달되지 않는다. 배지 텍스트·아이콘·순서 중 최소 하나를 두 번째 채널로 같이 싣는다(접근성 절의 불변 규칙).",
      "경계 — tint 배경과 solid 채움에서 글자색을 다르게 쓴다: solid 채움 위에는 --risk-<level>-foreground를, tint 배경(color-mix로 만든 옅은 면) 위에는 값 토큰 자신(--risk-<level>)을 글자색으로 쓴다. -foreground는 tint 위 글자용이 아니다.",
      "경계 — tint 면은 background·card·muted 위에만 올린다: 값 토큰이 불투명 표면 위에서 본문 대비 4.5:1을 넘는다는 사실은 tint 용법으로 전이되지 않는다. tint 배경은 backdrop이 글자색 쪽으로 14% 끌려와 대비가 내려가므로, 이미 자기 자신이 틴트된 표면(accent·secondary)에 tint를 겹치면 미달한다(ocean 라이트 accent 위 risk-low tint = 3.86:1 실측). 그런 표면 위에서는 tint 대신 solid 채움을 쓴다 — 두 약속 모두 lib/risk-tokens.test.ts가 합성색을 계산해 지킨다.",
      "경계 — 등급 색을 상태 색(success/warning/destructive)으로 대체하지 않는다: 상태 색은 3단이라 4단 등급을 실을 수 없고, 같은 화면에서 \"작업 실패\"와 \"경보 등급\"이 같은 색이 되면 읽는 쪽이 둘을 구분하지 못한다.",
    ],
  },
  {
    title: "컴포넌트",
    kind: "invariant",
    items: [
      "UI 프리미티브는 shadcn/ui를 쓴다 — components/ui/ 는 components.json 의 style(radix-nova)로 설치한 상류 원본이며, 그 스타일 자체가 컨트롤 높이·--radius 파생 토큰·has-data-[icon=...] 슬롯 규약을 담고 있다. 빈 프로젝트에 같은 프리셋으로 설치해 대조하면 60개 중 6개만 다르고, 그 6개는 상류가 더 앞선 것이다(#57 실측). 파일 단위 기록은 components/ui/upstream.manifest.json 에 있으며, 그 파일의 customized 는 CLI 가 설치 시 치환하는 자리까지 포함한 값이라 그대로 \"하우스 포크\" 로 읽지 않는다.",
      "components/ui/ 를 손으로 고치지 않는다 — 프로필의 모서리·밀도 축은 radix-nova 가 쓰는 --radius 파생 토큰과 컨트롤 스케일을 전제로 계산되므로, 파일을 임의로 고치거나 다른 스타일의 프리미티브로 갈아끼우면 축이 어긋난다. 상류를 재설치·업그레이드할 때는 node scripts/shadcn-upstream.mjs 로 components.json 의 style 기준 상류와 대조하고, 차이가 나면 upstream.manifest.json 에 기록한다.",
      "프리미티브도 상류가 아니라 이 카탈로그에서 설치한다 — npx shadcn add https://ui.doksam.com/r/badge.json 을 쓴다. bare 이름(npx shadcn add badge)으로 받으면 무엇이 깔릴지가 소비 프로젝트의 init 프리셋(style·base·아이콘 라이브러리)과 상류의 현재 버전에 달리게 되어, 카탈로그가 렌더한 것과 같다고 보장할 수 없다. 실제로 상류 radix-nova 는 이미 6개 파일(checkbox·radio-group·switch·field·command·message-scroller)에서 카탈로그보다 앞서 있다.",
      "커스텀 동작이 필요하면 components/ui/ 밖에 별도 컴포넌트를 만들어 shadcn 프리미티브를 조합한다 — components/ui/customs 같은 하위 폴더를 만들어 components/ui/ 안에 끼워 넣지 않는다. shadcn 유래 프리미티브와 커스텀 조합은 디렉터리 레벨에서 분리한다(예: components/<feature>/ 또는 components/patterns/).",
      "테이블 헤더(thead th)는 app/globals.css의 전역 규칙으로 항상 볼드로 렌더링된다 — 컴포넌트마다 font-bold를 개별 지정하지 않는다.",
    ],
  },
  {
    title: "테마 초기화",
    kind: "decision",
    items: [
      "기본 모드·테마 프리셋·폰트를 어떻게 정할지 고른다: (1) 프로필이 정한 값으로 고정하고 사용자 토글을 두지 않는다, (2) 사용자 토글을 두고 localStorage 에 기억한다, (3) 시스템 설정(prefers-color-scheme)을 따른다. 조직 표준 화면이면 (1), 야간 사용·장시간 체류가 잦으면 (2)나 (3)이 맞는다.",
      "경계 — 어느 쪽을 고르든 결정은 hydration 이전에 끝낸다: app/layout.tsx의 <head> 인라인 <script>(THEME_INIT_SCRIPT)가 localStorage 값을 읽어 <html>에 data-theme/data-font/dark 클래스를 직접 세팅하는 방식을 표준으로 쓴다.",
      "경계 — useEffect 등 mount 이후 로직만으로 다크모드·프리셋을 적용하지 않는다: 첫 페인트가 기본값으로 그려진 뒤 바뀌는 FOUC(테마 깜빡임)가 발생한다. mount 시 useEffect는 인라인 스크립트가 이미 세팅한 <html> 상태를 React state로 동기화하는 용도로만 쓴다(hooks/use-theme-preset.ts의 mount-sync 패턴 참고).",
      "경계 — 인라인 스크립트가 읽는 localStorage 키는 lib/theme-storage.ts의 상수(THEME_PRESET_STORAGE_KEY 등)를 그대로 참조한다: 훅과 문자열이 어긋나지 않도록 값을 이원화하지 않는다. 스크립트 본문은 try/catch로 감싸 실패 시 조용히 기본값으로 폴백한다.",
      "경계 — 테마 로직은 순수 함수(우선순위 계산·값 읽기)와 IO 어댑터(document/localStorage 접근)를 분리한다: applyToDocument/readDocumentState처럼 부수효과를 별도 함수로 나눠 테스트 가능하게 유지한다.",
    ],
  },
  {
    title: "모서리 · 밀도 · 타입 대비",
    kind: "decision",
    items: [
      `모서리 계열을 고른다: CORNER_PRESETS(${CORNER_PRESET_NAMES}) 와 프로필 기본값(${PROFILE_CORNER_SUMMARY})을 참고해 제품에 맞게 선택·조정한다. suitedFor·avoidWhen 은 판단 자료이며 프로필이 고른 값을 그대로 쓸 의무는 없다.`,
      "정보 밀도를 고른다: compact, comfortable, spacious 를 출발점으로 입력 장치와 비교할 정보량에 맞춰 선택한다. 한 제품에서도 데이터 작업 영역은 촘촘하게, 설명·입력 영역은 여유 있게 구성할 수 있다. 다른 밀도가 필요한 영역은 범위를 명시한 래퍼나 프로젝트 스타일로 구분한다.",
      "경계 — compact 는 터치가 주 입력인 화면에서 쓰지 않는다: compact 의 컨트롤 높이는 기본 버튼 28px, 작은 버튼 24px, 아주 작은 버튼 22px 로 모바일 터치 타겟 권고(44px)에 못 미친다. 마우스·키보드가 주 입력인 관리 화면을 전제한 값이므로, 같은 화면을 모바일에서도 쓴다면 comfortable 이상을 고르거나 터치 대상 컨트롤만 크기를 키운다.",
      "타입 대비를 고른다: flat, moderate, dramatic 을 참고해 내용 위계에 맞는 제목·본문 비례를 정한다. 프로필과 다른 대비나 자체 타입 스케일도 가능하며 personality의 균등 배율과 겹쳐 의도치 않게 두 번 확대되지 않는지 확인한다.",
      "경계 — 반복되는 radius·타입·간격 값은 이름 있는 프로젝트 토큰이나 재사용 스타일로 모은다. 일회성 레이아웃·강조는 화면에 맞게 조정할 수 있다. 새 조합이 카탈로그에 없다는 이유로 구현을 막지 않으며 공통 재사용 가치가 생기면 프리셋으로 환류한다.",
      "경계 — corner·radius·density·typeContrast 를 프로필 기본값과 다르게 쓸 수 있다. 프로젝트 범위의 설정·래퍼에서 바꾸고 이유를 DESIGN.md 에 기록한다. 설치된 components/ui/ 원본과 공통 프리셋 파일은 수정하지 않으며 접근성·반응형 동작을 검증한다.",
      "경계 — 버튼 등 개별 컨트롤 하나만 밀도 기본값과 다른 크기로 만들고 싶으면 Tailwind v4 의 `!` 접미사(예: h-12!)를 쓴다 — 밀도 층의 전역 CSS 오버라이드가 일반 Tailwind 유틸리티보다 우선 적용되므로 접미사 없이는 클래스를 바꿔도 반영되지 않는다(e2e/shape-axes.spec.ts 가 계산된 값으로 잠근다). 다만 먼저 확인할 것은 size prop 이다 — h-7/h-6 처럼 기본 크기를 손으로 덮고 있었다면 그건 sm·xs·icon-sm·icon-xs 같은 올바른 variant 로 바꿀 자리이며, 대응 variant 가 없는 진짜 커스텀 값만 `!` 로 보호한다. 또 `!` 는 높이·크기에만 쓴다 — 패딩·간격에 붙이면 밀도 층이 소유한 padding-inline·gap 까지 축에서 빠져 컨트롤이 밀도를 따르지 않는다. 컴포넌트 전체나 화면 전체의 밀도를 이 방법으로 우회하지 않는다 — 그건 새 density 프리셋을 만들 사안이다.",
    ],
  },
  {
    title: "아이콘",
    kind: "invariant",
    items: [
      "아이콘은 Phosphor(@phosphor-icons/react)를 기본으로 쓴다 — regular가 기본, 강조·활성 상태는 duotone 또는 fill.",
      "서버 컴포넌트에서는 @phosphor-icons/react/dist/ssr 경로로 import한다.",
      "Lucide(lucide-react)는 shadcn 내장과 공존하며, 직접 쓸 때는 strokeWidth={1.5}로 Phosphor 굵기에 맞춘다.",
      "Tabler(@tabler/icons-react)는 Phosphor에 없는 특수 아이콘의 백업으로만 쓴다.",
      "이모지를 아이콘 대용으로 쓰지 않는다.",
    ],
  },
  {
    title: "페이지 · 라우팅",
    kind: "invariant",
    items: [
      "새 라우트를 추가하면 loading.tsx와 error.tsx를 함께 만든다.",
      "이미지는 next/image, 폰트는 next/font/local(레포 내 self-host)로 처리한다.",
    ],
  },
  {
    title: "레이아웃 · 반응형",
    kind: "decision",
    items: [
      "콘텐츠 폭을 고른다: 관리·데이터는 max-w-[1300px], 읽기 중심은 max-w-3xl, 모니터·차트는 전폭을 참고하되 고정 답으로 취급하지 않는다. 제품의 정보량·읽기 길이·화면 구성에 맞춰 다른 폭과 분할 비율을 설계할 수 있다.",
      "내비게이션 셸을 고른다: 사이드바, 상단 탭, 하단 내비, 분할 화면, 내비 없는 단일 화면 등을 과업에 맞게 조합·변형한다. 목적지 수만으로 결정하지 말고 이동 빈도, 핵심 행동과 입력 장치를 함께 본다.",
      "경계 — 컨테이너는 세그먼트 layout.tsx가 소유한다: 페이지 컴포넌트에서 max-width를 하드코딩하지 않는다(화면마다 폭이 갈라지는 원인). 폼 등 좁은 콘텐츠는 컨테이너를 줄이지 말고 페이지 내부 래퍼로 좁힌다.",
      "경계 — main 랜드마크는 layout이 렌더한다: 페이지·loading.tsx·error.tsx에서 main을 중복 렌더하지 않는다(main 중첩은 invalid HTML). 에러 UI는 div role=\"alert\".",
      "경계 — 모든 화면은 모바일(기본)·태블릿(sm:/md:)·데스크톱(lg:↑) 3모드에서 깨지지 않아야 한다: Tailwind mobile-first로 무접두 클래스가 모바일, 접두로 넓은 화면을 확장한다(역방향 금지).",
      "경계 — 넓은 콘텐츠(테이블·코드블록·차트)는 자체 overflow-x-auto 래퍼로 감싼다: 페이지(body) 가로 스크롤이 생기면 안 된다.",
      "경계 — 고정 px 폭(w-[###px])은 아이콘·뱃지 등 소품 외 금지: 콘텐츠 영역은 flex/grid/상대 단위로 잡는다.",
    ],
  },
  {
    title: "모션 · 애니메이션",
    kind: "decision",
    items: [
      `모션의 양을 고른다: personality 프리셋 기본값(${PERSONALITY_MOTION_SUMMARY})을 참고해 none(즉시 반영), subtle(상태·오버레이 피드백), expressive(전환·재정렬) 중 과업에 맞게 정한다. 프로필의 기본값을 따르거나 제품·영역별로 조정할 수 있으며 data-personality-motion 층과 프로젝트 모션 스타일에 범위를 명시한다. 자주 갱신되는 작업 화면은 집중을, 안내·전환 화면은 맥락 연결을 우선한다.`,
      "경계 — 애니메이션할 속성을 반드시 명시한다: transition-all을 쓰지 않는다. 상태 피드백은 transition-colors, 위치·크기 변화는 transition-transform, 페이드는 transition-opacity를 쓰고, 비레이아웃 속성 여러 개가 동시에 바뀌면 Tailwind 기본 transition 유틸이나 transition-[color,background-color,box-shadow]처럼 목록을 좁혀 적는다. transition-all은 레이아웃 속성까지 전환 대상에 넣어 예기치 않은 리플로우를 만든다(components/ui/ 는 상류 포맷을 따르는 영역이라 이 조항의 적용 대상이 아니다).",
      "경계 — 진행률 바처럼 레이아웃 속성 애니메이션이 불가피하면 transition-[width]처럼 그 속성만 명시한다: 리플로우를 감수하는 지점이 코드에 드러나야 한다. 그 외에는 합성 단계에서 끝나는 transform·opacity를 우선한다.",
      "경계 — duration은 100/200/300ms 스케일만 쓴다: hover·focus 등 즉각 피드백은 duration-100, 일반 상태 전환은 duration-200, 진입·퇴장이나 진행률처럼 눈으로 따라가는 변화는 duration-300. duration-[450ms] 같은 임의 값을 새로 만들지 않는다.",
      "경계 — 커스텀 keyframes를 넣는 컴포넌트는 @media (prefers-reduced-motion: reduce)에서 animation: none으로 멈춘다: JS로 구동하는 모션은 matchMedia(\"(prefers-reduced-motion: reduce)\")를 확인해 변환 자체를 걸지 않는다 — components/scroll-stack.tsx, components/relation-network.tsx가 레퍼런스다. 위 (1)~(3) 어느 쪽을 골라도 이 경계는 같다.",
      "경계 — 진입 애니메이션의 scale을 0에서 시작하지 않는다: shadcn animate-in 프리셋처럼 zoom-in-95(최종 크기의 95%)에서 출발해 팝오버·다이얼로그가 튀어나오지 않게 한다.",
      "경계 — 무한 반복 애니메이션(animate-spin·animate-pulse·animate-ping)은 로딩·실시간 갱신 등 '지금 진행 중'을 알리는 용도로만 쓴다: 정적 콘텐츠 강조에 쓰지 않는다.",
    ],
  },
  {
    title: "접근성",
    kind: "invariant",
    items: [
      "아이콘만 있는 버튼·링크에는 접근 가능한 이름을 준다 — aria-label을 붙이거나 sr-only 텍스트를 넣는다. 옆에 텍스트가 이미 있는 장식용 아이콘은 aria-hidden으로 중복 낭독을 막는다.",
      "포커스 표시를 제거하지 않는다 — outline-none만 남기지 말고 shadcn 프리미티브의 focus-visible:ring-*을 유지한다. 커스텀 인터랙티브 요소도 키보드 포커스가 눈에 보여야 한다.",
      "텍스트와 배경의 명도대비는 WCAG AA를 만족한다(일반 텍스트 4.5:1, 24px(18pt) 이상 또는 굵은 18.67px(14pt) 이상 텍스트만 3:1) — text-muted-foreground를 더 흐리게 덮어쓰거나 opacity-*로 본문을 죽이지 않는다. 새 테마 프리셋을 추가할 때는 라이트·다크 양쪽에서 확인한다.",
      "색만으로 정보를 전달하지 않는다 — 시세 등락(--gain/--loss)·상태 배지 등은 색과 함께 부호·아이콘·텍스트 라벨을 같이 준다(색각 이상·흑백 출력 대응).",
      "계열이 넷 이상인 차트·그래프는 색 외에 형태·선 패턴·직접 라벨 중 최소 하나를 두 번째 채널로 같이 싣는다 — chart-1~5 는 hue 를 72°씩 벌리고 명도를 계단식으로 두지만(#93), 다섯 계열이 한 화면에 겹치면 색각 이상·흑백 출력·작은 마커에서 색만으로는 계열을 되찾을 수 없다. 선 그래프는 파선 패턴(relation-network 의 GROUP_DASH 가 그 예다), 산점도는 마커 형태, 면적·막대는 계열 이름 직접 라벨이 대표적인 두 번째 채널이다.",
      "상호작용 요소는 시맨틱 태그로 만든다 — 클릭 가능한 div 대신 button/a를 쓰고, 탭·아코디언 등 복합 위젯은 role과 상태 속성(aria-selected, aria-expanded)을 함께 노출한다.",
      "폼 입력에는 연결된 label을 준다 — placeholder를 label 대용으로 쓰지 않는다(입력을 시작하면 사라져 맥락이 소실된다).",
    ],
  },
  {
    title: "폐쇄망 대응",
    kind: "invariant",
    items: [
      "금융권 등 폐쇄망 배포를 전제로 모든 리소스(폰트·아이콘·스크립트·스타일)를 self-host한다 — 빌드·런타임에 외부 CDN이나 외부 URL fetch가 없어야 한다.",
      "폰트는 next/font/google이 아닌 next/font/local을 쓰고, woff2 파일을 assets/fonts/<name>/ 에 레포로 커밋한다(라이선스 파일도 함께). npm 패키지(@fontsource 등)는 폰트 파일 취득 도구로만 쓰고 런타임 의존성으로 남기지 않는다.",
      "아이콘은 @phosphor-icons/react 등 npm 패키지로 번들한다 — 아이콘 CDN(iconify, googleapis 등) 링크를 쓰지 않는다.",
      "이미지·아바타 등 데모 콘텐츠도 외부 이미지 URL(i.pravatar.cc 등) 대신 로컬 placeholder(AvatarFallback, public/ 내 이미지)를 쓴다.",
      "next.config의 images.remotePatterns에 외부 도메인을 추가하지 않는다 — next/image는 로컬/자체 호스팅 이미지만 최적화 대상으로 둔다.",
      "빌드 산출물(.next) 외부 리소스 부재를 자동 테스트로 실증한다 — test/closed-network.test.ts가 프로덕션 정적 HTML/CSS에서 외부 <script src>/<link href>/CSS url()/CDN 힌트 문자열 0건을, test/sourcemap.test.ts가 프로덕션 청크에 sourcemap 부재를 검증한다.",
      "관측(analytics·APM) 로더만 예외로 둘 수 있고, 예외는 세 조건을 모두 만족해야 한다 — (1) 환경변수로 켜져야 하고 값이 없으면 스크립트가 아예 렌더되지 않는다(폐쇄망 배포는 변수를 주지 않으므로 외부 요청이 0건이다), (2) 허용 호스트를 코드에 목록으로 적고 그 목록만 통과시키는 게이트를 둔다 — 린트에서는 eslint-plugin-doksam-ui 의 no-external-url allow 옵션을 그 스크립트가 있는 파일에만 좁혀 주고, 빌드 산출물을 훑는 테스트에도 같은 성격의 허용 목록을 둔다(둘은 검사 대상이 달라 목록이 같지 않을 수 있다), (3) 화면 기능은 그 스크립트 없이도 완전히 동작한다. 폰트·아이콘·이미지·스타일·데이터는 이 예외에 들지 않는다 — 화면이 그것 없이 성립하지 않으므로 self-host가 유일한 답이다.",
    ],
  },
  {
    title: "TypeScript",
    kind: "invariant",
    items: [
      "any 타입을 쓰지 않는다.",
      "TypeScript strict 모드를 유지한다.",
    ],
  },
  {
    title: "의존성 규율",
    kind: "invariant",
    items: [
      "새 UI 라이브러리 추가를 지양한다 — 먼저 shadcn/ui 프리미티브 조합, 아이콘 표준 3종(Phosphor 기본, Lucide, Tabler 백업), 폰트·이미지 self-host로 요구사항을 풀 수 있는지 검토한 뒤에만 새 패키지를 고려한다.",
      "새 패키지가 불가피하면 추가 전에 다음을 확인하고 PR/이슈에 근거를 남긴다: (1) 유지보수 상태(최근 커밋·이슈 대응 여부), (2) 라이선스가 MIT·Apache-2.0·BSD 계열인지(GPL 등 카피레프트 계열 제외), (3) 번들 크기·트리쉐이킹 비용, (4) 폐쇄망(금융권) 배포를 위해 self-host 가능한지(런타임에 외부 CDN·외부 URL fetch가 없는지).",
      "위 확인 항목 중 하나라도 통과하지 못하면(라이선스 불명, 유지보수 중단, self-host 불가 등) 채택하지 않는다.",
      "@tanstack/react-table·@dnd-kit(core/sortable/utilities)는 self-host 검증(MIT 라이선스, 런타임 외부 CDN/fetch 없음, 폐쇄망 빌드 테스트 그린)을 마친 승인 의존성이다 — TableSortable(#24)에서 사용한다.",
    ],
  },
  {
    title: "UI 패턴",
    kind: "decision",
    items: [
      "화면을 조립할 때 ui.doksam.com/patterns 와 templates 를 참고해 적합한 출발점을 고른다. 그대로 쓰기, 일부 조합·변형, 프리미티브로 새 패턴 설계가 모두 가능하다. 카탈로그와 외형이 같다는 사실보다 사용자 흐름에 맞는지가 기준이다.",
      "주식·파이프라인 등 도메인 화면도 Srope 확장 패턴을 참고하되 필수 출발점으로 삼지 않는다. 제품의 사용자·정보 우선순위·갱신 주기에 맞게 정보 구조와 상호작용을 다시 설계할 수 있다.",
      "경계 — 제품의 공통 내비게이션·용어·상호작용 약속은 일관되게 유지한다. 그 안에서 과업이 다른 화면은 셸·본문 구조가 달라도 된다. 모든 화면에 같은 app-shell 변형을 강제하지 않으며 사용자가 이동 맥락을 잃지 않는지 확인한다.",
      "경계 — 로딩·빈 목록·에러 상태는 반드시 제공한다. /patterns/state 는 참고 구현이며 제품의 문맥과 회복 행동에 맞게 표현을 바꿀 수 있다.",
    ],
  },
  {
    title: "도메인 확장 (Bizinfo)",
    kind: "decision",
    items: [
      "이 절은 사업자(비즈니스) 도메인을 다루는 프로젝트에만 적용한다 — 해당하지 않으면 Bizinfo 카테고리를 설치하지 않는다.",
      "적용한다면 공통 컴포넌트 대신 ui.doksam.com/components 의 Bizinfo 카테고리 확장을 먼저 찾는다.",
      "화면 사용법 안내가 필요하면 ScreenHelpDialog 패턴((?) 버튼)을 쓴다 — 도움말이 필요하다는 것은 화면이 복잡하다는 신호이므로, 먼저 화면을 줄일 수 있는지 본다.",
      "경계 — 사업자등록번호를 화면에 표시할 때는 formatBizNo(XXX-XX-XXXXX 형태)를 쓴다: 저장·API 전송값은 원본 10자리를 그대로 유지한다.",
    ],
  },
  {
    title: "AI로 설치하기 (shadcn 커스텀 레지스트리)",
    kind: "invariant",
    items: [
      "doksam-ui 고유 자산(shadcn/ui 프리미티브가 아닌 것 — badge-extended, tooltip-icon-button, table-sortable, screen-help-dialog, json-tree, log-viewer, request-inspector, finance-* 유틸, format-biz-no, ui.doksam.com/profiles 의 브랜드 프로필 — profile-admin·profile-service 등 프로필 이름 하나당 한 항목이다. 같은 profile- 접두를 쓰는 profile-scope 는 프로필이 아니라 네 축을 data-* 속성으로 해소해 주는 유틸리티이므로 구분해서 고른다)은 코드를 복붙하지 않고 npx shadcn add https://ui.doksam.com/r/<name>.json 으로 설치한다.",
      "프리미티브(button·card·badge 등 components/ui/ 60종)도 이 레지스트리가 배포한다 — 항목 사이의 registryDependencies 는 전부 https://ui.doksam.com/r/<name>.json 이며 bare 이름을 쓰지 않는다. bare 이름은 상류 shadcn 에서 내려와 소비 프로젝트의 프리셋과 상류 버전에 따라 내용이 갈리므로, 설치본이 카탈로그와 같다는 보장이 사라진다(scripts/registry/ui-items.test.ts 가 막는다).",
      "설치 가능한 전체 목록과 각 install 명령은 ui.doksam.com/llms.txt(AI 발견용 카탈로그)에서 기계적으로 읽을 수 있다 — registry.json(레포 루트)이 단일 진실원천이며 pnpm gen:llms 로 동기화한다.",
      "이 레지스트리를 프로젝트에 상시 등록해두려면 components.json의 registries에 \"@doksam-ui\": \"https://ui.doksam.com/r/{name}.json\" 을 추가한다 — 이후 npx shadcn add @doksam-ui/<name> 으로 짧게 설치할 수 있다.",
      "폰트(assets/fonts/)는 registry item으로 자동 설치되지 않는다 — 프로필(profile-admin 등)은 cssVars로 테마 색·sidebar·risk·heatmap 토큰 값을 설치하고 radius는 해당 항목의 cssVars.theme으로 적용한다. Tailwind 유틸리티용 @theme inline 매핑과 프로필의 data-* 축 속성은 별도 연결하며, 폰트는 fonts/index.ts 안내대로 woff2를 수동 복사 후 next/font/local로 연결한다.",
    ],
  },
  {
    title: "표준 준수 체크리스트",
    kind: "invariant",
    items: [
      "[ ] DESIGN.md 에 사용자 과업·구조·성격·조합과 선택 이유 기록 — 배제 개수와 문서 분량 강제 없음.",
      "[ ] 수렴 안티패턴 절의 항목을 화면별로 자가 점검.",
      "[ ] 브랜드 프로필을 출발점으로 검토하고 제품에 맞는 테마·폰트·시각 성격 선택.",
      "[ ] 프로필 기본값과 다른 corner·radius·density·typeContrast 는 프로젝트 범위에서 관리하고 이유 기록 — 카탈로그 등록을 구현의 선행 조건으로 두지 않는다.",
      "[ ] 셸·패턴은 과업에 맞게 조합·변형 또는 신규 설계 — 색만 바꾼 템플릿 복제와 동일 구조의 관성적 반복 점검.",
      "[ ] 하드코딩 색 0건 — 시맨틱 색상 토큰만 사용.",
      "[ ] 위험·심각도 등급은 --risk-* 토큰으로, chart-1~5·상태 색으로 대체 0건 — 등급마다 색 외 채널(텍스트·아이콘) 동반.",
      "[ ] 아이콘 표준 3종(Phosphor 기본)만, 이모지 아이콘 0건.",
      "[ ] 폰트·리소스 전부 셀프호스팅 (외부 CDN 0건).",
      "[ ] 빌드 산출물 외부 리소스 부재를 자동 테스트로 실증 (test/closed-network.test.ts, test/sourcemap.test.ts).",
      "[ ] 새 페이지에 loading/error 동반, 상태 UI는 ui.doksam.com/patterns/state 를 따른다.",
      "[ ] transition-all 0건(components/ui/ 제외), duration은 100/200/300 스케일만.",
      "[ ] 커스텀 애니메이션은 prefers-reduced-motion: reduce 에서 정지 — 자동 테스트로 실증 (test/motion-rules.test.ts).",
      "[ ] 아이콘 단독 버튼에 접근 가능한 이름, 포커스 표시 유지, 본문 명도대비 WCAG AA.",
      "[ ] TypeScript strict·any 0건, Sonar Quality Gate 통과.",
    ],
  },
];

/** 디자인 브리프 절. scripts/gen-llms.mjs 가 llms.txt 맨 앞에 싣는다 — 문안은 여기에만 둔다. */
export const DESIGN_BRIEF_SECTION: RulesSection = RULES_SECTIONS[0];

/** 수렴 안티패턴 절 — gen-llms 가 브리프 바로 뒤에 전문을 싣는다(#34). */
export const CONVERGENCE_ANTIPATTERNS_SECTION: RulesSection = RULES_SECTIONS[1];

function sectionToMarkdown(section: RulesSection): string {
  const bullets = section.items.map((item) => `- ${item}`).join("\n");
  return `## ${section.title} [${section.kind}]\n\n${bullets}`;
}

/** AI 프롬프트에 그대로 붙여넣는 markdown 원문. RULES_SECTIONS 로부터 생성된다. */
export const RULES_MARKDOWN = [
  "# doksam-ui 사용 규칙",
  "doksam 프로젝트에서 UI를 만들 때 지키는 규칙입니다. ui.doksam.com 을 참고하세요.",
  "규칙은 두 층입니다. 절 제목 뒤에 붙은 표시를 먼저 보세요.",
  [
    "- [invariant] — 불변. 프로젝트가 달라도 답이 같습니다. 어기면 표준 위반이고, 상당수는 자동 테스트가 막습니다.",
    "- [decision] — 선택. 프로젝트마다 정답이 다릅니다. 이 절은 명령이 아니라 선택지와 고르는 기준을 주며, 무엇을 골랐는지는 DESIGN.md 에 남깁니다. 각 선택지에는 그 선택을 골랐을 때 지켜야 할 경계가 붙습니다.",
  ].join("\n"),
  '불변만 지키면 "틀리지 않은" 화면이 나올 뿐이고, 선택을 하지 않으면 모든 화면이 같은 뼈대로 수렴합니다. 무엇을 만들기 전에 "디자인 브리프" 절부터 수행하세요.',
  ...RULES_SECTIONS.map(sectionToMarkdown),
].join("\n\n");
