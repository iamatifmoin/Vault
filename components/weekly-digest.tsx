"use client";

import { useEffect, useState } from "react";
import { TopicPill } from "@/components/topic-pill";
import { computeIRS, computeWeeklyDigest } from "@/lib/algorithms";
import { cn } from "@/lib/utils";
import type { ProblemIndex, WeeklyDigest as WeeklyDigestData } from "@/types";

interface WeeklyDigestProps {
  problems: ProblemIndex[];
  username?: string;
}

type MessageSegment =
  | { type: "text"; value: string }
  | { type: "topic"; value: string }
  | { type: "number"; value: string }
  | { type: "irs"; value: string };

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

function tokenizeMessage(message: string, topics: string[]): MessageSegment[] {
  const segments: MessageSegment[] = [];
  const irsMatch = message.match(/IRS moved \d+ → \d+\./);

  let mainMessage = message;
  let irsSegment: MessageSegment | null = null;

  if (irsMatch && irsMatch.index !== undefined) {
    mainMessage = message.slice(0, irsMatch.index).trimEnd();
    irsSegment = { type: "irs", value: irsMatch[0] };
  }

  const sortedTopics = [...topics].sort((a, b) => b.length - a.length);
  let pos = 0;

  while (pos < mainMessage.length) {
    let matchIndex = mainMessage.length;
    let matchLength = 0;
    let matchType: "topic" | "number" | null = null;
    let matchValue = "";

    for (const topic of sortedTopics) {
      const idx = mainMessage.indexOf(topic, pos);
      if (idx !== -1 && idx < matchIndex) {
        matchIndex = idx;
        matchLength = topic.length;
        matchType = "topic";
        matchValue = topic;
      }
    }

    const numMatch = mainMessage.slice(pos).match(/\d+/);
    if (numMatch && numMatch.index !== undefined) {
      const idx = pos + numMatch.index;
      if (idx < matchIndex) {
        matchIndex = idx;
        matchLength = numMatch[0].length;
        matchType = "number";
        matchValue = numMatch[0];
      }
    }

    if (matchType && matchIndex < mainMessage.length) {
      if (matchIndex > pos) {
        segments.push({ type: "text", value: mainMessage.slice(pos, matchIndex) });
      }
      segments.push({ type: matchType, value: matchValue });
      pos = matchIndex + matchLength;
    } else {
      segments.push({ type: "text", value: mainMessage.slice(pos) });
      break;
    }
  }

  if (irsSegment) {
    if (segments.length > 0) {
      segments.push({ type: "text", value: " " });
    }
    segments.push(irsSegment);
  }

  return segments;
}

function DigestMessage({
  message,
  digest,
}: {
  message: string;
  digest: WeeklyDigestData;
}) {
  const topics = [
    ...new Set([...digest.strongTopics, ...digest.neglectedTopics]),
  ];
  const segments = tokenizeMessage(message, topics);

  return (
    <p className="text-sm leading-relaxed text-zinc-300">
      {segments.map((segment, index) => {
        switch (segment.type) {
          case "topic":
            return (
              <TopicPill
                key={`${segment.type}-${index}`}
                topic={segment.value}
                className="mx-0.5 align-middle"
              />
            );
          case "number":
            return (
              <span
                key={`${segment.type}-${index}`}
                className="font-medium text-white"
              >
                {segment.value}
              </span>
            );
          case "irs":
            return (
              <span
                key={`${segment.type}-${index}`}
                className={cn(
                  "font-medium",
                  digest.irsChange >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {segment.value}
              </span>
            );
          default:
            return <span key={`${segment.type}-${index}`}>{segment.value}</span>;
        }
      })}
    </p>
  );
}

export function WeeklyDigest({ problems, username = "user" }: WeeklyDigestProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [digest, setDigest] = useState<WeeklyDigestData | null>(null);

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

  const irsChipPositive = digest.irsChange >= 0;

  return (
    <section className="mt-6 rounded-xl border border-zinc-800 bg-vault-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          This Week
        </p>
        <p className="text-[11px] text-zinc-600">
          {formatDateRange(digest.weekStart, digest.weekEnd)}
        </p>
      </div>

      <div className="mt-4">
        <DigestMessage message={digest.message} digest={digest} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
            {digest.problemsSolved} solved
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              irsChipPositive
                ? "bg-emerald-950/60 text-emerald-400"
                : "bg-red-950/60 text-red-400",
            )}
          >
            IRS {digest.irsChange >= 0 ? "+" : ""}
            {digest.irsChange}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}
