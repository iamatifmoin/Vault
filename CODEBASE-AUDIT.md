# Vault Codebase Audit Report

Read-only audit of the Vault repository. Generated for use as baseline for subsequent implementation prompts.

---

## 1. Directory Trees

### `/app` (20 files)

```
app/
├── layout.tsx
├── globals.css
├── icon.svg
├── (auth)/
│   └── page.tsx                    → route: /
├── (app)/
│   ├── layout.tsx
│   ├── add/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── library/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── profile/
│       ├── page.tsx
│       └── loading.tsx
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts
    ├── ai/
    │   ├── analyze/
    │   │   └── route.ts
    │   └── hint/
    │       └── route.ts
    └── problems/
        ├── fetch/
        │   └── route.ts
        ├── list/
        │   └── route.ts
        ├── save/
        │   └── route.ts
        └── [id]/
            └── route.ts
```

**Note:** There is no `app/page.tsx`. The root route `/` is served by `app/(auth)/page.tsx` (route group `(auth)` is omitted from the URL).

---

### `/components` (36 files)

```
components/
├── activity-heatmap.tsx
├── add-problem-page.tsx
├── ai-panel.tsx
├── animated-main.tsx
├── app-logo.tsx
├── attempt-timeline.tsx
├── code-editor.tsx
├── code-snippet.tsx
├── empty-state.tsx
├── hint-ladder.tsx
├── library-page-client.tsx
├── login-button.tsx
├── logout-button.tsx
├── mini-activity-strip.tsx
├── page-header.tsx
├── platform-icon.tsx
├── problem-card.tsx
├── problem-markdown.tsx
├── problem-view-client.tsx
├── sidebar.tsx
├── streak-badge.tsx
├── vault-select.tsx
├── window-chrome.tsx
└── ui/
    ├── accordion.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── skeleton.tsx
    ├── sonner.tsx
    ├── tabs.tsx
    └── tooltip.tsx
```

---

### `/lib` (11 files)

```
lib/
├── auth.ts
├── claude.ts
├── codechef.ts
├── codeforces.ts
├── constants.ts
├── github.ts
├── leetcode.ts
├── markdown.ts
├── sheets.ts
├── stats.ts
└── utils.ts
```

---

### `/types` (2 files)

```
types/
├── index.ts
└── next-auth.d.ts
```

---

## 2. Full Contents — `/types`

### `types/index.ts`

```typescript
export type Platform = "leetcode" | "codeforces" | "codechef";
export type Difficulty = "easy" | "medium" | "hard";
export type Language = "cpp" | "python" | "java";
export type ApproachType = "Brute Force" | "Optimized" | "Optimal";

export type Sheet =
  | "neetcode-150"
  | "neetcode-roadmap"
  | "blind-75"
  | "strivers-sde"
  | "strivers-a2z"
  | "strivers-cp";

export interface TopicTag {
  name: string;
  slug: string;
}

export interface FetchedProblem {
  number: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: TopicTag[];
  content: string;
  boilerplate: {
    cpp: string;
    python: string;
    java: string;
  };
}

export interface AIAnalysis {
  classification: ApproachType;
  time_complexity: string;
  space_complexity: string;
  what_you_did_well: string[];
  bottlenecks: string[];
  bugs: string[];
  hints: {
    level_1: string;
    level_2: string;
    level_3: string;
    level_4: string;
    level_5: string;
  };
  pattern: {
    name: string;
    when_to_use: string;
    related_problems: string[];
  };
}

export interface Attempt {
  number: number;
  date: string;
  language: Language;
  code: string;
  approach: ApproachType;
  time_complexity: string;
  space_complexity: string;
  analysis: AIAnalysis | null;
}

export interface Problem {
  id: string;
  number: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  sheets: Sheet[];
  attempts: Attempt[];
  file_path: string;
  date_created: string;
}

export interface ProblemIndex {
  id: string;
  number: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  sheets: Sheet[];
  attempt_count: number;
  latest_approach: ApproachType | null;
  latest_date: string;
  latest_language: Language;
  file_path: string;
}

export interface RepoStats {
  totalFiles: number;
  firstSolveDate: string | null;
  latestSolveDate: string | null;
}

export interface SaveProblemPayload {
  mode?: "save-attempt";
  platform: Platform;
  problem: FetchedProblem;
  sheets: Sheet[];
  language: Language;
  code: string;
  analysis: AIAnalysis | null;
}

export interface UpdateAnalysisPayload {
  mode: "update-analysis";
  id: string;
  attemptNumber: number;
  analysis: AIAnalysis;
}
```

### `types/next-auth.d.ts`

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: DefaultSession["user"] & {
      login?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
  }
}
```

---

## 3. Full Contents — `/lib`

### `lib/constants.ts`

```typescript
import { type ApproachType, type Difficulty, type Language, type Platform } from "@/types";

export const REPO_NAME = "Data Structures & Algorithms";

export const PLATFORM_LABELS: Record<Platform, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_BADGE_TONES: Record<Difficulty, string> = {
  easy: "border-zinc-700 text-zinc-200",
  medium: "border-blue-500/40 text-blue-300",
  hard: "border-red-500/40 text-red-300",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  cpp: "C++",
  python: "Python",
  java: "Java",
};

export const APPROACH_BADGE_TONES: Record<
  ApproachType,
  { className: string; label: string }
