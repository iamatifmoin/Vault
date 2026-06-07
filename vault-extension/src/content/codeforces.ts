import { getAuthState } from "../shared/auth";
import type { CapturedProblem } from "../shared/types";

console.log("Vault: Codeforces content script loaded");

const STORAGE_KEY = "vault_cf_problem";
const VERDICT_SELECTOR =
  ".verdict-accepted, td.verdict-accepted, .submission-verdict-verdict-accepted";

interface ParsedProblemRef {
  contestId: number;
  problemIndex: string;
  problemId: string;
}

function slugifyTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseProblemRef(value: string): ParsedProblemRef | null {
  const trimmed = value.trim();
  const match = trimmed.match(/(\d+)\s*\/?\s*([A-Za-z]\d?)/);
  if (!match) return null;

  const contestId = Number.parseInt(match[1], 10);
  const problemIndex = match[2].toUpperCase();
  if (Number.isNaN(contestId)) return null;

  return {
    contestId,
    problemIndex,
    problemId: `${contestId}${problemIndex}`,
  };
}

function parseProblemFromUrl(url: string): ParsedProblemRef | null {
  try {
    const { pathname, searchParams } = new URL(url, window.location.origin);

    const problemsetMatch = pathname.match(
      /\/problemset\/problem\/(\d+)\/([A-Za-z]\d?)/i,
    );
    if (problemsetMatch) {
      return parseProblemRef(`${problemsetMatch[1]}${problemsetMatch[2]}`);
    }

    const contestMatch = pathname.match(
      /\/contest\/(\d+)\/problem\/([A-Za-z]\d?)/i,
    );
    if (contestMatch) {
      return parseProblemRef(`${contestMatch[1]}${contestMatch[2]}`);
    }

    const problemParam = searchParams.get("problem");
    if (problemParam) {
      return parseProblemRef(problemParam);
    }
  } catch {
    return null;
  }

  return null;
}

function ratingToDifficulty(rating: number): CapturedProblem["difficulty"] {
  if (rating < 1200) return "Easy";
  if (rating <= 2000) return "Medium";
  return "Hard";
}

function extractRating(): number | null {
  const ratingMatch = document.body.textContent?.match(/\*(\d{3,4})\b/);
  if (!ratingMatch) return null;

  const rating = Number.parseInt(ratingMatch[1], 10);
  return Number.isNaN(rating) ? null : rating;
}

function normalizeDifficulty(value?: string): CapturedProblem["difficulty"] {
  if (value === "Easy" || value === "Hard") return value;
  return "Medium";
}

function extractProblemTitle(): string {
  const titleEl = document.querySelector(".problem-statement .title");
  const rawTitle = titleEl?.textContent?.trim() ?? "";
  return rawTitle.replace(/^[A-Z]\d?\.\s*/, "").trim();
}

function extractTopics(): string[] {
  return Array.from(document.querySelectorAll(".tag-box a.round-link"))
    .map((el) => el.textContent?.trim() ?? "")
    .filter(Boolean);
}

function extractProblemData(): Partial<CapturedProblem> | null {
  const parsed = parseProblemFromUrl(window.location.href);
  if (!parsed) return null;

  const title = extractProblemTitle();
  if (!title) return null;

  const rating = extractRating();

  return {
    platform: "codeforces",
    number: parsed.problemId,
    title,
    titleSlug: slugifyTitle(title),
    difficulty: rating ? ratingToDifficulty(rating) : "Medium",
    topics: extractTopics(),
  };
}

function extractProblemDataFromRow(
  row: HTMLElement,
): Partial<CapturedProblem> | null {
  const problemLink = row.querySelector<HTMLAnchorElement>(
    'a[href*="/problem/"], a[href*="/problemset/problem/"]',
  );
  const href = problemLink?.getAttribute("href") ?? "";
  const parsed = href ? parseProblemFromUrl(href) : null;
  if (!parsed) return null;

  const title =
    problemLink?.textContent?.trim().replace(/^[A-Z]\d?\.\s*/, "").trim() ??
    "";

  return {
    platform: "codeforces",
    number: parsed.problemId,
    title: title || parsed.problemId,
    titleSlug: slugifyTitle(title || parsed.problemId),
    difficulty: "Medium",
    topics: [],
  };
}

