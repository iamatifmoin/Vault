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
                ? "rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                : "rounded-full border-vault-border bg-transparent text-zinc-400 hover:bg-vault-surface hover:text-zinc-50"
            }
            onClick={() => onSelect(attempt.number)}
          >
            {`Attempt ${attempt.number} · ${attempt.approach} · ${attempt.date}`}
          </Button>
          {index < attempts.length - 1 ? (
            <div className="h-px w-4 shrink-0 bg-vault-border" />
          ) : null}
        </div>
      ))}
      <Link href={addHref}>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-dashed border-vault-border bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-50"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Attempt
        </Button>
      </Link>
    </div>
  );
}