> = {
  "Brute Force": {
    className: "border-zinc-700 bg-zinc-900 text-zinc-300",
    label: "Brute Force",
  },
  Optimized: {
    className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    label: "Optimized",
  },
  Optimal: {
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 badge-optimal-glow",
    label: "Optimal",
  },
};

export const LEETCODE_BOILERPLATE = {
  cpp: `class Solution {\npublic:\n    vector<int> solve(vector<int>& nums) {\n        // Your solution here\n        return {};\n    }\n};`,
  python: `class Solution:\n    def solve(self, nums):\n        # Your solution here\n        pass`,
  java: `class Solution {\n    public int[] solve(int[] nums) {\n        // Your solution here\n        return new int[]{};\n    }\n}`,
};

export const CP_BOILERPLATE = {
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    // Your solution here\n\n    return 0;\n}`,
  python: `import sys\ninput = sys.stdin.readline\n\ndef solve():\n    # Your solution here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
  java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Your solution here\n    }\n}`,
};

export const MANUAL_PROBLEM_NOTICE =
  "Problem content couldn't be fetched automatically. Paste the problem statement manually.";

export const PREMIUM_PROBLEM_NOTICE =
  "Couldn't fetch this problem. It may be a premium problem. Paste the problem statement manually.";

export const ANALYSIS_SYSTEM_PROMPT = `You are an expert DSA coach analyzing a student's solution.
Be specific, reference actual lines and variable names from their code.
Never give away the full optimal solution - guide toward it instead.
Return ONLY valid JSON with no markdown fences, no preamble.`;
```

### `lib/markdown.ts`

```typescript
import matter from "gray-matter";
import TurndownService from "turndown";
import { DIFFICULTY_LABELS, LANGUAGE_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import type {
  AIAnalysis,
  Attempt,
  Language,
  Problem,
  ProblemIndex,
  Platform,
} from "@/types";

const ANALYSIS_COMMENT_PREFIX = "<!-- vault-analysis:";
const ANALYSIS_COMMENT_SUFFIX = " -->";

export function slugifyTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function slugifyTopic(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function padLeetCodeNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.padStart(4, "0");
}

export function buildProblemId(platform: Platform, number: string) {
  return platform === "leetcode"
    ? `${platform}-${padLeetCodeNumber(number)}`
    : `${platform}-${number.toLowerCase()}`;
}

export function buildProblemFilePath(input: {
  platform: Platform;
  number: string;
  title: string;
  primaryTopic?: string;
}) {
  const titleSlug = slugifyTitle(input.title);

  if (input.platform === "leetcode") {
    const topicSlug = slugifyTopic(input.primaryTopic || "misc");
    return `${input.platform}/${topicSlug}/${padLeetCodeNumber(input.number)}-${titleSlug}.md`;
  }

  if (input.platform === "codeforces") {
    return `${input.platform}/${input.number}-${titleSlug}.md`;
  }

  return `${input.platform}/${input.number.toUpperCase()}.md`;
}

export function htmlToMarkdown(html: string) {
  const turndown = new TurndownService({
    codeBlockStyle: "fenced",
    headingStyle: "atx",
    bulletListMarker: "-",
  });

  turndown.addRule("preserveCodeBlocks", {
    filter: ["pre"],
    replacement(_content, node) {
      const text = node.textContent ?? "";
      return `\n\`\`\`\n${text.trim()}\n\`\`\`\n`;
    },
  });

  return turndown.turndown(html).trim();
}

function renderAnalysisSummary(analysis: AIAnalysis | null) {
  if (!analysis) {
    return "**AI Analysis:** Not available.\n";
  }

  const serialize = JSON.stringify(analysis);

  return [
    "**AI Analysis:**",
    `*What you did well:* ${analysis.what_you_did_well.join(" ") || "None."}`,
    `*Bottlenecks:* ${analysis.bottlenecks.join(" ") || "None."}`,
    `*Bugs:* ${analysis.bugs.join(" ") || "None."}`,
    `${ANALYSIS_COMMENT_PREFIX}${serialize}${ANALYSIS_COMMENT_SUFFIX}`,
  ].join("\n");
}

function renderAttempt(attempt: Attempt) {
  const languageLabel = LANGUAGE_LABELS[attempt.language];

  return [
    `### Attempt ${attempt.number} - ${attempt.approach}`,
    "",
    `**Date:** ${attempt.date} | **Language:** ${languageLabel}`,
    `**Time:** ${attempt.time_complexity} | **Space:** ${attempt.space_complexity}`,
    `**Classification:** ${attempt.approach}`,
    "",
    `\`\`\`${attempt.language}`,
    attempt.code.trim(),
    "```",
    "",
    renderAnalysisSummary(attempt.analysis),
  ].join("\n");
}

export function generateProblemMarkdown(problem: Problem, problemStatement: string) {
  const platformLabel = PLATFORM_LABELS[problem.platform];
  const difficultyLabel = DIFFICULTY_LABELS[problem.difficulty];
  const topicLabel = problem.topics.join(", ");
  const sheetLabel = problem.sheets.join(", ");
  const frontmatter = [
    "---",
    `id: "${problem.id}"`,
    `number: "${problem.number}"`,
    `title: "${problem.title}"`,
    `platform: "${problem.platform}"`,
    `difficulty: "${problem.difficulty}"`,
    `topics: ${JSON.stringify(problem.topics)}`,
    `sheets: ${JSON.stringify(problem.sheets)}`,
    `date_created: "${problem.date_created}"`,
    "---",
  ].join("\n");

  return [
    frontmatter,
    "",
    `# ${problem.number}. ${problem.title}`,
    "",
    `**Platform:** ${platformLabel} | **Difficulty:** ${difficultyLabel}`,
    `**Topics:** ${topicLabel || "Uncategorized"} | **Sheet:** ${sheetLabel || "Unassigned"}`,
    "",
    "## Problem Statement",
    "",
    problemStatement.trim(),
    "",
    "## Attempts",
    "",
    problem.attempts.map(renderAttempt).join("\n\n---\n\n"),
    "",
  ].join("\n");
}

function normalizeLanguage(value: string): Language {
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("c++") || normalized === "cpp") {
    return "cpp";
  }
  if (normalized.startsWith("java")) {
    return "java";
  }
  return "python";
}

