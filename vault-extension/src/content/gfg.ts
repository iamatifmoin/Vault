import { getAuthState } from "../shared/auth";
import type { CapturedProblem } from "../shared/types";

console.log("Vault: GFG content script loaded");

const RESULT_SELECTOR =
  '.result__accepted, [class*="result__accepted"], [class*="correct"], [class*="success"], [class*="accepted"]';

interface CodeMirrorDoc {
  getValue(): string;
}

interface CodeMirrorInstance {
  getValue(): string;
  doc?: CodeMirrorDoc;
}

declare global {
  interface Window {
    CodeMirror?: CodeMirrorInstance;
  }
}

function parseSlug(): string | null {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : null;
}

function slugToNumber(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  const slugHash = Math.abs(hash).toString(36);
  return parseInt(slugHash, 36) % 10000 || 1;
}

function normalizeDifficulty(value: string): CapturedProblem["difficulty"] {
  const normalized = value.trim().toLowerCase();
  if (normalized === "hard") return "Hard";
  if (normalized === "medium") return "Medium";
  if (
    normalized === "school" ||
    normalized === "basic" ||
    normalized === "easy"
  ) {
    return "Easy";
  }
  return "Easy";
}

function extractTitle(): string {
  const headerTitle =
    document.querySelector("h1")?.textContent?.trim() ??
    document.querySelector("h2")?.textContent?.trim() ??
    document.querySelector('[class*="problem"] h1, [class*="problem"] h2')
      ?.textContent?.trim();

  if (headerTitle) return headerTitle;

  return (
    document.title.replace(/\s*[-|]\s*GeeksforGeeks.*/i, "").trim() ||
    parseSlug()?.replace(/-/g, " ") ||
    ""
  );
}

function extractDifficulty(): CapturedProblem["difficulty"] {
  const labels = Array.from(
    document.querySelectorAll(
      "[class*='difficulty'], [class*='Difficulty'], .problem-meta span, header span, .header span",
    ),
  );

  for (const label of labels) {
    const text = label.textContent?.trim() ?? "";
    if (/^(School|Basic|Easy|Medium|Hard)$/i.test(text)) {
      return normalizeDifficulty(text);
    }
  }

  const bodyText = document.body.textContent ?? "";
  const match = bodyText.match(/\b(School|Basic|Easy|Medium|Hard)\b/i);
  if (match) return normalizeDifficulty(match[1]);

  return "Easy";
}

function extractTopics(): string[] {
  const tagsHeading = Array.from(
    document.querySelectorAll("h2, h3, h4, span, div, p"),
  ).find((el) => /topic\s*tags?/i.test(el.textContent?.trim() ?? ""));

  const container =
    tagsHeading?.parentElement ??
    tagsHeading?.nextElementSibling ??
    tagsHeading?.closest("div")?.parentElement;

  if (!container) return [];

  return Array.from(
    container.querySelectorAll("a, span[class*='tag'], li, [class*='tag']"),
  )
    .map((el) => el.textContent?.trim() ?? "")
    .filter(
      (text) =>
        text &&
        !/^topic\s*tags?$/i.test(text) &&
        !/^(School|Basic|Easy|Medium|Hard)$/i.test(text),
    );
}

function extractProblemData(): Partial<CapturedProblem> | null {
  const slug = parseSlug();
  if (!slug) return null;

  const title = extractTitle();
  if (!title) return null;

  return {
    platform: "gfg",
    number: slugToNumber(slug),
    title,
    titleSlug: slug,
    difficulty: extractDifficulty(),
    topics: extractTopics(),
  };
}

function extractCode(): string {
  const globalCode =
    window.CodeMirror?.doc?.getValue() ?? window.CodeMirror?.getValue();
  if (globalCode) return globalCode;

  const editor = document.querySelector(".CodeMirror") as
    | (HTMLElement & { CodeMirror?: CodeMirrorInstance })
    | null;

  return editor?.CodeMirror?.getValue() ?? "";
}

function extractLanguage(): CapturedProblem["language"] {
  const select = document.querySelector<HTMLSelectElement>(
    'select[class*="language"], select[id*="language"], select[name*="language"]',
  );
  const selectedText =
    select?.selectedOptions[0]?.textContent?.trim() ??
    select?.options[select.selectedIndex]?.textContent?.trim() ??
    "";

  const fallbackText =
    document
      .querySelector(
        '[class*="language"] [class*="selected"], [class*="lang"] [class*="selected"], [class*="language-select"]',
      )
      ?.textContent?.trim() ?? "";

  const dropdownText = selectedText || fallbackText;

  if (/python/i.test(dropdownText)) return "python";
  if (/java/i.test(dropdownText) && !/javascript/i.test(dropdownText)) {
    return "java";
  }
  if (/c\+\+|cpp/i.test(dropdownText)) return "cpp";

  return "cpp";
}

function isAcceptedResult(el: HTMLElement): boolean {
  const text = el.textContent?.trim() ?? "";
  if (/correct answer/i.test(text) || /problem solved/i.test(text)) {
    return true;
  }

  if (el.matches(".result__accepted, [class*='result__accepted']")) {
    return true;
  }

  return Boolean(
    el.querySelector(
      '.result__accepted, [class*="result__accepted"], [class*="correct"], [class*="success"]',
    ),
  );
}

async function onAcceptedDetected(): Promise<void> {
  const auth = await getAuthState();
  if (!auth.githubToken) return;

  const problemData = extractProblemData();
  if (
    !problemData?.number ||
    !problemData.title ||
    !problemData.titleSlug ||
    !problemData.difficulty
  ) {
    return;
  }

  const code = extractCode();
  if (!code.trim()) return;

  const captured: CapturedProblem = {
    platform: "gfg",
    number: problemData.number,
    title: problemData.title,
    titleSlug: problemData.titleSlug,
    difficulty: problemData.difficulty,
    topics: problemData.topics ?? [],
    code,
    language: extractLanguage(),
    submittedAt: new Date().toISOString(),
  };

  try {
    chrome.runtime.sendMessage({ type: "PROBLEM_CAPTURED", data: captured });
  } catch {
    // silent failure
  }
}

const config: MutationObserverInit = { childList: true, subtree: true };

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      const resultEl =
        (isAcceptedResult(node) ? node : null) ??
        node.querySelector<HTMLElement>(RESULT_SELECTOR);

      if (resultEl && isAcceptedResult(resultEl)) {
        observer.disconnect();
        void onAcceptedDetected();
        setTimeout(() => observer.observe(document.body, config), 3000);
        return;
      }
    }
  }
});

observer.observe(document.body, config);