function cacheProblemData(data: Partial<CapturedProblem>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silent failure
  }
}

function readCachedProblemData(): Partial<CapturedProblem> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<CapturedProblem>) : null;
  } catch {
    return null;
  }
}

function mapLanguage(value: string): CapturedProblem["language"] {
  const text = value.trim();
  if (/pypy3|python\s*3/i.test(text)) return "python";
  if (/java\s*(11|17)?/i.test(text) && !/javascript/i.test(text)) return "java";
  if (/g\+\+|gnu\s*c\+\+/i.test(text)) return "cpp";
  return "cpp";
}

function extractLanguageFromRow(row: HTMLElement): CapturedProblem["language"] {
  const cells = Array.from(row.querySelectorAll("td"));
  for (const cell of cells) {
    const text = cell.textContent?.trim() ?? "";
    if (/g\+\+|pypy|python|java/i.test(text)) {
      return mapLanguage(text);
    }
  }

  return "cpp";
}

async function extractCodeFromSubmissionRow(
  row: HTMLElement,
): Promise<string> {
  const submissionLink = row.querySelector<HTMLAnchorElement>(
    'a[href*="/submission/"]',
  );
  const href = submissionLink?.getAttribute("href");
  if (!href) return "";

  try {
    const response = await fetch(new URL(href, window.location.origin).href);
    if (!response.ok) return "";

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const codeEl =
      doc.querySelector("#program-source-text") ??
      doc.querySelector("pre#program-source-text") ??
      doc.querySelector("#program-source-text pre");

    return codeEl?.textContent?.trim() ?? "";
  } catch {
    return "";
  }
}

function isAcceptedVerdict(el: HTMLElement): boolean {
  if (el.matches(VERDICT_SELECTOR)) return true;

  const text = el.textContent?.trim() ?? "";
  return (
    text === "Accepted" ||
    (text.includes("Accepted") && !text.includes("Not Accepted"))
  );
}

function findAcceptedContext(
  node: HTMLElement,
): { verdictEl: HTMLElement; row: HTMLElement | null } | null {
  const verdictEl =
    (node.matches(VERDICT_SELECTOR) ? node : null) ??
    node.querySelector<HTMLElement>(VERDICT_SELECTOR) ??
    (isAcceptedVerdict(node) ? node : null) ??
    Array.from(node.querySelectorAll<HTMLElement>("td, span, div")).find(
      isAcceptedVerdict,
    ) ??
    null;

  if (!verdictEl) return null;

  const row = verdictEl.closest("tr");
  return { verdictEl, row };
}

async function onAcceptedDetected(
  row: HTMLElement | null,
): Promise<void> {
  const auth = await getAuthState();
  if (!auth.githubToken) return;

  const problemData =
    extractProblemData() ??
    (row ? extractProblemDataFromRow(row) : null) ??
    readCachedProblemData();

  if (
    !problemData?.number ||
    !problemData.title ||
    !problemData.titleSlug ||
    !problemData.difficulty
  ) {
    return;
  }

  const code = row ? await extractCodeFromSubmissionRow(row) : "";
  if (!code.trim()) return;

  const captured: CapturedProblem = {
    platform: "codeforces",
    number: problemData.number,
    title: problemData.title,
    titleSlug: problemData.titleSlug,
    difficulty: normalizeDifficulty(problemData.difficulty),
    topics: problemData.topics ?? [],
    code,
    language: row ? extractLanguageFromRow(row) : "cpp",
    submittedAt: new Date().toISOString(),
  };

  try {
    chrome.runtime.sendMessage({ type: "PROBLEM_CAPTURED", data: captured });
  } catch {
    // silent failure
  }
}

const cachedProblem = extractProblemData();
if (cachedProblem?.number && cachedProblem.title) {
  cacheProblemData(cachedProblem);
}

const config: MutationObserverInit = { childList: true, subtree: true };

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      const context = findAcceptedContext(node);
      if (!context) continue;

      observer.disconnect();
      void onAcceptedDetected(context.row);
      setTimeout(() => observer.observe(document.body, config), 3000);
      return;
    }
  }
});

observer.observe(document.body, config);
