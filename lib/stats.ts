import type { ProblemIndex } from "@/types";

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toDateKey(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  const normalized = normalizeDate(date);
  return normalized.toISOString().slice(0, 10);
}

export function getRecentProblems(index: ProblemIndex[], limit = 6) {
  return [...index]
    .sort(
      (a, b) =>
        new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime(),
    )
    .slice(0, limit);
}

export function computeCurrentStreak(index: ProblemIndex[]) {
  if (!index.length) {
    return 0;
  }

  const solvedDates = new Set(index.map((item) => toDateKey(item.latest_date)));
  let streak = 0;
  const cursor = normalizeDate(new Date());

  while (solvedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function computeBestStreak(index: ProblemIndex[]) {
  if (!index.length) {
    return 0;
  }

  const solvedDates = Array.from(
    new Set(index.map((item) => toDateKey(item.latest_date))),
  ).sort();

  let best = 1;
  let current = 1;

  for (let i = 1; i < solvedDates.length; i += 1) {
    const previous = new Date(solvedDates[i - 1]);
    const currentDate = new Date(solvedDates[i]);
    previous.setDate(previous.getDate() + 1);

    if (toDateKey(previous) === toDateKey(currentDate)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

export function computeDashboardStats(index: ProblemIndex[]) {
  const now = normalizeDate(new Date());
  const weekAgo = normalizeDate(new Date(now));
  weekAgo.setDate(now.getDate() - 6);

  return {
    totalSolved: index.length,
    thisWeek: index.filter((item) => {
      const date = normalizeDate(new Date(item.latest_date));
      return date >= weekAgo && date <= now;
    }).length,
    currentStreak: computeCurrentStreak(index),
    optimal: index.filter((item) => item.latest_approach === "Optimal").length,
  };
}

export function computeDifficultyBreakdown(index: ProblemIndex[]) {
  return {
    easy: index.filter((item) => item.difficulty === "easy").length,
    medium: index.filter((item) => item.difficulty === "medium").length,
    hard: index.filter((item) => item.difficulty === "hard").length,
  };
}

export function computePlatformBreakdown(index: ProblemIndex[]) {
  return index.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.platform] = (accumulator[item.platform] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function buildHeatmap(index: ProblemIndex[]) {
  const end = normalizeDate(new Date());
  const start = normalizeDate(new Date(end));
  start.setDate(end.getDate() - 364);

  const counts = index.reduce<Record<string, number>>((accumulator, item) => {
    const key = toDateKey(item.latest_date);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  return Array.from({ length: 365 }, (_, offset) => {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    const key = toDateKey(date);

    return {
      date: key,
      count: counts[key] ?? 0,
    };
  });
}

export function formatRelativeDate(dateString: string) {
  const today = normalizeDate(new Date());
  const target = normalizeDate(new Date(dateString));
  const diffInDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays <= 0) {
    return "Today";
  }

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
