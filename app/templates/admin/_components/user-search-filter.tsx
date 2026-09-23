"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole, UserStatus } from "../_data/users-data"
import { ROLE_LABEL, STATUS_LABEL } from "../_data/users-data"

export interface UserSearchFilterValue {
  search: string
  role: UserRole | "all"
  status: UserStatus | "all"
}

export const USER_SEARCH_FILTER_DEFAULT: UserSearchFilterValue = {
  search: "",
  role: "all",
  status: "all",
}

interface UserSearchFilterProps {
  value: UserSearchFilterValue
  onChange: (value: UserSearchFilterValue) => void
}

/**
 * components/patterns/form-input/search-filter.tsx 의 controlled 검색바
 * 패턴을 이 템플릿의 사용자 데이터(역할/상태)에 맞춰 적용한 버전.
 */
export function UserSearchFilter({ value, onChange }: Readonly<UserSearchFilterProps>) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <MagnifyingGlassIcon
          size={14}
          weight="regular"
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="이름 또는 이메일로 검색"
          className="h-8 pl-8 text-xs"
        />
      </div>
      <Select value={value.role} onValueChange={(role: UserRole | "all") => onChange({ ...value, role })}>
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue placeholder="역할" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 역할</SelectItem>
          {(Object.entries(ROLE_LABEL) as [UserRole, string][]).map(([role, label]) => (
            <SelectItem key={role} value={role}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.status} onValueChange={(status: UserStatus | "all") => onChange({ ...value, status })}>
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 상태</SelectItem>
          {(Object.entries(STATUS_LABEL) as [UserStatus, string][]).map(([status, label]) => (
            <SelectItem key={status} value={status}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" variant="outline" onClick={() => onChange(USER_SEARCH_FILTER_DEFAULT)}>
        초기화
      </Button>
    </div>
  )
}
