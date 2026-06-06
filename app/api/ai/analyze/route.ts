import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeSolution } from "@/lib/claude";
import type { FetchedProblem, Language, Platform } from "@/types";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    platform: Platform;
    problem: FetchedProblem;
    code: string;
    language: Language;
  };

  if (!body.platform || !body.problem || !body.code || !body.language) {
    return NextResponse.json(
      { error: "Missing analysis input." },
      { status: 400 },
    );
  }

  try {
    const analysis = await analyzeSolution(body);
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI analysis unavailable. You can save without analysis.",
      },
      { status: 500 },
    );
  }
}
