import { cn } from "@/lib/utils";

function tone(count: number) {
  if (count >= 6) {
    return "bg-emerald-500";
  }
  if (count >= 4) {
    return "bg-emerald-500/80";
  }
  if (count >= 2) {
    return "bg-emerald-500/50";
  }
  if (count >= 1) {
    return "bg-emerald-500/20";
  }
  return "bg-zinc-800";
}

export function ActivityHeatmap({
  days,
}: {
  days: Array<{ date: string; count: number }>;
}) {
  const columns = Array.from({ length: Math.ceil(days.length / 7) }, (_, columnIndex) =>
    days.slice(columnIndex * 7, columnIndex * 7 + 7),
  );

  return (
    <div className="w-full min-w-0">
      <div className="flex min-w-max gap-1">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-1">
            {column.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} solves`}
                className={cn("h-3 w-3 rounded-[2px]", tone(day.count))}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 font-mono text-[11px] text-zinc-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-[2px] bg-zinc-800" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500/20" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500/50" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500/80" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
