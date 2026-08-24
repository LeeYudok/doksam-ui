"use client";

import { useRef, useState, type ComponentProps, type MouseEvent } from "react";

import {
  RegionHoverTip,
  regionFillColor,
  regionShare,
  buildRegionStats,
  type RegionDatum,
} from "./shared";

// 실제 지리 위상을 따른 개략 배치 — [col, row].
const GRID: Record<string, [number, number]> = {
  서울특별시: [1, 0],
  강원특별자치도: [3, 0],
  인천광역시: [0, 1],
  경기도: [1, 1],
  충청북도: [2, 1],
  경상북도: [3, 1],
  충청남도: [0, 2],
  세종특별자치시: [1, 2],
  대전광역시: [2, 2],
  대구광역시: [3, 2],
  전북특별자치도: [0, 3],
  광주광역시: [1, 3],
  경상남도: [2, 3],
  울산광역시: [3, 3],
  전라남도: [0, 4],
  부산광역시: [2, 4],
  제주특별자치도: [0, 5],
};

const SHORT_NAME: Record<string, string> = {
  서울특별시: "서울",
  강원특별자치도: "강원",
  인천광역시: "인천",
  경기도: "경기",
  충청북도: "충북",
  경상북도: "경북",
  충청남도: "충남",
  세종특별자치시: "세종",
  대전광역시: "대전",
  대구광역시: "대구",
  전북특별자치도: "전북",
  광주광역시: "광주",
  경상남도: "경남",
  울산광역시: "울산",
  전라남도: "전남",
  부산광역시: "부산",
  제주특별자치도: "제주",
};

const CELL = 112;
const PAD = 10;
const MAX_SIDE = 100;
const MIN_SIDE = 34;
// 이 변 길이 이상이면 큰 라벨(15/12px), 미만이면 축소 라벨(12/10px)로 내부 표기.
const LABEL_LARGE_SIDE = 52;
const VIEW_W = PAD * 2 + CELL * 4;
const VIEW_H = PAD * 2 + CELL * 6;
const EXTRUDE_X = -4;
const EXTRUDE_Y = -8;

export interface RegionCartogramProps {
  data: RegionDatum[];
  valueLabel: string;
  unit: string;
  selectedRegion: string;
  onRegionClick?: (region: string) => void;
}

/**
 * Demers 타일 카토그램 — 타일 면적이 값에 비례해, 지리 지도의 "면적 큰 지역
 * 과대평가" 왜곡을 보완하는 보조 뷰. 위치는 GRID 개략 배치.
 */
export function RegionCartogram({
  data,
  valueLabel,
  unit,
  selectedRegion,
  onRegionClick,
}: RegionCartogramProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const stats = buildRegionStats(data);

  function handleMove(e: MouseEvent) {
    const box = boxRef.current;
    if (!box) return;
    const b = box.getBoundingClientRect();
    setTipPos({ x: e.clientX - b.left, y: e.clientY - b.top, w: b.width, h: b.height });
  }

  const placed = data.filter((r) => GRID[r.region]);
  // hover 타일은 SVG 마지막에 그려 돌출·측면이 이웃에 가리지 않게 한다.
  const ordered = hovered
    ? [...placed.filter((r) => r.region !== hovered), ...placed.filter((r) => r.region === hovered)]
    : placed;
  const hoveredRegion = placed.find((r) => r.region === hovered);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={boxRef} className="relative w-full max-w-md self-center">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`시/도별 ${valueLabel} 분포 카토그램`}
        >
          {ordered.map((r) => (
            <CartogramTile
              key={r.region}
              region={r}
              maxCount={stats.maxCount}
              total={stats.total}
              dimmed={hovered !== null && hovered !== r.region}
              hovered={hovered === r.region}
              selected={selectedRegion === r.region}
              unit={unit}
              onRegionClick={onRegionClick}
              onHover={setHovered}
              onMove={handleMove}
            />
          ))}
        </svg>
        {hoveredRegion && (
          <RegionHoverTip
            region={hoveredRegion}
            stats={stats}
            valueLabel={valueLabel}
            unit={unit}
            x={tipPos.x}
            y={tipPos.y}
            containerWidth={tipPos.w}
            containerHeight={tipPos.h}
          />
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        타일 면적·색 = {valueLabel} 비례(√ 스케일) · 위치는 개략 배치
      </p>
    </div>
  );
}

interface CartogramTileProps {
  region: RegionDatum;
  maxCount: number;
  total: number;
  dimmed: boolean;
  hovered: boolean;
  selected: boolean;
  unit: string;
  onRegionClick?: (region: string) => void;
  onHover: (region: string | null) => void;
  onMove: (e: MouseEvent) => void;
}

interface TileGeometry {
  side: number;
  cx: number;
  cy: number;
  largeLabel: boolean;
  labelFill: string;
}

