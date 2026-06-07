import { NextResponse } from "next/server";
import { classifyApproach } from "@/lib/algorithms";
import { auth } from "@/lib/auth";
import { getFile, getIndex, getOrCreateRepo, getProblemFile, saveFile, saveIndex } from "@/lib/github";
import {
  buildProblemFilePath,
  buildProblemId,
  generateProblemMarkdown,
  normalizeCode,
  toProblemIndex,
} from "@/lib/markdown";
import type {
  Attempt,
  Problem,
  SaveProblemPayload,
  UpdateAnalysisPayload,
} from "@/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultAttempt(payload: SaveProblemPayload, attemptNumber: number): Attempt {
  const code = normalizeCode(payload.code);
  return {
    number: attemptNumber,
    date: today(),
    language: payload.language,
    code,
    approach:
      payload.analysis?.classification ??
      classifyApproach(code, payload.language),
    time_complexity: payload.analysis?.time_complexity ?? "Not analyzed",
    space_complexity: payload.analysis?.space_complexity ?? "Not analyzed",
    analysis: payload.analysis,
  };
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SaveProblemPayload | UpdateAnalysisPayload;

  try {
    const repo = await getOrCreateRepo(session.accessToken);
    const index = await getIndex(session.accessToken);

    if (body.mode === "update-analysis") {
      const entry = index.find((item) => item.id === body.id);

      if (!entry) {
        return NextResponse.json({ error: "Problem not found." }, { status: 404 });
      }

      const existing = await getProblemFile(session.accessToken, entry.file_path);

      if (!existing) {
        return NextResponse.json({ error: "Problem file not found." }, { status: 404 });
      }

      const updatedAttempts = existing.problem.attempts.map((attempt) =>
        attempt.number === body.attemptNumber
          ? {
              ...attempt,
              approach: body.analysis.classification,
              time_complexity: body.analysis.time_complexity,
              space_complexity: body.analysis.space_complexity,
              analysis: body.analysis,
            }
          : attempt,
      );

      const updatedProblem: Problem = {
        ...existing.problem,
        attempts: updatedAttempts,
      };

      const markdown = generateProblemMarkdown(
        updatedProblem,
        existing.problemStatement,
      );
      const existingFile = await getFile(session.accessToken, entry.file_path);

      await saveFile(
        session.accessToken,
        entry.file_path,
        markdown,
        existingFile?.sha,
      );

      const nextIndex = index.map((item) =>
        item.id === body.id ? toProblemIndex(updatedProblem) : item,
      );
      await saveIndex(session.accessToken, nextIndex);

      return NextResponse.json({ id: body.id, updated: true });
    }

    const filePath = buildProblemFilePath({
      platform: body.platform,
      number: body.problem.number,
      title: body.problem.title,
      primaryTopic: body.problem.topics[0]?.name,
    });
    const id = buildProblemId(body.platform, body.problem.number);
    const existingEntry = index.find((item) => item.id === id);
    const existingFile = await (existingEntry
      ? getProblemFile(session.accessToken, existingEntry.file_path)
      : Promise.resolve(null));
    const finalFilePath = existingEntry?.file_path ?? filePath;
    const attempt = defaultAttempt(body, existingFile ? existingFile.problem.attempts.length + 1 : 1);

    const problem: Problem = existingFile
      ? {
          ...existingFile.problem,
          sheets: Array.from(
            new Set([...existingFile.problem.sheets, ...body.sheets]),
          ) as Problem["sheets"],
          attempts: [...existingFile.problem.attempts, attempt],
          file_path: finalFilePath,
        }
      : {
          id,
          number: body.problem.number,
          title: body.problem.title,
          platform: body.platform,
          difficulty: body.problem.difficulty,
          topics: body.problem.topics.map((topic) => topic.slug || topic.name.toLowerCase()),
          sheets: body.sheets,
          attempts: [attempt],
          file_path: finalFilePath,
          date_created: today(),
        };

    const markdown = generateProblemMarkdown(
      problem,
      existingFile?.problemStatement ?? body.problem.content,
    );
    const existingGitFile = await getFile(
      session.accessToken,
      finalFilePath,
    );

    await saveFile(
      session.accessToken,
      finalFilePath,
      markdown,
      existingGitFile?.sha,
    );

    const nextIndex = existingEntry
      ? index.map((item) => (item.id === id ? toProblemIndex(problem) : item))
      : [...index, toProblemIndex(problem)];

    await saveIndex(session.accessToken, nextIndex);

    return NextResponse.json({
      id,
      filePath: finalFilePath,
      attemptNumber: attempt.number,
      repoCreated: repo.created,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save the problem to GitHub.",
      },
      { status: 500 },
    );
  }
}
