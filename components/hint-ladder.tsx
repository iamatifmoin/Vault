"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
        <span className="text-micro-label">Level {level}</span>
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{hints[level - 1]}</p>
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
