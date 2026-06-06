import { LEETCODE_BOILERPLATE } from "@/lib/constants";
import { htmlToMarkdown, slugifyTitle } from "@/lib/markdown";
import type { Difficulty, FetchedProblem, TopicTag } from "@/types";

interface LeetCodeListItem {
  stat: {
    frontend_question_id: number;
    question__title: string;
    question__title_slug: string;
  };
}

let leetCodeListPromise: Promise<LeetCodeListItem[]> | null = null;

async function getLeetCodeProblemList() {
  if (!leetCodeListPromise) {
    leetCodeListPromise = fetch("https://leetcode.com/api/problems/all/", {
      headers: {
        Referer: "https://leetcode.com",
      },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch the LeetCode problem list.");
        }

        return response.json();
      })
      .then((payload) => payload.stat_status_pairs as LeetCodeListItem[]);
  }

  return leetCodeListPromise;
}

async function resolveLeetCodeSlug(query: string) {
  const trimmed = query.trim();
  const urlMatch = trimmed.match(/leetcode\.com\/problems\/([^/]+)/i);

  if (urlMatch) {
    return urlMatch[1];
  }

  if (/^\d+$/.test(trimmed)) {
    const list = await getLeetCodeProblemList();
    const match = list.find(
      (item) => String(item.stat.frontend_question_id) === trimmed,
    );

    if (match) {
      return match.stat.question__title_slug;
    }
  }

  const normalizedSlug = slugifyTitle(trimmed);
  const list = await getLeetCodeProblemList();
  const match = list.find(
    (item) =>
      item.stat.question__title_slug === normalizedSlug ||
      slugifyTitle(item.stat.question__title) === normalizedSlug,
  );

  return match?.stat.question__title_slug ?? normalizedSlug;
}

function normalizeDifficulty(value: string): Difficulty {
  const normalized = value.trim().toLowerCase();
  if (normalized === "hard") {
    return "hard";
  }
  if (normalized === "medium") {
    return "medium";
  }
  return "easy";
}

function extractBoilerplate(
  codeSnippets: Array<{ langSlug: string; code: string }>,
): FetchedProblem["boilerplate"] {
  const boilerplate = { ...LEETCODE_BOILERPLATE };

  for (const snippet of codeSnippets) {
    if (snippet.langSlug === "cpp") {
      boilerplate.cpp = snippet.code;
    }
    if (snippet.langSlug === "python3") {
      boilerplate.python = snippet.code;
    }
    if (snippet.langSlug === "java") {
      boilerplate.java = snippet.code;
    }
  }

  return boilerplate;
}

const PROBLEM_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      content
      difficulty
      topicTags { name slug }
      codeSnippets { langSlug code }
    }
  }
`;

export async function fetchLeetCodeProblem(query: string): Promise<FetchedProblem> {
  const titleSlug = await resolveLeetCodeSlug(query);
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
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch the LeetCode problem.");
  }

  const payload = await response.json();
  const question = payload?.data?.question;

  if (!question?.content) {
    throw new Error("LeetCode problem content is unavailable.");
  }

  const topics = (question.topicTags ?? []).map(
    (tag: { name: string; slug: string }) =>
      ({
        name: tag.name,
        slug: tag.slug,
      }) satisfies TopicTag,
  );

  return {
    number: String(question.questionFrontendId),
    title: question.title,
    slug: question.titleSlug,
    difficulty: normalizeDifficulty(question.difficulty),
    topics,
    content: htmlToMarkdown(question.content),
    boilerplate: extractBoilerplate(question.codeSnippets ?? []),
  };
}
