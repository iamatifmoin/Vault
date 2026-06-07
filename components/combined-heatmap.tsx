"use client";

import { toDateKey } from "@/lib/stats";
import { cn } from "@/lib/utils";

export interface CombinedHeatmapProps {
  activityMap: Record<string, number>;
  className?: string;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const DAY_LABELS = [
  { label: "Mon", row: 1 },
  { label: "Wed", row: 3 },
  { label: "Fri", row: 5 },
] as const;

const CELL_SIZE = 12;
const CELL_GAP = 2;
const CELL_STEP = CELL_SIZE + CELL_GAP;

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function cellColor(count: number) {
  if (count >= 7) return "bg-emerald-500";
  if (count >= 4) return "bg-emerald-500/80";
  if (count >= 2) return "bg-emerald-500/[0.55]";
  if (count >= 1) return "bg-emerald-500/30";
  return "bg-zinc-800";
}

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTooltip(count: number, dateKey: string) {
  const noun = count === 1 ? "problem" : "problems";
  return `${count} ${noun} — ${formatDateLabel(dateKey)}`;
}

type HeatmapCell = {
  date: string;
  count: number;
  inRange: boolean;
};

function buildWeekColumns(activityMap: Record<string, number>) {
  const end = normalizeDate(new Date());
  const rangeStart = normalizeDate(new Date(end));
  rangeStart.setDate(end.getDate() - 364);

  const gridStart = new Date(rangeStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const columns: HeatmapCell[][] = [];
  const cursor = new Date(gridStart);

  while (cursor <= end || columns.length < 52) {
    const column: HeatmapCell[] = [];

    for (let row = 0; row < 7; row += 1) {
      const key = toDateKey(cursor);
      const inRange = cursor >= rangeStart && cursor <= end;

      column.push({
        date: key,
        count: inRange ? (activityMap[key] ?? 0) : 0,
        inRange,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    columns.push(column);
    if (cursor > end && columns.length >= 52) {
      break;
    }
  }

  return columns;
}

function getMonthLabelPositions(columns: HeatmapCell[][]) {
  const positions: Array<{ label: string; columnIndex: number }> = [];
  const seenMonths = new Set<string>();

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
    for (const cell of columns[columnIndex]) {
      if (!cell.inRange) continue;

      const date = new Date(`${cell.date}T12:00:00`);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (date.getDate() === 1 && !seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        positions.push({
          label: MONTH_LABELS[date.getMonth()],
          columnIndex,
        });
        break;
      }

      if (!seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        positions.push({
          label: MONTH_LABELS[date.getMonth()],
          columnIndex,
        });
        break;
      }
    }
  }

  return positions;
}

function computeHeatmapStats(activityMap: Record<string, number>) {
  const end = normalizeDate(new Date());
  const start = normalizeDate(new Date(end));
  start.setDate(end.getDate() - 364);

  const days: number[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(activityMap[toDateKey(cursor)] ?? 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  const total = days.reduce((sum, count) => sum + count, 0);

  let longestStreak = 0;
  let streak = 0;
  for (const count of days) {
    if (count >= 1) {
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  let currentStreak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index] >= 1) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { total, longestStreak, currentStreak };
}

function HeatmapCellView({ cell }: { cell: HeatmapCell }) {
  if (!cell.inRange) {
    return (
      <div
        className="shrink-0 rounded-[2px] bg-transparent"
        style={{ width: CELL_SIZE, height: CELL_SIZE }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className="group relative shrink-0"
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    >
      <div
        className={cn(
          "h-full w-full rounded-[2px] transition-transform duration-150 group-hover:scale-110",
          cellColor(cell.count),
        )}
        aria-label={formatTooltip(cell.count, cell.date)}
      />
      <div
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-200 shadow-lg group-hover:block"
        role="tooltip"
      >
        {formatTooltip(cell.count, cell.date)}
      </div>
    </div>
  );
}

export function CombinedHeatmap({
  activityMap,
  className,
}: CombinedHeatmapProps) {
  const columns = buildWeekColumns(activityMap);
  const monthLabels = getMonthLabelPositions(columns);
  const stats = computeHeatmapStats(activityMap);
  const gridWidth = columns.length * CELL_STEP - CELL_GAP;
  const gridHeight = 7 * CELL_STEP - CELL_GAP;

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-flex min-w-max gap-2">
          <div
            className="relative shrink-0 font-mono text-[10px] text-zinc-400"
            style={{ width: 28, height: gridHeight + 20, paddingTop: 20 }}
          >
            {DAY_LABELS.map(({ label, row }) => (
              <span
                key={label}
                className="absolute left-0 leading-none"
                style={{ top: 20 + row * CELL_STEP }}
              >
                {label}
              </span>
            ))}
          </div>

          <div>
            <div
              className="relative mb-1 font-mono text-[10px] text-zinc-400"
              style={{ width: gridWidth, height: 16 }}
            >
              {monthLabels.map(({ label, columnIndex }) => (
                <span
                  key={`${label}-${columnIndex}`}
                  className="absolute leading-none"
                  style={{ left: columnIndex * CELL_STEP }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex" style={{ gap: CELL_GAP }}>
              {columns.map((column, columnIndex) => (
                <div
                  key={columnIndex}
                  className="flex flex-col"
                  style={{ gap: CELL_GAP }}
                >
                  {column.map((cell) => (
                    <HeatmapCellView key={cell.date} cell={cell} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-zinc-400">
        <span>
          365-day total:{" "}
          <span className="tabular-nums text-zinc-200">{stats.total}</span>{" "}
          problems
        </span>
        <span className="hidden text-zinc-700 sm:inline" aria-hidden>
          |
        </span>
        <span>
          Longest streak:{" "}
          <span className="tabular-nums text-zinc-200">
            {stats.longestStreak}
          </span>{" "}
          days
        </span>
        <span className="hidden text-zinc-700 sm:inline" aria-hidden>
          |
        </span>
        <span>
          Current streak:{" "}
          <span className="tabular-nums text-zinc-200">
            {stats.currentStreak}
          </span>{" "}
          days
        </span>
      </div>
    </div>
  );
}
