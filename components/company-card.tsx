"use client";

import { ReadinessArc } from "@/components/readiness-arc";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Company, CompanyReadiness } from "@/types";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const TIER_BADGE: Record<string, string> = {
  "FAANG":           "bg-purple-950/70 text-purple-400 border border-purple-900/50",
  "Indian Unicorn":  "bg-blue-950/70   text-blue-400   border border-blue-900/50",
  "Service":         "bg-zinc-800/80   text-zinc-400   border border-zinc-700/50",
};

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
      className="rounded-xl border border-zinc-800 bg-vault-surface p-5
                 hover:border-zinc-700 transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-zinc-100">{company.name}</h3>
        <span className={cn(
          "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
          TIER_BADGE[company.tier] ?? TIER_BADGE["Service"]
        )}>
          {company.tier}
        </span>
      </div>

      {/* Arc */}
      <div className="flex justify-center mb-3">
        <ReadinessArc percent={readiness.readinessPercent} />
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-zinc-800" />

      {/* Topic bars */}
      <div className="space-y-2">
        {topTopics.map(({ topic }) => {
          const tr = readiness.topicReadiness.find(t => t.topic === topic);
          const solved = tr?.solved ?? 0;
          const total = tr?.total ?? 1;
          const pct = Math.min((solved / total) * 100, 100);

          return (
            <div key={topic} className="flex items-center gap-2">
              <span className="w-24 truncate text-[11px] text-zinc-500 flex-shrink-0">
                {topic}
              </span>
              <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                />
              </div>
              <span className="w-10 text-right text-[11px] font-mono text-zinc-600">
                {solved}/{total}
              </span>
            </div>
          );
        })}
      </div>

      {/* Weak topics */}
      {readiness.weakestTopics.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-yellow-500 flex-shrink-0" />
          {readiness.weakestTopics.map(t => (
            <span key={t}
              className="rounded-md border border-yellow-900/40 bg-yellow-950/30
                         px-1.5 py-0.5 text-[10px] text-yellow-500/80">
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
