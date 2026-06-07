"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedMain } from "@/components/animated-main";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProblemCard } from "@/components/problem-card";
import { DIFFICULTY_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ApproachType, Difficulty, Platform, ProblemIndex } from "@/types";

const APPROACH_FILTERS: ApproachType[] = ["Optimal", "Optimized", "Brute Force"];
const DIFFICULTY_FILTERS: Difficulty[] = ["easy", "medium", "hard"];
const PLATFORM_FILTERS: Platform[] = ["leetcode", "codeforces", "codechef", "gfg"];

function computeFilterCounts(problems: ProblemIndex[]) {
  return {
    byApproach: {
      Optimal: problems.filter((p) => p.latest_approach === "Optimal").length,
      Optimized: problems.filter((p) => p.latest_approach === "Optimized").length,
      "Brute Force": problems.filter((p) => p.latest_approach === "Brute Force").length,
    },
    byDifficulty: {
      easy: problems.filter((p) => p.difficulty === "easy").length,
      medium: problems.filter((p) => p.difficulty === "medium").length,
      hard: problems.filter((p) => p.difficulty === "hard").length,
    },
    byPlatform: {
      leetcode: problems.filter((p) => p.platform === "leetcode").length,
      codeforces: problems.filter((p) => p.platform === "codeforces").length,
      codechef: problems.filter((p) => p.platform === "codechef").length,
      gfg: problems.filter((p) => p.platform === "gfg").length,
    },
  };
}

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, count, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150",
        active
          ? "border-emerald-700/60 bg-emerald-950/40 text-emerald-300"
          : "border-zinc-700/60 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          active ? "text-emerald-400/70" : "text-zinc-600",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function LibraryPageClient({
  initialIndex,
  streak,
}: {
  initialIndex: ProblemIndex[];
  streak: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopics =
    searchParams.get("topics")?.split(",").filter(Boolean) ?? [];

  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string[]>(initialTopics);
  const [activeApproach, setActiveApproach] = useState<ApproachType | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  const counts = useMemo(() => computeFilterCounts(initialIndex), [initialIndex]);

  const activeFilterCount =
    (search ? 1 : 0) +
    (topicFilter.length > 0 ? 1 : 0) +
    (activeApproach ? 1 : 0) +
    (activeDifficulty ? 1 : 0) +
    (activePlatform ? 1 : 0);

  const problems = initialIndex.filter((problem) => {
    const matchesSearch =
      !search ||
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.topics.some((topic) => topic.toLowerCase().includes(search.toLowerCase()));
    const matchesTopics =
      topicFilter.length === 0 ||
      topicFilter.some((topic) => problem.topics.includes(topic));
    const matchesPlatform = !activePlatform || problem.platform === activePlatform;
    const matchesDifficulty = !activeDifficulty || problem.difficulty === activeDifficulty;
    const matchesApproach =
      !activeApproach || problem.latest_approach === activeApproach;

    return (
      matchesSearch &&
      matchesTopics &&
      matchesPlatform &&
      matchesDifficulty &&
      matchesApproach
    );
  });

  function clearFilters() {
    setSearch("");
    setTopicFilter([]);
    setActiveApproach(null);
    setActiveDifficulty(null);
    setActivePlatform(null);
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Library" streak={streak} />

      <AnimatedMain className="mx-auto max-w-7xl p-container-padding">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-1.5 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 transition-colors focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {APPROACH_FILTERS.map((approach) => (
            <FilterChip
              key={approach}
              label={approach}
              count={counts.byApproach[approach]}
              active={activeApproach === approach}
              onClick={() =>
                setActiveApproach(activeApproach === approach ? null : approach)
              }
            />
          ))}

          {DIFFICULTY_FILTERS.map((difficulty) => (
            <FilterChip
              key={difficulty}
              label={DIFFICULTY_LABELS[difficulty]}
              count={counts.byDifficulty[difficulty]}
              active={activeDifficulty === difficulty}
              onClick={() =>
                setActiveDifficulty(activeDifficulty === difficulty ? null : difficulty)
              }
            />
          ))}

          {PLATFORM_FILTERS.map((platform) => (
            <FilterChip
              key={platform}
              label={PLATFORM_LABELS[platform]}
              count={counts.byPlatform[platform]}
              active={activePlatform === platform}
              onClick={() =>
                setActivePlatform(activePlatform === platform ? null : platform)
              }
            />
          ))}

          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-150 hover:border-zinc-600 hover:text-zinc-300"
            >
              <X className="h-3 w-3" />
              {activeFilterCount} active filter{activeFilterCount !== 1 ? "s" : ""}
            </button>
          ) : null}
        </div>

        {topicFilter.length > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">Topics:</span>
            {topicFilter.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() =>
                  setTopicFilter((current) => current.filter((entry) => entry !== topic))
                }
                className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
              >
                {topic}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              onClick={() => setTopicFilter([])}
            >
              Clear topics
            </button>
          </div>
        ) : null}

        <p className="text-xs text-zinc-500">
          Showing {problems.length} of {initialIndex.length} problems
        </p>

        {problems.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-4 space-y-1.5"
          >
            {problems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onClick={() => router.push(`/library/${problem.id}`)}
              />
            ))}
          </motion.div>
        ) : initialIndex.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Your library is empty"
            description="Solve a problem on LeetCode, Codeforces, or CodeChef. The extension will save it here automatically."
            action={{ label: "Add manually", href: "/add" }}
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No matching problems"
            description="No problems match the current filters. Try adjusting your search or clearing filters."
            action={{ label: "Clear filters", onClick: clearFilters }}
          />
        )}
      </AnimatedMain>
    </div>
  );
}
