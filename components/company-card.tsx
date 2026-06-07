"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Company, CompanyReadiness } from "@/types";

export interface CompanyCardProps {
  company: Company;
  readiness: CompanyReadiness;
}

function getReadinessTextColor(percent: number): string {
  if (percent < 40) return "text-red-500";
  if (percent < 70) return "text-yellow-400";
  return "text-emerald-500";
}

function getBarColor(percent: number): string {
  if (percent < 40) return "bg-red-500";
  if (percent < 70) return "bg-yellow-400";
  return "bg-emerald-500";
}

export function CompanyCard({ company, readiness }: CompanyCardProps) {
  const topTopics = [...company.topics]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map(({ topic }) => {
      const data = readiness.topicReadiness.find((entry) => entry.topic === topic);
      const solved = data?.solved ?? 0;
      const total = data?.total ?? 0;
      const percent = total > 0 ? Math.min((solved / total) * 100, 100) : 0;

      return { topic, solved, total, percent };
    });

  const roundedPercent = Math.round(readiness.readinessPercent);
  const libraryUrl = `/library?topics=${encodeURIComponent(readiness.weakestTopics.join(","))}`;

  return (
    <div className="surface-card flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-card-title">{company.name}</h3>
        <Badge variant="outline" className="shrink-0 font-mono text-[10px] uppercase">
          {company.tier}
        </Badge>
      </div>

      <div
        className={cn(
          "mt-4 font-mono text-5xl font-bold leading-none tabular-nums",
          getReadinessTextColor(roundedPercent),
        )}
      >
        {roundedPercent}%
      </div>
      <p className="mt-1 text-xs text-muted-foreground">interview readiness</p>

      <div className="mt-6 space-y-3">
        {topTopics.map(({ topic, solved, total, percent }) => (
          <div key={topic} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-zinc-400">{topic}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-700">
              <div
                className={cn("h-full rounded-full transition-all", getBarColor(percent))}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-400">
              {solved}/{total}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-micro-label mb-2">Weak spots</p>
        <div className="flex flex-wrap gap-2">
          {readiness.weakestTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-xs text-red-400"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <Link
        href={libraryUrl}
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Practice these topics
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
