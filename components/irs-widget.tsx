"use client";

import { useEffect, useMemo, useState } from "react";
import { computeIRS } from "@/lib/algorithms";
import { cn } from "@/lib/utils";
import type { IRSBreakdown, IRSData, ProblemIndex } from "@/types";

const CACHE_TTL_MS = 60 * 60 * 1000;

const BREAKDOWN_ROWS: {
  key: keyof IRSBreakdown;
  label: string;
  max: number;
}[] = [
  { key: "topicCoverageBreadth", label: "Topic Coverage", max: 25 },
  { key: "difficultyDistribution", label: "Difficulty Mix", max: 20 },
  { key: "approachQuality", label: "Approach Quality", max: 25 },
  { key: "recencyScore", label: "Recency", max: 15 },
  { key: "volumeScore", label: "Volume", max: 15 },
];

interface IRSWidgetProps {
  problems: ProblemIndex[];
  targetTier?: "FAANG" | "Indian Unicorn" | "Service";
  username?: string;
}

interface CachedIRSEntry {
  data: IRSData;
  cachedAt: number;
  fingerprint: string;
}

function buildFingerprint(problems: ProblemIndex[]): string {
  return problems
    .map((p) => `${p.id}:${p.latest_date}:${p.latest_approach}:${p.attempt_count}`)
    .sort()
    .join("|");
}

function readCache(username: string, fingerprint: string): IRSData | null {
  try {
    const raw = localStorage.getItem(`vault_irs_${username}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as CachedIRSEntry;
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
    if (entry.fingerprint !== fingerprint) return null;

    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(username: string, data: IRSData, fingerprint: string) {
  try {
    const entry: CachedIRSEntry = {
      data,
      cachedAt: Date.now(),
      fingerprint,
    };
    localStorage.setItem(`vault_irs_${username}`, JSON.stringify(entry));
  } catch {
    // localStorage may be unavailable
  }
}

function getScoreBarColor(score: number): string {
  if (score < 40) return "bg-red-500";
  if (score < 70) return "bg-yellow-400";
  return "bg-emerald-500";
}

function BreakdownBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const rounded = Math.round(value);
  const filledBlocks = Math.round((value / max) * 5);

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-zinc-400">{label}</span>
      <div className="flex flex-1 gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-sm",
              index < filledBlocks ? "bg-emerald-500" : "bg-zinc-700",
            )}
          />
        ))}
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-400">
        {rounded}/{max}
      </span>
    </div>
  );
}

function TrendIndicator({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <p className="font-mono text-sm text-emerald-500">
        ↑ +{trend} this week
      </p>
    );
  }

  if (trend < 0) {
    return (
      <p className="font-mono text-sm text-red-500">↓ {trend} this week</p>
    );
  }

  return <p className="font-mono text-sm text-zinc-400">— No change</p>;
}

export function IRSWidget({
  problems,
  targetTier = "FAANG",
  username,
}: IRSWidgetProps) {
  const problemList = problems as ProblemIndex[];

  const fingerprint = useMemo(
    () => buildFingerprint(problemList),
    [problemList],
  );

  const computed = useMemo(
    () => computeIRS(problemList, targetTier),
    [problemList, targetTier],
  );

  const [irsData, setIrsData] = useState(computed);

  useEffect(() => {
    if (username) {
      const cached = readCache(username, fingerprint);
      if (cached) {
        setIrsData(cached);
        return;
      }
      writeCache(username, computed, fingerprint);
    }

    setIrsData(computed);
  }, [computed, fingerprint, username]);

  const { score, breakdown, trend } = irsData;

  return (
    <div className="surface-card p-6">
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        Interview Readiness Score
      </p>

      <div className="mt-3 font-mono text-[72px] font-bold leading-none tabular-nums text-white">
        {score}
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-700">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            getScoreBarColor(score),
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-2">
        <TrendIndicator trend={trend} />
      </div>

      <div className="mt-6 space-y-3">
        {BREAKDOWN_ROWS.map(({ key, label, max }) => (
          <BreakdownBar
            key={key}
            label={label}
            value={breakdown[key]}
            max={max}
          />
        ))}
      </div>
    </div>
  );
}
