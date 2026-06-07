import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateStudyPlan } from "@/lib/claude";
import type { CompanyTierTarget } from "@/types";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    targetTier?: CompanyTierTarget;
    targetCompanies?: string[];
    dailyHours?: number;
    placementDate?: string;
    sheetFollowed?: string;
    weakTopics?: string[];
    problemsSolvedCount?: number;
  };

  if (
    !body.targetTier ||
    !body.placementDate ||
    body.dailyHours == null ||
    !body.sheetFollowed
  ) {
    return NextResponse.json(
      { error: "Missing required plan generation input." },
      { status: 400 },
    );
  }

  try {
    const plan = await generateStudyPlan({
      targetTier: body.targetTier,
      targetCompanies: body.targetCompanies ?? [],
      dailyHours: body.dailyHours,
      placementDate: body.placementDate,
      sheetFollowed: body.sheetFollowed,
      weakTopics: body.weakTopics ?? [],
      problemsSolvedCount: body.problemsSolvedCount ?? 0,
    });

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate study plan.",
      },
      { status: 500 },
    );
  }
}
