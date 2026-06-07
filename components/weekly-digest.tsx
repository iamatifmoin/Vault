"use client";

import { useEffect, useState } from "react";
import { computeIRS, computeWeeklyDigest } from "@/lib/algorithms";
import { cn } from "@/lib/utils";
import type { ProblemIndex, WeeklyDigest as WeeklyDigestData } from "@/types";

interface WeeklyDigestProps {
  problems: ProblemIndex[];
  username?: string;
}

function getThisMondayKey(reference = new Date()): string {
  const date = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  return monday.toISOString().slice(0, 10);
}

function readPrevIRS(username: string): number {
  try {
    const raw = localStorage.getItem(`vault_irs_prev_${username}`);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function isDismissed(mondayKey: string): boolean {
  try {
    return localStorage.getItem(`vault_digest_dismissed_${mondayKey}`) === "true";
  } catch {
    return false;
  }
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

function daysSinceTopic(problems: ProblemIndex[], topic: string): number | null {
  const topicProblems = problems.filter((p) => p.topics.includes(topic));
  if (topicProblems.length === 0) return null;

  const mostRecent = topicProblems.reduce((latest, p) =>
    new Date(p.latest_date) > new Date(latest.latest_date) ? p : latest,
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(mostRecent.latest_date);
  target.setHours(0, 0, 0, 0);
  return Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function DigestBody({
  digest,
  problems,
  prevIRS,
  currentIRS,
}: {
  digest: WeeklyDigestData;
  problems: ProblemIndex[];
  prevIRS: number;
  currentIRS: number;
}) {
  const { problemsSolved, strongTopics, neglectedTopics, irsChange } = digest;
  const closingTone = irsChange >= 0 ? "Great week!" : "Push harder.";

  return (
    <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
      <p>
        {problemsSolved >= 7 ? (
          <>
            Strong week —{" "}
            <span className="font-semibold text-emerald-500">
              {problemsSolved}
            </span>{" "}
            problems solved.
          </>
        ) : problemsSolved > 0 ? (
          <>
            <span className="font-semibold text-emerald-500">
              {problemsSolved}
            </span>{" "}
            problem{problemsSolved === 1 ? "" : "s"} solved this week.
          </>
        ) : (
          "No problems solved this week yet."
        )}
      </p>

      {strongTopics.length > 0 ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {strongTopics.map((topic, index) => (
            <span key={topic} className="inline-flex items-center gap-1.5">
              {index === 0 ? null : index === strongTopics.length - 1 ? (
                <span className="text-zinc-500">and</span>
              ) : (
                <span className="text-zinc-500">,</span>
              )}
              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300">
                {topic}
              </span>
            </span>
          ))}
          <span>looking solid.</span>
        </p>
      ) : null}

      {neglectedTopics.length > 0 ? (
        <p>
          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300">
            {neglectedTopics[0]}
          </span>{" "}
          {(() => {
            const days = daysSinceTopic(problems, neglectedTopics[0]);
            if (days === null) return "hasn't been started yet.";
            return `hasn't been touched in ${days} days.`;
          })()}
        </p>
      ) : null}

      <p>
        IRS moved{" "}
        <span className="font-mono tabular-nums text-white">{prevIRS}</span>
        {" → "}
        <span className="font-mono tabular-nums text-white">{currentIRS}</span>
        {irsChange !== 0 ? (
          <span
            className={cn(
              "ml-1.5 font-mono text-xs font-medium",
              irsChange > 0 ? "text-emerald-500" : "text-red-500",
            )}
          >
            ({irsChange > 0 ? "+" : ""}
            {irsChange})
          </span>
        ) : null}
        .
      </p>

      <p
        className={cn(
          "font-medium",
          irsChange >= 0 ? "text-emerald-500" : "text-red-500",
        )}
      >
        {closingTone}
      </p>
    </div>
  );
}

export function WeeklyDigest({ problems, username = "user" }: WeeklyDigestProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [digest, setDigest] = useState<WeeklyDigestData | null>(null);
  const [prevIRS, setPrevIRS] = useState(0);
  const [currentIRS, setCurrentIRS] = useState(0);

  useEffect(() => {
    setMounted(true);

    const mondayKey = getThisMondayKey();
    if (isDismissed(mondayKey)) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const snapshotKey = `vault_digest_irs_${username}_${mondayKey}`;
    let prev: number;
    let current: number;

    try {
      const snapshot = localStorage.getItem(snapshotKey);
      if (snapshot) {
        const parsed = JSON.parse(snapshot) as {
          prevIRS: number;
          currentIRS: number;
        };
        prev = parsed.prevIRS;
        current = parsed.currentIRS;
      } else {
        prev = readPrevIRS(username);
        current = computeIRS(problems).score;
        localStorage.setItem(
          snapshotKey,
          JSON.stringify({ prevIRS: prev, currentIRS: current }),
        );
        localStorage.setItem(`vault_irs_prev_${username}`, String(current));
      }
    } catch {
      prev = readPrevIRS(username);
      current = computeIRS(problems).score;
    }

    setPrevIRS(prev);
    setCurrentIRS(current);
    setDigest(computeWeeklyDigest(problems, prev));
  }, [problems, username]);

  function handleDismiss() {
    const mondayKey = getThisMondayKey();
    try {
      localStorage.setItem(`vault_digest_dismissed_${mondayKey}`, "true");
    } catch {
      // localStorage may be unavailable
    }
    setVisible(false);
  }

  if (!mounted || !visible || !digest) {
    return null;
  }

  return (
    <section className="mt-6 rounded-md border border-zinc-700 bg-zinc-900/60 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            This Week
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            {formatDateRange(digest.weekStart, digest.weekEnd)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Dismiss
        </button>
      </div>

      <div className="mt-5 border-l-2 border-emerald-500/40 pl-4">
        <DigestBody
          digest={digest}
          problems={problems}
          prevIRS={prevIRS}
          currentIRS={currentIRS}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-700/60 pt-4">
        <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 font-mono text-[11px] text-zinc-400">
          {digest.problemsSolved} solved this week
        </span>
        <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 font-mono text-[11px] text-zinc-400">
          IRS: {prevIRS} → {currentIRS}
        </span>
      </div>
    </section>
  );
}
