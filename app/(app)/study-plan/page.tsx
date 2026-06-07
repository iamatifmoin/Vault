"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatedMain } from "@/components/animated-main";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeTopicMastery } from "@/lib/algorithms";
import { COMPANIES } from "@/lib/company-data";
import { readOnboardingData } from "@/lib/onboarding";
import {
  clearStudyPlan,
  readStudyPlan,
  saveStudyPlan,
} from "@/lib/study-plan";
import { computeCurrentStreak } from "@/lib/stats";
import { cn } from "@/lib/utils";
import type {
  CompanyTierTarget,
  ProblemIndex,
  StudyPlan,
  StudyPlanWeek,
} from "@/types";

function formatWeekRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth();

  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

function deriveTargetTier(companyIds: string[]): CompanyTierTarget {
  const tiers = companyIds
    .map((id) => COMPANIES.find((company) => company.id === id)?.tier)
    .filter(Boolean);

  if (tiers.includes("FAANG")) return "FAANG";
  if (tiers.includes("Indian Unicorn")) return "Indian Unicorn";
  return "Service";
}

function getWeakTopics(problems: ProblemIndex[]): string[] {
  return computeTopicMastery(problems)
    .filter((entry) => entry.masteryScore < 50 || entry.totalSolved < 3)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 5)
    .map((entry) => entry.topic);
}

function computeOverallProgress(weeks: StudyPlanWeek[]) {
  const target = weeks.reduce((sum, week) => sum + week.targetProblems, 0);
  const completed = weeks.reduce(
    (sum, week) => sum + week.completedProblems,
    0,
  );
  return {
    target,
    completed,
    percent: target > 0 ? Math.round((completed / target) * 100) : 0,
  };
}

function WeekProgressBar({
  completed,
  target,
}: {
  completed: number;
  target: number;
}) {
  const percent = target > 0 ? Math.min((completed / target) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-700"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-400">
        {completed}/{target} done
      </span>
    </div>
  );
}

