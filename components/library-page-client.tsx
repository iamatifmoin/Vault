"use client";

import { useState } from "react";
import { ProblemCard } from "@/components/problem-card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { VaultSelect } from "@/components/vault-select";
import { DIFFICULTY_LABELS, LANGUAGE_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { SHEETS } from "@/lib/sheets";
import type { ProblemIndex } from "@/types";

const filterSelectClassName =
  "h-8 min-w-[148px] py-1 pl-3 pr-9 text-[11px] font-mono uppercase";

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
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={filterSelectClassName}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </VaultSelect>
  );
}

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
      <PageHeader title="Library" streak={streak} />

      <main className="mx-auto max-w-7xl p-container-padding">
        <div className="flex flex-col gap-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-vault-surface"
            placeholder="Search problems, topics, or languages..."
          />

          <div className="flex flex-wrap gap-2">
            <FilterSelect value={platform} onChange={setPlatform} options={platformOptions} />
            <FilterSelect value={sheet} onChange={setSheet} options={sheetOptions} />
            <FilterSelect value={difficulty} onChange={setDifficulty} options={difficultyOptions} />
            <FilterSelect value={approach} onChange={setApproach} options={approachOptions} />
            <FilterSelect value={language} onChange={setLanguage} options={languageOptions} />

            <button
              type="button"
              className="text-micro-label h-8 px-3 hover:text-foreground"
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

        <p className="text-micro-label mt-4 normal-case tracking-normal">
          Showing {problems.length} of {initialIndex.length} problems
        </p>

        <div className="mt-6 grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>

        {!problems.length ? (
          <div className="surface-card mt-10 border-dashed p-8 text-sm text-muted-foreground">
            No problems match the current filters.
          </div>
        ) : null}
      </main>
    </div>
  );
}
