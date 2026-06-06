import { NextResponse } from "next/server";
import { CP_BOILERPLATE, LEETCODE_BOILERPLATE, MANUAL_PROBLEM_NOTICE, PREMIUM_PROBLEM_NOTICE } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { fetchCodeChefProblem } from "@/lib/codechef";
import { fetchCodeforcesProblem } from "@/lib/codeforces";
import { fetchLeetCodeProblem } from "@/lib/leetcode";
import { slugifyTitle } from "@/lib/markdown";
import type { FetchedProblem, Platform } from "@/types";

function manualFallback(platform: Platform, query: string, notice: string): FetchedProblem {
  return {
    number: query.trim(),
    title: query.trim(),
    slug: slugifyTitle(query),
    difficulty: "medium",
    topics: [],
    content: notice,
    boilerplate: platform === "leetcode" ? LEETCODE_BOILERPLATE : CP_BOILERPLATE,
  };
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform, query } = (await request.json()) as {
    platform: Platform;
    query: string;
  };

  if (!platform || !query?.trim()) {
    return NextResponse.json(
      { error: "Platform and query are required." },
      { status: 400 },
    );
  }

  try {
    if (platform === "leetcode") {
      const problem = await fetchLeetCodeProblem(query);
      return NextResponse.json({ problem });
    }

    if (platform === "codeforces") {
      const problem = await fetchCodeforcesProblem(query);
      return NextResponse.json({ problem });
    }

    const { problem, notice } = await fetchCodeChefProblem(query);
    return NextResponse.json({
      problem,
      notice,
      manualEntry: Boolean(notice),
    });
  } catch (error) {
    const notice =
      platform === "leetcode" ? PREMIUM_PROBLEM_NOTICE : MANUAL_PROBLEM_NOTICE;

    return NextResponse.json({
      problem: manualFallback(platform, query, notice),
      notice:
        error instanceof Error && error.message
          ? `${notice}`
          : notice,
      manualEntry: true,
    });
  }
}
