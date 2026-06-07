"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { ReadinessArc } from "@/components/readiness-arc";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Company, CompanyReadiness } from "@/types";

const TIER_BADGE: Record<string, string> = {
  FAANG: "border-purple-900/50 bg-purple-950/70 text-purple-400",
  "Indian Unicorn": "border-blue-900/50 bg-blue-950/70 text-blue-400",
  Service: "border-zinc-700/50 bg-zinc-800/80 text-zinc-400",
};

function getBarColor(pct: number) {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export interface CompanyCardProps {
  company: Company;
  readiness: CompanyReadiness;
}

export function CompanyCard({ company, readiness }: CompanyCardProps) {
  const topTopics = company.topics
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  return (
    <motion.div
      variants={listItem}
      className="relative overflow-hidden rounded-xl border border-zinc-800 bg-vault-surface p-5 transition-colors duration-200 hover:border-zinc-700"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.015] to-transparent" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-card-title text-zinc-100">{company.name}</h3>
            <p className="mt-1 text-[11px] text-zinc-500">
              {readiness.readinessPercent}% interview readiness
            </p>
          </div>
          <span
            className={cn(
              "flex-shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              TIER_BADGE[company.tier] ?? TIER_BADGE.Service,
            )}
          >
            {company.tier}
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex flex-shrink-0 flex-col items-center sm:w-36">
            <ReadinessArc percent={readiness.readinessPercent} />
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Readiness
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              Topic coverage
            </p>
            <div className="space-y-2.5">
              {topTopics.map(({ topic }) => {
                const tr = readiness.topicReadiness.find((t) => t.topic === topic);
                const solved = tr?.solved ?? 0;
                const total = tr?.total ?? 1;
                const pct = Math.min((solved / total) * 100, 100);

                return (
                  <div key={topic} className="flex items-center gap-2">
                    <span className="w-24 flex-shrink-0 truncate text-[11px] text-zinc-500">
                      {topic}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        className={cn("h-full rounded-full", getBarColor(pct))}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                    <span className="w-10 flex-shrink-0 text-right font-mono text-[11px] tabular-nums text-zinc-500">
                      {solved}/{total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {readiness.weakestTopics.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-lg border border-yellow-900/30 bg-yellow-950/20 px-3 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
            <span className="text-[11px] text-yellow-500/90">Focus on:</span>
            {readiness.weakestTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-md border border-yellow-900/40 bg-yellow-950/40 px-1.5 py-0.5 text-[10px] text-yellow-500/90"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
