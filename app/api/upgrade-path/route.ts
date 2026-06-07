import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Language } from "@/types";

interface UpgradePathRequest {
  problemTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  currentCode: string;
  currentApproach: "Brute Force" | "Optimized" | "Optimal";
  language: Language;
}

interface UpgradePathResponse {
  currentComplexity: string;
  optimalComplexity: string;
  keyInsight: string;
  whatToChange: string;
  patternName: string;
  codeDiff: {
    before: string;
    after: string;
  };
}

function buildUpgradePathPrompt(input: UpgradePathRequest) {
  const { problemTitle, difficulty, topics, currentCode, currentApproach, language } =
    input;

  return `You are a DSA mentor helping a student optimize their solution.
Problem: ${problemTitle} (${difficulty}) — Topics: ${topics.join(", ")}
Current approach: ${currentApproach}
Language: ${language}
Student's current solution:
\`\`\`${language}
${currentCode}
\`\`\`
Provide an upgrade path in this EXACT JSON format (no markdown, no explanation):
{
"currentComplexity": "O(n²) — nested loop scan",
"optimalComplexity": "O(n) — hash map lookup",
"keyInsight": "One sentence explaining the core optimization idea",
"whatToChange": "2-3 specific changes to make (concise, no full solution)",
"patternName": "The algorithmic pattern (e.g. 'Two Pointers', 'Hash Map')",
"codeDiff": {
"before": "The key lines that are inefficient (3-5 lines max)",
"after": "The optimized equivalent (3-5 lines max, in ${language})"
}
}
IMPORTANT:
- Do NOT reveal the complete solution
- The "after" codeDiff should show the PATTERN, not the complete answer
- Keep all values under 120 characters`;
}

function parseUpgradePathResponse(raw: string): UpgradePathResponse {
  try {
    return JSON.parse(raw) as UpgradePathResponse;
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as UpgradePathResponse;
    }

    throw new Error("Claude did not return valid JSON.");
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as UpgradePathRequest;

  if (
    !body.problemTitle ||
    !body.difficulty ||
    !body.currentCode ||
    !body.currentApproach ||
    !body.language
  ) {
    return NextResponse.json({ error: "Missing upgrade path input." }, { status: 400 });
  }

  if (body.currentApproach === "Optimal") {
    return NextResponse.json(
      { error: "Already optimal — no upgrade path needed." },
      { status: 400 },
    );
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: buildUpgradePathPrompt(body),
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    const data = parseUpgradePathResponse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate upgrade path. Try again later." },
      { status: 500 },
    );
  }
}
