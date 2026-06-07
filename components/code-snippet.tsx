"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { normalizeCode } from "@/lib/markdown";
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

export function CodeSnippet({
  code,
  language,
  showLineNumbers = true,
}: {
  code: string;
  language: Language;
  showLineNumbers?: boolean;
}) {
  const [highlighted, setHighlighted] = useState("");
  const normalizedCode = normalizeCode(code);
  const lines = normalizedCode.split("\n");

  useEffect(() => {
    let active = true;

    codeToHtml(normalizedCode, {
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
              normalizedCode,
            )}</code></pre>`,
          );
        }
      });

    return () => {
      active = false;
    };
  }, [normalizedCode, language]);

  if (!showLineNumbers) {
    return (
      <div
        className="[&_.shiki]:!bg-transparent [&_.shiki]:!p-0"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }

  return (
    <div className="flex gap-3">
      <div
        aria-hidden
        className="select-none border-r border-border pr-3 text-right font-mono text-xs leading-[1.625rem] text-muted-foreground/60"
      >
        {lines.map((_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <div
        className={cn(
          "min-w-0 flex-1 [&_.shiki]:!bg-transparent [&_.shiki]:!p-0",
          "[&_pre]:!leading-[1.625rem]",
        )}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
