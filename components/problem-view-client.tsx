"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AIPanel } from "@/components/ai-panel";
import { AttemptTimeline } from "@/components/attempt-timeline";
import { CodeSnippet } from "@/components/code-snippet";
import { HintLadder } from "@/components/hint-ladder";
import { ProblemMarkdown } from "@/components/problem-markdown";
import { Button } from "@/components/ui/button";
import type { AIAnalysis, Problem } from "@/types";

function slugifyTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProblemViewClient({
  initialProblem,
  problemStatement,
}: {
  initialProblem: Problem;
  problemStatement: string;
}) {
  const [problem, setProblem] = useState(initialProblem);
  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState(
    initialProblem.attempts.at(-1)?.number ?? 1,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const selectedAttempt =
    problem.attempts.find((attempt) => attempt.number === selectedAttemptNumber) ??
    problem.attempts[problem.attempts.length - 1];

  async function analyzeAttempt() {
    setIsAnalyzing(true);

    try {
      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: problem.platform,
          problem: {
            number: problem.number,
            title: problem.title,
            slug: slugifyTitle(problem.title),
            difficulty: problem.difficulty,
            topics: problem.topics.map((topic) => ({ name: topic, slug: topic })),
            content: problemStatement,
            boilerplate: {
              cpp: "",
              python: "",
              java: "",
            },
          },
          code: selectedAttempt.code,
          language: selectedAttempt.language,
        }),
      });
      const analyzePayload = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(analyzePayload.error);
      }

      const analysis = analyzePayload.analysis as AIAnalysis;
      const saveResponse = await fetch("/api/problems/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "update-analysis",
          id: problem.id,
          attemptNumber: selectedAttempt.number,
          analysis,
        }),
      });
      const savePayload = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(savePayload.error);
      }

      setProblem((current) => ({
        ...current,
        attempts: current.attempts.map((attempt) =>
          attempt.number === selectedAttempt.number
            ? {
                ...attempt,
                approach: analysis.classification,
                time_complexity: analysis.time_complexity,
                space_complexity: analysis.space_complexity,
                analysis,
              }
            : attempt,
        ),
      }));
      toast.success("Attached the AI analysis to this attempt.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to analyze this solution.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-container-padding py-8 md:flex-row">
      <section className="w-full md:w-[58%]">
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/library" className="hover:text-zinc-50">
            Library
          </Link>
          <span>›</span>
          <span className="text-zinc-100">{`${problem.number}. ${problem.title}`}</span>
        </nav>

        <div className="mt-4 flex items-center gap-4">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
            {problem.number}. {problem.title}
          </h1>
          <span className="rounded-sm border border-blue-500/40 px-2 py-1 font-mono text-[11px] uppercase text-blue-300">
            {problem.difficulty}
          </span>
        </div>

        <div className="mt-6">
          <AttemptTimeline
            attempts={problem.attempts}
            selectedAttempt={selectedAttemptNumber}
            onSelect={setSelectedAttemptNumber}
            addHref={`/add?platform=${problem.platform}&number=${problem.number}&attempt=true`}
          />
        </div>

        <div className="mt-8 rounded-md border border-vault-border bg-vault-surface p-6">
          <ProblemMarkdown content={problemStatement} />
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-vault-border bg-[#09090b]">
          <div className="flex items-center justify-between border-b border-vault-border bg-vault-surface px-4 py-2">
            <span className="font-mono text-[11px] uppercase text-zinc-500">
              Solution.{selectedAttempt.language}
            </span>
            <span className="font-mono text-[11px] uppercase text-zinc-500">
              Attempt {selectedAttempt.number}
            </span>
          </div>
          <div className="overflow-x-auto p-4 text-sm">
            <CodeSnippet code={selectedAttempt.code} language={selectedAttempt.language} />
          </div>
        </div>
      </section>

      <aside className="w-full md:w-[42%]">
        <div className="sticky top-24 space-y-6">
          {selectedAttempt.analysis ? (
            <>
              <AIPanel analysis={selectedAttempt.analysis} />
              <HintLadder analysis={selectedAttempt.analysis} />
            </>
          ) : (
            <div className="rounded-lg border border-vault-border bg-vault-surface p-6">
              <h2 className="text-2xl font-semibold text-zinc-50">AI Analysis</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                This attempt was saved without analysis. Run the coach now to attach
                hints, complexity feedback, and the likely pattern.
              </p>
              <Button
                type="button"
                className="mt-6 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => void analyzeAttempt()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Analyze this solution
              </Button>
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}
