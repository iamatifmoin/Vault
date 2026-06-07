import type {
  IRSData,
  IRSBreakdown,
  TopicMastery,
  RevisionItem,
  WeeklyDigest,
  ProblemIndex,
} from "@/types";
import { toDateKey } from "@/lib/stats";

export const CORE_DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Binary Search",
  "Sorting",
  "Recursion & Backtracking",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Hashing",
  "Heaps & Priority Queues",
  "Tries",
  "Bit Manipulation",
] as const;

export const TIER_BENCHMARKS = {
  FAANG: 250,
  "Indian Unicorn": 150,
  Service: 75,
} as const;

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysSince(dateString: string, reference = new Date()): number {
  const today = normalizeDate(reference);
  const target = normalizeDate(new Date(dateString));
  return Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getCurrentWeekBounds(reference = new Date()) {
  const date = normalizeDate(reference);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function isDateInRange(
  dateString: string,
  start: Date,
  end: Date,
): boolean {
  const date = normalizeDate(new Date(dateString));
  return date >= start && date <= end;
}

function computeIRSBreakdown(
  problems: ProblemIndex[],
  targetTier: keyof typeof TIER_BENCHMARKS,
): IRSBreakdown {
  const total = problems.length;

  if (total === 0) {
    return {
      topicCoverageBreadth: 0,
      difficultyDistribution: 0,
      approachQuality: 0,
      recencyScore: 0,
      volumeScore: 0,
    };
  }

  const touchedCoreTopics = new Set<string>();
  for (const problem of problems) {
    for (const topic of problem.topics) {
      if ((CORE_DSA_TOPICS as readonly string[]).includes(topic)) {
        touchedCoreTopics.add(topic);
      }
    }
  }

  const topicCoverageBreadth =
    (touchedCoreTopics.size / CORE_DSA_TOPICS.length) * 25;

  const mediumHardCount = problems.filter(
    (p) => p.difficulty === "medium" || p.difficulty === "hard",
  ).length;
  const difficultyDistribution = Math.min(
    (mediumHardCount / total) * 20,
    20,
  );

  const optimalCount = problems.filter(
    (p) => p.latest_approach === "Optimal",
  ).length;
  const approachQuality = (optimalCount / total) * 25;

  const recencyScore = Math.min(
    problems.filter((p) => daysSince(p.latest_date) <= 30).length,
    15,
  );

  const benchmark = TIER_BENCHMARKS[targetTier];
  const volumeScore = Math.min((total / benchmark) * 15, 15);

  return {
    topicCoverageBreadth,
    difficultyDistribution,
    approachQuality,
    recencyScore,
    volumeScore,
  };
}

function computeIRSScore(
  breakdown: IRSBreakdown,
): number {
  const raw =
    breakdown.topicCoverageBreadth +
    breakdown.difficultyDistribution +
    breakdown.approachQuality +
    breakdown.recencyScore +
    breakdown.volumeScore;
  return Math.min(Math.round(raw), 100);
}

export function computeIRS(
  problems: ProblemIndex[],
  targetTier: keyof typeof TIER_BENCHMARKS = "FAANG",
): IRSData {
  const breakdown = computeIRSBreakdown(problems, targetTier);
  const score = computeIRSScore(breakdown);

  const { start: thisWeekStart, end: thisWeekEnd } = getCurrentWeekBounds();
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

  const thisWeekCount = problems.filter((p) =>
    isDateInRange(p.latest_date, thisWeekStart, thisWeekEnd),
  ).length;
  const lastWeekCount = problems.filter((p) =>
    isDateInRange(p.latest_date, lastWeekStart, lastWeekEnd),
  ).length;

  return {
    score,
    breakdown,
    lastComputed: new Date().toISOString(),
    trend: thisWeekCount - lastWeekCount,
  };
}

export function computeTopicMastery(problems: ProblemIndex[]): TopicMastery[] {
  return CORE_DSA_TOPICS.map((topic) => {
    const topicProblems = problems.filter((p) => p.topics.includes(topic));
    const totalSolved = topicProblems.length;
    const optimalCount = topicProblems.filter(
      (p) => p.latest_approach === "Optimal",
    ).length;

    const qualityComponent = (optimalCount / Math.max(totalSolved, 1)) * 60;
    const volumeComponent = Math.min(totalSolved / 10, 1) * 40;
    const masteryScore = Math.round(qualityComponent + volumeComponent);

    return {
      topic,
      totalSolved,
      optimalCount,
      masteryScore,
    };
  }).sort((a, b) => b.masteryScore - a.masteryScore);
}

function approachPenalty(approach: string | null): number {
  if (approach === "Brute Force") return 30;
  if (approach === "Optimized") return 15;
  return 0;
}

function buildRevisionReason(
  approach: string | null,
  days: number,
): string {
  if (approach === "Brute Force") {
    return `Brute Force — ${days} days ago`;
  }
  if (approach === "Optimized") {
    return "Optimized — needs revisit";
  }
  if (approach === "Optimal") {
    return `Optimal — ${days} days ago`;
  }
  return `${days} days ago`;
}

export function computeRevisionQueue(problems: ProblemIndex[]): RevisionItem[] {
  return problems
    .map((problem) => {
      const days = daysSince(problem.latest_date);
      const base = days * 0.5;
      const penalty = approachPenalty(problem.latest_approach);
      const attemptBonus = Math.max(0, problem.attempt_count - 1) * 5;
      const priorityScore = base + penalty + attemptBonus;

      return {
        problemNumber: Number.parseInt(problem.number, 10) || 0,
        title: problem.title,
        platform: problem.platform,
        difficulty: problem.difficulty,
        latestApproach: problem.latest_approach ?? "Unknown",
        lastSolvedDate: problem.latest_date,
        priorityScore,
        revisionReason: buildRevisionReason(problem.latest_approach, days),
        filePath: problem.file_path,
        days,
      };
    })
    .filter((item) => item.days >= 7)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 20)
    .map(({ days, ...item }) => {
      void days;
      return item;
    });
}

export function computeWeeklyDigest(
  problems: ProblemIndex[],
  previousIRS: number,
): WeeklyDigest {
  const { start: weekStart, end: weekEnd } = getCurrentWeekBounds();
  const problemsSolved = problems.filter((p) =>
    isDateInRange(p.latest_date, weekStart, weekEnd),
  ).length;

  const mastery = computeTopicMastery(problems);
  const strongTopics = mastery
    .filter((t) => t.masteryScore > 60)
    .slice(0, 3)
    .map((t) => t.topic);

  const neglectedTopics = CORE_DSA_TOPICS.filter((topic) => {
    const recent = problems.some(
      (p) =>
        p.topics.includes(topic) && daysSince(p.latest_date) <= 14,
    );
    return !recent;
  }).slice(0, 3);

  const currentIRS = computeIRS(problems).score;
  const irsChange = currentIRS - previousIRS;

  const targetWeekly = 7;
  const onTrack = problemsSolved >= Math.ceil((targetWeekly / 7) * 7);

  const messageParts: string[] = [];

  if (problemsSolved >= 7) {
    messageParts.push(`Strong week — ${problemsSolved} problems solved.`);
  } else if (problemsSolved > 0) {
    messageParts.push(`${problemsSolved} problem${problemsSolved === 1 ? "" : "s"} solved this week.`);
  } else {
    messageParts.push("No problems solved this week yet.");
  }

  if (strongTopics.length > 0) {
    messageParts.push(`${strongTopics.join(", ")} looking solid.`);
  }

  if (neglectedTopics.length > 0) {
    const firstNeglected = neglectedTopics[0];
    const daysUntouched = (() => {
      const topicProblems = problems.filter((p) =>
        p.topics.includes(firstNeglected),
      );
      if (topicProblems.length === 0) return null;
      const mostRecent = topicProblems.reduce((latest, p) =>
        new Date(p.latest_date) > new Date(latest.latest_date) ? p : latest,
      );
      return daysSince(mostRecent.latest_date);
    })();

    if (daysUntouched !== null) {
      messageParts.push(
        `${firstNeglected} hasn't been touched in ${daysUntouched} days.`,
      );
    } else {
      messageParts.push(`${firstNeglected} hasn't been started yet.`);
    }
  }

  messageParts.push(
    `IRS moved ${previousIRS} → ${currentIRS}.`,
  );

  return {
    weekStart: toDateKey(weekStart),
    weekEnd: toDateKey(weekEnd),
    problemsSolved,
    strongTopics,
    neglectedTopics,
    irsChange,
    onTrack,
    message: messageParts.join(" "),
  };
}

export function computeActivityMap(
  problems: ProblemIndex[],
): Record<string, number> {
  const end = normalizeDate(new Date());
  const start = normalizeDate(new Date(end));
  start.setDate(end.getDate() - 364);

  const counts = problems.reduce<Record<string, number>>((acc, problem) => {
    const key = toDateKey(problem.latest_date);
    const date = normalizeDate(new Date(key));
    if (date >= start && date <= end) {
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return acc;
  }, {});

  return counts;
}
