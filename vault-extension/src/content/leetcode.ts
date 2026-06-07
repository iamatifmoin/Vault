import { getAuthState } from "../shared/auth";
import type { CapturedProblem } from "../shared/types";

console.log("Vault: LeetCode content script loaded");

const RESULT_SELECTOR = '[data-e2e-locator="submission-result"]';

interface LeetCodeTopicTag {
  name: string;
  slug: string;
}

interface LeetCodeQuestion {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  topicTags: LeetCodeTopicTag[];
}

interface MonacoModel {
  getValue(): string;
}

interface MonacoEditor {
  getModels(): MonacoModel[];
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
        };
      };
    };
    monaco?: {
      editor?: MonacoEditor;
    };
  }
}

function normalizeDifficulty(value: string): CapturedProblem["difficulty"] {
  if (value === "Medium" || value === "Hard") return value;
  return "Easy";
}

function extractProblemData(): Partial<CapturedProblem> | null {
  const question =
    window.__NEXT_DATA__?.props?.pageProps?.dehydratedState?.queries?.[0]?.state
      ?.data?.question;

  if (!question) return null;

  const number = Number.parseInt(question.questionId, 10);
  if (Number.isNaN(number)) return null;

  return {
    platform: "leetcode",
    number,
    title: question.title,
    titleSlug: question.titleSlug,
    difficulty: normalizeDifficulty(question.difficulty),
    topics: question.topicTags?.map((tag) => tag.name) ?? [],
  };
}

function extractCode(): string {
  const model = window.monaco?.editor?.getModels()?.[0];
  const code = model?.getValue();
  if (code) return code;

  const editorEl =
    document.querySelector('[data-cy="code-editor"] .view-lines') ??
    document.querySelector(".monaco-editor .view-lines");

  return editorEl?.textContent ?? "";
}

function extractLanguage(): CapturedProblem["language"] {
  const langEl = document.querySelector('[data-cy="lang-select"]');
  const text = langEl?.textContent?.trim() ?? "";

  if (text.includes("Python")) return "python";
  if (text.includes("Java") && !text.includes("JavaScript")) return "java";
  if (text.includes("C++")) return "cpp";

  return "cpp";
}

function isAcceptedResult(el: HTMLElement): boolean {
  const text = el.textContent ?? "";
  return text.includes("Accepted") && !text.includes("Not Accepted");
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
        (node.matches(RESULT_SELECTOR) ? node : null) ??
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
