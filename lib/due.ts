/**
 * 기한 카운트다운 상태 파생 (#82).
 *
 * `due-countdown-badge` 가 쓰는 순수 로직을 컴포넌트에서 분리해 둔다 — 잔여일
 * 계산은 날짜 경계·DST·"오늘이 기한일인가" 같은 함정이 있어서 렌더 코드 안에
 * 섞이면 검증이 안 된다.
 *
 * 설계상 두 가지를 고정하지 않는다:
 *
 * - **며칠부터 임박인가**(`soonWithinDays`)는 프로젝트가 정한다. EWS 실물은 D-3
 *   이지만 다른 도메인은 다르다 — 기본값은 두되 하드코딩하지 않는다.
 * - **문구**는 여기서 만들지 않는다. 상태만 돌려주고 `경과`·`이내`·`기한`·
 *   `만료 임박` 같은 표기는 호출측이 주입한다(i18n 대상).
 */

/** 기한 상태. 여유 → 임박 → 경과 순. */
export const DUE_STATUSES = ["ahead", "soon", "overdue"] as const;

export type DueStatus = (typeof DUE_STATUSES)[number];

/** 날짜 입력 — `Date` 또는 `YYYY-MM-DD` 문자열. */
export type DueInput = Date | string;

export interface DueState {
  /** 기준일 대비 잔여일. 0 은 기한 당일, 음수는 경과한 일수다. */
  readonly daysRemaining: number;
  readonly status: DueStatus;
}

/** 기본 임박 임계값(일). 프로젝트가 다르면 `soonWithinDays` 로 덮는다. */
export const DEFAULT_SOON_WITHIN_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 날짜를 "달력 하루" 번호로 환산한다. 로컬 연·월·일만 뽑아 UTC 자정으로 다시
 * 만들기 때문에 서머타임 전환 구간에서도 하루가 23/25시간이 되지 않는다.
 * `YYYY-MM-DD` 문자열은 `new Date()` 가 UTC 로 해석해 로컬 기준으로 하루가
 * 밀릴 수 있어 직접 파싱한다.
 */
function toDayNumber(input: DueInput, argName: string): number {
  if (typeof input === "string") {
    if (!DATE_ONLY.test(input)) {
      throw new RangeError(`${argName}: 날짜 문자열은 YYYY-MM-DD 형식이어야 합니다 (받은 값: ${input})`);
    }
    const [year, month, day] = input.split("-").map(Number);
    const utc = Date.UTC(year, month - 1, day);
    // Date.UTC 는 2026-02-31 같은 값을 3월로 굴려서 조용히 받아들인다.
    const rolled = new Date(utc);
    if (
      rolled.getUTCFullYear() !== year ||
      rolled.getUTCMonth() !== month - 1 ||
      rolled.getUTCDate() !== day
    ) {
      throw new RangeError(`${argName}: 존재하지 않는 날짜입니다 (받은 값: ${input})`);
    }
    return utc / DAY_MS;
  }

  if (Number.isNaN(input.getTime())) {
    throw new RangeError(`${argName}: 유효하지 않은 Date 입니다.`);
  }
  return Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()) / DAY_MS;
}

export interface ResolveDueOptions {
  /** 잔여일이 이 값 이하이면 `soon`. 0 이상의 정수. 기본값 3. */
  readonly soonWithinDays?: number;
}

/**
 * 기준일(`asOf`) 대비 기한일(`deadline`)의 잔여일과 상태를 돌려준다.
 *
 * 기준일을 인자로 받는 것은 의도적이다 — 내부에서 `new Date()` 를 읽으면 서버
 * 렌더와 클라이언트 렌더가 날짜 경계에서 갈려 hydration 이 어긋나고, 테스트도
 * 시계에 의존하게 된다.
 */
export function resolveDue(
  deadline: DueInput,
  asOf: DueInput,
  options: ResolveDueOptions = {},
): DueState {
  const { soonWithinDays = DEFAULT_SOON_WITHIN_DAYS } = options;
  if (!Number.isInteger(soonWithinDays) || soonWithinDays < 0) {
    throw new RangeError(`soonWithinDays: 0 이상의 정수여야 합니다 (받은 값: ${soonWithinDays})`);
  }

  const daysRemaining = toDayNumber(deadline, "deadline") - toDayNumber(asOf, "asOf");

  let status: DueStatus;
  if (daysRemaining < 0) {
    status = "overdue";
  } else if (daysRemaining <= soonWithinDays) {
    status = "soon";
  } else {
    status = "ahead";
  }

  return { daysRemaining, status };
}