function WeekCard({
  week,
  onUpdateCompleted,
  onToggleComplete,
}: {
  week: StudyPlanWeek;
  onUpdateCompleted: (weekNumber: number, value: number) => void;
  onToggleComplete: (weekNumber: number, complete: boolean) => void;
}) {
  const isComplete = week.completedProblems >= week.targetProblems;

  function adjustCompleted(delta: number) {
    const next = Math.max(
      0,
      Math.min(week.targetProblems, week.completedProblems + delta),
    );
    onUpdateCompleted(week.weekNumber, next);
  }

  function handleInputChange(raw: string) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      onUpdateCompleted(week.weekNumber, 0);
      return;
    }
    onUpdateCompleted(
      week.weekNumber,
      Math.max(0, Math.min(week.targetProblems, parsed)),
    );
  }

  return (
    <div className="relative pl-8">
      <span
        className={cn(
          "absolute left-0 top-5 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-vault-bg",
          isComplete ? "border-emerald-500 bg-emerald-500/20" : "border-zinc-700",
        )}
      >
        {isComplete ? (
          <Check className="h-2.5 w-2.5 text-emerald-500" strokeWidth={3} />
        ) : null}
      </span>

      <div className="surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Week {week.weekNumber}
            </p>
            <p className="text-card-title mt-1">
              {formatWeekRange(week.startDate, week.endDate)}
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={isComplete}
              onChange={(event) =>
                onToggleComplete(week.weekNumber, event.target.checked)
              }
              className="h-3.5 w-3.5 rounded border-border bg-vault-bg accent-emerald-500"
            />
            Mark week complete
          </label>
        </div>

        <p className="mt-3 text-sm text-zinc-400">
          Focus:{" "}
          <span className="text-foreground">
            {week.focusTopics.join(", ")}
          </span>
        </p>

        <div className="mt-4">
          <p className="text-micro-label mb-2">Target: {week.targetProblems} problems</p>
          <WeekProgressBar
            completed={week.completedProblems}
            target={week.targetProblems}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400">Completed:</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() => adjustCompleted(-1)}
              disabled={week.completedProblems <= 0}
              aria-label="Decrease completed problems"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min={0}
              max={week.targetProblems}
              value={week.completedProblems}
              onChange={(event) => handleInputChange(event.target.value)}
              className="h-8 w-16 text-center font-mono text-sm tabular-nums"
            />
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() => adjustCompleted(1)}
              disabled={week.completedProblems >= week.targetProblems}
              aria-label="Increase completed problems"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <span className="font-mono text-xs text-zinc-400">
              / {week.targetProblems}
            </span>
          </div>
        </div>

        {week.notes ? (
          <p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-zinc-400">
            {week.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [problems, setProblems] = useState<ProblemIndex[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  useEffect(() => {
    setPlan(readStudyPlan());
    setHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadIndex() {
      try {
        const response = await fetch("/api/problems/list");
        if (!response.ok) return;

        const data = (await response.json()) as { index?: ProblemIndex[] };
        if (!cancelled) {
          setProblems(Array.isArray(data.index) ? data.index : []);
        }
      } catch {
        if (!cancelled) setProblems([]);
      }
    }

    loadIndex();

    return () => {
      cancelled = true;
    };
  }, []);

  const streak = useMemo(() => computeCurrentStreak(problems), [problems]);
  const overall = useMemo(
    () => (plan ? computeOverallProgress(plan.weeks) : null),
    [plan],
  );

  const persistPlan = useCallback((next: StudyPlan) => {
    const updated: StudyPlan = {
      ...next,
      lastUpdated: new Date().toISOString(),
    };
    setPlan(updated);
    saveStudyPlan(updated);
  }, []);

  const updateWeekCompleted = useCallback(
    (weekNumber: number, completedProblems: number) => {
      if (!plan) return;

      persistPlan({
        ...plan,
        weeks: plan.weeks.map((week) =>
          week.weekNumber === weekNumber
            ? { ...week, completedProblems }
            : week,
        ),
      });
    },
    [plan, persistPlan],
  );

  const toggleWeekComplete = useCallback(
    (weekNumber: number, complete: boolean) => {
      if (!plan) return;

      persistPlan({
        ...plan,
        weeks: plan.weeks.map((week) =>
          week.weekNumber === weekNumber
            ? {
                ...week,
                completedProblems: complete ? week.targetProblems : 0,
              }
            : week,
        ),
      });
    },
    [plan, persistPlan],
  );

  async function handleGenerate() {
    const onboarding = readOnboardingData();
    if (!onboarding) {
      setError("Complete onboarding first to generate a personalized plan.");
      return;
    }

    const companyNames = onboarding.targetCompanies
      .map((id) => COMPANIES.find((company) => company.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetTier: deriveTargetTier(onboarding.targetCompanies),
          targetCompanies: companyNames,
          dailyHours: onboarding.dailyHours,
          placementDate: onboarding.placementDate,
          sheetFollowed: onboarding.sheet,
          weakTopics: getWeakTopics(problems),
          problemsSolvedCount: problems.length,
        }),
      });

      const data = (await response.json()) as {
        weeks?: StudyPlanWeek[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate study plan.");
      }

      if (!data.weeks?.length) {
        throw new Error("Generated plan had no weeks.");
      }

      const now = new Date().toISOString();
      const newPlan: StudyPlan = {
        id: crypto.randomUUID(),
        targetTier: deriveTargetTier(onboarding.targetCompanies),
        targetCompanies: companyNames,
        dailyHours: onboarding.dailyHours,
        placementDate: onboarding.placementDate,
        sheetFollowed: onboarding.sheet,
        weeks: data.weeks,
        createdAt: now,
        lastUpdated: now,
      };

      persistPlan(newPlan);
      setConfirmRegenerate(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate study plan.",
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleRegenerate() {
    if (!confirmRegenerate) {
      setConfirmRegenerate(true);
      return;
    }

    clearStudyPlan();
    setPlan(null);
    setConfirmRegenerate(false);
    void handleGenerate();
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Study Plan" subtitle="Your personalized DSA roadmap" />
        <AnimatedMain className="mx-auto max-w-3xl p-container-padding">
          <div className="surface-card h-64 animate-pulse" />
        </AnimatedMain>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Study Plan"
        subtitle={
          plan
            ? `${plan.weeks.length} weeks · ${plan.targetTier} track`
            : "Your personalized DSA roadmap"
        }
        streak={streak}
        actions={
          plan ? (
            <div className="flex items-center gap-2">
              {confirmRegenerate ? (
                <>
                  <span className="hidden text-xs text-zinc-400 sm:inline">
                    Replace current plan?
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400"
                    onClick={() => setConfirmRegenerate(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={generating}
                  >
                    Confirm
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400"
                  onClick={() => setConfirmRegenerate(true)}
                  disabled={generating}
                >
                  Regenerate Plan
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <AnimatedMain className="mx-auto max-w-3xl p-container-padding">
        {!plan ? (
          <div className="surface-card overflow-hidden">
            {generating ? (
              <div className="flex flex-col items-center px-6 py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                <p className="mt-4 text-sm text-zinc-400">
                  Claude is building your plan...
                </p>
              </div>
            ) : (
              <>
                <EmptyState
                  icon={Sparkles}
                  title="Generate Your Study Plan"
                  description="Get a week-by-week DSA roadmap tailored to your target companies, weak topics, and placement timeline — powered by Claude."
                  action={{
                    label: "Generate Your Study Plan",
                    onClick: () => void handleGenerate(),
                  }}
                />
                {error ? (
                  <p className="mx-auto -mt-8 max-w-sm px-6 pb-8 text-center text-sm text-red-500">
                    {error}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <>
            {overall ? (
              <section className="surface-card mb-6 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-micro-label">Overall Progress</p>
                    <p className="text-stat mt-1">{overall.percent}%</p>
                  </div>
                  <p className="font-mono text-sm tabular-nums text-zinc-400">
                    {overall.completed} / {overall.target} problems
                  </p>
                </div>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-700"
                  role="progressbar"
                  aria-valuenow={overall.completed}
                  aria-valuemin={0}
                  aria-valuemax={overall.target}
                >
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${overall.percent}%` }}
                  />
                </div>
              </section>
            ) : null}

            {generating ? (
              <div className="surface-card mb-6 flex items-center justify-center gap-3 px-6 py-10">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-400">
                  Claude is building your plan...
                </p>
              </div>
            ) : null}

            {error ? (
              <p className="mb-4 text-sm text-red-500">{error}</p>
            ) : null}

            <div className="relative space-y-6 border-l border-zinc-700 pl-0">
              {plan.weeks.map((week) => (
                <WeekCard
                  key={week.weekNumber}
                  week={week}
                  onUpdateCompleted={updateWeekCompleted}
                  onToggleComplete={toggleWeekComplete}
                />
              ))}
            </div>
          </>
        )}
      </AnimatedMain>
    </div>
  );
}
