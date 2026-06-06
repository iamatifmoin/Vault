"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { Code2, Eye } from "lucide-react";
import { codeToHtml } from "shiki";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

const languageMap: Record<Language, string> = {
  cpp: "cpp",
  python: "python",
  java: "java",
};

const fileExtensions: Record<Language, string> = {
  cpp: "cpp",
  python: "py",
  java: "java",
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDuration(startedAt: number) {
  const diff = Math.floor((Date.now() - startedAt) / 1000);
  const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const seconds = String(diff % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (value: string) => void;
  language: Language;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [highlighted, setHighlighted] = useState<string>("");
  const [startedAt] = useState(() => Date.now());
  const [duration, setDuration] = useState(() => formatDuration(Date.now()));
  const deferredValue = useDeferredValue(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 1);
  const filename = `solution.${fileExtensions[language]}`;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDuration(formatDuration(startedAt));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    let active = true;

    startTransition(() => {
      codeToHtml(deferredValue || "// Start typing...", {
        lang: languageMap[language],
        theme: "github-dark-default",
      })
        .then((html) => {
          if (active) {
            setHighlighted(html);
          }
        })
        .catch(() => {
          if (active) {
            setHighlighted(
              `<pre class="shiki github-dark-default"><code>${escapeHtml(
                deferredValue,
              )}</code></pre>`,
            );
          }
        });
    });

    return () => {
      active = false;
    };
  }, [deferredValue, language]);

  function syncGutterScroll() {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-vault-inset">
      <div className="flex h-12 items-center justify-between border-b border-border bg-vault-surface px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {filename}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "edit" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "rounded-md border font-mono text-[11px] uppercase",
                mode === "edit"
                  ? "border-border bg-vault-raised text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-vault-raised hover:text-foreground",
              )}
              onClick={() => setMode("edit")}
            >
              <Code2 className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant={mode === "preview" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "rounded-md border font-mono text-[11px] uppercase",
                mode === "preview"
                  ? "border-border bg-vault-raised text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-vault-raised hover:text-foreground",
              )}
              onClick={() => setMode("preview")}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Preview
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-vault-brand animate-pulse-dot"
            aria-hidden
          />
          <div className="font-mono text-xs tabular-nums text-muted-foreground">
            {duration}
          </div>
        </div>
      </div>

      {mode === "edit" ? (
        <div className="code-area flex min-h-0 flex-1 overflow-hidden">
          <div
            ref={gutterRef}
            aria-hidden
            className="code-gutter min-h-0 shrink-0 overflow-hidden py-4 pl-4"
          >
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onScroll={syncGutterScroll}
            className="min-h-0 flex-1 resize-none overflow-auto bg-vault-inset py-4 pr-4 font-mono text-[13px] leading-6 text-foreground outline-none scrollbar-thin"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="code-area flex min-h-0 flex-1 overflow-hidden">
          <div
            aria-hidden
            className="code-gutter min-h-0 shrink-0 overflow-hidden py-4 pl-4"
          >
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          <div
            className="min-h-0 min-w-0 flex-1 overflow-auto py-4 pr-4 scrollbar-thin [&_.shiki]:!bg-transparent [&_.shiki]:!p-0"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      )}
    </div>
  );
}
