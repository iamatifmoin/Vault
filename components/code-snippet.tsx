"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
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
}: {
  code: string;
  language: Language;
}) {
  const [highlighted, setHighlighted] = useState("");

  useEffect(() => {
    let active = true;

    codeToHtml(code, {
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
              code,
            )}</code></pre>`,
          );
        }
      });

    return () => {
      active = false;
    };
  }, [code, language]);

  return (
    <div
      className="[&_.shiki]:!bg-transparent [&_.shiki]:!p-0"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}