function parseAnalysis(section: string): AIAnalysis | null {
  const match = section.match(/<!-- vault-analysis:([\s\S]*?) -->/);

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1]) as AIAnalysis;
  } catch {
    return null;
  }
}

function parseAttempts(block: string) {
  const sections = block
    .split(/\n(?=### Attempt \d+ - )/)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map<Attempt>((section) => {
    const headingMatch = section.match(/^### Attempt (\d+) - (.+)$/m);
    const dateLine = section.match(/\*\*Date:\*\* ([^|]+)\| \*\*Language:\*\* ([^\n]+)/m);
    const timeLine = section.match(/\*\*Time:\*\* ([^|]+)\| \*\*Space:\*\* ([^\n]+)/m);
    const classificationLine = section.match(/\*\*Classification:\*\* ([^\n]+)/m);
    const codeMatch = section.match(/```(\w+)\n([\s\S]*?)```/m);

    if (!headingMatch || !dateLine || !timeLine || !classificationLine || !codeMatch) {
      throw new Error("Unable to parse attempt from markdown file.");
    }

    return {
      number: Number(headingMatch[1]),
      date: dateLine[1].trim(),
      language: normalizeLanguage(dateLine[2]),
      code: codeMatch[2].trimEnd(),
      approach: classificationLine[1].trim() as Attempt["approach"],
      time_complexity: timeLine[1].trim(),
      space_complexity: timeLine[2].trim(),
      analysis: parseAnalysis(section),
    };
  });
}

export function parseProblemMarkdown(fileContent: string, filePath = "") {
  const parsed = matter(fileContent);
  const problemStatementMatch = parsed.content.match(
    /## Problem Statement\s+([\s\S]*?)\s+## Attempts/,
  );
  const attemptsMatch = parsed.content.match(/## Attempts\s+([\s\S]*)$/);

  if (!problemStatementMatch || !attemptsMatch) {
    throw new Error("Unable to parse the saved markdown structure.");
  }

  const attempts = parseAttempts(attemptsMatch[1].trim());
  const data = parsed.data as Record<string, unknown>;

  const problem: Problem = {
    id: String(data.id),
    number: String(data.number),
    title: String(data.title),
    platform: data.platform as Platform,
    difficulty: data.difficulty as Problem["difficulty"],
    topics: Array.isArray(data.topics) ? data.topics.map(String) : [],
    sheets: Array.isArray(data.sheets)
      ? data.sheets.map((item) => String(item) as Problem["sheets"][number])
      : [],
    attempts,
    file_path: filePath,
    date_created: String(data.date_created),
  };

  return {
    problem,
    problemStatement: problemStatementMatch[1].trim(),
  };
}

export function toProblemIndex(problem: Problem): ProblemIndex {
  const latestAttempt = problem.attempts[problem.attempts.length - 1];

  return {
    id: problem.id,
    number: problem.number,
    title: problem.title,
    platform: problem.platform,
    difficulty: problem.difficulty,
    topics: problem.topics,
    sheets: problem.sheets,
    attempt_count: problem.attempts.length,
    latest_approach: latestAttempt?.approach ?? null,
    latest_date: latestAttempt?.date ?? problem.date_created,
    latest_language: latestAttempt?.language ?? "python",
    file_path: problem.file_path,
  };
}
```

### `lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      if (profile && "login" in profile && typeof profile.login === "string") {
        token.login = profile.login;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.user.login =
        typeof token.login === "string" ? token.login : undefined;
      return session;
    },
  },
});
```

### `lib/claude.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/constants";
import type { AIAnalysis, FetchedProblem, Language, Platform } from "@/types";

function numberCodeLines(code: string) {
  return code
    .split("\n")
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");
}

export function buildAnalysisPrompt(
  platform: Platform,
  problem: FetchedProblem,
  code: string,
  language: Language,
) {
  return `
Problem: ${problem.number}. ${problem.title} (${problem.difficulty})
Platform: ${platform}
Topics: ${problem.topics.map((topic) => topic.name).join(", ")}

Problem Statement:
${problem.content}

Student's Solution (${language}):
${numberCodeLines(code)}

Return a JSON object with exactly this structure:
{
  "classification": "Brute Force" | "Optimized" | "Optimal",
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "what_you_did_well": ["specific observation about their code", ...],
  "bottlenecks": ["specific bottleneck with line reference", ...],
  "bugs": ["bug description with line reference if applicable", ...],
  "hints": {
    "level_1": "A subtle observation about the problem constraints - no approach mentioned",
    "level_2": "Point to the specific bottleneck in their code without naming the fix",
    "level_3": "Name the pattern/data structure category without full explanation",
    "level_4": "Describe the thinking direction concretely - still no code",
    "level_5": "Full approach explanation without writing the code"
  },
  "pattern": {
    "name": "Pattern name (e.g. Sliding Window, Two Pointers)",
    "when_to_use": "One sentence on when to recognize this pattern",
    "related_problems": ["Problem name (#number)", ...]
  }
}`;
}

