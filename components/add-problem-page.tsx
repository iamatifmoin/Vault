"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AnimatedMain } from "@/components/animated-main";
import { AIPanel } from "@/components/ai-panel";
import { AppLogo } from "@/components/app-logo";
import { CodeEditor } from "@/components/code-editor";
import { PageHeader } from "@/components/page-header";
import { PlatformIcon } from "@/components/platform-icon";
import { ProblemMarkdown } from "@/components/problem-markdown";
import { WindowChrome } from "@/components/window-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultSelect } from "@/components/vault-select";
import { cn } from "@/lib/utils";
import { SHEETS } from "@/lib/sheets";
import type { AIAnalysis, FetchedProblem, Language, Platform, ProblemIndex, Sheet } from "@/types";

const platforms: Platform[] = ["leetcode", "codeforces", "codechef"];
const languages: Language[] = ["cpp", "python", "java"];

const platformLabels: Record<Platform, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
};

type Section = "problem" | "code" | "analysis";

const sectionTabs: Array<{ id: Section; label: string }> = [
  { id: "problem", label: "Problem" },
  { id: "code", label: "Code" },
  { id: "analysis", label: "Analysis" },
];

export function AddProblemPage({ streak }: { streak: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<Section>("problem");
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

  function scrollToSection(section: Section) {
    setActiveSection(section);
    const target =
      section === "problem"
        ? problemRef.current
        : section === "code"
          ? codeRef.current
          : analysisRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
      scrollToSection("analysis");
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
      <PageHeader title="Add Problem" streak={streak} />

      <nav className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="flex">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className={cn(
                "flex-1 border-b-2 py-3 text-sm font-medium transition-colors",
                activeSection === tab.id
                  ? "border-vault-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <AnimatedMain className="p-container-padding">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-gutter lg:grid-cols-12">
          <div ref={problemRef} className="flex scroll-mt-28 flex-col gap-gutter lg:col-span-5 lg:scroll-mt-20">
            <div className="surface-card p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-micro-label">Platform</label>
                  <div className="mt-2 flex rounded-md border border-border bg-background p-1">
                    {platforms.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                          item === platform
                            ? "border border-border bg-vault-raised text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setPlatform(item)}
                      >
                        <PlatformIcon
                          platform={item}
                          className={item === platform ? "text-foreground" : undefined}
                        />
                        <span className="hidden sm:inline">{platformLabels[item]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="text-micro-label">Target Sheet</label>
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
                    <label className="text-micro-label">Problem URL / ID</label>
                    <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row">
                      <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="min-w-0 flex-1"
                        placeholder="e.g. 1 or 1234A"
                      />
                      <Button
                        type="button"
                        className="h-10 shrink-0 px-4 sm:w-auto"
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

            <WindowChrome
              title={problem ? `${problem.number}. ${problem.title}` : "Problem Preview"}
              className="flex min-h-[420px] flex-1 flex-col"
            >
              <div className="border-b border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-section-title">
                      {problem ? `${problem.number}. ${problem.title}` : "Problem Preview"}
                    </h2>
                    {existingProblem ? (
                      <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                        You&apos;ve already solved this problem ({existingProblem.attempt_count} attempts). You&apos;re adding Attempt {existingProblem.attempt_count + 1}.
                      </p>
                    ) : null}
                  </div>
                  {problem ? (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-mono text-[11px] uppercase text-emerald-300">
                      {problem.difficulty}
                    </span>
                  ) : null}
                </div>
                {problem?.topics.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {problem.topics.map((topic) => (
                      <span
                        key={topic.slug}
                        className="rounded-full border border-border bg-vault-raised px-2 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {topic.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex-1 overflow-auto p-4 scrollbar-thin">
                {notice ? (
                  <div className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
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
                    className="min-h-[320px] w-full rounded-md border border-border bg-vault-bg p-4 font-mono text-sm leading-6 text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Paste the problem statement here..."
                  />
                ) : problem ? (
                  <ProblemMarkdown content={problem.content} />
                ) : (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-6 text-center">
                    <AppLogo size="lg" showWordmark={false} className="opacity-40" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Fetch a problem to populate this panel.
                    </p>
                  </div>
                )}
              </div>
            </WindowChrome>
          </div>

          <div className="flex flex-col gap-gutter lg:col-span-7">
            <div ref={codeRef} className="scroll-mt-28 space-y-gutter lg:scroll-mt-20">
              <div className="flex gap-0 border-b border-border">
                {languages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      "border-b-2 px-4 py-2 font-mono text-[11px] uppercase transition-colors",
                      item === language
                        ? "border-vault-brand text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => void handleAnalyze()}
                    disabled={!problem || isAnalyzing || !code.trim()}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze with AI
                  </Button>
                  {analysis ? (
                    <Button
                      type="button"
                      className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 sm:w-auto"
                      onClick={() => void handleSave(analysis)}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save to Vault
                    </Button>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => void handleSave(null)}
                  disabled={!problem || isSaving || isAnalyzing}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save without Analysis
                </Button>
              </div>
            </div>

            <div ref={analysisRef} className="scroll-mt-28 lg:scroll-mt-20">
              {analysisError ? (
                <p className="mb-3 text-sm text-muted-foreground">{analysisError}</p>
              ) : null}

              {isAnalyzing ? (
                <div className="surface-card p-6">
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
                <div className="flex flex-col items-center rounded-md border border-dashed border-border bg-vault-surface/50 px-6 py-12 text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.4} />
                  <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                    Run analysis to populate the coaching panel, or save the attempt
                    directly to GitHub.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedMain>
    </div>
  );
}
