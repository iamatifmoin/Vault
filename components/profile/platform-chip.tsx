import { PLATFORM_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Platform } from "@/types";

const PLATFORM_PILL: Record<Platform, string> = {
  leetcode: "border-orange-900/50 bg-orange-950/80 text-orange-400",
  codeforces: "border-blue-900/50 bg-blue-950/80 text-blue-400",
  codechef: "border-amber-900/50 bg-amber-950/80 text-amber-400",
  gfg: "border-green-900/50 bg-green-950/80 text-green-400",
};

interface PlatformChipProps {
  platform: string;
  count: number;
}

export function PlatformChip({ platform, count }: PlatformChipProps) {
  const key = platform as Platform;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        PLATFORM_PILL[key],
      )}
    >
      <span>{PLATFORM_LABELS[key] ?? platform}</span>
      <span className="font-mono opacity-80">{count}</span>
    </span>
  );
}
