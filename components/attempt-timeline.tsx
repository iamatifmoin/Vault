"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Attempt } from "@/types";

export function AttemptTimeline({
  attempts,
  selectedAttempt,
  onSelect,
  addHref,
}: {
  attempts: Attempt[];
  selectedAttempt: number;
  onSelect: (attemptNumber: number) => void;
  addHref: string;
}) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {attempts.map((attempt, index) => (
        <div key={attempt.number} className="flex items-center gap-3">
          <Button
            type="button"
            variant={attempt.number === selectedAttempt ? "default" : "outline"}
            className={
              attempt.number === selectedAttempt
                ? "shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                : "shrink-0 rounded-full border-border bg-transparent text-muted-foreground hover:bg-vault-surface hover:text-foreground"
            }
            onClick={() => onSelect(attempt.number)}
          >
            <span>{`Attempt ${attempt.number}`}</span>
            <span className="hidden md:inline">{` · ${attempt.approach} · ${attempt.date}`}</span>
          </Button>
          {index < attempts.length - 1 ? (
            <div className="h-px w-4 shrink-0 bg-border" />
          ) : null}
        </div>
      ))}
      <Link href={addHref}>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-full border-dashed border-border bg-transparent text-muted-foreground hover:border-muted hover:text-foreground"
        >
          <Plus className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Add Attempt</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </Link>
    </div>
  );
}
