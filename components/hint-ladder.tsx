"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIAnalysis } from "@/types";

export function HintLadder({ analysis }: { analysis: AIAnalysis }) {
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const hints = [
    analysis.hints.level_1,
    analysis.hints.level_2,
    analysis.hints.level_3,
    analysis.hints.level_4,
    analysis.hints.level_5,
  ];

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-section-title">Hint Ladder</h3>
        <div className="flex items-center gap-1.5" aria-label={`Hint level ${level} of 5`}>
          {([1, 2, 3, 4, 5] as const).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setLevel(step)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                step <= level ? "bg-vault-brand" : "bg-muted",
              )}
              aria-label={`Go to hint level ${step}`}
            />
          ))}
        </div>
      </div>
      <p className="text-micro-label mt-3">Level {level} of 5</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{hints[level - 1]}</p>
      {level < 5 ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setLevel((previous) => Math.min(previous + 1, 5) as 1 | 2 | 3 | 4 | 5)}
        >
          Need more help →
        </Button>
      ) : null}
    </div>
  );
}
