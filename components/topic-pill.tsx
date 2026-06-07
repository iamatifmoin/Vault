import { cn } from "@/lib/utils";

export function TopicPill({ topic, className }: { topic: string; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border border-zinc-700/50 bg-zinc-800/60",
      "px-2.5 py-0.5 text-[11px] text-zinc-400 font-medium",
      className
    )}>
      {topic}
    </span>
  );
}
