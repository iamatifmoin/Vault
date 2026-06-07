import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import type { Difficulty } from "@/types";

interface TeachMessage {
  role: "user" | "assistant";
  content: string;
}

interface TeachRequestBody {
  problem: {
    title: string;
    difficulty: Difficulty;
    topics: string[];
  };
  messages: TeachMessage[];
}

function buildSystemPrompt(problem: TeachRequestBody["problem"]) {
  const difficulty = DIFFICULTY_LABELS[problem.difficulty];
  const topics = problem.topics.join(", ") || "general DSA";

  return `You are a patient DSA mentor using the Socratic method.
The student is working on: ${problem.title} (${difficulty}) — ${topics}.
You must NEVER give the full solution or pseudocode directly.
Instead, ask guiding questions that lead the student to discover the approach.
Start by asking about their current thinking.
Each response should end with a single guiding question.
If the student is clearly stuck after 3 exchanges, offer a small hint about the data structure or algorithm pattern to consider.
Keep responses under 150 words.`;
}

function toApiMessages(messages: TeachMessage[]): Anthropic.MessageParam[] {
  if (messages.length === 0) {
    return [{ role: "user", content: "I'm stuck and need help thinking through this problem." }];
  }

  const apiMessages: Anthropic.MessageParam[] = [];

  if (messages[0]?.role === "assistant") {
    apiMessages.push({
      role: "user",
      content: "I'm stuck and need help thinking through this problem.",
    });
  }

  for (const message of messages) {
    apiMessages.push({
      role: message.role,
      content: message.content,
    });
  }

  return apiMessages;
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

  const body = (await request.json()) as TeachRequestBody;

  if (!body.problem?.title || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Missing teach session input." }, { status: 400 });
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: buildSystemPrompt(body.problem),
    messages: toApiMessages(body.messages),
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
