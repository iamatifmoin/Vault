import matter from "gray-matter";
import TurndownService from "turndown";
import { DIFFICULTY_LABELS, LANGUAGE_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import type {
  AIAnalysis,
  Attempt,
  Difficulty,
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

function normalizeDifficulty(value: unknown): Difficulty {
  const raw = String(value ?? "easy").toLowerCase();
  if (raw === "medium") {
    return "medium";
  }
  if (raw === "hard") {
    return "hard";
  }
  return "easy";
}

function normalizePlatform(value: unknown): Platform {
  const raw = String(value ?? "leetcode").toLowerCase();
  if (raw === "codeforces") {
    return "codeforces";
  }
  if (raw === "codechef") {
    return "codechef";
  }
  if (raw === "gfg") {
    return "gfg";
  }
  return "leetcode";
}

function normalizeApproach(value: string): Attempt["approach"] {
  const trimmed = value.trim();
  if (trimmed === "Optimized" || trimmed === "Optimal") {
    return trimmed;
  }
  return "Brute Force";
}

function parseExtensionDate(value: string) {
  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/);

  if (isoMatch) {
    return isoMatch[0];
  }

  const parsed = new Date(trimmed);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return trimmed;
}

function isVaultAppMarkdown(content: string) {
  return (
    content.includes("## Problem Statement") && content.includes("## Attempts")
  );
}

function parseExtensionAttempts(content: string) {
  const sections = content
    .split(/\n(?=## Attempt \d+ [—-] )/)
    .map((section) => section.trim())
    .filter((section) => /^## Attempt \d+ [—-] /m.test(section));

  if (!sections.length) {
    throw new Error("Unable to parse the saved markdown structure.");
  }

  return sections.map<Attempt>((section) => {
    const headingMatch = section.match(/^## Attempt (\d+) [—-] (.+)$/m);
    const languageLine = section.match(/\*\*Language:\*\* ([^\n]+)/m);
    const approachLine = section.match(/\*\*Approach:\*\* ([^\n]+)/m);
    const timeLine = section.match(/\*\*Time Complexity:\*\* ([^\n]+)/m);
    const spaceLine = section.match(/\*\*Space Complexity:\*\* ([^\n]+)/m);
    const codeMatch = section.match(/```(\w+)\n([\s\S]*?)```/m);

    if (!headingMatch || !languageLine || !codeMatch) {
      throw new Error("Unable to parse attempt from markdown file.");
    }

    return {
      number: Number(headingMatch[1]),
      date: parseExtensionDate(headingMatch[2]),
      language: normalizeLanguage(languageLine[1]),
      code: codeMatch[2].trimEnd(),
      approach: normalizeApproach(approachLine?.[1] ?? "Brute Force"),
      time_complexity: timeLine?.[1]?.trim() ?? "TBD",
      space_complexity: spaceLine?.[1]?.trim() ?? "TBD",
      analysis: null,
    };
  });
}

function parseExtensionProblemMarkdown(
  parsed: ReturnType<typeof matter>,
  filePath: string,
) {
  const data = parsed.data as Record<string, unknown>;
  const attempts = parseExtensionAttempts(parsed.content);
  const platform = normalizePlatform(data.platform);
  const number = String(data.number ?? "");
  const id =
    typeof data.id === "string" && data.id
      ? data.id
      : buildProblemId(platform, number);
  const dateCreated = data.firstSolvedDate
    ? parseExtensionDate(String(data.firstSolvedDate))
    : (attempts[0]?.date ?? new Date().toISOString().slice(0, 10));

  const problem: Problem = {
    id,
    number,
    title: String(data.title ?? ""),
    platform,
    difficulty: normalizeDifficulty(data.difficulty),
    topics: Array.isArray(data.topics) ? data.topics.map(String) : [],
    sheets: Array.isArray(data.sheets)
      ? data.sheets.map((item) => String(item) as Problem["sheets"][number])
      : [],
    attempts,
    file_path: filePath,
    date_created: dateCreated,
  };

  return {
    problem,
    problemStatement: "",
  };
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

  if (!isVaultAppMarkdown(parsed.content)) {
    return parseExtensionProblemMarkdown(parsed, filePath);
  }

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
