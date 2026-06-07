"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, PlusSquare, Search, X } from "lucide-react";
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

type FilterCategory = "approach" | "difficulty" | "platform";

const FILTER_CATEGORIES: { id: FilterCategory; label: string }[] = [
  { id: "approach", label: "Approach" },
  { id: "difficulty", label: "Difficulty" },
  { id: "platform", label: "Platform" },
];

const CATEGORY_STYLE: Record<
  FilterCategory,
  { tab: string; line: string; glow: string }
> = {
  approach: {
    tab: "text-emerald-300",
    line: "bg-emerald-400",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.25)]",
  },
  difficulty: {
    tab: "text-blue-300",
    line: "bg-blue-400",
    glow: "shadow-[0_0_12px_rgba(96,165,250,0.25)]",
  },
  platform: {
    tab: "text-purple-300",
    line: "bg-purple-400",
    glow: "shadow-[0_0_12px_rgba(192,132,252,0.25)]",
  },
};

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

function FilterCategoryTab({
  label,
  count,
  active,
  category,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  category: FilterCategory;
  onClick: () => void;
}) {
  const style = CATEGORY_STYLE[category];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative px-1 pb-3 text-sm font-medium transition-colors",
        active ? style.tab : "text-zinc-500 hover:text-zinc-300",
      )}
    >
      {label}
      <span className="ml-1.5 font-mono text-xs tabular-nums text-zinc-600">
        {count}
      </span>
      {active ? (
        <motion.span
          layoutId="library-filter-line"
          className={cn(
            "absolute inset-x-0 -bottom-px h-0.5 rounded-full",
            style.line,
            style.glow,
          )}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      ) : null}
    </button>
  );
}

function FilterPill({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-medium transition-all duration-150",
        checked
          ? "bg-vault-brand/10 text-vault-brand ring-1 ring-vault-brand/35"
          : "bg-zinc-900/60 text-zinc-400 ring-1 ring-zinc-800 hover:bg-zinc-800/80 hover:text-zinc-200",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
          checked
            ? "bg-vault-brand text-vault-brand-foreground"
            : "border border-zinc-700 bg-zinc-950",
        )}
      >
        {checked ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
      </span>
      {label}
      <span className="font-mono tabular-nums text-zinc-600">{count}</span>
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
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("approach");
  const [activeApproach, setActiveApproach] = useState<ApproachType | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  const counts = useMemo(() => computeFilterCounts(initialIndex), [initialIndex]);

  const categoryCounts: Record<FilterCategory, number> = {
    approach: APPROACH_FILTERS.length,
    difficulty: DIFFICULTY_FILTERS.length,
    platform: PLATFORM_FILTERS.length,
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    topicFilter.length +
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
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="relative min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-1.5 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 transition-colors focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <Link
              href="/add"
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-vault-brand/50 bg-vault-brand/10 px-3 py-1.5 text-xs font-medium text-vault-brand transition-all duration-150 hover:border-vault-brand/70 hover:bg-vault-brand/20"
            >
              <PlusSquare className="h-3 w-3" />
              Add a problem
            </Link>
          </div>

          <div
            className="flex flex-wrap items-end gap-x-6 gap-y-2 border-b border-zinc-800/80"
            role="tablist"
            aria-label="Filter category"
          >
            {FILTER_CATEGORIES.map((category) => (
              <FilterCategoryTab
                key={category.id}
                category={category.id}
                label={category.label}
                count={categoryCounts[category.id]}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            {activeFilterCount > 0 ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pt-4">
                  <span className="text-micro-label mr-1">Filtering</span>
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-0.5 pl-2.5 pr-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                    >
                      &ldquo;{search}&rdquo;
                      <X className="h-3 w-3 text-zinc-500" />
                    </button>
                  ) : null}
                  {activeApproach ? (
                    <button
                      type="button"
                      onClick={() => setActiveApproach(null)}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-0.5 pl-2.5 pr-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                    >
                      {activeApproach}
                      <X className="h-3 w-3 text-zinc-500" />
                    </button>
                  ) : null}
                  {activeDifficulty ? (
                    <button
                      type="button"
                      onClick={() => setActiveDifficulty(null)}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-0.5 pl-2.5 pr-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                    >
                      {DIFFICULTY_LABELS[activeDifficulty]}
                      <X className="h-3 w-3 text-zinc-500" />
                    </button>
                  ) : null}
                  {activePlatform ? (
                    <button
                      type="button"
                      onClick={() => setActivePlatform(null)}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-0.5 pl-2.5 pr-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                    >
                      {PLATFORM_LABELS[activePlatform]}
                      <X className="h-3 w-3 text-zinc-500" />
                    </button>
                  ) : null}
                  {topicFilter.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() =>
                        setTopicFilter((current) => current.filter((entry) => entry !== topic))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-0.5 pl-2.5 pr-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                    >
                      {topic}
                      <X className="h-3 w-3 text-zinc-500" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    Clear all
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="pt-5">
            <p className="text-micro-label mb-2.5">
              {activeCategory === "approach"
                ? "Filter by approach"
                : activeCategory === "difficulty"
                  ? "Filter by difficulty"
                  : "Filter by platform"}
            </p>
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-wrap gap-1.5"
            >
              {activeCategory === "approach"
                ? APPROACH_FILTERS.map((approach) => (
                    <FilterPill
                      key={approach}
                      label={approach}
                      count={counts.byApproach[approach]}
                      checked={activeApproach === approach}
                      onToggle={() =>
                        setActiveApproach(activeApproach === approach ? null : approach)
                      }
                    />
                  ))
                : null}
              {activeCategory === "difficulty"
                ? DIFFICULTY_FILTERS.map((difficulty) => (
                    <FilterPill
                      key={difficulty}
                      label={DIFFICULTY_LABELS[difficulty]}
                      count={counts.byDifficulty[difficulty]}
                      checked={activeDifficulty === difficulty}
                      onToggle={() =>
                        setActiveDifficulty(
                          activeDifficulty === difficulty ? null : difficulty,
                        )
                      }
                    />
                  ))
                : null}
              {activeCategory === "platform"
                ? PLATFORM_FILTERS.map((platform) => (
                    <FilterPill
                      key={platform}
                      label={PLATFORM_LABELS[platform]}
                      count={counts.byPlatform[platform]}
                      checked={activePlatform === platform}
                      onToggle={() =>
                        setActivePlatform(activePlatform === platform ? null : platform)
                      }
                    />
                  ))
                : null}
            </motion.div>
          </div>
        </div>

        <p className="text-xs text-zinc-500">
          Showing {problems.length} of {initialIndex.length} problems
        </p>

        {problems.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-4 space-y-2"
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
