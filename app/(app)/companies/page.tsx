"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatedMain } from "@/components/animated-main";
import { CompanyCard } from "@/components/company-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  COMPANIES,
  computeCompanyReadiness,
  getCompaniesByTier,
} from "@/lib/company-data";
import { computeCurrentStreak } from "@/lib/stats";
import { cn } from "@/lib/utils";
import type { CompanyTier, ProblemIndex } from "@/types";

const STORAGE_KEY = "vault_target_companies";

const TIERS: CompanyTier[] = ["FAANG", "Indian Unicorn", "Service"];

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

function CompanySelectorSkeleton() {
  return (
    <div className="surface-card p-4">
      <Skeleton className="h-8 w-full max-w-md" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}

function CompanyCardSkeleton() {
  return (
    <div className="surface-card p-6">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="mt-4 h-12 w-24" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full" />
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

  function toggleCompany(id: string) {
    setSelectedIds((current) => {
      const next = current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Company Tracker"
        subtitle="Know exactly where you stand"
        streak={streak}
      />

      <AnimatedMain className="mx-auto max-w-6xl p-container-padding">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-section-title">Target companies</h2>
            {hydrated ? (
              <Badge variant="outline" className="font-mono text-xs">
                {selectedIds.length} companies selected
              </Badge>
            ) : (
              <Skeleton className="h-5 w-36" />
            )}
          </div>

          {!hydrated ? (
            <CompanySelectorSkeleton />
          ) : (
            <Tabs
              value={activeTier}
              onValueChange={(value) => setActiveTier(value as CompanyTier)}
            >
              <TabsList className="h-auto w-full flex-wrap justify-start bg-vault-surface p-1 sm:w-fit">
                {TIERS.map((tier) => (
                  <TabsTrigger
                    key={tier}
                    value={tier}
                    className="px-3 py-1.5 text-xs sm:text-sm"
                  >
                    {tier}
                  </TabsTrigger>
                ))}
              </TabsList>

              {TIERS.map((tier) => (
                <TabsContent key={tier} value={tier} className="mt-4">
                  <div className="surface-card grid gap-1 p-2 sm:grid-cols-2 lg:grid-cols-3">
                    {getCompaniesByTier(tier).map((company) => {
                      const checked = selectedIds.includes(company.id);

                      return (
                        <label
                          key={company.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-vault-raised",
                            checked && "bg-vault-brand-muted",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCompany(company.id)}
                            className="h-4 w-4 shrink-0 rounded border-border bg-vault-bg accent-emerald-500"
                          />
                          <span className="text-sm">{company.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </section>

        <section className="mt-8">
          {loading ? (
            selectedIds.length > 0 ? (
              <div className="stagger-children grid gap-gutter md:grid-cols-2">
                {selectedIds.map((id) => (
                  <CompanyCardSkeleton key={id} />
                ))}
              </div>
            ) : (
              <CompanySelectorSkeleton />
            )
          ) : selectedCompanies.length === 0 ? (
            <div className="surface-card border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Select one or more companies above to see your readiness breakdown.
              </p>
            </div>
          ) : (
            <div className="stagger-children grid gap-gutter md:grid-cols-2">
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
            </div>
          )}
        </section>
      </AnimatedMain>
    </div>
  );
}
