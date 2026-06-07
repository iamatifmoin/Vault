"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Target, X } from "lucide-react";
import { AnimatedMain } from "@/components/animated-main";
import { CompanyCard } from "@/components/company-card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { CompanyCardSkeleton } from "@/components/skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  COMPANIES,
  computeCompanyReadiness,
  getCompaniesByTier,
} from "@/lib/company-data";
import { staggerContainer } from "@/lib/motion";
import { computeCurrentStreak } from "@/lib/stats";
import { cn } from "@/lib/utils";
import type { CompanyTier, ProblemIndex } from "@/types";

const STORAGE_KEY = "vault_target_companies";

const TIERS: CompanyTier[] = ["FAANG", "Indian Unicorn", "Service"];

const TIER_STYLE: Record<
  CompanyTier,
  { tab: string; line: string; glow: string }
> = {
  FAANG: {
    tab: "text-purple-300",
    line: "bg-purple-400",
    glow: "shadow-[0_0_12px_rgba(192,132,252,0.25)]",
  },
  "Indian Unicorn": {
    tab: "text-blue-300",
    line: "bg-blue-400",
    glow: "shadow-[0_0_12px_rgba(96,165,250,0.25)]",
  },
  Service: {
    tab: "text-zinc-200",
    line: "bg-zinc-400",
    glow: "shadow-[0_0_12px_rgba(161,161,170,0.15)]",
  },
};

function readSelectedCompanies(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const validIds = new Set(COMPANIES.map((company) => company.id));
    return parsed.filter(
      (id): id is string => typeof id === "string" && validIds.has(id),
    );
  } catch {
    return [];
  }
}

function TierTab({
  label,
  count,
  active,
  tier,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  tier: CompanyTier;
  onClick: () => void;
}) {
  const style = TIER_STYLE[tier];

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
          layoutId="company-tier-line"
          className={cn("absolute inset-x-0 -bottom-px h-0.5 rounded-full", style.line, style.glow)}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      ) : null}
    </button>
  );
}

function CompanyPill({
  name,
  checked,
  onToggle,
}: {
  name: string;
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
      {name}
    </button>
  );
}

function CompanySelectorSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex gap-6 border-b border-zinc-800/80 pb-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-5 w-24" />
        ))}
      </div>
      <Skeleton className="mt-5 h-3 w-28" />
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const [problems, setProblems] = useState<ProblemIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTier, setActiveTier] = useState<CompanyTier>("FAANG");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSelectedIds(readSelectedCompanies());
    setHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadIndex() {
      setLoading(true);

      try {
        const response = await fetch("/api/problems/list");
        if (!response.ok) throw new Error("Failed to load index");

        const data = (await response.json()) as { index?: ProblemIndex[] };
        if (!cancelled) {
          setProblems(Array.isArray(data.index) ? data.index : []);
        }
      } catch {
        if (!cancelled) setProblems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadIndex();

    return () => {
      cancelled = true;
    };
  }, []);

  const streak = useMemo(() => computeCurrentStreak(problems), [problems]);

  const selectedCompanies = useMemo(
    () => COMPANIES.filter((company) => selectedIds.includes(company.id)),
    [selectedIds],
  );

  const readinessByCompany = useMemo(() => {
    const map = new Map(
      selectedCompanies.map((company) => [
        company.id,
        computeCompanyReadiness(company, problems),
      ]),
    );
    return map;
  }, [selectedCompanies, problems]);

  const tierCompanies = getCompaniesByTier(activeTier);

  function persistSelection(next: string[]) {
    setSelectedIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function toggleCompany(id: string) {
    persistSelection(
      selectedIds.includes(id)
        ? selectedIds.filter((entry) => entry !== id)
        : [...selectedIds, id],
    );
  }

  function clearSelection() {
    persistSelection([]);
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Company Tracker"
        subtitle="Know exactly where you stand"
        streak={streak}
      />

      <AnimatedMain className="mx-auto max-w-6xl p-container-padding">
        {!hydrated ? (
          <CompanySelectorSkeleton />
        ) : (
          <div className="mb-8">
            <div
              className="flex flex-wrap items-end gap-x-6 gap-y-2 border-b border-zinc-800/80"
              role="tablist"
              aria-label="Company tier"
            >
              {TIERS.map((tier) => (
                <TierTab
                  key={tier}
                  tier={tier}
                  label={tier}
                  count={getCompaniesByTier(tier).length}
                  active={activeTier === tier}
                  onClick={() => setActiveTier(tier)}
                />
              ))}
            </div>

            <AnimatePresence mode="popLayout">
              {selectedCompanies.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-2 pt-4">
                    <span className="text-micro-label mr-1">Tracking</span>
                    {selectedCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => toggleCompany(company.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-0.5 pl-2.5 pr-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                      >
                        {company.name}
                        <X className="h-3 w-3 text-zinc-500" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={clearSelection}
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
                Companies in {activeTier}
              </p>
              <motion.div
                key={activeTier}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-wrap gap-1.5"
              >
                {tierCompanies.map((company) => (
                  <CompanyPill
                    key={company.id}
                    name={company.name}
                    checked={selectedIds.includes(company.id)}
                    onToggle={() => toggleCompany(company.id)}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-section-title text-muted-foreground">
              Your readiness
            </h2>
            {!loading && selectedCompanies.length > 0 ? (
              <span className="font-mono text-xs tabular-nums text-zinc-500">
                {selectedCompanies.length} active
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <CompanyCardSkeleton key={index} />
              ))}
            </div>
          ) : selectedCompanies.length === 0 ? (
            <div className="surface-card">
              <EmptyState
                icon={Target}
                title="No companies selected"
                description="Choose companies from the list above to see your interview readiness and topic gaps."
              />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid gap-4 md:grid-cols-2"
            >
              {selectedCompanies.map((company) => {
                const readiness = readinessByCompany.get(company.id);
                if (!readiness) return null;

                return (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    readiness={readiness}
                  />
                );
              })}
            </motion.div>
          )}
        </section>
      </AnimatedMain>
    </div>
  );
}
