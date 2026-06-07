"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Loader2,
  Lock,
  Mic,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { AIPanel } from "@/components/ai-panel";
import { CodeEditor } from "@/components/code-editor";
import { PageHeader } from "@/components/page-header";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VaultSelect } from "@/components/vault-select";
import { CORE_DSA_TOPICS } from "@/lib/algorithms";
import {
  DIFFICULTY_BADGE_TONES,
  LANGUAGE_LABELS,
  PLATFORM_LABELS,
} from "@/lib/constants";
import {
  buildPlatformProblemUrl,
  formatCountdown,
  formatElapsed,
  getBoilerplate,
  getExpectedTimeRange,
  getNoMatchMessage,
  getTimerColor,
  pickMockProblem,
  TIME_LIMIT_OPTIONS,
  toFetchedProblem,
  type MockDifficulty,
} from "@/lib/mock-interview";
import { cn } from "@/lib/utils";
import type { AIAnalysis, Language, ProblemIndex } from "@/types";

const difficulties: MockDifficulty[] = ["Easy", "Medium", "Hard"];
const languages: Language[] = ["cpp", "python", "java"];

type Phase = "setup" | "interview" | "results";

const PRO_STORAGE_KEY = "vault_pro";

export function MockInterviewPage({
  initialIndex,
  streak,
}: {
  initialIndex: ProblemIndex[];
  streak: number;
}) {
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<MockDifficulty>("Medium");
  const [topic, setTopic] = useState<string>("surprise-me");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [noMatchMessage, setNoMatchMessage] = useState<string | null>(null);

  const [selectedProblem, setSelectedProblem] = useState<ProblemIndex | null>(
    null,
  );
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const timeLimitRef = useRef(0);
  const remainingRef = useRef(0);
  const submitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsPro(window.localStorage.getItem(PRO_STORAGE_KEY) === "true");
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedProblem || isSubmitting) {
      return;
    }

    stopTimer();
    setIsSubmitting(true);
    setSubmitError(null);

    const elapsed = Math.max(
      0,
      timeLimitRef.current - remainingRef.current,
    );
    setElapsedSeconds(elapsed);

    try {
      const fetchedProblem = toFetchedProblem(selectedProblem);
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedProblem.platform,
          problem: fetchedProblem,
          code,
          language,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Analysis failed.");
      }

      setAnalysis(payload.analysis as AIAnalysis);
      setPhase("results");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "AI analysis unavailable. You can save without analysis.";
      setSubmitError(message);
      toast.error(message);
      setPhase("results");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, isSubmitting, language, selectedProblem, stopTimer]);

  useEffect(() => {
    submitRef.current = () => {
      void handleSubmit();
    };
  }, [handleSubmit]);

  const startTimer = useCallback((limitSeconds: number) => {
    stopTimer();
    timeLimitRef.current = limitSeconds;
    remainingRef.current = limitSeconds;
    setRemainingSeconds(limitSeconds);

    timerRef.current = window.setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - 1);
      setRemainingSeconds(remainingRef.current);

      if (remainingRef.current <= 0) {
        stopTimer();
        submitRef.current?.();
      }
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  function resetToSetup() {
    stopTimer();
    setPhase("setup");
    setSelectedProblem(null);
    setAnalysis(null);
    setSubmitError(null);
    setNoMatchMessage(null);
    setCode("");
    setElapsedSeconds(0);
    setRemainingSeconds(0);
  }

  function handleStart() {
    const match = pickMockProblem(initialIndex, difficulty, topic);

    if (!match) {
      setNoMatchMessage(getNoMatchMessage(difficulty, topic));
      return;
    }

    setNoMatchMessage(null);
    setSelectedProblem(match);
    setLanguage(match.latest_language ?? "python");
    setCode(getBoilerplate(match.platform, match.latest_language ?? "python"));
    setAnalysis(null);
    setSubmitError(null);
    setPhase("interview");

    const limitSeconds = timeLimitMinutes * 60;
    startTimer(limitSeconds);
  }

  function handleAbandon() {
    if (
      window.confirm(
        "Abandon this mock interview? Your progress will not be saved.",
      )
    ) {
      resetToSetup();
    }
  }

  async function handleSave() {
    if (!selectedProblem) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/problems/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedProblem.platform,
          problem: toFetchedProblem(selectedProblem),
          sheets: selectedProblem.sheets,
          language,
          code,
          analysis,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error);
      }

      toast.success("Attempt saved to your Vault.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save the attempt to GitHub.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isPro === null) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Mock Interview" streak={streak} />
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Mock Interview" streak={streak} />
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-container-padding py-12">
          <Card className="surface-card w-full max-w-md border-border bg-vault-surface ring-border">
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-vault-raised">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-section-title">Pro Feature</CardTitle>
              <CardDescription className="text-base leading-6">
                Mock Interview Mode is a Pro feature. Upgrade for ₹299/month.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <Button type="button" disabled className="min-w-[160px]">
                Upgrade (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "interview" && selectedProblem) {
    const problemUrl = buildPlatformProblemUrl(
      selectedProblem.platform,
      selectedProblem.number,
      selectedProblem.title,
    );

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-700 px-4 md:px-6">
          <button
            type="button"
            onClick={handleAbandon}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Abandon
          </button>

          <div
            className={cn(
              "font-mono text-2xl tabular-nums transition-colors",
              getTimerColor(remainingSeconds),
            )}
          >
            {formatCountdown(remainingSeconds)}
          </div>

          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !code.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          <section className="flex min-h-0 flex-col border-b border-zinc-700 lg:border-b-0 lg:border-r">
            <div className="border-b border-zinc-700 p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <PlatformIcon platform={selectedProblem.platform} />
                    <span>{PLATFORM_LABELS[selectedProblem.platform]}</span>
                  </div>
                  <h2 className="mt-2 text-section-title">
                    {selectedProblem.number}. {selectedProblem.title}
                  </h2>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-1 font-mono text-[11px] uppercase",
                    DIFFICULTY_BADGE_TONES[selectedProblem.difficulty],
                  )}
                >
                  {selectedProblem.difficulty}
                </span>
              </div>

              {selectedProblem.topics.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedProblem.topics.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 overflow-auto p-4 md:p-6">
              <p className="text-sm leading-6 text-zinc-400">
                Problem statement not available — solve on the original platform.
              </p>
              <Link
                href={problemUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm text-white transition-colors hover:text-emerald-400"
              >
                Open on {PLATFORM_LABELS[selectedProblem.platform]}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="flex min-h-0 flex-col">
            <div className="flex border-b border-zinc-700">
              {languages.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={cn(
                    "border-b-2 px-4 py-2 font-mono text-[11px] uppercase transition-colors",
                    item === language
                      ? "border-emerald-500 text-white"
                      : "border-transparent text-zinc-400 hover:text-white",
                  )}
                  onClick={() => {
                    setLanguage(item);
                    setCode(getBoilerplate(selectedProblem.platform, item));
                  }}
                >
                  {LANGUAGE_LABELS[item]}
                </button>
              ))}
            </div>

            <div className="min-h-[320px] flex-1">
              <CodeEditor value={code} onChange={setCode} language={language} />
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (phase === "results" && selectedProblem) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Mock Interview Results" streak={streak} />

        <div className="mx-auto max-w-4xl space-y-6 px-container-padding py-8">
          <div className="surface-card rounded-md border border-border p-6">
            <p className="text-sm text-muted-foreground">
              {selectedProblem.number}. {selectedProblem.title}
            </p>
            <p className="mt-3 text-base leading-7 text-foreground">
              You solved this in{" "}
              <span className="font-mono text-white">
                {formatElapsed(elapsedSeconds)}
              </span>
              . Typical expectation for{" "}
              <span className="capitalize">{difficulty.toLowerCase()}</span> is{" "}
              <span className="font-mono text-white">
                {getExpectedTimeRange(difficulty)}
              </span>
              .
            </p>
          </div>

          {submitError ? (
            <p className="text-sm text-muted-foreground">{submitError}</p>
          ) : null}

          {isSubmitting ? (
            <div className="surface-card p-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing your solution...
              </div>
            </div>
          ) : analysis ? (
            <AIPanel
              analysis={analysis}
              footer={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save to Vault
                  </Button>
                  <Button type="button" variant="outline" onClick={resetToSetup}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Another
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="surface-card space-y-4 p-6">
              <p className="text-sm text-muted-foreground">
                Analysis unavailable, but you can still save your attempt.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save to Vault
                </Button>
                <Button type="button" variant="outline" onClick={resetToSetup}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Mock Interview" streak={streak} />

      <div className="mx-auto max-w-xl px-container-padding py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-vault-surface">
            <Mic className="h-5 w-5 text-emerald-400" strokeWidth={1.6} />
          </div>
          <div>
            <h2 className="text-section-title">Start Mock Interview</h2>
            <p className="text-sm text-muted-foreground">
              Timed practice on unsolved problems from your Vault.
            </p>
          </div>
        </div>

        <div className="surface-card space-y-6 rounded-md border border-border p-6">
          <div>
            <label className="text-micro-label">Difficulty</label>
            <div className="mt-2 flex rounded-md border border-border bg-background p-1">
              {difficulties.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-md px-2 py-2 text-sm transition-colors",
                    item === difficulty
                      ? "border border-border bg-vault-raised text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setDifficulty(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-micro-label" htmlFor="mock-topic">
              Topic
            </label>
            <VaultSelect
              id="mock-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2"
            >
              <option value="surprise-me">Surprise me</option>
              {CORE_DSA_TOPICS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </VaultSelect>
          </div>

          <div>
            <label className="text-micro-label" htmlFor="mock-time-limit">
              Time limit
            </label>
            <VaultSelect
              id="mock-time-limit"
              value={String(timeLimitMinutes)}
              onChange={(event) =>
                setTimeLimitMinutes(Number.parseInt(event.target.value, 10))
              }
              className="mt-2"
            >
              {TIME_LIMIT_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </VaultSelect>
          </div>

          {noMatchMessage ? (
            <p className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
              {noMatchMessage}
            </p>
          ) : null}

          <Button type="button" className="w-full" onClick={handleStart}>
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
