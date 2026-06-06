import { load } from "cheerio";
import { CP_BOILERPLATE } from "@/lib/constants";
import { htmlToMarkdown, slugifyTitle } from "@/lib/markdown";
import type { Difficulty, FetchedProblem, TopicTag } from "@/types";

interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

let problemsetPromise: Promise<CodeforcesProblem[]> | null = null;

function parseCodeforcesQuery(query: string) {
  const match = query.trim().match(/(\d+)\s*\/?\s*([A-Za-z]\d?)/);

  if (!match) {
    throw new Error("Enter a Codeforces problem like 1234A or 1234/A.");
  }

  return {
    contestId: Number(match[1]),
    index: match[2].toUpperCase(),
  };
}

function mapDifficulty(rating?: number): Difficulty {
  if (!rating || rating <= 1200) {
    return "easy";
  }
  if (rating <= 1800) {
    return "medium";
  }
  return "hard";
}

async function getProblemset() {
  if (!problemsetPromise) {
    problemsetPromise = fetch("https://codeforces.com/api/problemset.problems", {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch the Codeforces problemset.");
        }

        return response.json();
      })
      .then((payload) => payload.result.problems as CodeforcesProblem[]);
  }

  return problemsetPromise;
}

async function fetchStatement(contestId: number, index: string) {
  const response = await fetch(
    `https://codeforces.com/problemset/problem/${contestId}/${index}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to fetch the Codeforces statement page.");
  }

  const html = await response.text();
  const $ = load(html);
  const statement = $(".problem-statement").first().clone();

  statement.find("script, style").remove();

  if (!statement.length) {
    throw new Error("Unable to parse the Codeforces problem statement.");
  }

  return htmlToMarkdown(statement.html() ?? "");
}

export async function fetchCodeforcesProblem(query: string): Promise<FetchedProblem> {
  const { contestId, index } = parseCodeforcesQuery(query);
  const problems = await getProblemset();
  const problem = problems.find(
    (item) => item.contestId === contestId && item.index === index,
  );

  if (!problem) {
    throw new Error("That Codeforces problem could not be found.");
  }

  const topics = problem.tags.map(
    (tag) =>
      ({
        name: tag,
        slug: slugifyTitle(tag),
      }) satisfies TopicTag,
  );

  return {
    number: `${contestId}${index}`,
    title: problem.name,
    slug: slugifyTitle(problem.name),
    difficulty: mapDifficulty(problem.rating),
    topics,
    content: await fetchStatement(contestId, index),
    boilerplate: CP_BOILERPLATE,
  };
}
