"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { computeIRS } from "@/lib/algorithms";
import { cn } from "@/lib/utils";
import type { IRSData, ProblemIndex } from "@/types";

const CACHE_TTL_MS = 60 * 60 * 1000;

const RING_SIZE = 136;
const CENTER = 68;
const RADIUS = 52;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getRingColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#eab308";
  return "#ef4444";
}

function getRingGlow(score: number): string {
  if (score >= 70) return "drop-shadow(0 0 8px rgba(34,197,94,0.45))";
  if (score >= 40) return "drop-shadow(0 0 8px rgba(234,179,8,0.35))";
  return "none";
}

function BreakdownStat({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-zinc-500">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-zinc-400">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}

interface IRSWidgetProps {
  problems: ProblemIndex[];
  targetTier?: "FAANG" | "Indian Unicorn" | "Service";
  username?: string;
  className?: string;
}

interface CachedIRSEntry {
  data: IRSData;
  cachedAt: number;
  fingerprint: string;
}

function buildFingerprint(problems: ProblemIndex[]): string {
  return problems
    .map(
      (p) =>
        `${p.id}:${p.latest_date}:${p.latest_approach}:${p.attempt_count}`,
    )
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

function IRSWidgetVisual({
  irsData,
  targetTier,
  className,
}: {
  irsData: IRSData;
  targetTier: string;
  className?: string;
}) {
  const { score, breakdown, trend } = irsData;
  const color = getRingColor(score);
  const glow = getRingGlow(score);

  const springScore = useSpring(0, { stiffness: 40, damping: 15 });
  const dashOffset = useTransform(
    springScore,
    (s) => CIRCUMFERENCE * (1 - s / 100),
  );

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    springScore.set(score);
    const unsubscribe = springScore.on("change", (v) =>
      setDisplayScore(Math.round(v)),
    );
    return unsubscribe;
  }, [score, springScore]);

  const breakdownItems = [
    {
      label: "Topic Coverage",
      value: breakdown.topicCoverageBreadth,
      max: 25,
    },
    {
      label: "Difficulty Mix",
      value: breakdown.difficultyDistribution,
      max: 20,
    },
    {
      label: "Approach Quality",
      value: breakdown.approachQuality,
      max: 25,
    },
    { label: "Recency", value: breakdown.recencyScore, max: 15 },
    { label: "Volume", value: breakdown.volumeScore, max: 15 },
  ];

  const leftItems = breakdownItems.slice(0, 2);
  const rightItems = breakdownItems.slice(2);

  const scoreRing = (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      style={{ filter: glow }}
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="#27272a"
        strokeWidth={STROKE_WIDTH}
      />
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        style={{ strokeDashoffset: dashOffset }}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
      <text
        x={CENTER}
        y={CENTER - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="26"
        fontFamily="var(--font-mono, ui-monospace)"
        fontWeight="700"
      >
        {displayScore}
      </text>
      <text
        x={CENTER}
        y={CENTER + 16}
        textAnchor="middle"
        fill="#71717a"
        fontSize="10"
        fontFamily="var(--font-sans, system-ui)"
      >
        / 100
      </text>
    </svg>
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-zinc-800 bg-vault-surface p-6",
        className,
      )}
    >
      <div className="mb-6 text-center">
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
          Interview Readiness
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-zinc-400">Targeting {targetTier}</span>
          {trend !== 0 && (
            <span
              className={cn(
                "text-xs font-medium",
                trend > 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)} this week
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full flex-1 items-center gap-6 lg:gap-10">
        <div className="hidden min-w-0 flex-1 flex-col gap-5 md:flex">
          {leftItems.map((item) => (
            <BreakdownStat key={item.label} {...item} color={color} />
          ))}
        </div>

        <div className="mx-auto flex-shrink-0 md:mx-0">{scoreRing}</div>

        <div className="hidden min-w-0 flex-1 flex-col gap-5 md:flex">
          {rightItems.map((item) => (
            <BreakdownStat key={item.label} {...item} color={color} />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2.5 md:hidden">
        {breakdownItems.map((item) => (
          <BreakdownStat key={item.label} {...item} color={color} />
        ))}
      </div>
    </div>
  );
}

export function IRSWidget({
  problems,
  targetTier = "FAANG",
  username,
  className,
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

  return (
    <IRSWidgetVisual
      irsData={irsData}
      targetTier={targetTier}
      className={className}
    />
  );
}
