import { load } from "cheerio";
import { CP_BOILERPLATE, MANUAL_PROBLEM_NOTICE } from "@/lib/constants";
import { htmlToMarkdown, slugifyTitle } from "@/lib/markdown";
import type { FetchedProblem } from "@/types";

function extractCode(query: string) {
  const trimmed = query.trim().toUpperCase();
  const urlMatch = trimmed.match(/CODECHEF\.COM\/PROBLEMS\/([A-Z0-9_]+)/i);
  return urlMatch ? urlMatch[1].toUpperCase() : trimmed;
}

export async function fetchCodeChefProblem(query: string): Promise<{
  problem: FetchedProblem;
  notice?: string;
}> {
  const code = extractCode(query);

  try {
    const response = await fetch(`https://www.codechef.com/problems/${code}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to fetch the CodeChef page.");
    }

    const html = await response.text();
    const $ = load(html);
    const title =
      $("h1").first().text().trim() ||
      $("title").text().replace(/\s*\|\s*CodeChef/i, "").trim() ||
      code;

    const statement = $(
      ".problem-statement, #problem-statement, [class*='problem-statement']",
    )
      .first()
      .clone();

    statement.find("script, style").remove();

    if (!statement.length) {
      return {
        problem: {
          number: code,
          title,
          slug: slugifyTitle(title),
          difficulty: "medium",
          topics: [],
          content: MANUAL_PROBLEM_NOTICE,
          boilerplate: CP_BOILERPLATE,
        },
        notice: MANUAL_PROBLEM_NOTICE,
      };
    }

    return {
      problem: {
        number: code,
        title,
        slug: slugifyTitle(title),
        difficulty: "medium",
        topics: [],
        content: htmlToMarkdown(statement.html() ?? ""),
        boilerplate: CP_BOILERPLATE,
      },
    };
  } catch {
    return {
      problem: {
        number: code,
        title: code,
        slug: code.toLowerCase(),
        difficulty: "medium",
        topics: [],
        content: MANUAL_PROBLEM_NOTICE,
        boilerplate: CP_BOILERPLATE,
      },
      notice: MANUAL_PROBLEM_NOTICE,
    };
  }
}
