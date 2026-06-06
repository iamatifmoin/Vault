import { cn } from "@/lib/utils";

export function StreakBadge({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500",
        className,
      )}
    >
      {streak} day streak
    </div>
  );
}
