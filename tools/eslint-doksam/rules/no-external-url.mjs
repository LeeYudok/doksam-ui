import { RULE_META } from "../meta.mjs"

/**
 * 외부 리소스를 **불러오는** 자리를 막는다 — 규칙 원문 "폐쇄망 대응" 절.
 *
 * 조항이 금지하는 것은 "빌드·런타임의 외부 CDN·외부 URL fetch" 이지 URL 을 글자로
 * 적는 것이 아니다. 문자열에 `https://` 가 있다고 전부 잡으면 문서 링크·스키마
 * URL·사용자가 누르는 바깥 링크까지 걸려 오탐이 쏟아지고, 오탐이 쏟아지면 사람은
 * 규칙을 끈다(카탈로그 자신에게 돌려 실측한 결과 84건 중 대부분이 그런 것이었다).
 * 그래서 **리소스를 적재하는 위치**만 본다.
 *
 *  - `src`/`srcSet`/`poster`, `<link href>` 등 브라우저가 받으러 가는 속성
 *  - fetch·axios·new Worker/WebSocket/EventSource/URL 등 런타임 요청
 *  - CSS 의 `url(https://...)`
 *  - `next/font/google` import — 빌드 시 외부에서 폰트를 받는다
 *  - next.config 의 `images.remotePatterns`
 *  - 런타임 대입: `el.src = "https://..."`
 */

const EXTERNAL = /https?:\/\/[^\s"'`)]+/g
const CSS_URL = /url\(\s*['"]?(https?:\/\/[^\s'")]+)/gi

const DEFAULT_ALLOW = [
  "http://localhost",
  "https://localhost",
  "http://127.0.0.1",
  "https://127.0.0.1",
  "http://0.0.0.0",
  "http://www.w3.org/",
  "https://www.w3.org/",
]

/** 브라우저가 받으러 가는 JSX 속성. */
const RESOURCE_ATTRIBUTES = new Set(["src", "srcSet", "srcset", "poster", "data"])

/** 런타임에 외부로 나가는 호출·생성자. */
const REQUEST_CALLEES = new Set(["fetch", "importScripts", "axios"])
const REQUEST_CONSTRUCTORS = new Set(["Worker", "SharedWorker", "WebSocket", "EventSource", "URL", "Request"])

/** 이 노드가 담은 문자열들(리터럴·템플릿 조각). */
function stringsOf(node) {
  if (!node) return []
  if (node.type === "Literal" && typeof node.value === "string") return [node.value]
  if (node.type === "TemplateLiteral") return node.quasis.map((q) => q.value.cooked ?? q.value.raw)
  if (node.type === "JSXExpressionContainer") return stringsOf(node.expression)
  return []
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: RULE_META["no-external-url"].summary,
      section: RULE_META["no-external-url"].section,
      url: "https://ui.doksam.com/rules/lint",
    },
    schema: [
      {
        type: "object",
        properties: {
          // 추가로 허용할 URL 접두. 폐쇄망 안에 실재하는 사내 호스트에만 쓴다.
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      externalResource:
        "외부 리소스 '{{value}}' 를 불러온다 — 폰트·아이콘·이미지·스크립트는 전부 self-host 한다(next/font/local, npm 아이콘 패키지, public/ 로컬 이미지). doksam-ui 규칙 [invariant] '폐쇄망 대응' (https://ui.doksam.com/rules)",
      googleFont:
        "next/font/google 은 빌드 시 외부에서 폰트를 받는다 — next/font/local 을 쓰고 woff2 를 assets/fonts/ 에 커밋한다(라이선스 파일도 함께). doksam-ui 규칙 [invariant] '폐쇄망 대응' (https://ui.doksam.com/rules)",
      remotePatterns:
        "next.config 의 images.remotePatterns 에 외부 도메인을 등록하지 않는다 — next/image 는 로컬·자체 호스팅 이미지만 최적화 대상으로 둔다. doksam-ui 규칙 [invariant] '폐쇄망 대응' (https://ui.doksam.com/rules)",
    },
  },

  create(context) {
    const allow = [...DEFAULT_ALLOW, ...(context.options[0]?.allow ?? [])]
    const isAllowed = (url) => allow.some((prefix) => url.startsWith(prefix))

    /** 리소스 적재 위치의 값 노드를 검사한다. */
    const checkResource = (node, valueNode) => {
      for (const text of stringsOf(valueNode)) {
        for (const match of text.matchAll(EXTERNAL)) {
          if (isAllowed(match[0])) continue
          context.report({ node, messageId: "externalResource", data: { value: match[0] } })
        }
      }
    }

    return {
      // 어느 위치든 CSS url() 은 곧 적재다.
      Literal(node) {
        if (typeof node.value !== "string") return
        for (const match of node.value.matchAll(CSS_URL)) {
          if (isAllowed(match[1])) continue
          context.report({ node, messageId: "externalResource", data: { value: match[1] } })
        }
      },

      JSXAttribute(node) {
        const name = node.name?.name
        if (typeof name !== "string") return
        const isResourceAttr = RESOURCE_ATTRIBUTES.has(name)
        // href 는 <link> 만 적재다 — <a href>·<Link href> 는 사용자가 누르는 이동이다.
        const element = node.parent?.name?.name
        const isLinkHref = name === "href" && element === "link"
        if (!isResourceAttr && !isLinkHref) return
        checkResource(node, node.value)
      },

      CallExpression(node) {
        const callee = node.callee
        const name =
          callee.type === "Identifier"
            ? callee.name
            : callee.type === "MemberExpression" && callee.object?.type === "Identifier"
              ? callee.object.name
              : undefined
        if (!name || !REQUEST_CALLEES.has(name)) return
        for (const argument of node.arguments) checkResource(node, argument)
      },

      NewExpression(node) {
        if (node.callee?.type !== "Identifier" || !REQUEST_CONSTRUCTORS.has(node.callee.name)) return
        for (const argument of node.arguments) checkResource(node, argument)
      },

      AssignmentExpression(node) {
        if (node.left?.type !== "MemberExpression") return
        const property = node.left.property?.name ?? node.left.property?.value
        if (property !== "src" && property !== "href") return
        checkResource(node, node.right)
      },

      ImportDeclaration(node) {
        if (node.source?.value !== "next/font/google") return
        context.report({ node, messageId: "googleFont" })
      },

      Property(node) {
        const key = node.key?.name ?? node.key?.value
        if (key !== "remotePatterns") return
        // 빈 배열은 "외부 도메인 없음" 을 명시한 것이므로 통과시킨다.
        if (node.value?.type === "ArrayExpression" && node.value.elements.length === 0) return
        context.report({ node, messageId: "remotePatterns" })
      },
    }
  },
}
