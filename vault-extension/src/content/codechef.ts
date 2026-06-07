import { getAuthState } from "../shared/auth";
import type { CapturedProblem } from "../shared/types";

console.log("Vault: CodeChef content script loaded");

const RESULT_SELECTOR =
  '[class*="verdict"], [class*="submission"], [class*="result"], [class*="status"]';

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

function slugifyTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseProblemCode(): string | null {
  const match = window.location.pathname.match(/\/problems\/([A-Z0-9_]+)/i);
  return match ? match[1].toUpperCase() : null;
}

function normalizeDifficulty(value: string): CapturedProblem["difficulty"] {
  const normalized = value.trim().toLowerCase();
  if (normalized === "hard") return "Hard";
  if (normalized === "medium") return "Medium";
  if (normalized === "school" || normalized === "easy") return "Easy";
  return "Medium";
}

function extractTitle(): string {
  const h1 = document.querySelector("h1")?.textContent?.trim();
  if (h1) return h1;

  return (
    document.title.replace(/\s*\|\s*CodeChef/i, "").trim() ||
    parseProblemCode() ||
    ""
  );
}

function extractDifficulty(): CapturedProblem["difficulty"] {
  const labels = Array.from(
    document.querySelectorAll(
      "[class*='difficulty'], [class*='Difficulty'], .sidebar span, .problem-sidebar span, aside span",
    ),
  );

  for (const label of labels) {
    const text = label.textContent?.trim() ?? "";
    if (/^(School|Easy|Medium|Hard)$/i.test(text)) {
      return normalizeDifficulty(text);
    }
  }

  const bodyText = document.body.textContent ?? "";
  const match = bodyText.match(/\b(School|Easy|Medium|Hard)\b/i);
  if (match) return normalizeDifficulty(match[1]);

  return "Medium";
}

function extractTopics(): string[] {
  const tagsHeading = Array.from(
    document.querySelectorAll("aside h2, aside h3, aside h4, .sidebar h2, .sidebar h3"),
  ).find((el) => el.textContent?.trim().toLowerCase() === "tags");

  const container = tagsHeading?.parentElement ?? tagsHeading?.nextElementSibling;
  if (!container) return [];

  return Array.from(
    container.querySelectorAll("a, span, li, [class*='tag']"),
  )
    .map((el) => el.textContent?.trim() ?? "")
    .filter((text) => text && !/^tags?$/i.test(text));
}

function extractProblemData(): Partial<CapturedProblem> | null {
  const problemCode = parseProblemCode();
  if (!problemCode) return null;

  const title = extractTitle();
  if (!title) return null;

  return {
    platform: "codechef",
    number: problemCode,
    title,
    titleSlug: slugifyTitle(title),
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
  const langEl = document.querySelector(
    '[class*="language"], select[name*="language"], [id*="language"]',
  );
  const text = langEl?.textContent?.trim() ?? langEl?.getAttribute("value") ?? "";

  if (/python/i.test(text)) return "python";
  if (/java/i.test(text) && !/javascript/i.test(text)) return "java";
  if (/c\+\+|cpp/i.test(text)) return "cpp";

  return "cpp";
}

function isAcceptedResult(el: HTMLElement): boolean {
  const text = el.textContent?.trim() ?? "";
  if (text === "AC" || /\bAccepted\b/.test(text)) return true;

  return Boolean(
    el.querySelector(
      '[class*="success"], [class*="accepted"], [class*="check"], svg[class*="success"]',
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
    platform: "codechef",
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
