import Anthropic from "@anthropic-ai/sdk";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/constants";
import type { AIAnalysis, FetchedProblem, Language, Platform } from "@/types";

function numberCodeLines(code: string) {
  return code
    .split("\n")
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");
}

export function buildAnalysisPrompt(
  platform: Platform,
  problem: FetchedProblem,
  code: string,
  language: Language,
) {
  return `
Problem: ${problem.number}. ${problem.title} (${problem.difficulty})
Platform: ${platform}
Topics: ${problem.topics.map((topic) => topic.name).join(", ")}

Problem Statement:
${problem.content}

Student's Solution (${language}):
${numberCodeLines(code)}

Return a JSON object with exactly this structure:
{
  "classification": "Brute Force" | "Optimized" | "Optimal",
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "what_you_did_well": ["specific observation about their code", ...],
  "bottlenecks": ["specific bottleneck with line reference", ...],
  "bugs": ["bug description with line reference if applicable", ...],
  "hints": {
    "level_1": "A subtle observation about the problem constraints - no approach mentioned",
    "level_2": "Point to the specific bottleneck in their code without naming the fix",
    "level_3": "Name the pattern/data structure category without full explanation",
    "level_4": "Describe the thinking direction concretely - still no code",
    "level_5": "Full approach explanation without writing the code"
  },
  "pattern": {
    "name": "Pattern name (e.g. Sliding Window, Two Pointers)",
    "when_to_use": "One sentence on when to recognize this pattern",
    "related_problems": ["Problem name (#number)", ...]
  }
}`;
}

function parseAnalysisResponse(raw: string) {
  try {
    return JSON.parse(raw) as AIAnalysis;
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as AIAnalysis;
    }

    throw new Error("Claude did not return valid JSON.");
  }
}

function normalizeAnalysis(analysis: AIAnalysis): AIAnalysis {
  return {
    classification: analysis.classification,
    time_complexity: analysis.time_complexity || "O(?)",
    space_complexity: analysis.space_complexity || "O(?)",
    what_you_did_well: analysis.what_you_did_well ?? [],
    bottlenecks: analysis.bottlenecks ?? [],
    bugs: analysis.bugs ?? [],
    hints: {
      level_1: analysis.hints?.level_1 ?? "",
      level_2: analysis.hints?.level_2 ?? "",
      level_3: analysis.hints?.level_3 ?? "",
      level_4: analysis.hints?.level_4 ?? "",
      level_5: analysis.hints?.level_5 ?? "",
    },
    pattern: {
      name: analysis.pattern?.name ?? "Unknown",
      when_to_use: analysis.pattern?.when_to_use ?? "",
      related_problems: analysis.pattern?.related_problems ?? [],
    },
  };
}

export async function analyzeSolution(input: {
  platform: Platform;
  problem: FetchedProblem;
  code: string;
  language: Language;
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildAnalysisPrompt(
          input.platform,
          input.problem,
          input.code,
          input.language,
        ),
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return normalizeAnalysis(parseAnalysisResponse(text));
}

export function getHintLevel(analysis: AIAnalysis, level: 1 | 2 | 3 | 4 | 5) {
  return analysis.hints[`level_${level}` as keyof AIAnalysis["hints"]];
}
