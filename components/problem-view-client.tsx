"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AIPanel } from "@/components/ai-panel";
import { AttemptTimeline } from "@/components/attempt-timeline";
import { CodeSnippet } from "@/components/code-snippet";
import { HintLadder } from "@/components/hint-ladder";
import { PageHeader } from "@/components/page-header";
import { ProblemMarkdown } from "@/components/problem-markdown";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_BADGE_TONES } from "@/lib/constants";
import { cn } from "@/lib/utils";
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
  const [copied, setCopied] = useState(false);
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
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/library" className="transition-colors hover:text-foreground">
              Library
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-foreground">
              {`${problem.number}. ${problem.title}`}
            </span>
          </nav>
        }
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-container-padding py-8 md:flex-row">
      <section className="w-full md:w-[58%]">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-page-title">
            {problem.number}. {problem.title}
          </h1>
          <span
            className={cn(
              "rounded-full border px-2 py-1 font-mono text-[11px] uppercase",
              DIFFICULTY_BADGE_TONES[problem.difficulty],
            )}
          >
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

        <div className="surface-card mt-8 p-6">
          <ProblemMarkdown content={problemStatement} />
        </div>

        <div className="surface-card mt-8 overflow-hidden bg-vault-inset">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-vault-surface px-4 py-2">
            <span className="text-micro-label">
              Solution.{selectedAttempt.language}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-micro-label">
                Attempt {selectedAttempt.number}
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-vault-raised hover:text-foreground"
                onClick={() => {
                  void navigator.clipboard.writeText(selectedAttempt.code);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto p-4 text-sm">
            <CodeSnippet code={selectedAttempt.code} language={selectedAttempt.language} />
          </div>
        </div>
      </section>

      <aside className="w-full md:w-[42%]">
        <div className="sticky top-20 space-y-6 pb-24 md:pb-0">
          {selectedAttempt.analysis ? (
            <>
              <AIPanel analysis={selectedAttempt.analysis} />
              <HintLadder analysis={selectedAttempt.analysis} />
            </>
          ) : (
            <div className="surface-card p-6">
              <h2 className="text-section-title">AI Analysis</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                This attempt was saved without analysis. Run the coach now to attach
                hints, complexity feedback, and the likely pattern.
              </p>
              <Button
                type="button"
                className="mt-6"
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
    </div>
  );
}