function parseAnalysisResponse(raw: string) {
  try {
    return JSON.parse(raw) as AIAnalysis;
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as AIAnalysis;
    }

    throw new Error("Claude did not return valid JSON.");
  }
}

function normalizeAnalysis(analysis: AIAnalysis): AIAnalysis {
  return {
    classification: analysis.classification,
    time_complexity: analysis.time_complexity || "O(?)",
    space_complexity: analysis.space_complexity || "O(?)",
    what_you_did_well: analysis.what_you_did_well ?? [],
    bottlenecks: analysis.bottlenecks ?? [],
    bugs: analysis.bugs ?? [],
    hints: {
      level_1: analysis.hints?.level_1 ?? "",
      level_2: analysis.hints?.level_2 ?? "",
      level_3: analysis.hints?.level_3 ?? "",
      level_4: analysis.hints?.level_4 ?? "",
      level_5: analysis.hints?.level_5 ?? "",
    },
    pattern: {
      name: analysis.pattern?.name ?? "Unknown",
      when_to_use: analysis.pattern?.when_to_use ?? "",
      related_problems: analysis.pattern?.related_problems ?? [],
    },
  };
}

export async function analyzeSolution(input: {
  platform: Platform;
  problem: FetchedProblem;
  code: string;
  language: Language;
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildAnalysisPrompt(
          input.platform,
          input.problem,
          input.code,
          input.language,
        ),
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return normalizeAnalysis(parseAnalysisResponse(text));
}

export function getHintLevel(analysis: AIAnalysis, level: 1 | 2 | 3 | 4 | 5) {
  return analysis.hints[`level_${level}` as keyof AIAnalysis["hints"]];
}
```

### `lib/codechef.ts`

```typescript
import { load } from "cheerio";
import { CP_BOILERPLATE, MANUAL_PROBLEM_NOTICE } from "@/lib/constants";
import { htmlToMarkdown, slugifyTitle } from "@/lib/markdown";
import type { FetchedProblem } from "@/types";

function extractCode(query: string) {
  const trimmed = query.trim().toUpperCase();
  const urlMatch = trimmed.match(/CODECHEF\.COM\/PROBLEMS\/([A-Z0-9_]+)/i);
  return urlMatch ? urlMatch[1].toUpperCase() : trimmed;
}

export async function fetchCodeChefProblem(query: string): Promise<{
  problem: FetchedProblem;
  notice?: string;
}> {
  const code = extractCode(query);

  try {
    const response = await fetch(`https://www.codechef.com/problems/${code}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to fetch the CodeChef page.");
    }

    const html = await response.text();
    const $ = load(html);
    const title =
      $("h1").first().text().trim() ||
      $("title").text().replace(/\s*\|\s*CodeChef/i, "").trim() ||
      code;

    const statement = $(
      ".problem-statement, #problem-statement, [class*='problem-statement']",
    )
      .first()
      .clone();

    statement.find("script, style").remove();

    if (!statement.length) {
      return {
        problem: {
          number: code,
          title,
          slug: slugifyTitle(title),
          difficulty: "medium",
          topics: [],
          content: MANUAL_PROBLEM_NOTICE,
          boilerplate: CP_BOILERPLATE,
        },
        notice: MANUAL_PROBLEM_NOTICE,
      };
    }

    return {
      problem: {
        number: code,
        title,
        slug: slugifyTitle(title),
        difficulty: "medium",
        topics: [],
        content: htmlToMarkdown(statement.html() ?? ""),
        boilerplate: CP_BOILERPLATE,
      },
    };
  } catch {
    return {
      problem: {
        number: code,
        title: code,
        slug: code.toLowerCase(),
        difficulty: "medium",
        topics: [],
        content: MANUAL_PROBLEM_NOTICE,
        boilerplate: CP_BOILERPLATE,
      },
      notice: MANUAL_PROBLEM_NOTICE,
    };
  }
}
```

### `lib/codeforces.ts`

```typescript
import { load } from "cheerio";
import { CP_BOILERPLATE } from "@/lib/constants";
import { htmlToMarkdown, slugifyTitle } from "@/lib/markdown";
import type { Difficulty, FetchedProblem, TopicTag } from "@/types";

interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

let problemsetPromise: Promise<CodeforcesProblem[]> | null = null;

function parseCodeforcesQuery(query: string) {
  const match = query.trim().match(/(\d+)\s*\/?\s*([A-Za-z]\d?)/);

  if (!match) {
    throw new Error("Enter a Codeforces problem like 1234A or 1234/A.");
  }

  return {
    contestId: Number(match[1]),
    index: match[2].toUpperCase(),
  };
}

function mapDifficulty(rating?: number): Difficulty {
  if (!rating || rating <= 1200) {
    return "easy";
  }
  if (rating <= 1800) {
    return "medium";
  }
  return "hard";
}

async function getProblemset() {
  if (!problemsetPromise) {
    problemsetPromise = fetch("https://codeforces.com/api/problemset.problems", {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch the Codeforces problemset.");
        }

        return response.json();
      })
      .then((payload) => payload.result.problems as CodeforcesProblem[]);
  }

  return problemsetPromise;
}

async function fetchStatement(contestId: number, index: string) {
  const response = await fetch(
    `https://codeforces.com/problemset/problem/${contestId}/${index}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to fetch the Codeforces statement page.");
  }

  const html = await response.text();
  const $ = load(html);
  const statement = $(".problem-statement").first().clone();

  statement.find("script, style").remove();

  if (!statement.length) {
    throw new Error("Unable to parse the Codeforces problem statement.");
  }

  return htmlToMarkdown(statement.html() ?? "");
}

export async function fetchCodeforcesProblem(query: string): Promise<FetchedProblem> {
  const { contestId, index } = parseCodeforcesQuery(query);
  const problems = await getProblemset();
  const problem = problems.find(
    (item) => item.contestId === contestId && item.index === index,
  );

  if (!problem) {
    throw new Error("That Codeforces problem could not be found.");
  }

  const topics = problem.tags.map(
    (tag) =>
      ({
        name: tag,
        slug: slugifyTitle(tag),
      }) satisfies TopicTag,
  );

  return {
    number: `${contestId}${index}`,
    title: problem.name,
    slug: slugifyTitle(problem.name),
    difficulty: mapDifficulty(problem.rating),
    topics,
    content: await fetchStatement(contestId, index),
    boilerplate: CP_BOILERPLATE,
  };
}
```

### `lib/leetcode.ts`

```typescript
import { LEETCODE_BOILERPLATE } from "@/lib/constants";
import { htmlToMarkdown, slugifyTitle } from "@/lib/markdown";
import type { Difficulty, FetchedProblem, TopicTag } from "@/types";

interface LeetCodeListItem {
  stat: {
    frontend_question_id: number;
    question__title: string;
    question__title_slug: string;
  };
}

let leetCodeListPromise: Promise<LeetCodeListItem[]> | null = null;

async function getLeetCodeProblemList() {
  if (!leetCodeListPromise) {
    leetCodeListPromise = fetch("https://leetcode.com/api/problems/all/", {
      headers: {
        Referer: "https://leetcode.com",
      },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch the LeetCode problem list.");
        }

        return response.json();
      })
      .then((payload) => payload.stat_status_pairs as LeetCodeListItem[]);
  }

  return leetCodeListPromise;
}

async function resolveLeetCodeSlug(query: string) {
  const trimmed = query.trim();
  const urlMatch = trimmed.match(/leetcode\.com\/problems\/([^/]+)/i);

  if (urlMatch) {
    return urlMatch[1];
  }

  if (/^\d+$/.test(trimmed)) {
    const list = await getLeetCodeProblemList();
    const match = list.find(
      (item) => String(item.stat.frontend_question_id) === trimmed,
    );

    if (match) {
      return match.stat.question__title_slug;
    }
  }

  const normalizedSlug = slugifyTitle(trimmed);
  const list = await getLeetCodeProblemList();
  const match = list.find(
    (item) =>
      item.stat.question__title_slug === normalizedSlug ||
      slugifyTitle(item.stat.question__title) === normalizedSlug,
  );

  return match?.stat.question__title_slug ?? normalizedSlug;
}

function normalizeDifficulty(value: string): Difficulty {
  const normalized = value.trim().toLowerCase();
  if (normalized === "hard") {
    return "hard";
  }
  if (normalized === "medium") {
    return "medium";
  }
  return "easy";
}

function extractBoilerplate(
  codeSnippets: Array<{ langSlug: string; code: string }>,
): FetchedProblem["boilerplate"] {
  const boilerplate = { ...LEETCODE_BOILERPLATE };

  for (const snippet of codeSnippets) {
    if (snippet.langSlug === "cpp") {
      boilerplate.cpp = snippet.code;
    }
    if (snippet.langSlug === "python3") {
      boilerplate.python = snippet.code;
    }
    if (snippet.langSlug === "java") {
      boilerplate.java = snippet.code;
    }
  }

  return boilerplate;
}

const PROBLEM_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      content
      difficulty
      topicTags { name slug }
      codeSnippets { langSlug code }
    }
  }
