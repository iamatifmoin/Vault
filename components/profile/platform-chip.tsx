import { PlatformBadge } from "@/components/platform-badge";
import type { Platform } from "@/types";

const PLATFORM_LABELS: Record<string, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
  gfg: "GeeksForGeeks",
};

interface PlatformChipProps {
  platform: string;
  count: number;
}

export function PlatformChip({ platform, count }: PlatformChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/40 px-3 py-1 text-xs text-zinc-400">
      <PlatformBadge platform={platform as Platform} />
      <span>{PLATFORM_LABELS[platform] ?? platform}</span>
      <span className="font-mono text-zinc-500">{count}</span>
    </span>
  );
}
