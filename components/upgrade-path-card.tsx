"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Code2, Lightbulb, ArrowRight } from "lucide-react";
import { ApproachBadge } from "@/components/approach-badge";
import { scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface UpgradePathData {
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

interface UpgradePathProps {
  problemTitle: string;
  difficulty: string;
  topics: string[];
  currentCode: string;
  currentApproach: "Brute Force" | "Optimized";
  language: string;
}

export function UpgradePathCard({
  problemTitle,
  difficulty,
  topics,
  currentCode,
  currentApproach,
  language,
}: UpgradePathProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [data, setData] = useState<UpgradePathData | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const fetchUpgradePath = async () => {
    setState("loading");
    try {
      const res = await window.fetch("/api/upgrade-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle,
          difficulty,
          topics,
          currentCode,
          currentApproach,
          language,
        }),
      });
      if (!res.ok) throw new Error();
      setData((await res.json()) as UpgradePathData);
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={() => void fetchUpgradePath()}
        className="group flex w-full items-center gap-3 rounded-lg border border-zinc-800
                   bg-zinc-900/40 px-4 py-3 text-left transition-all duration-150
                   hover:border-zinc-700 hover:bg-zinc-900"
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
                        bg-emerald-950/60 text-emerald-400 border border-emerald-900/40"
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-200">How to optimize this solution</p>
          <p className="text-xs text-zinc-500">
            Get a targeted upgrade path from {currentApproach} to Optimal
          </p>
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400" />
      </button>
    );
  }

  if (state === "loading") {
    return (
      <div
        className="flex items-center gap-3 rounded-lg border border-zinc-800
                      bg-zinc-900/40 px-4 py-4"
      >
        <div
          className="h-4 w-4 animate-spin rounded-full border-2
                        border-zinc-700 border-t-emerald-500"
        />
        <span className="text-sm text-zinc-400">Analysing your solution…</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-lg border border-red-900/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
        Failed to generate upgrade path. Try again later.
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-zinc-200">Upgrade Path</span>
        </div>
        <div className="flex items-center gap-2">
          <ApproachBadge approach={currentApproach} />
          <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
          <ApproachBadge approach="Optimal" />
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-red-900/30 bg-red-950/30 p-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-red-400/70">
              Current
            </p>
            <p className="font-mono text-sm text-red-300">{data.currentComplexity}</p>
          </div>
          <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/30 p-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
              Optimal
            </p>
            <p className="font-mono text-sm text-emerald-300">{data.optimalComplexity}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-zinc-800/40 p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Key Insight
            </p>
            <p className="text-sm leading-relaxed text-zinc-200">{data.keyInsight}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Pattern:</span>
          <span
            className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5
                           text-xs font-medium text-zinc-300"
          >
            {data.patternName}
          </span>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-400">What to change:</p>
          <p className="text-sm leading-relaxed text-zinc-300">{data.whatToChange}</p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowDiff(!showDiff)}
            className="flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <Code2 className="h-3.5 w-3.5" />
            {showDiff ? "Hide" : "Show"} code pattern
            <ChevronRight
              className={cn("h-3 w-3 transition-transform", showDiff && "rotate-90")}
            />
          </button>

          <AnimatePresence>
            {showDiff && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-red-400/70">
                      Before
                    </p>
                    <pre
                      className="overflow-x-auto whitespace-pre rounded bg-zinc-950 p-3 font-mono
                                    text-[11px] leading-relaxed text-red-300/80"
                    >
                      {data.codeDiff.before}
                    </pre>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
                      After
                    </p>
                    <pre
                      className="overflow-x-auto whitespace-pre rounded bg-zinc-950 p-3 font-mono
                                    text-[11px] leading-relaxed text-emerald-300/80"
                    >
                      {data.codeDiff.after}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