`;

export async function fetchLeetCodeProblem(query: string): Promise<FetchedProblem> {
  const titleSlug = await resolveLeetCodeSlug(query);
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query: PROBLEM_QUERY,
      variables: { titleSlug },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch the LeetCode problem.");
  }

  const payload = await response.json();
  const question = payload?.data?.question;

  if (!question?.content) {
    throw new Error("LeetCode problem content is unavailable.");
  }

  const topics = (question.topicTags ?? []).map(
    (tag: { name: string; slug: string }) =>
      ({
        name: tag.name,
        slug: tag.slug,
      }) satisfies TopicTag,
  );

  return {
    number: String(question.questionFrontendId),
    title: question.title,
    slug: question.titleSlug,
    difficulty: normalizeDifficulty(question.difficulty),
    topics,
    content: htmlToMarkdown(question.content),
    boilerplate: extractBoilerplate(question.codeSnippets ?? []),
  };
}
```

### `lib/github.ts`

```typescript
import { Octokit } from "@octokit/rest";
import { REPO_NAME } from "@/lib/constants";
import { parseProblemMarkdown } from "@/lib/markdown";
import type { ProblemIndex, RepoStats } from "@/types";

function createOctokit(token: string) {
  return new Octokit({
    auth: token,
  });
}

async function getRepoOwner(token: string) {
  const octokit = createOctokit(token);
  const { data } = await octokit.users.getAuthenticated();
  return data.login;
}

export async function getOrCreateRepo(token: string) {
  const octokit = createOctokit(token);
  const owner = await getRepoOwner(token);

  try {
    await octokit.repos.get({
      owner,
      repo: REPO_NAME,
    });

    return { owner, repo: REPO_NAME, created: false };
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status !== 404) {
      throw error;
    }

    await octokit.repos.createForAuthenticatedUser({
      name: REPO_NAME,
      private: true,
      auto_init: true,
      description: "Personal DSA practice history managed by Vault.",
    });

    return { owner, repo: REPO_NAME, created: true };
  }
}

export async function getFile(token: string, path: string) {
  const octokit = createOctokit(token);
  const owner = await getRepoOwner(token);

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo: REPO_NAME,
      path,
    });

    if (Array.isArray(response.data) || response.data.type !== "file") {
      return null;
    }

    return {
      content: Buffer.from(response.data.content, "base64").toString("utf8"),
      sha: response.data.sha,
    };
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }

    throw error;
  }
}

export async function saveFile(
  token: string,
  path: string,
  content: string,
  sha?: string,
) {
  const octokit = createOctokit(token);
  const owner = await getRepoOwner(token);

  return octokit.repos.createOrUpdateFileContents({
    owner,
    repo: REPO_NAME,
    path,
    message: `${sha ? "Update" : "Create"} ${path}`,
    content: Buffer.from(content, "utf8").toString("base64"),
    sha,
  });
}

export async function getIndex(token: string) {
  const file = await getFile(token, "index.json");

  if (!file) {
    return [] satisfies ProblemIndex[];
  }

  try {
    const parsed = JSON.parse(file.content) as ProblemIndex[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveIndex(token: string, index: ProblemIndex[]) {
  const existing = await getFile(token, "index.json");
  const sorted = [...index].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  await saveFile(
    token,
    "index.json",
    `${JSON.stringify(sorted, null, 2)}\n`,
    existing?.sha,
  );
}

export async function getProblemFile(token: string, filePath: string) {
  const file = await getFile(token, filePath);

  if (!file) {
    return null;
  }

  return parseProblemMarkdown(file.content, filePath);
}

export async function listRepoStats(token: string): Promise<RepoStats> {
  const octokit = createOctokit(token);
  const owner = await getRepoOwner(token);
  const index = await getIndex(token);
  const repo = await octokit.repos.get({
    owner,
    repo: REPO_NAME,
  });

  const tree = await octokit.git.getTree({
    owner,
    repo: REPO_NAME,
    tree_sha: repo.data.default_branch,
    recursive: "true",
  });

  const markdownFiles = tree.data.tree.filter(
    (item) => item.type === "blob" && item.path?.endsWith(".md"),
  );
  const sortedDates = [...index]
    .map((item) => item.latest_date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return {
    totalFiles: markdownFiles.length,
    firstSolveDate: sortedDates[0] ?? null,
    latestSolveDate: sortedDates.at(-1) ?? null,
  };
}
```

