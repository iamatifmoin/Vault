"use client";

import { motion } from "framer-motion";
import { ApproachBadge } from "@/components/approach-badge";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PlatformBadge } from "@/components/platform-badge";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ApproachType, Difficulty, Platform, ProblemIndex } from "@/types";

const APPROACH_ACCENT: Record<ApproachType, string> = {
  Optimal: "bg-emerald-500",
  Optimized: "bg-yellow-400",
  "Brute Force": "bg-red-500",
};

type DifficultyLabel = "Easy" | "Medium" | "Hard";

interface ProblemCardProps {
  problem: ProblemIndex;
  onClick: () => void;
}

export function ProblemCard({ problem, onClick }: ProblemCardProps) {
  const formattedDate = new Date(problem.latest_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const difficultyLabel = DIFFICULTY_LABELS[problem.difficulty] as DifficultyLabel;

  return (
    <motion.div
      variants={listItem}
      onClick={onClick}
      className="group relative flex cursor-pointer items-center gap-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60 transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] flex-shrink-0 transition-opacity",
          problem.latest_approach
            ? APPROACH_ACCENT[problem.latest_approach]
            : "bg-zinc-700",
        )}
      />

      <div className="min-w-0 flex-1 px-4 py-3 pl-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex-shrink-0 font-mono text-[11px] text-zinc-600">
            {problem.number.padStart(4, "0")}
          </span>
          <span className="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
            {problem.title}
          </span>
          <DifficultyBadge difficulty={difficultyLabel} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <PlatformBadge platform={problem.platform as Platform} />
          {problem.latest_approach ? (
            <ApproachBadge
              approach={problem.latest_approach}
              unverified={!problem.approach_verified}
            />
          ) : null}
          {problem.attempt_count > 1 ? (
            <span className="text-[11px] text-zinc-600">{problem.attempt_count} attempts</span>
          ) : null}
          <span className="ml-auto text-[11px] text-zinc-600">{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}
