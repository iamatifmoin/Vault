"use client";

import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Plus } from "lucide-react";
import { ApproachBadge } from "@/components/approach-badge";
import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { LANGUAGE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Attempt } from "@/types";

interface AttemptTimelineProps {
  attempts: Attempt[];
  selectedAttempt: number;
  onSelect: (attemptNumber: number) => void;
  addHref: string;
}

export function AttemptTimeline({
  attempts,
  selectedAttempt,
  onSelect,
  addHref,
}: AttemptTimelineProps) {
  const sorted = [...attempts].sort((a, b) => b.number - a.number);

  return (
    <div className="space-y-3">
      <Accordion.Root
        type="single"
        collapsible
        value={`attempt-${selectedAttempt}`}
        onValueChange={(value) => {
          if (value) {
            onSelect(Number(value.replace("attempt-", "")));
          }
        }}
        className="space-y-2"
      >
        {sorted.map((attempt, idx) => (
          <Accordion.Item
            key={attempt.number}
            value={`attempt-${attempt.number}`}
            className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50
                       data-[state=open]:border-zinc-700"
          >
            <Accordion.Trigger
              className="group flex w-full items-center gap-3 px-4 py-3
                                         text-left transition-colors
                                         hover:bg-zinc-800/40"
            >
              <div
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  idx === 0
                    ? "bg-emerald-950/80 text-emerald-400 ring-1 ring-emerald-800/50"
                    : "bg-zinc-800 text-zinc-500",
                )}
              >
                {attempt.number}
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ApproachBadge approach={attempt.approach} showDot />
                <span className="font-mono text-[11px] text-zinc-500">
                  {LANGUAGE_LABELS[attempt.language] ?? attempt.language}
                </span>
                {attempt.time_complexity ? (
                  <span className="hidden text-[11px] text-zinc-600 sm:block">
                    {attempt.time_complexity}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="text-[11px] text-zinc-600">
                  {new Date(attempt.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-zinc-600 transition-transform duration-200
                           group-data-[state=open]:rotate-180"
                />
              </div>
            </Accordion.Trigger>

            <Accordion.Content
              className="overflow-hidden data-[state=closed]:animate-accordion-up
                                         data-[state=open]:animate-accordion-down"
            >
              <div className="space-y-3 border-t border-zinc-800 px-4 py-4">
                {attempt.time_complexity || attempt.space_complexity ? (
                  <div className="flex items-center gap-4 text-xs">
                    {attempt.time_complexity ? (
                      <span className="text-zinc-400">
                        Time:{" "}
                        <span className="font-mono text-zinc-200">
                          {attempt.time_complexity}
                        </span>
                      </span>
                    ) : null}
                    {attempt.space_complexity ? (
                      <span className="text-zinc-400">
                        Space:{" "}
                        <span className="font-mono text-zinc-200">
                          {attempt.space_complexity}
                        </span>
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <CodeBlock code={attempt.code} language={attempt.language} />
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      <Link href={addHref}>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-lg border-dashed border-border bg-transparent text-muted-foreground hover:border-muted hover:text-foreground sm:w-auto"
        >
          <Plus className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Add Attempt</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </Link>
    </div>
  );
}
