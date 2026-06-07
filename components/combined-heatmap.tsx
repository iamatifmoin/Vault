"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActivityDayDialog } from "@/components/activity-day-dialog";
import { formatDayActivitySummary } from "@/lib/algorithms";
import { PLATFORM_LABELS } from "@/lib/constants";
import { toDateKey } from "@/lib/stats";
import { cn } from "@/lib/utils";
import type { DayActivity } from "@/types";

function getDayItemCount(day: DayActivity) {
  return day.entries.length + day.githubContributionCount;
}

export interface CombinedHeatmapProps {
  activityByDay: Record<string, DayActivity>;
  username?: string;
  canLinkToVault?: boolean;
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

const CELL_SIZE = 15;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const TOOLTIP_DETAIL_THRESHOLD = 3;

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

type HeatmapCell = {
  date: string;
  count: number;
  inRange: boolean;
  activity: DayActivity | null;
};

function buildWeekColumns(activityByDay: Record<string, DayActivity>) {
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
      const activity = inRange ? (activityByDay[key] ?? null) : null;

      column.push({
        date: key,
        count: activity?.total ?? 0,
        inRange,
        activity,
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

function computeHeatmapStats(activityByDay: Record<string, DayActivity>) {
  const end = normalizeDate(new Date());
  const start = normalizeDate(new Date(end));
  start.setDate(end.getDate() - 364);

  const days: number[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(activityByDay[toDateKey(cursor)]?.total ?? 0);
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

function getTooltipAlign(columnIndex: number, totalColumns: number) {
  if (columnIndex >= totalColumns - 5) return "end";
  if (columnIndex < 5) return "start";
  return "center";
}

function HeatmapTooltipContent({
  cell,
}: {
  cell: HeatmapCell;
}) {
  if (!cell.activity || cell.count === 0) {
    return (
      <span className="text-zinc-400">{formatDateLabel(cell.date)} — no activity</span>
    );
  }

  const summaryLines = formatDayActivitySummary(cell.activity);
  const showClickHint = getDayItemCount(cell.activity) > TOOLTIP_DETAIL_THRESHOLD;
  const activityLabel =
    cell.count === 1 ? "activity" : "activities";

  return (
    <div className="space-y-1.5 text-left">
      <p className="font-medium text-zinc-100">{formatDateLabel(cell.date)}</p>
      <p className="text-zinc-400">
        {cell.count} {activityLabel}
      </p>
      {getDayItemCount(cell.activity) <= TOOLTIP_DETAIL_THRESHOLD ? (
        <ul className="space-y-0.5 text-zinc-300">
          {cell.activity.entries.map((entry) => (
            <li key={entry.id}>
              {entry.title}{" "}
              <span className="text-zinc-500">
                ({PLATFORM_LABELS[entry.platform]})
              </span>
            </li>
          ))}
          {cell.activity.githubContributions.map((item) => (
            <li key={item.id}>
              {item.label}{" "}
              <span className="text-zinc-500">({item.repository})</span>
            </li>
          ))}
          {cell.activity.githubContributionCount > 0 &&
          cell.activity.githubContributions.length === 0 ? (
            <li>
              GitHub ({cell.activity.githubContributionCount}{" "}
              {cell.activity.githubContributionCount === 1
                ? "contribution"
                : "contributions"}
              )
            </li>
          ) : null}
        </ul>
      ) : (
        <ul className="space-y-0.5 text-zinc-300">
          {summaryLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {showClickHint ? (
        <p className="pt-0.5 text-[10px] text-zinc-500">Click for full details</p>
      ) : null}
    </div>
  );
}

function HeatmapCellView({
  cell,
  columnIndex,
  totalColumns,
  onSelect,
}: {
  cell: HeatmapCell;
  columnIndex: number;
  totalColumns: number;
  onSelect: (date: string, activity: DayActivity) => void;
}) {
  if (!cell.inRange) {
    return (
      <div
        className="shrink-0 rounded-[3px] bg-transparent"
        style={{ width: CELL_SIZE, height: CELL_SIZE }}
        aria-hidden
      />
    );
  }

  const isInteractive = cell.count > 0;

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        onClick={() => {
          if (cell.activity && cell.count > 0) {
            onSelect(cell.date, cell.activity);
          }
        }}
        className={cn(
          "shrink-0 rounded-[3px] transition-colors duration-150 hover:ring-1 hover:ring-inset hover:ring-emerald-500/50",
          cellColor(cell.count),
          isInteractive && "cursor-pointer",
        )}
        style={{ width: CELL_SIZE, height: CELL_SIZE }}
        aria-label={
          cell.count > 0
            ? `${cell.count} activities on ${formatDateLabel(cell.date)}`
            : `No activity on ${formatDateLabel(cell.date)}`
        }
      />
      <TooltipContent
        side="top"
        align={getTooltipAlign(columnIndex, totalColumns)}
        collisionPadding={16}
        showArrow={false}
        className="max-w-[220px] border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[11px] text-zinc-200"
      >
        <HeatmapTooltipContent cell={cell} />
      </TooltipContent>
    </Tooltip>
  );
}

export function CombinedHeatmap({
  activityByDay,
  username,
  canLinkToVault = false,
  className,
}: CombinedHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<DayActivity | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns = buildWeekColumns(activityByDay);
  const monthLabels = getMonthLabelPositions(columns);
  const stats = computeHeatmapStats(activityByDay);
  const gridWidth = columns.length * CELL_STEP - CELL_GAP;

  function handleSelect(date: string, activity: DayActivity) {
    setSelectedDate(date);
    setSelectedActivity(activity);
    setDialogOpen(true);
  }

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="flex justify-center">
        <div className="max-w-full overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-flex min-w-max flex-col items-center px-1.5 py-px">
            <div
              className="relative mb-2 font-mono text-[10px] text-zinc-400"
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
                    <HeatmapCellView
                      key={cell.date}
                      cell={cell}
                      columnIndex={columnIndex}
                      totalColumns={columns.length}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-zinc-400">
        <span>
          365-day total:{" "}
          <span className="tabular-nums text-zinc-200">{stats.total}</span>{" "}
          activities
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

      <ActivityDayDialog
        date={selectedDate}
        activity={selectedActivity}
        username={username}
        canLinkToVault={canLinkToVault}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
