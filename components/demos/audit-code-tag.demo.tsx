import { AuditCodeTag } from "@/components/audit-code-tag"
import { AuditCodeTagInteractiveDemo } from "./audit-code-tag.demo.client"

export const demo = (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <AuditCodeTag code="EVD-2025-0518" />
      <AuditCodeTag code="TAX-DELINQ-01" />
      <AuditCodeTag code="BIO-AUDIT-44" />
    </div>
    <AuditCodeTagInteractiveDemo />
  </div>
)

export const code = `<AuditCodeTag code="EVD-2025-0518" />
<AuditCodeTag code="TAX-DELINQ-01" />
<AuditCodeTag code="BIO-AUDIT-44" />

{/* 근거 문서로 이동 */}
<AuditCodeTag code="EVD-2025-0518" onNavigate={() => router.push(\`/evidence/\${code}\`)} />

{/* 복사 아이콘을 함께 표시 */}
<AuditCodeTag code="TAX-DELINQ-01" copyable />`

export const dos = [
  "접두어(EVD-/TAX-/BIO- 등)로 색을 나누지 않는다 — 코드 체계가 프로젝트마다 달라, 색 규칙을 이 컴포넌트가 고정하면 다른 체계를 쓰는 화면에서 의미가 틀어진다.",
  "근거 문서로 이동하는 화면에서만 onNavigate를 준다 — 없으면 정적 태그로 렌더돼 불필요한 포커스 정지가 생기지 않는다.",
  "여러 개가 촘촘히 나열되는 목록에서는 copyable을 끄고, 상세 화면처럼 개별 코드를 다루는 자리에서만 켠다.",
]

export const donts = [
  "코드 문자열을 파싱해 접두어별 배지 variant를 만들지 않는다 — 접두어 규칙은 도메인마다 다른 데이터일 뿐 컴포넌트의 지식이 아니다.",
  "onNavigate와 copyable을 동시에 켰을 때 복사 아이콘 클릭이 상위 onNavigate로 새지 않게 한다(이 컴포넌트는 내부에서 stopPropagation으로 이미 막는다) — 커스텀 래퍼로 감쌀 때도 같은 전제를 유지한다.",
]
