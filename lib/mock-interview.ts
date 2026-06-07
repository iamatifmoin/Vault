import { computeTopicMastery, CORE_DSA_TOPICS } from "@/lib/algorithms";
import { CP_BOILERPLATE, LEETCODE_BOILERPLATE } from "@/lib/constants";
import { slugifyTitle } from "@/lib/markdown";
import type {
  Difficulty,
  FetchedProblem,
  Language,
  Platform,
  ProblemIndex,
} from "@/types";

export const TIME_LIMIT_OPTIONS = [15, 20, 25, 30, 45, 60] as const;

export type MockDifficulty = "Easy" | "Medium" | "Hard";

const DIFFICULTY_MAP: Record<MockDifficulty, Difficulty> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

const EXPECTED_RANGES: Record<MockDifficulty, string> = {
  Easy: "5–10 min",
  Medium: "20–25 min",
  Hard: "35–45 min",
};

export function getExpectedTimeRange(difficulty: MockDifficulty): string {
  return EXPECTED_RANGES[difficulty];
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds} sec`;
  }

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainingSeconds} sec`;
}

export function getTimerColor(remainingSeconds: number): string {
  if (remainingSeconds <= 120) {
    return "text-red-500";
  }

  if (remainingSeconds <= 300) {
    return "text-yellow-400";
  }

  return "text-white";
}

export function buildPlatformProblemUrl(
  platform: Platform,
  number: string,
  title: string,
): string {
  const titleSlug = slugifyTitle(title);

  if (platform === "leetcode") {
    return `https://leetcode.com/problems/${titleSlug}/`;
  }

  if (platform === "codeforces") {
    const match = number.match(/^(\d+)([A-Za-z]\d*)$/);
    if (match) {
      return `https://codeforces.com/problemset/problem/${match[1]}/${match[2]}`;
    }
    return "https://codeforces.com/problemset";
  }

  return `https://www.codechef.com/problems/${number.toUpperCase()}`;
}

export function getBoilerplate(platform: Platform, language: Language): string {
  return platform === "leetcode"
    ? LEETCODE_BOILERPLATE[language]
    : CP_BOILERPLATE[language];
}

export function toFetchedProblem(
  problem: ProblemIndex,
  content = "",
): FetchedProblem {
  return {
    number: problem.number,
    title: problem.title,
    slug: slugifyTitle(problem.title),
    difficulty: problem.difficulty,
    topics: problem.topics.map((topic) => ({
      name: topic,
      slug: slugifyTitle(topic),
    })),
    content,
    boilerplate: {
      cpp: getBoilerplate(problem.platform, "cpp"),
      python: getBoilerplate(problem.platform, "python"),
      java: getBoilerplate(problem.platform, "java"),
    },
  };
}

function pickSurpriseTopic(problems: ProblemIndex[]): string {
  const mastery = computeTopicMastery(problems);
  const weakTopics = mastery
    .filter((item) => item.masteryScore < 60)
    .map((item) => item.topic);

  const pool = weakTopics.length > 0 ? weakTopics : [...CORE_DSA_TOPICS];
  return pool[Math.floor(Math.random() * pool.length)] ?? CORE_DSA_TOPICS[0];
}

export function pickMockProblem(
  problems: ProblemIndex[],
  difficulty: MockDifficulty,
  topic: string,
): ProblemIndex | null {
  const normalizedDifficulty = DIFFICULTY_MAP[difficulty];
  const selectedTopic =
    topic === "surprise-me" ? pickSurpriseTopic(problems) : topic;

  const candidates = problems.filter(
    (problem) =>
      problem.difficulty === normalizedDifficulty &&
      problem.latest_approach !== "Optimal" &&
      problem.topics.includes(selectedTopic),
  );

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

export function getNoMatchMessage(
  difficulty: MockDifficulty,
  topic: string,
): string {
  const topicLabel =
    topic === "surprise-me"
      ? ""
      : ` ${topic.toLowerCase()}`;

  return `No unsolved ${difficulty.toLowerCase()}${topicLabel} problems. Add more to your Vault first.`;
}
