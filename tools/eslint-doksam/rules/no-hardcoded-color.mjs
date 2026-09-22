import { RULE_META } from "../meta.mjs"

/**
 * 하드코딩 색을 막는다 — 규칙 원문 "컬러 · 토큰" 절의 1번 조항.
 *
 * 세 갈래를 본다.
 *  1. 색 함수 리터럴: rgb()/rgba()/hsl()/oklch()/lab()/color-mix() 등
 *  2. hex 리터럴: #rrggbb·#rrggbbaa 는 항상, #rgb·#rgba 는 색 문맥에서만
 *     (`href="#abc"` 같은 앵커가 3자리 hex 와 구분되지 않기 때문이다 — 문맥을
 *     보지 않고 잡으면 오탐이 나고, 오탐이 나면 사람은 규칙 전체를 끈다)
 *  3. Tailwind 팔레트 클래스: text-red-500, bg-slate-200/50, border-t-blue-600,
 *     dark:hover:bg-white 처럼 변형 접두가 붙은 형태까지
 *
 * `bg-[#0f172a]` 같은 임의 값 클래스는 2번이 문자열 안에서 그대로 잡는다.
 */

/** Tailwind 기본 팔레트 — 시맨틱 토큰이 아닌 고정 색 이름. */
const PALETTE = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
]

/** 색을 받는 유틸리티 접두 — 이 접두 + 팔레트 조합만 클래스로 본다. */
const COLOR_UTILITIES = [
  "bg",
  "text",
  "border",
  "ring",
  "outline",
  "fill",
  "stroke",
  "from",
  "via",
  "to",
  "shadow",
  "decoration",
  "divide",
  "accent",
  "caret",
  "placeholder",
  "selection",
]

const SHADES = "50|100|200|300|400|500|600|700|800|900|950"
const AXIS = "t|r|b|l|x|y|s|e|offset"
const OPACITY = "(?:\\/\\d{1,3})?"

const PALETTE_CLASS = new RegExp(
  `^(?:${COLOR_UTILITIES.join("|")})(?:-(?:${AXIS}))?-(?:(?:${PALETTE.join("|")})-(?:${SHADES})|white|black)${OPACITY}$`,
)