### `lib/stats.ts`

```typescript
import type { ProblemIndex } from "@/types";

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toDateKey(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  const normalized = normalizeDate(date);
  return normalized.toISOString().slice(0, 10);
}

export function getRecentProblems(index: ProblemIndex[], limit = 6) {
  return [...index]
    .sort(
      (a, b) =>
        new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime(),
    )
    .slice(0, limit);
}

export function computeCurrentStreak(index: ProblemIndex[]) {
  if (!index.length) {
    return 0;
  }

  const solvedDates = new Set(index.map((item) => toDateKey(item.latest_date)));
  let streak = 0;
  const cursor = normalizeDate(new Date());

  while (solvedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function computeBestStreak(index: ProblemIndex[]) {
  if (!index.length) {
    return 0;
  }

  const solvedDates = Array.from(
    new Set(index.map((item) => toDateKey(item.latest_date))),
  ).sort();

  let best = 1;
  let current = 1;

  for (let i = 1; i < solvedDates.length; i += 1) {
    const previous = new Date(solvedDates[i - 1]);
    const currentDate = new Date(solvedDates[i]);
    previous.setDate(previous.getDate() + 1);

    if (toDateKey(previous) === toDateKey(currentDate)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

export function computeDashboardStats(index: ProblemIndex[]) {
  const now = normalizeDate(new Date());
  const weekAgo = normalizeDate(new Date(now));
  weekAgo.setDate(now.getDate() - 6);

  return {
    totalSolved: index.length,
    thisWeek: index.filter((item) => {
      const date = normalizeDate(new Date(item.latest_date));
      return date >= weekAgo && date <= now;
    }).length,
    currentStreak: computeCurrentStreak(index),
    optimal: index.filter((item) => item.latest_approach === "Optimal").length,
  };
}

export function computeDifficultyBreakdown(index: ProblemIndex[]) {
  return {
    easy: index.filter((item) => item.difficulty === "easy").length,
    medium: index.filter((item) => item.difficulty === "medium").length,
    hard: index.filter((item) => item.difficulty === "hard").length,
  };
}

export function computePlatformBreakdown(index: ProblemIndex[]) {
  return index.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.platform] = (accumulator[item.platform] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function buildHeatmap(index: ProblemIndex[]) {
  const end = normalizeDate(new Date());
  const start = normalizeDate(new Date(end));
  start.setDate(end.getDate() - 364);

  const counts = index.reduce<Record<string, number>>((accumulator, item) => {
    const key = toDateKey(item.latest_date);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  return Array.from({ length: 365 }, (_, offset) => {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    const key = toDateKey(date);

    return {
      date: key,
      count: counts[key] ?? 0,
    };
  });
}

export function formatRelativeDate(dateString: string) {
  const today = normalizeDate(new Date());
  const target = normalizeDate(new Date(dateString));
  const diffInDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays <= 0) {
    return "Today";
  }

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
```

