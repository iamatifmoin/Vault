import { cn } from "@/lib/utils";

type Approach = "Optimal" | "Optimized" | "Brute Force";

interface ApproachBadgeProps {
  approach: Approach;
  size?: "sm" | "md";
  showDot?: boolean;
  unverified?: boolean; // from approachVerified: false in index.json
}

const APPROACH_STYLES: Record<Approach, string> = {
  "Optimal":     "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50",
  "Optimized":   "bg-yellow-950/80  text-yellow-400  border border-yellow-800/50",
  "Brute Force": "bg-red-950/80     text-red-400     border border-red-800/50",
};

const DOT_STYLES: Record<Approach, string> = {
  "Optimal":     "bg-emerald-400",
  "Optimized":   "bg-yellow-400",
  "Brute Force": "bg-red-400",
};

export function ApproachBadge({ approach, size = "sm", showDot = false, unverified = false }: ApproachBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium font-mono tracking-tight",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        APPROACH_STYLES[approach],
        unverified && "opacity-60"
      )}
      title={unverified ? "Approach auto-classified — run AI analysis to verify" : undefined}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", DOT_STYLES[approach])} />
      )}
      {approach}
    </span>
  );
}
