import Link from "next/link";
import { ArrowUpRight, GitCommitHorizontal } from "lucide-react";
import { APPROACH_BADGE_TONES, DIFFICULTY_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { SHEETS } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import type { ProblemIndex } from "@/types";

function difficultyTone(difficulty: ProblemIndex["difficulty"]) {
  if (difficulty === "hard") {
    return "border-red-500/40 text-red-300";
  }
  if (difficulty === "medium") {
    return "border-blue-500/40 text-blue-300";
  }
  return "border-zinc-700 text-zinc-200";
}

export function ProblemCard({ problem }: { problem: ProblemIndex }) {
  const sheet = problem.sheets[0];
  const latestApproach =
    problem.latest_approach && APPROACH_BADGE_TONES[problem.latest_approach];

  return (
    <Link
      href={`/library/${problem.id}`}
      className="group flex flex-col gap-stack-md rounded-md border border-vault-border bg-vault-surface p-4 transition-colors hover:border-zinc-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase",
              difficultyTone(problem.difficulty),
            )}
          >
            {DIFFICULTY_LABELS[problem.difficulty]}
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            {sheet ? SHEETS[sheet].label : PLATFORM_LABELS[problem.platform]}
          </span>
        </div>
        <ArrowUpRight className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-zinc-50" />
      </div>

      <div>
        <h3 className="text-[15px] font-medium text-zinc-50">{problem.title}</h3>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {problem.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="rounded-sm border border-vault-border px-2 py-0.5 font-mono text-[11px] uppercase text-zinc-400"
          >
            {topic}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-vault-border pt-2">
        <div className="flex items-center gap-2">
          {latestApproach ? (
            <span
              className={cn(
                "rounded-sm border px-2 py-0.5 font-mono text-[11px]",
                latestApproach.className,
              )}
            >
              {latestApproach.label}
            </span>
          ) : null}
          <span className="rounded-sm bg-vault-raised px-1.5 py-0.5 font-mono text-[11px] text-zinc-100">
            {problem.latest_language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
          <GitCommitHorizontal className="h-3.5 w-3.5" />
          <span>{problem.attempt_count}</span>
        </div>
      </div>
    </Link>
  );
}
