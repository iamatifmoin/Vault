import { cn } from "@/lib/utils";

type Platform = "leetcode" | "codeforces" | "codechef" | "gfg";

const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  leetcode:   { label: "LC",  color: "bg-orange-950/80 text-orange-400 border border-orange-900/50" },
  codeforces: { label: "CF",  color: "bg-blue-950/80   text-blue-400   border border-blue-900/50" },
  codechef:   { label: "CC",  color: "bg-amber-950/80  text-amber-400  border border-amber-900/50" },
  gfg:        { label: "GFG", color: "bg-green-950/80  text-green-400  border border-green-900/50" },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform] ?? { label: platform.toUpperCase(), color: "bg-zinc-800 text-zinc-400 border border-zinc-700" };
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono tracking-wider border",
      meta.color
    )}>
      {meta.label}
    </span>
  );
}
