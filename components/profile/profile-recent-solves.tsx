"use client";

import { ProblemCard } from "@/components/problem-card";
import type { ProblemIndex } from "@/types";

interface ProfileRecentSolvesProps {
  problems: ProblemIndex[];
}

export function ProfileRecentSolves({ problems }: ProfileRecentSolvesProps) {
  if (!problems.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-zinc-500">
        No problems solved yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} compact />
      ))}
    </div>
  );
}
