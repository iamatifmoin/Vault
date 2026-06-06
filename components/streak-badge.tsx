import { Flame } from "lucide-react";
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
        "inline-flex items-center gap-1.5 rounded-full border border-vault-brand/25 bg-vault-brand-muted px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider text-vault-brand shadow-brand-glow",
        className,
      )}
    >
      <Flame className="h-3 w-3 shrink-0" strokeWidth={2} />
      {streak} day streak
    </div>
  );
}
