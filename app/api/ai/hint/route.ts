import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getHintLevel } from "@/lib/claude";
import type { AIAnalysis } from "@/types";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    analysis: AIAnalysis;
    level: 1 | 2 | 3 | 4 | 5;
  };

  if (!body.analysis || !body.level) {
    return NextResponse.json({ error: "Missing hint input." }, { status: 400 });
  }

  return NextResponse.json({
    hint: getHintLevel(body.analysis, body.level),
  });
}