### `lib/sheets.ts`

```typescript
export const SHEETS = {
  "neetcode-150": { label: "NeetCode 150", provider: "NeetCode" },
  "neetcode-roadmap": { label: "NeetCode Roadmap", provider: "NeetCode" },
  "blind-75": { label: "Blind 75", provider: "Community" },
  "strivers-sde": { label: "Striver's SDE Sheet", provider: "Striver" },
  "strivers-a2z": { label: "Striver's A2Z DSA Sheet", provider: "Striver" },
  "strivers-cp": { label: "Striver's CP Sheet", provider: "Striver" },
} as const;
```

### `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 4. Layout and Root Page

### `app/layout.tsx` (root layout)

```typescript
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Vault",
  description: "A personal DSA practice tracker backed by your own GitHub.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans text-foreground`}
      >
        <TooltipProvider delay={150}>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "border border-border bg-card text-foreground !animate-[toast-slide-in_200ms_ease-out]",
                title: "text-foreground",
                description: "text-muted-foreground",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
```

### Root page — `app/(auth)/page.tsx` (serves `/`)

There is no `app/page.tsx`. The login/landing page is:

```typescript
import { redirect } from "next/navigation";
import { BrainCircuit, Repeat2, Vault } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { LoginButton } from "@/components/login-button";
import { auth } from "@/lib/auth";

const features = [
  {
    icon: Vault,
    title: "GitHub Auto-Sync",
    description:
      "Automatically push your solutions and keep every attempt inside your own repository.",
  },
  {
    icon: BrainCircuit,
    title: "AI Complexity Analysis",
    description:
      "Get precise feedback on time complexity, bottlenecks, and better patterns.",
  },
  {
    icon: Repeat2,
    title: "Attempt History",
    description:
      "Track every revision from brute force to optimal without losing your thinking trail.",
  },
];

