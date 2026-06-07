"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ApproachBadge } from "@/components/approach-badge";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { DIFFICULTY_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Difficulty, Platform, ProblemIndex } from "@/types";

const DIFFICULTY_ACCENT: Record<Difficulty, string> = {
  easy: "bg-emerald-500",
  medium: "bg-blue-500",
  hard: "bg-red-500",
};

const PLATFORM_PILL: Record<Platform, string> = {
  leetcode: "border-orange-900/50 bg-orange-950/80 text-orange-400",
  codeforces: "border-blue-900/50 bg-blue-950/80 text-blue-400",
  codechef: "border-amber-900/50 bg-amber-950/80 text-amber-400",
  gfg: "border-green-900/50 bg-green-950/80 text-green-400",
};

type DifficultyLabel = "Easy" | "Medium" | "Hard";

interface ProblemCardProps {
  problem: ProblemIndex;
  onClick?: () => void;
  compact?: boolean;
}

function padProblemNumber(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? digits.padStart(4, "0") : number;
}

export function ProblemCard({ problem, onClick, compact = false }: ProblemCardProps) {
  const formattedDate = new Date(problem.latest_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const difficultyLabel = DIFFICULTY_LABELS[problem.difficulty] as DifficultyLabel;
  const visibleTopics = problem.topics.slice(0, 3);
  const hiddenTopicCount = Math.max(problem.topics.length - visibleTopics.length, 0);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="flex-shrink-0 font-mono text-[11px] text-zinc-600">
          {padProblemNumber(problem.number)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">
          {problem.title}
        </span>
        <DifficultyBadge difficulty={difficultyLabel} />
        {problem.latest_approach ? (
          <ApproachBadge
            approach={problem.latest_approach}
            unverified={!problem.approach_verified}
          />
        ) : null}
        <span className="ml-auto flex-shrink-0 text-[11px] text-zinc-600">
          {formattedDate}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      variants={listItem}
      onClick={onClick}
      className={cn(
        "group flex items-stretch overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60 transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900/90",
        onClick && "cursor-pointer",
      )}
    >
      <div
        className={cn(
          "w-[3px] flex-shrink-0 self-stretch",
          DIFFICULTY_ACCENT[problem.difficulty],
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0 font-mono text-[11px] tabular-nums text-zinc-500">
              #{padProblemNumber(problem.number)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-snug text-zinc-100 transition-colors group-hover:text-white">
                {problem.title}
              </p>
              {visibleTopics.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {visibleTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-500"
                    >
                      {topic}
                    </span>
                  ))}
                  {hiddenTopicCount > 0 ? (
                    <span className="text-[10px] text-zinc-600">
                      +{hiddenTopicCount}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0 sm:justify-end">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
              PLATFORM_PILL[problem.platform as Platform],
            )}
          >
            {PLATFORM_LABELS[problem.platform as Platform]}
          </span>
          {problem.latest_approach ? (
            <ApproachBadge
              approach={problem.latest_approach}
              unverified={!problem.approach_verified}
            />
          ) : null}
          {problem.attempt_count > 1 ? (
            <span className="rounded-md border border-zinc-800 bg-zinc-800/50 px-2 py-0.5 text-[11px] text-zinc-500">
              {problem.attempt_count} attempts
            </span>
          ) : null}
          <span className="ml-auto whitespace-nowrap font-mono text-[11px] tabular-nums text-zinc-500 sm:ml-0">
            {formattedDate}
          </span>
        </div>
      </div>

      {onClick ? (
        <div className="hidden items-center pr-3 sm:flex">
          <ChevronRight className="h-4 w-4 text-zinc-700 transition-colors group-hover:text-zinc-400" />
        </div>
      ) : null}
    </motion.div>
  );
}
