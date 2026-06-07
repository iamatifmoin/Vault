import { computeIRS, computeTopicMastery } from "@/lib/algorithms";
import { computeBestStreak } from "@/lib/stats";
import type {
  CompanyTierTarget,
  ProblemIndex,
  ShareableCardData,
  TopicMastery,
} from "@/types";

export const MILESTONE_THRESHOLDS = [50, 100, 150, 200] as const;
export const MILESTONES_SEEN_KEY = "vault_milestones_seen";
export const SHARE_BASE_URL = "vaultbyatif.vercel.app";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function getProfileShareUrl(username: string) {
  return `https://${SHARE_BASE_URL}/u/${username}`;
}

export function computeMonthlyCounts(
  problems: ProblemIndex[],
  year = new Date().getFullYear(),
) {
  const counts = Array.from({ length: 12 }, () => 0);

  for (const problem of problems) {
    const date = new Date(problem.latest_date);
    if (date.getFullYear() === year) {
      counts[date.getMonth()] += 1;
    }
  }

  return counts.map((count, index) => ({
    month: MONTH_LABELS[index],
    count,
  }));
}

export function getStrongestTopic(problems: ProblemIndex[]): string {
  const mastery = computeTopicMastery(problems);
  const strongest = mastery.reduce<TopicMastery | null>((best, entry) => {
    if (!best || entry.totalSolved > best.totalSolved) {
      return entry;
    }
    return best;
  }, null);

  return strongest && strongest.totalSolved > 0 ? strongest.topic : "Getting Started";
}

export function buildShareableCardData(
  problems: ProblemIndex[],
  user: { username: string; avatarUrl: string },
  targetTier: CompanyTierTarget = "FAANG",
): ShareableCardData {
  const irs = computeIRS(problems, targetTier);
  const year = new Date().getFullYear();

  return {
    type: "year-review",
    username: user.username,
    avatarUrl: user.avatarUrl,
    totalSolved: problems.length,
    strongestTopic: getStrongestTopic(problems),
    streak: computeBestStreak(problems),
    irsScore: irs.score,
    milestoneCount: problems.length,
    radarSnapshot: computeTopicMastery(problems),
    generatedAt: new Date().toISOString(),
  };
}

export function getMilestonesSeen(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(MILESTONES_SEEN_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is number => typeof value === "number")
      : [];
  } catch {
    return [];
  }
}

export function markMilestoneSeen(count: number) {
  const seen = getMilestonesSeen();
  if (seen.includes(count)) {
    return;
  }

  localStorage.setItem(
    MILESTONES_SEEN_KEY,
    JSON.stringify([...seen, count]),
  );
}

export function getUnseenMilestone(totalSolved: number): number | null {
  if (!MILESTONE_THRESHOLDS.includes(totalSolved as (typeof MILESTONE_THRESHOLDS)[number])) {
    return null;
  }

  const seen = getMilestonesSeen();
  return seen.includes(totalSolved) ? null : totalSolved;
}

export function toOrdinal(count: number) {
  const remainder = count % 100;
  if (remainder >= 11 && remainder <= 13) {
    return `${count}th`;
  }

  switch (count % 10) {
    case 1:
      return `${count}st`;
    case 2:
      return `${count}nd`;
    case 3:
      return `${count}rd`;
    default:
      return `${count}th`;
  }
}

export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string,
) {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    background: "#09090b",
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function getTargetTierLabel(tier: CompanyTierTarget) {
  switch (tier) {
    case "FAANG":
      return "Targeting FAANG";
    case "Indian Unicorn":
      return "Targeting Indian Unicorn";
    case "Service":
      return "Targeting Service";
  }
}