/** 색 함수 호출 — CSS 문자열 안에서 그대로 잡는다. */
const COLOR_FUNCTION = /\b(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color-mix)\s*\(/

const HEX = /#[0-9a-fA-F]{3,8}\b/g

/**
 * 색 함수 인자에 들어간 CSS named color — hex 와 같은 하드코딩 색이다.
 *
 * `color-mix(in oklch, var(--chart-1) 20%, white)` 는 겉으로는 토큰 파생처럼
 * 보이지만 `white` 가 곧 `#ffffff` 다(#79 에서 카탈로그 자신이 실제로 이렇게
 * 우회했다). 문자열 전체가 아니라 **색 함수 인자 안에서만** 본다 — 밖에서도
 * 잡으면 "white paper" 같은 평범한 문장이 걸려 오탐이 쏟아진다.
 *
 * `transparent`·`currentColor` 는 색을 새로 만드는 것이 아니라 투명도·상속을
 * 가리키는 키워드라 제외한다.
 */
const NAMED_COLOR =
  /\b(?:white|black|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|cyan|magenta|silver|gold|navy|teal|olive|maroon|lime|aqua|fuchsia|indigo|violet|beige|ivory|khaki|salmon|coral|crimson|turquoise|lavender|tan|plum|orchid|wheat|azure|snow|linen|tomato|chocolate|skyblue|steelblue|slateblue|midnightblue|whitesmoke|ghostwhite|antiquewhite|floralwhite|navajowhite|rebeccapurple)\b/i

/** 색 문맥으로 보는 식별자 — 속성 이름·객체 키·변수 이름에 쓰인다. */
const COLOR_NAME = /colou?r|fill|stroke|background|shadow|border|stop|palette|swatch|gradient|tint|shade/i

/** 변형 접두(`dark:`, `hover:`, `data-[x]:`)를 떼고 유틸리티 본문만 남긴다. */
function utilityOf(token) {
  let depth = 0
  let lastColon = -1
  for (let i = 0; i < token.length; i += 1) {
    const ch = token[i]
    if (ch === "[" || ch === "(") depth += 1
    else if (ch === "]" || ch === ")") depth -= 1
    else if (ch === ":" && depth === 0) lastColon = i
  }
  let utility = token.slice(lastColon + 1)
  // Tailwind v4 의 important 접미/접두와 음수 부호를 떼어 낸다.
  if (utility.startsWith("!")) utility = utility.slice(1)
  if (utility.endsWith("!")) utility = utility.slice(0, -1)
  if (utility.startsWith("-")) utility = utility.slice(1)
  return utility
}

/** 이 문자열이 색을 다루는 자리인가 — 3·4자리 hex 판정에만 쓴다. */
function inColorContext(node) {
  let current = node
  for (let depth = 0; current && depth < 4; depth += 1) {
    const parent = current.parent
    if (!parent) return false
    if (parent.type === "JSXAttribute" && parent.name?.name && COLOR_NAME.test(String(parent.name.name))) return true
    if (parent.type === "Property") {
      const key = parent.key?.name ?? parent.key?.value
      if (key && COLOR_NAME.test(String(key))) return true
    }
    if (parent.type === "VariableDeclarator" && parent.id?.name && COLOR_NAME.test(parent.id.name)) return true
    current = parent
  }
  return false
}

/**
 * 색 함수 호출 하나를 떼어내 "토큰에서 파생된 것인지" 판정한다.
 *
 * `start` 에서 시작하는 괄호를 짝 맞춰 닫는 데까지 잘라낸 뒤, 그 안에 `var(--…)`
 * 가 있고 색 리터럴(hex·중첩 색 함수)이 없으면 파생으로 본다.
 */
function isTokenDerived(text, start) {
  const open = text.indexOf("(", start)
  if (open === -1) return false
  let depth = 0
  let end = -1
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++
    else if (text[i] === ")") {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  const args = text.slice(open + 1, end === -1 ? text.length : end)
  // 인자에 숫자가 하나도 없으면 구체적인 색일 수 없다 — 템플릿 보간으로 값을
  // 채우는 `rgb(${r}, ${g}, ${b})` 같은 코드다(문자열 조각만 모으면 인자가
  // ", , " 로 남는다). 런타임 계산 결과를 문자열로 조립하는 것이지 색을 박은
  // 것이 아니므로 잡지 않는다.
  if (!/\d/.test(args)) return true
  if (!/var\(\s*--/.test(args)) return false
  // HEX 는 /g 라 test() 가 lastIndex 를 남긴다 — 상태 없는 match 로 확인한다.
  if (args.match(HEX)) return false
  // named color 가 섞이면 토큰 파생이 아니라 리터럴과의 혼합이다.
  if (NAMED_COLOR.test(args)) return false
  // 중첩 색 함수의 인자도 같은 기준으로 본다 — 안쪽이 리터럴이면 파생이 아니다.
  const inner = COLOR_FUNCTION.exec(args)
  if (inner && !isTokenDerived(args, inner.index)) return false
  return true
}

/** 문자열 하나에서 위반 조각을 모은다. */
function findViolations(text, node) {
  const found = []

  const fn = COLOR_FUNCTION.exec(text)
  // 색 함수라도 인자가 토큰(var(--x))뿐이면 값을 새로 만든 것이 아니라 토큰을
  // 가공한 것이다 — color-mix(in oklch, var(--foreground) 8%, transparent) 는
  // 그림자 농도를 토큰에서 파생시키는 정상 용법이라 잡지 않는다. 안에 색
  // 리터럴이 섞여 있으면(#fff·oklch(0.5 0 0) 등) 그때는 하드코딩이다.
  if (fn && !isTokenDerived(text, fn.index)) found.push(`${fn[1]}()`)

  for (const match of text.matchAll(HEX)) {
    const digits = match[0].length - 1
    if (digits === 6 || digits === 8) found.push(match[0])
    else if ((digits === 3 || digits === 4) && inColorContext(node)) found.push(match[0])
  }

  for (const token of text.split(/\s+/)) {
    if (!token) continue
    if (PALETTE_CLASS.test(utilityOf(token))) found.push(token)
  }

  return found
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: RULE_META["no-hardcoded-color"].summary,
      section: RULE_META["no-hardcoded-color"].section,
      url: "https://ui.doksam.com/rules/lint",
    },
    schema: [
      {
        type: "object",
        properties: {
          // 색 자체가 데이터인 자리(색 선택기 스와치 등)를 위한 탈출구.
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedColor:
        "하드코딩 색 '{{value}}' — 시맨틱 토큰(bg-background, text-destructive, text-chart-1)만 쓴다. doksam-ui 규칙 [invariant] '컬러 · 토큰' (https://ui.doksam.com/rules)",
    },
  },

  create(context) {
    const allow = new Set(context.options[0]?.allow ?? [])

    const check = (node, text) => {
      if (typeof text !== "string" || text.length === 0) return
      for (const value of findViolations(text, node)) {
        if (allow.has(value)) continue
        context.report({ node, messageId: "hardcodedColor", data: { value } })
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw)
      },

      /**
       * 템플릿 리터럴은 조각(quasi)별로 검사하면 색 함수가 조각 경계에서 쪼개져
       * 빠져나간다 — `` `color-mix(in oklch, ${c} 20%, white)` `` 는 앞 조각에
       * 숫자가 없어 "보간으로 값을 채우는 코드" 로 통과하고, 뒤 조각에는 색
       * 함수가 없어 아무도 `white` 를 보지 않는다(#79).
       *
       * 그래서 보간 자리를 토큰 참조로 메운 **합친 문자열**을 한 번 더 본다.
       * 보간의 실제 값은 정적으로 알 수 없으므로 토큰으로 가정하고, 글자로 적힌
       * 리터럴만 판정한다.
       */
      TemplateLiteral(node) {
        if (node.expressions.length === 0) return
        const joined = node.quasis
          .map((q) => q.value.cooked ?? q.value.raw)
          .join("var(--interpolated)")
        const fn = COLOR_FUNCTION.exec(joined)
        if (!fn || isTokenDerived(joined, fn.index)) return
        context.report({ node, messageId: "hardcodedColor", data: { value: `${fn[1]}()` } })
      },
    }
  },
}
