"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIPanel } from "@/components/ai-panel";
import { CodeEditor } from "@/components/code-editor";
import { ProblemMarkdown } from "@/components/problem-markdown";
import { StreakBadge } from "@/components/streak-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultSelect } from "@/components/vault-select";
import { SHEETS } from "@/lib/sheets";
import type { AIAnalysis, FetchedProblem, Language, Platform, ProblemIndex, Sheet } from "@/types";

const platforms: Platform[] = ["leetcode", "codeforces", "codechef"];
const languages: Language[] = ["cpp", "python", "java"];

export function AddProblemPage({ streak }: { streak: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<Platform>(
    (searchParams.get("platform") as Platform) || "leetcode",
  );
  const [query, setQuery] = useState(searchParams.get("number") || "");
  const [sheet, setSheet] = useState<Sheet | "">("neetcode-150");
  const [problem, setProblem] = useState<FetchedProblem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [existingProblem, setExistingProblem] = useState<ProblemIndex | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const nextPlatform = searchParams.get("platform") as Platform | null;
    const nextNumber = searchParams.get("number");

    if (nextPlatform) {
      setPlatform(nextPlatform);
    }
    if (nextNumber) {
      setQuery(nextNumber);
    }
  }, [searchParams]);

  async function loadExistingProblem(nextProblem: FetchedProblem, nextPlatform: Platform) {
    const response = await fetch("/api/problems/list");
    const payload = (await response.json()) as { index: ProblemIndex[] };
    const match = payload.index.find(
      (item) => item.platform === nextPlatform && item.number === nextProblem.number,
    );
    setExistingProblem(match ?? null);
  }

  async function handleFetch() {
    setIsFetching(true);
    setAnalysis(null);
    setAnalysisError(null);
    setExistingProblem(null);

    try {
      const response = await fetch("/api/problems/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, query }),
      });
      const payload = (await response.json()) as {
        problem: FetchedProblem;
        notice?: string;
        manualEntry?: boolean;
      };

      setProblem(payload.problem);
      setNotice(payload.notice ?? null);
      setManualEntry(Boolean(payload.manualEntry));
      setCode(payload.problem.boilerplate[language]);
      await loadExistingProblem(payload.problem, platform);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to fetch the problem.",
      );
    } finally {
      setIsFetching(false);
    }
  }

  async function handleAnalyze() {
    if (!problem || !code.trim()) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, problem, code, language }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error);
      }

      setAnalysis(payload.analysis);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "AI analysis unavailable. You can save without analysis.";
      setAnalysisError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSave(nextAnalysis: AIAnalysis | null) {
    if (!problem) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/problems/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          problem,
          sheets: sheet ? [sheet] : [],
          language,
          code,
          analysis: nextAnalysis,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error);
      }

      if (payload.repoCreated) {
        toast.success("Created your 'Data Structures & Algorithms' repo on GitHub.");
      }

      router.push(`/library/${payload.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save the problem to GitHub.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-vault-border bg-background/90 px-container-padding backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
          Add Problem
        </h1>
        <StreakBadge streak={streak} />
      </header>

      <main className="p-container-padding">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-gutter lg:col-span-5">
            <div className="rounded-md border border-vault-border bg-vault-surface p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase text-zinc-500">
                    Platform
                  </label>
                  <div className="mt-2 flex rounded-sm border border-vault-border bg-background p-1">
                    {platforms.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          item === platform
                            ? "flex-1 rounded-sm border border-vault-border bg-vault-raised px-3 py-1.5 text-sm text-zinc-50"
                            : "flex-1 rounded-sm px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-50"
                        }
                        onClick={() => setPlatform(item)}
                      >
                        {item === "leetcode"
                          ? "LeetCode"
                          : item === "codeforces"
                            ? "Codeforces"
                            : "CodeChef"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="font-mono text-[11px] uppercase text-zinc-500">
                      Target Sheet
                    </label>
                    <VaultSelect
                      value={sheet || "unassigned"}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSheet(value === "unassigned" ? "" : (value as Sheet));
                      }}
                      className="mt-2"
                    >
                      <option value="unassigned">Unassigned</option>
                      {Object.entries(SHEETS).map(([value, meta]) => (
                        <option key={value} value={value}>
                          {meta.label}
                        </option>
                      ))}
                    </VaultSelect>
                  </div>

                  <div className="min-w-0">
                    <label className="font-mono text-[11px] uppercase text-zinc-500">
                      Problem URL / ID
                    </label>
                    <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row">
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="h-10 min-w-0 flex-1 rounded-sm border border-vault-border bg-background px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-50"
                        placeholder="e.g. 1 or 1234A"
                      />
                      <Button
                        type="button"
                        className="h-10 shrink-0 rounded-sm bg-primary px-4 text-primary-foreground hover:bg-primary/90 sm:w-auto"
                        onClick={() => void handleFetch()}
                        disabled={isFetching}
                      >
                        {isFetching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Fetch"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-md border border-vault-border bg-vault-surface">
              <div className="border-b border-vault-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-50">
                      {problem ? `${problem.number}. ${problem.title}` : "Problem Preview"}
                    </h2>
                    {existingProblem ? (
                      <p className="mt-2 rounded-sm bg-zinc-800 px-3 py-2 text-sm text-zinc-400">
                        You&apos;ve already solved this problem ({existingProblem.attempt_count} attempts). You&apos;re adding Attempt {existingProblem.attempt_count + 1}.
                      </p>
                    ) : null}
                  </div>
                  {problem ? (
                    <span className="rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-mono text-[11px] uppercase text-emerald-300">
                      {problem.difficulty}
                    </span>
                  ) : null}
                </div>
                {problem?.topics.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {problem.topics.map((topic) => (
                      <span
                        key={topic.slug}
                        className="rounded-sm border border-vault-border bg-vault-raised px-2 py-1 font-mono text-[11px] text-zinc-400"
                      >
                        {topic.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex-1 overflow-auto p-4 scrollbar-thin">
                {notice ? (
                  <div className="mb-4 rounded-sm border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
                    {notice}
                  </div>
                ) : null}

                {manualEntry ? (
                  <textarea
                    value={problem?.content ?? ""}
                    onChange={(event) =>
                      setProblem((current) =>
                        current
                          ? {
                              ...current,
                              content: event.target.value,
                            }
                          : current,
                      )
                    }
                    className="min-h-[320px] w-full rounded-md border border-vault-border bg-vault-bg p-4 font-mono text-sm leading-6 text-zinc-100 outline-none focus:border-zinc-50"
                    placeholder="Paste the problem statement here..."
                  />
                ) : problem ? (
                  <ProblemMarkdown content={problem.content} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    Fetch a problem to populate this panel.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-gutter lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              {languages.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    item === language
                      ? "rounded-sm border border-vault-border bg-vault-raised px-3 py-1 font-mono text-[11px] uppercase text-zinc-50"
                      : "rounded-sm border border-transparent px-3 py-1 font-mono text-[11px] uppercase text-zinc-400 hover:border-vault-border hover:bg-vault-raised hover:text-zinc-50"
                  }
                  onClick={() => {
                    setLanguage(item);
                    if (problem) {
                      setCode(problem.boilerplate[item]);
                    }
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="min-h-[520px]">
              <CodeEditor value={code} onChange={setCode} language={language} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void handleAnalyze()}
                disabled={!problem || isAnalyzing || !code.trim()}
                className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze with AI
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSave(null)}
                disabled={!problem || isSaving || isAnalyzing}
                className="rounded-sm border-vault-border bg-transparent text-zinc-300 hover:bg-vault-raised hover:text-zinc-50"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save without Analysis
              </Button>
              {analysis ? (
                <Button
                  type="button"
                  onClick={() => void handleSave(analysis)}
                  disabled={isSaving}
                  className="rounded-sm bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save to Vault
                </Button>
              ) : null}
            </div>

            {analysisError ? (
              <p className="text-sm text-zinc-400">{analysisError}</p>
            ) : null}

            {isAnalyzing ? (
              <div className="rounded-lg border border-vault-border bg-vault-surface p-6">
                <Skeleton className="h-8 w-40 bg-zinc-800" />
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-16 w-full bg-zinc-800" />
                  <Skeleton className="h-16 w-full bg-zinc-800" />
                  <Skeleton className="h-16 w-full bg-zinc-800" />
                </div>
              </div>
            ) : analysis ? (
              <AIPanel analysis={analysis} />
            ) : (
              <div className="rounded-lg border border-vault-border bg-vault-surface p-6 text-sm text-zinc-500">
                Run analysis to populate the coaching panel, or save the attempt directly to GitHub.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
