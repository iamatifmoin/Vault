"use client";

import { useState } from "react";
import { ProblemCard } from "@/components/problem-card";
import type { ProblemIndex } from "@/types";

export function LibraryPageClient({
  initialIndex,
  streak,
}: {
  initialIndex: ProblemIndex[];
  streak: number;
}) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [sheet, setSheet] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [approach, setApproach] = useState("all");
  const [language, setLanguage] = useState("all");

  const problems = initialIndex.filter((problem) => {
    const matchesSearch =
      !search ||
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.topics.some((topic) => topic.toLowerCase().includes(search.toLowerCase()));
    const matchesPlatform = platform === "all" || problem.platform === platform;
    const matchesSheet =
      sheet === "all" || problem.sheets.includes(sheet as ProblemIndex["sheets"][number]);
    const matchesDifficulty = difficulty === "all" || problem.difficulty === difficulty;
    const matchesApproach =
      approach === "all" || problem.latest_approach === approach;
    const matchesLanguage =
      language === "all" || problem.latest_language === language;

    return (
      matchesSearch &&
      matchesPlatform &&
      matchesSheet &&
      matchesDifficulty &&
      matchesApproach &&
      matchesLanguage
    );
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-vault-border bg-background/90 px-container-padding backdrop-blur">
        <div className="text-2xl font-semibold text-zinc-50">Library</div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          {streak} day streak
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-container-padding">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-sm border border-vault-border bg-vault-surface px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-50"
              placeholder="Search problems, topics, or languages..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: platform, setter: setPlatform, options: ["all", "leetcode", "codeforces", "codechef"] },
              { value: sheet, setter: setSheet, options: ["all", "neetcode-150", "neetcode-roadmap", "blind-75", "strivers-sde", "strivers-a2z", "strivers-cp"] },
              { value: difficulty, setter: setDifficulty, options: ["all", "easy", "medium", "hard"] },
              { value: approach, setter: setApproach, options: ["all", "Brute Force", "Optimized", "Optimal"] },
              { value: language, setter: setLanguage, options: ["all", "cpp", "python", "java"] },
            ].map((filter, index) => (
              <select
                key={index}
                value={filter.value}
                onChange={(event) => filter.setter(event.target.value)}
                className="h-8 rounded-sm border border-vault-border bg-vault-surface px-3 font-mono text-[11px] uppercase text-zinc-300 outline-none"
              >
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ))}

            <button
              type="button"
              className="h-8 px-3 font-mono text-[11px] uppercase text-zinc-500 hover:text-zinc-50"
              onClick={() => {
                setSearch("");
                setPlatform("all");
                setSheet("all");
                setDifficulty("all");
                setApproach("all");
                setLanguage("all");
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>

        {!problems.length ? (
          <div className="mt-10 rounded-md border border-dashed border-vault-border bg-vault-surface p-8 text-sm text-zinc-500">
            No problems match the current filters.
          </div>
        ) : null}
      </main>
    </div>
  );
}
