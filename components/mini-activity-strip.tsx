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
      <div className="mt-3 grid grid-cols-7 gap-1">
        {recent.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} solves`}
            className={cn("aspect-square rounded-[2px]", tone(day.count))}
          />
        ))}
      </div>
    </div>
  );
}