/** GRID 좌표와 값 비율에서 타일 한 장의 배치·크기·라벨 표기를 계산한다. */
function tileGeometry(count: number, maxCount: number, col: number, row: number): TileGeometry {
  const ratio = maxCount > 0 ? count / maxCount : 0;
  const side = MIN_SIDE + (MAX_SIDE - MIN_SIDE) * Math.sqrt(ratio);
  // 진한 타일 내부 라벨은 배경색 글자로 대비 확보(√ 보간 55% 이상 = 진한 편).
  const darkFill = Math.pow(ratio, 0.45) > 0.5;
  return {
    side,
    cx: PAD + col * CELL + CELL / 2,
    cy: PAD + row * CELL + CELL / 2,
    largeLabel: side >= LABEL_LARGE_SIDE,
    labelFill: darkFill ? "var(--background)" : "var(--foreground)",
  };
}

type TileInteraction = Pick<
  ComponentProps<"g">,
  "role" | "tabIndex" | "aria-pressed" | "onClick" | "onKeyDown"
>;

/** 클릭 핸들러가 있을 때만 버튼 시맨틱(role/tabIndex/Enter·Space)을 부여한다. */
function tileInteraction(
  region: string,
  selected: boolean,
  onRegionClick?: (region: string) => void,
): TileInteraction {
  if (!onRegionClick) return {};
  return {
    role: "button",
    tabIndex: 0,
    "aria-pressed": selected,
    onClick: () => onRegionClick(region),
    onKeyDown: (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      onRegionClick(region);
    },
  };
}

function tileAriaLabel(region: RegionDatum, unit: string, selected: boolean): string {
  return `${region.region} ${region.count.toLocaleString()}${unit}${selected ? " (선택됨)" : ""}`;
}

function TileLabels({
  region,
  total,
  cx,
  cy,
  largeLabel,
  labelFill,
}: Readonly<{
  region: RegionDatum;
  total: number;
  cx: number;
  cy: number;
  largeLabel: boolean;
  labelFill: string;
}>) {
  return (
    <>
      <text
        x={cx}
        y={largeLabel ? cy - 3 : cy - 2}
        textAnchor="middle"
        className={`pointer-events-none font-semibold ${largeLabel ? "text-[15px]" : "text-[12px]"}`}
        style={{ fill: labelFill }}
      >
        {SHORT_NAME[region.region] ?? region.region}
      </text>
      <text
        x={cx}
        y={largeLabel ? cy + 14 : cy + 11}
        textAnchor="middle"
        className={`pointer-events-none opacity-80 ${largeLabel ? "text-[12px]" : "text-[10px]"}`}
        style={{ fill: labelFill }}
      >
        {regionShare(region.count, total)}%
      </text>
    </>
  );
}

function CartogramTile({
  region,
  maxCount,
  total,
  dimmed,
  hovered,
  selected,
  unit,
  onRegionClick,
  onHover,
  onMove,
}: CartogramTileProps) {
  const [col, row] = GRID[region.region];
  const { side, cx, cy, largeLabel, labelFill } = tileGeometry(region.count, maxCount, col, row);

  return (
    <g
      data-region={region.region}
      data-count={region.count}
      style={{
        cursor: onRegionClick ? "pointer" : undefined,
        filter: hoverFilter(hovered, dimmed),
        transition: "filter 150ms",
      }}
      aria-label={tileAriaLabel(region, unit, selected)}
      {...tileInteraction(region.region, selected, onRegionClick)}
      onMouseEnter={() => onHover(region.region)}
      onMouseLeave={() => onHover(null)}
      onMouseMove={onMove}
      onFocus={() => onHover(region.region)}
      onBlur={() => onHover(null)}
    >
      {hovered && (
        // 돌출 측면 — 원위치 바닥 타일이 두께로 보인다.
        <rect
          x={cx - side / 2}
          y={cy - side / 2}
          width={side}
          height={side}
          rx={8}
          className="pointer-events-none"
          style={{ fill: "var(--map-side)" }}
        />
      )}
      <g
        transform={hovered ? `translate(${EXTRUDE_X}, ${EXTRUDE_Y})` : undefined}
        style={{ transition: "transform 150ms" }}
      >
        <rect
          x={cx - side / 2}
          y={cy - side / 2}
          width={side}
          height={side}
          rx={8}
          stroke={selected ? "var(--foreground)" : "var(--card)"}
          strokeWidth={selected ? 2 : 1}
          style={{ fill: regionFillColor(region.count, maxCount) }}
        />
        <TileLabels
          region={region}
          total={total}
          cx={cx}
          cy={cy}
          largeLabel={largeLabel}
          labelFill={labelFill}
        />
      </g>
    </g>
  );
}

function hoverFilter(hovered: boolean, dimmed: boolean): string | undefined {
  if (hovered) return "brightness(1.1) saturate(1.15)";
  if (dimmed) return "saturate(0.55) opacity(0.7)";
  return undefined;
}
