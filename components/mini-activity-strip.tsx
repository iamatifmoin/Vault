"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function tone(count: number) {
  if (count >= 4) return "bg-emerald-500";
  if (count >= 2) return "bg-emerald-500/60";
  if (count >= 1) return "bg-emerald-500/30";
  return "bg-muted";
}

export function MiniActivityStrip({
  days,
}: {
  days: Array<{ date: string; count: number }>;
}) {
  const recent = days.slice(-28);

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-micro-label">Last 4 weeks</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {recent.reduce((sum, day) => sum + day.count, 0)} solves
        </span>
      </div>
      <div className="mt-3 flex justify-center">
        <div className="grid grid-cols-7 gap-1">
          {recent.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger
                delay={0}
                className={cn(
                  "h-3 w-3 rounded-[2px] transition-transform duration-150 hover:scale-110 hover:ring-1 hover:ring-vault-brand/30",
                  tone(day.count),
                )}
                aria-label={`${day.date}: ${day.count} solves`}
              />
              <TooltipContent side="top" className="font-mono text-[11px]">
                {day.date}: {day.count} {day.count === 1 ? "solve" : "solves"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
