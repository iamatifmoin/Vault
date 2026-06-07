import type { CapturedProblem } from "./types";

const PROBLEM_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      difficulty
      topicTags { name }
    }
  }
`;

function normalizeDifficulty(value: string): CapturedProblem["difficulty"] {
  if (value === "Medium" || value === "Hard") return value;
  return "Easy";
}

export function getTitleSlugFromUrl(): string | null {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match?.[1] ?? null;
}

export async function fetchProblemBySlug(
  titleSlug: string,
): Promise<Partial<CapturedProblem> | null> {
  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query: PROBLEM_QUERY,
        variables: { titleSlug },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: {
        question?: {
          questionFrontendId?: string;
          title?: string;
          titleSlug?: string;
          difficulty?: string;
          topicTags?: Array<{ name: string }>;
        };
      };
    };

    const question = payload.data?.question;
    if (!question?.questionFrontendId || !question.title || !question.titleSlug) {
      return null;
    }

    const number = Number.parseInt(question.questionFrontendId, 10);
    if (Number.isNaN(number)) {
      return null;
    }

    return {
      platform: "leetcode",
      number,
      title: question.title,
      titleSlug: question.titleSlug,
      difficulty: normalizeDifficulty(question.difficulty ?? "Easy"),
      topics: question.topicTags?.map((tag) => tag.name) ?? [],
    };
  } catch {
    return null;
  }
}
