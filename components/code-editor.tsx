"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-vault-border bg-[#0d0d0f]">
      <div className="flex h-12 items-center justify-between border-b border-vault-border bg-vault-surface px-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "edit" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "rounded-sm border font-mono text-[11px] uppercase",
              mode === "edit"
                ? "border-vault-border bg-vault-raised text-zinc-50"
                : "border-transparent text-zinc-400 hover:bg-vault-raised hover:text-zinc-50",
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
              "rounded-sm border font-mono text-[11px] uppercase",
              mode === "preview"
                ? "border-vault-border bg-vault-raised text-zinc-50"
                : "border-transparent text-zinc-400 hover:bg-vault-raised hover:text-zinc-50",
            )}
            onClick={() => setMode("preview")}
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            Preview
          </Button>
        </div>

        <div className="font-mono text-[12px] text-zinc-500">{duration}</div>
      </div>

      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-h-[420px] flex-1 resize-none bg-[#0d0d0f] px-4 py-4 font-mono text-[13px] leading-6 text-zinc-100 outline-none scrollbar-thin"
          spellCheck={false}
        />
      ) : (
        <div
          className="h-full min-h-[420px] flex-1 overflow-auto px-4 py-4 scrollbar-thin [&_.shiki]:!bg-transparent [&_.shiki]:!p-0"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
    </div>
  );
}
