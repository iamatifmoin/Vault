import Link from "next/link";
import { ArrowUpRight, GitCommitHorizontal } from "lucide-react";
import { APPROACH_BADGE_TONES, DIFFICULTY_BADGE_TONES, DIFFICULTY_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { SHEETS } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import type { ProblemIndex } from "@/types";

export function ProblemCard({ problem }: { problem: ProblemIndex }) {
  const sheet = problem.sheets[0];
  const latestApproach =
    problem.latest_approach && APPROACH_BADGE_TONES[problem.latest_approach];

  return (
    <Link
      href={`/library/${problem.id}`}
      className="group surface-card flex flex-col gap-stack-md p-4 transition-all hover:border-muted hover:shadow-subtle"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-1.5 py-0.5 font-mono text-[11px] uppercase",
              DIFFICULTY_BADGE_TONES[problem.difficulty],
            )}
          >
            {DIFFICULTY_LABELS[problem.difficulty]}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {sheet ? SHEETS[sheet].label : PLATFORM_LABELS[problem.platform]}
          </span>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>

      <div>
        <h3 className="text-card-title">{problem.title}</h3>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {problem.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] uppercase text-muted-foreground"
          >
            {topic}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center gap-2">
          {latestApproach ? (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[11px]",
                latestApproach.className,
              )}
            >
              {latestApproach.label}
            </span>
          ) : null}
          <span className="rounded-md bg-vault-raised px-1.5 py-0.5 font-mono text-[11px] text-foreground">
            {problem.latest_language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <GitCommitHorizontal className="h-3.5 w-3.5" />
          <span>{problem.attempt_count}</span>
        </div>
      </div>
    </Link>
  );
}
