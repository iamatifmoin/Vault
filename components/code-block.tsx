"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { normalizeCode } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

const LANG_MAP: Record<string, string> = {
  cpp: "c++",
  python: "python",
  java: "java",
};

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalizedCode = normalizeCode(code);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(normalizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group relative overflow-hidden rounded-lg bg-zinc-950", className)}>
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
          {LANG_MAP[language] ?? language}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px]
                     text-zinc-500 transition-colors duration-150
                     hover:bg-zinc-800 hover:text-zinc-300"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre
        className="overflow-x-auto whitespace-pre p-4 font-mono text-sm
                   leading-relaxed text-zinc-300"
      >
        <code>{normalizedCode}</code>
      </pre>
    </div>
  );
}
