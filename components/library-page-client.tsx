"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { AnimatedMain } from "@/components/animated-main";
import { EmptyState } from "@/components/empty-state";
import { ProblemCard } from "@/components/problem-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaultSelect } from "@/components/vault-select";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS, LANGUAGE_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { SHEETS } from "@/lib/sheets";
import type { ProblemIndex } from "@/types";

const filterSelectClassName =
  "h-8 w-full min-w-0 py-1 pl-3 pr-8 text-[11px] font-mono uppercase sm:w-auto sm:min-w-[132px]";

const platformOptions = [
  { value: "all", label: "All Platforms" },
  ...Object.entries(PLATFORM_LABELS).map(([value, label]) => ({ value, label })),
];

const sheetOptions = [
  { value: "all", label: "All Sheets" },
  ...Object.entries(SHEETS).map(([value, meta]) => ({ value, label: meta.label })),
];

const difficultyOptions = [
  { value: "all", label: "All Difficulties" },
  ...Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label })),
];

const approachOptions = [
  { value: "all", label: "All Approaches" },
  { value: "Brute Force", label: "Brute Force" },
  { value: "Optimized", label: "Optimized" },
  { value: "Optimal", label: "Optimal" },
];

const languageOptions = [
  { value: "all", label: "All Languages" },
  ...Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label })),
];

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <VaultSelect
      fullWidth={false}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(filterSelectClassName, "bg-vault-bg")}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </VaultSelect>
  );
}

function clearFilters(setters: {
  setSearch: (v: string) => void;
  setTopicFilter: (v: string[]) => void;
  setPlatform: (v: string) => void;
  setSheet: (v: string) => void;
  setDifficulty: (v: string) => void;
  setApproach: (v: string) => void;
  setLanguage: (v: string) => void;
}) {
  setters.setSearch("");
  setters.setTopicFilter([]);
  setters.setPlatform("all");
  setters.setSheet("all");
  setters.setDifficulty("all");
  setters.setApproach("all");
  setters.setLanguage("all");
}

export function LibraryPageClient({
  initialIndex,
  streak,
}: {
  initialIndex: ProblemIndex[];
  streak: number;
}) {
  const searchParams = useSearchParams();
  const initialTopics =
    searchParams.get("topics")?.split(",").filter(Boolean) ?? [];

  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string[]>(initialTopics);
  const [platform, setPlatform] = useState("all");
  const [sheet, setSheet] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [approach, setApproach] = useState("all");
  const [language, setLanguage] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    search !== "" ||
    topicFilter.length > 0 ||
    platform !== "all" ||
    sheet !== "all" ||
    difficulty !== "all" ||
    approach !== "all" ||
    language !== "all";

  const problems = initialIndex.filter((problem) => {
    const matchesSearch =
      !search ||
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.topics.some((topic) => topic.toLowerCase().includes(search.toLowerCase()));
    const matchesTopics =
      topicFilter.length === 0 ||
      topicFilter.some((topic) => problem.topics.includes(topic));
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
      matchesTopics &&
      matchesPlatform &&
      matchesSheet &&
      matchesDifficulty &&
      matchesApproach &&
      matchesLanguage
    );
  });

  const filterSetters = {
    setSearch,
    setTopicFilter,
    setPlatform,
    setSheet,
    setDifficulty,
    setApproach,
    setLanguage,
  };

  const filterControls = (
    <>
      <FilterSelect value={platform} onChange={setPlatform} options={platformOptions} />
      <FilterSelect value={sheet} onChange={setSheet} options={sheetOptions} />
      <FilterSelect value={difficulty} onChange={setDifficulty} options={difficultyOptions} />
      <FilterSelect value={approach} onChange={setApproach} options={approachOptions} />
      <FilterSelect value={language} onChange={setLanguage} options={languageOptions} />
      {hasActiveFilters ? (
        <button
          type="button"
          className="text-micro-label col-span-2 h-8 shrink-0 px-3 hover:text-foreground sm:col-span-1"
          onClick={() => clearFilters(filterSetters)}
        >
          Clear All
        </button>
      ) : null}
    </>
  );

  return (
    <div className="min-h-screen">
      <PageHeader title="Library" streak={streak} />

      <AnimatedMain className="mx-auto max-w-7xl p-container-padding">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-vault-surface pl-9 pr-9"
              placeholder="Search problems, topics, or languages..."
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {topicFilter.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-micro-label normal-case tracking-normal">
                Topics:
              </span>
              {topicFilter.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() =>
                    setTopicFilter((current) => current.filter((entry) => entry !== topic))
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {topic}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                className="text-micro-label normal-case tracking-normal hover:text-foreground"
                onClick={() => setTopicFilter([])}
              >
                Clear topics
              </button>
            </div>
          ) : null}

          <button
            type="button"
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-md border border-border text-sm text-muted-foreground transition-colors hover:text-foreground md:hidden",
              filtersOpen && "border-vault-brand/40 text-foreground",
            )}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters ? (
              <span className="h-1.5 w-1.5 rounded-full bg-vault-brand" />
            ) : null}
          </button>

          <div
            className={cn(
              "surface-card items-center gap-2 p-2",
              filtersOpen ? "grid grid-cols-2 sm:flex sm:flex-wrap" : "hidden",
              "md:flex md:flex-wrap",
            )}
          >
            {filterControls}
          </div>
        </div>

        <p className="text-micro-label mt-4 normal-case tracking-normal">
          Showing {problems.length} of {initialIndex.length} problems
        </p>

        <div className="stagger-children mt-6 grid gap-gutter md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>

        {!problems.length ? (
          <div className="surface-card mt-10 border-dashed">
            <EmptyState
              description={
                initialIndex.length
                  ? "No problems match the current filters."
                  : "Your library is empty. Add a problem to get started."
              }
              action={
                hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6"
                    onClick={() => clearFilters(filterSetters)}
                  >
                    Clear filters
                  </Button>
                ) : initialIndex.length === 0 ? (
                  <Button
                    nativeButton={false}
                    render={<Link href="/add" />}
                    className="mt-6"
                  >
                    Add a problem
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : null}
      </AnimatedMain>
    </div>
  );
}
