import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { computeRevisionQueue } from "@/lib/algorithms";
import {
  DIFFICULTY_BADGE_TONES,
  DIFFICULTY_LABELS,
  PLATFORM_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Difficulty, Platform, ProblemIndex } from "@/types";

interface RevisionQueueProps {
  problems: any[];
}

const APPROACH_BADGE_CLASSES: Record<string, string> = {
  "Brute Force": "bg-red-500 text-white",
  Optimized: "bg-yellow-400 text-black",
  Optimal: "bg-emerald-500 text-black",
};

function getApproachBadgeClass(approach: string): string {
  return (
    APPROACH_BADGE_CLASSES[approach] ??
    "border border-zinc-700 bg-zinc-900 text-zinc-400"
  );
}

function buildIdByPath(problems: ProblemIndex[]): Map<string, string> {
  return new Map(problems.map((problem) => [problem.file_path, problem.id]));
}

export function RevisionQueue({ problems }: RevisionQueueProps) {
  const problemList = problems as ProblemIndex[];
  const queue = computeRevisionQueue(problemList);
  const idByPath = buildIdByPath(problemList);
  const visibleItems = queue.slice(0, 5);
  const hasMore = queue.length > 5;

  return (
    <section className="surface-card mt-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-vault-bg/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-white">Revision Queue</h2>
          {queue.length > 0 ? (
            <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 font-mono text-[11px] font-medium text-black">
              {queue.length} due
            </span>
          ) : null}
        </div>
        {hasMore ? (
          <Link
            href="/library"
            className="font-mono text-xs text-zinc-400 transition-colors hover:text-white"
          >
            See all
          </Link>
        ) : null}
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <CheckCircle2
            className="h-5 w-5 text-emerald-500"
            strokeWidth={1.6}
          />
          <p className="mt-3 text-sm text-zinc-400">
            You&apos;re all caught up. Keep solving.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleItems.map((item) => {
            const problemId = idByPath.get(item.filePath);
            const difficulty = item.difficulty as Difficulty;

            return (
              <div
                key={item.filePath}
                className={cn(
                  "flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between",
                  item.priorityScore > 50 && "border-l-2 border-red-500",
                )}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="truncate text-[15px] font-medium text-white">
                      <span className="font-mono text-zinc-400">
                        {String(item.problemNumber).padStart(4, "0")}
                      </span>
                      <span className="text-zinc-600"> · </span>
                      {item.title}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase",
                        DIFFICULTY_BADGE_TONES[difficulty],
                      )}
                    >
                      {DIFFICULTY_LABELS[difficulty]}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-zinc-400">
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] uppercase text-zinc-400">
                        {PLATFORM_LABELS[item.platform as Platform]}
                      </span>
                      <span className="mx-2 text-zinc-600">·</span>
                      {item.revisionReason}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px]",
                        getApproachBadgeClass(item.latestApproach),
                      )}
                    >
                      {item.latestApproach}
                    </span>
                  </div>
                </div>

                {problemId ? (
                  <Link
                    href={`/library/${problemId}`}
                    className="shrink-0 font-mono text-xs text-zinc-400 transition-colors hover:text-emerald-500 md:pl-4"
                  >
                    Review →
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