export default async function LoginPage() {
  const session = await auth();

  if (session?.accessToken) {
    redirect("/dashboard");
  }

  return (
    <main className="page-enter min-h-screen bg-background text-foreground md:flex">
      <section className="relative flex w-full flex-col justify-between overflow-hidden border-b border-border bg-vault-surface px-8 py-8 md:w-[55%] md:border-b-0 md:border-r md:px-16 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(229,255,93,0.06),transparent_55%)]"
        />
        <div className="relative">
          <AppLogo size="md" />
        </div>

        <div className="relative my-auto max-w-lg space-y-12 py-16 md:py-0">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-[40px]">
            Your DSA practice,
            <br />
            properly organised.
          </h1>

          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group flex items-start gap-4">
                  <div className="rounded-md border border-border bg-vault-raised p-2.5 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-px">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h2 className="text-card-title">{feature.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-micro-label">Own the repo. Own the history.</p>
      </section>

      <section className="flex w-full items-center justify-center px-8 py-16 md:w-[45%] md:px-16">
        <div className="surface-card relative w-full max-w-md overflow-hidden p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-vault-brand/60" />
          <div className="mb-8">
            <p className="text-micro-label">GitHub OAuth</p>
            <h2 className="text-page-title mt-3">Log into Vault</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in with GitHub to fetch problems, analyze attempts, and save
              everything directly into your own
              {" "}
              <span className="text-foreground">Data Structures &amp; Algorithms</span>
              {" "}
              repository.
            </p>
          </div>

          <div className="rounded-md border border-border bg-vault-bg p-4">
            <LoginButton />
          </div>
        </div>
      </section>
    </main>
  );
}
```

---

## 5. Environment Variables

### Referenced in code (`process.env`)

| Variable | File(s) | Purpose |
|---|---|---|
| `NEXTAUTH_SECRET` | `lib/auth.ts` | NextAuth session encryption |
| `GITHUB_CLIENT_ID` | `lib/auth.ts` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | `lib/auth.ts` | GitHub OAuth client secret |
| `ANTHROPIC_API_KEY` | `lib/claude.ts` | Claude API for solution analysis |

### In `.env.example` (not directly referenced in code)

| Variable | Notes |
|---|---|
| `NEXTAUTH_URL` | Standard NextAuth env; consumed by NextAuth at runtime |

### `auth()` call sites (14 locations)

All use `import { auth } from "@/lib/auth"` and check `session?.accessToken` for authorization.

| File | Context |
|---|---|
| `app/(auth)/page.tsx` | Redirect to `/dashboard` if authenticated |
| `app/(app)/layout.tsx` | App shell auth gate |
| `app/(app)/dashboard/page.tsx` | Dashboard data fetch |
| `app/(app)/add/page.tsx` | Add problem page |
| `app/(app)/library/page.tsx` | Library list |
| `app/(app)/library/[id]/page.tsx` | Problem detail |
| `app/(app)/profile/page.tsx` | Profile page |
| `app/api/problems/fetch/route.ts` | POST fetch |
| `app/api/problems/list/route.ts` | GET list |
| `app/api/problems/save/route.ts` | POST save |
| `app/api/problems/[id]/route.ts` | GET by id |
| `app/api/ai/analyze/route.ts` | POST analyze |
| `app/api/ai/hint/route.ts` | POST hint |

---

## 6. API Routes under `/app/api`

| File Path | HTTP Methods | Description |
|---|---|---|
| `app/api/auth/[...nextauth]/route.ts` | **GET**, **POST** | NextAuth handlers (OAuth, session) |
| `app/api/problems/fetch/route.ts` | **POST** | Fetch problem from LeetCode/Codeforces/CodeChef |
| `app/api/problems/list/route.ts` | **GET** | Return `{ index: ProblemIndex[] }` from GitHub |
| `app/api/problems/save/route.ts` | **POST** | Save attempt or update analysis to GitHub |
| `app/api/problems/[id]/route.ts` | **GET** | Return full problem + statement by id |
| `app/api/ai/analyze/route.ts` | **POST** | Run Claude analysis on submitted code |
| `app/api/ai/hint/route.ts` | **POST** | Return hint level from existing analysis |

All API routes except NextAuth require `session.accessToken` (401 if missing).

---

## 7. Dashboard Components

There is no `components/dashboard/` folder. The dashboard page (`app/(app)/dashboard/page.tsx`) composes shared components plus inline stat cards.

### Components used on Dashboard

#### `PageHeader` — `components/page-header.tsx`

| Prop | Type | Required | Used on Dashboard |
|---|---|---|---|
| `title` | `string` | No | `"Dashboard"` |
| `subtitle` | `string` | No | Greeting from session name |
| `streak` | `number` | No | Current streak |
| `breadcrumb` | `React.ReactNode` | No | — |
| `actions` | `React.ReactNode` | No | — |
| `className` | `string` | No | — |

When `streak` is set and `actions` is omitted, renders `StreakBadge`.

#### `StreakBadge` — `components/streak-badge.tsx`

| Prop | Type | Required | Used on Dashboard |
|---|---|---|---|
| `streak` | `number` | Yes | Via `PageHeader` |
| `className` | `string` | No | — |

#### `AnimatedMain` — `components/animated-main.tsx`

| Prop | Type | Required | Used on Dashboard |
|---|---|---|---|
| `children` | `React.ReactNode` | Yes | Page content |
| `className` | `string` | No | `"mx-auto max-w-6xl p-container-padding"` |
| `grid` | `boolean` | No | Default `false` |

#### `MiniActivityStrip` — `components/mini-activity-strip.tsx`

| Prop | Type | Required | Used on Dashboard |
|---|---|---|---|
| `days` | `Array<{ date: string; count: number }>` | Yes | Last 28 days of `buildHeatmap(index)` |

Client component. Shows 4-week grid + solve count.

#### `EmptyState` — `components/empty-state.tsx`

| Prop | Type | Required | Used on Dashboard |
|---|---|---|---|
| `description` | `string` | Yes | No-attempts message |
| `title` | `string` | No | — |
| `action` | `React.ReactNode` | No | — |
| `actionHref` | `string` | No | `"/add"` |
| `actionLabel` | `string` | No | `"Add your first problem"` |
| `className` | `string` | No | — |

### Inline dashboard UI (not separate components)

The dashboard page defines stat cards inline (not extracted):

- **Stat cards** (4): Total Solved, This Week, Streak, Optimal — from `computeDashboardStats(index)`
- **Recent Activity list**: maps `getRecentProblems(index, 6)` → links to `/library/[id]` with platform/difficulty/approach badges

### Related stats components (not on Dashboard, used on Profile)

#### `ActivityHeatmap` — `components/activity-heatmap.tsx`

| Prop | Type | Required |
|---|---|---|
| `days` | `Array<{ date: string; count: number }>` | Yes |

Full 365-day heatmap (Profile page only).

### Dashboard data flow summary

```
auth() → session.accessToken
  → getIndex(accessToken) → ProblemIndex[]
  → computeDashboardStats(index)   → { totalSolved, thisWeek, currentStreak, optimal }
  → getRecentProblems(index, 6)    → ProblemIndex[]
  → computeCurrentStreak(index)    → number (for header)
  → buildHeatmap(index)            → { date, count }[] (365 days)
```

### Loading state

`app/(app)/dashboard/loading.tsx` uses `PageHeader` + `Skeleton` placeholders mirroring the 4 stat cards, mini activity strip, and recent activity list. Does not use the live dashboard components.

---

## Quick Reference — App Architecture

| Layer | Role |
|---|---|
| **Auth** | GitHub OAuth via NextAuth; `accessToken` stored in session for Octokit |
| **Storage** | Private GitHub repo `"Data Structures & Algorithms"` — markdown files + `index.json` |
| **Platforms** | LeetCode (GraphQL), Codeforces (API + scrape), CodeChef (scrape) |
| **AI** | Anthropic Claude for code analysis + hint ladder |
| **Routes** | `(auth)/` = public login; `(app)/` = authenticated app with sidebar layout |
