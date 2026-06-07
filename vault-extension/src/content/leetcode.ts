import { getAuthState } from "../shared/auth";
import { fetchProblemBySlug, getTitleSlugFromUrl } from "../shared/leetcode";
import type { CapturedProblem } from "../shared/types";

console.log("Vault: LeetCode content script loaded");

const RESULT_SELECTORS = [
  '[data-e2e-locator="submission-result"]',
  '[data-cy="submission-result"]',
  '[class*="submission-result"]',
  '[class*="text-green"]',
  '[class*="text-success"]',
];

const CAPTURE_COOLDOWN_MS = 15_000;

interface LeetCodeQuestion {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  topicTags?: Array<{ name: string }>;
}

interface MonacoEditorInstance {
  getValue(): string;
}

interface MonacoEditorApi {
  getModels(): MonacoEditorInstance[];
  getEditors?(): MonacoEditorInstance[];
}

declare global {
  interface Window {
    __NEXT_DATA__?: {
      props?: {
        pageProps?: {
          dehydratedState?: {
            queries?: Array<{
              state?: {
                data?: {
                  question?: LeetCodeQuestion;
                };
              };
            }>;
          };
          question?: LeetCodeQuestion;
        };
      };
    };
    monaco?: {
      editor?: MonacoEditorApi;
    };
  }
}

let captureInFlight = false;
let lastCaptureAt = 0;

function normalizeDifficulty(value: string): CapturedProblem["difficulty"] {
  if (value === "Medium" || value === "Hard") return value;
  return "Easy";
}

function mapQuestion(question: LeetCodeQuestion): Partial<CapturedProblem> {
  const number = Number.parseInt(question.questionId, 10);
  if (Number.isNaN(number)) {
    return {};
  }

  return {
    platform: "leetcode",
    number,
    title: question.title,
    titleSlug: question.titleSlug,
    difficulty: normalizeDifficulty(question.difficulty),
    topics: question.topicTags?.map((tag) => tag.name) ?? [],
  };
}

function extractProblemDataFromPage(): Partial<CapturedProblem> | null {
  const directQuestion = window.__NEXT_DATA__?.props?.pageProps?.question;
  if (directQuestion?.questionId) {
    const mapped = mapQuestion(directQuestion);
    if (mapped.number) return mapped;
  }

  const queries =
    window.__NEXT_DATA__?.props?.pageProps?.dehydratedState?.queries ?? [];

  for (const query of queries) {
    const question = query?.state?.data?.question;
    if (question?.questionId) {
      const mapped = mapQuestion(question);
      if (mapped.number) return mapped;
    }
  }

  return null;
}

async function resolveProblemData(): Promise<Partial<CapturedProblem> | null> {
  const fromPage = extractProblemDataFromPage();
  if (
    fromPage?.number &&
    fromPage.title &&
    fromPage.titleSlug &&
    fromPage.difficulty
  ) {
    return fromPage;
  }

  const titleSlug = getTitleSlugFromUrl();
  if (!titleSlug) {
    return null;
  }

  return fetchProblemBySlug(titleSlug);
}

function extractCode(): string {
  const editorApi = window.monaco?.editor;

  const editors = editorApi?.getEditors?.();
  const editorValue = editors?.[0]?.getValue();
  if (editorValue) return editorValue;

  const modelValue = editorApi?.getModels()?.[0]?.getValue();
  if (modelValue) return modelValue;

  const editorEl =
    document.querySelector('[data-cy="code-editor"] .view-lines') ??
    document.querySelector(".monaco-editor .view-lines") ??
    document.querySelector(".view-lines");

  return editorEl?.textContent ?? "";
}

function extractLanguage(): CapturedProblem["language"] {
  const selectors = [
    '[data-cy="lang-select"]',
    '[data-e2e-locator="lang-select"]',
    'button[id*="language"]',
  ];

  for (const selector of selectors) {
    const text = document.querySelector(selector)?.textContent?.trim() ?? "";
    if (!text) continue;
    if (text.includes("Python")) return "python";
    if (text.includes("Java") && !text.includes("JavaScript")) return "java";
    if (text.includes("C++") || text.includes("Cpp")) return "cpp";
  }

  return "cpp";
}

function isAcceptedResult(el: HTMLElement): boolean {
  const text = el.textContent?.trim() ?? "";
  if (!text) return false;
  if (text.includes("Not Accepted")) return false;
  return text === "Accepted" || /^Accepted\b/.test(text);
}

function isSubmissionContext(el: HTMLElement): boolean {
  if (el.closest('[data-e2e-locator*="submission"], [data-cy*="submission"]')) {
    return true;
  }

  const className = el.className?.toString() ?? "";
  return /submit|submission|result|verdict|status/i.test(className);
}

function findAcceptedElement(): HTMLElement | null {
  for (const selector of RESULT_SELECTORS) {
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      if (isAcceptedResult(el)) {
        return el;
      }
    }
  }

  for (const el of document.querySelectorAll<HTMLElement>("span, div, p, td")) {
    if (!isAcceptedResult(el)) continue;
    if (!isSubmissionContext(el) && el.closest('[class*="flexlayout"]') === null) {
      continue;
    }
    return el;
  }

  return null;
}

async function onAcceptedDetected(): Promise<void> {
  if (captureInFlight || Date.now() - lastCaptureAt < CAPTURE_COOLDOWN_MS) {
    return;
  }

  captureInFlight = true;

  try {
    const auth = await getAuthState();
    if (!auth.githubToken) {
      console.warn(
        "Vault: submission accepted, but extension is not connected. Open the Vault popup and click Connect to Vault.",
      );
      return;
    }

    const problemData = await resolveProblemData();
    if (
      !problemData?.number ||
      !problemData.title ||
      !problemData.titleSlug ||
      !problemData.difficulty
    ) {
      console.warn("Vault: could not read LeetCode problem metadata.");
      return;
    }

    const code = extractCode();
    if (!code.trim()) {
      console.warn("Vault: accepted submission detected, but no editor code was found.");
      return;
    }

    const captured: CapturedProblem = {
      platform: "leetcode",
      number: problemData.number,
      title: problemData.title,
      titleSlug: problemData.titleSlug,
      difficulty: problemData.difficulty,
      topics: problemData.topics ?? [],
      code,
      language: extractLanguage(),
      submittedAt: new Date().toISOString(),
    };

    chrome.runtime.sendMessage(
      { type: "PROBLEM_CAPTURED", data: captured },
      (response) => {
        if (chrome.runtime.lastError?.message) {
          console.error("Vault:", chrome.runtime.lastError.message);
          return;
        }

        const payload = response as { ok?: boolean; message?: string } | undefined;
        if (payload?.ok) {
          console.log("Vault:", payload.message ?? "Saved to Vault");
          return;
        }

        console.error("Vault:", payload?.message ?? "Failed to save to GitHub");
      },
    );

    lastCaptureAt = Date.now();
  } finally {
    captureInFlight = false;
  }
}

function checkForAccepted(): void {
  if (!findAcceptedElement()) return;
  void onAcceptedDetected();
}

const observerConfig: MutationObserverInit = {
  childList: true,
  subtree: true,
  characterData: true,
};

const observer = new MutationObserver(() => {
  checkForAccepted();
});

observer.observe(document.body, observerConfig);
window.setInterval(checkForAccepted, 2_000);
checkForAccepted();
