"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ApproachBadge } from "@/components/approach-badge";
import { PlatformBadge } from "@/components/platform-badge";
import { computeRevisionQueue } from "@/lib/algorithms";
import { listItem, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ApproachType, Platform, ProblemIndex } from "@/types";

interface RevisionQueueProps {
  problems: ProblemIndex[];
}

const URGENCY_BORDER: Record<string, string> = {
  "Brute Force": "border-l-red-500/70",
  Optimized: "border-l-yellow-500/50",
  Optimal: "border-l-zinc-700",
};

function buildIdByPath(problems: ProblemIndex[]): Map<string, string> {
  return new Map(problems.map((problem) => [problem.file_path, problem.id]));
}

export function RevisionQueue({ problems }: RevisionQueueProps) {
  const problemList = problems as ProblemIndex[];
  const queue = computeRevisionQueue(problemList);
  const idByPath = buildIdByPath(problemList);

  if (queue.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-800 bg-vault-surface p-5">
      <SectionHeader title="Revision Queue" count={queue.length} />
      <motion.ul
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-4 space-y-1.5"
      >
        {queue.slice(0, 5).map((item) => {
          const problemId = idByPath.get(item.filePath);
          if (!problemId) return null;

          return (
            <motion.li key={item.filePath} variants={listItem}>
              <Link
                href={`/library/${problemId}`}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg border-l-2 pl-3 pr-4 py-2.5",
                  "border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/70",
                  "transition-colors duration-150",
                  URGENCY_BORDER[item.latestApproach] ?? "border-l-zinc-700",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-zinc-500">
                      #{String(item.problemNumber).padStart(4, "0")}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <PlatformBadge platform={item.platform as Platform} />
                    <ApproachBadge approach={item.latestApproach as ApproachType} />
                    <span className="ml-auto text-[11px] text-zinc-500">
                      {item.revisionReason}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400" />
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
      {queue.length > 5 && (
        <Link
          href="/library?filter=revision"
          className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <span>+{queue.length - 5} more</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      {count > 0 && (
        <span className="rounded-full border border-red-900/40 bg-red-950/60 px-2 py-0.5 text-[11px] font-medium text-red-400">
          {count} due
        </span>
      )}
    </div>
  );
}
