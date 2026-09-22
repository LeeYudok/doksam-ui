"use client"

import { AuditCodeTag } from "@/components/audit-code-tag"

/** onNavigate 는 함수 prop이라 서버 컴포넌트에서 클라이언트 컴포넌트로 그대로 넘길 수 없다(RSC 직렬화). */
export function AuditCodeTagInteractiveDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AuditCodeTag code="EVD-2025-0518" onNavigate={() => {}} />
      <AuditCodeTag code="TAX-DELINQ-01" copyable />
    </div>
  )
}
