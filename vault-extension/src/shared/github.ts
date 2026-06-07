import type { CapturedProblem, IndexEntry } from "./types";

const REPO_NAME = "Data-Structures-And-Algorithms";
const REPO_DESCRIPTION = "Personal DSA practice history managed by Vault.";
const API_BASE = "https://api.github.com";

interface VaultRepoContext {
  username: string;
  repoName: string;
}

interface GitHubFileContent {
  content: string;
  sha: string;
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function toBase64(content: string): string {
  const bytes = new TextEncoder().encode(content);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlScalar(value: number | string): string {
  return typeof value === "number" ? String(value) : yamlString(value);
}

function formatTopicsYaml(topics: string[]): string {
  if (topics.length === 0) {
    return "topics: []";
  }
  return `topics: [${topics.map((topic) => yamlString(topic)).join(", ")}]`;
}

function formatAttemptDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildTopicSlug(topics: string[]): string {
  const primaryTopic = topics[0] ?? "miscellaneous";
  return primaryTopic
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function buildFilePath(problem: CapturedProblem): string {
  const topicSlug = buildTopicSlug(problem.topics);
  const paddedNumber = String(problem.number).padStart(4, "0");
  return `${problem.platform}/${topicSlug}/${paddedNumber}-${problem.titleSlug}.md`;
}

function buildAttemptSection(
  problem: CapturedProblem,
  attemptNumber: number,
  solvedAt: string,
): string {
  return [
    "",
    `## Attempt ${attemptNumber} — ${formatAttemptDate(solvedAt)}`,
    "",
    `**Language:** ${problem.language}`,
    "**Approach:** Brute Force",
    "**Time Complexity:** TBD",
    "**Space Complexity:** TBD",
    "",
    `\`\`\`${problem.language}`,
    problem.code.trim(),
    "```",
    "",
    "---",
    "",
  ].join("\n");
}

function buildNewProblemMarkdown(
  problem: CapturedProblem,
  solvedAt: string,
  attemptNumber: number,
): string {
  const frontmatter = [
    "---",
    `number: ${yamlScalar(problem.number)}`,
    `title: ${yamlString(problem.title)}`,
    `titleSlug: ${yamlString(problem.titleSlug)}`,
    `platform: ${yamlString(problem.platform)}`,
    `difficulty: ${yamlString(problem.difficulty)}`,
    formatTopicsYaml(problem.topics),
    "sheets: []",
    `language: ${yamlString(problem.language)}`,
    `latestApproach: ${yamlString("Brute Force")}`,
    `attempts: ${attemptNumber}`,
    `firstSolvedDate: ${yamlString(solvedAt)}`,
    `lastSolvedDate: ${yamlString(solvedAt)}`,
    "---",
  ].join("\n");

  const body = [
    "",
    `# ${problem.number}. ${problem.title}`,
    "",
    `**Platform:** ${problem.platform}`,
    `**Difficulty:** ${problem.difficulty}`,
    `**Topics:** ${problem.topics.join(", ") || "Uncategorized"}`,
    "",
    "---",
    buildAttemptSection(problem, attemptNumber, solvedAt).trimEnd(),
  ].join("\n");

  return `${frontmatter}${body}`;
}

function splitMarkdown(content: string): { frontmatter: string; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Unable to parse existing markdown frontmatter.");
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function updateFrontmatterField(
  frontmatter: string,
  key: string,
  value: string | number,
): string {
  const line =
    typeof value === "number"
      ? `${key}: ${value}`
      : `${key}: ${yamlString(value)}`;
  const pattern = new RegExp(`^${key}:.*$`, "m");

  if (pattern.test(frontmatter)) {
    return frontmatter.replace(pattern, line);
  }

  return `${frontmatter}\n${line}`;
}

function appendAttemptToMarkdown(
  existingContent: string,
  problem: CapturedProblem,
  attemptNumber: number,
  solvedAt: string,
): string {
  const { frontmatter, body } = splitMarkdown(existingContent);

  let nextFrontmatter = frontmatter;
  nextFrontmatter = updateFrontmatterField(nextFrontmatter, "attempts", attemptNumber);
  nextFrontmatter = updateFrontmatterField(nextFrontmatter, "lastSolvedDate", solvedAt);
  nextFrontmatter = updateFrontmatterField(nextFrontmatter, "latestApproach", "Brute Force");
  nextFrontmatter = updateFrontmatterField(nextFrontmatter, "language", problem.language);

  const trimmedBody = body.trimEnd();
  const attemptSection = buildAttemptSection(problem, attemptNumber, solvedAt);

  return `---\n${nextFrontmatter}\n---\n${trimmedBody}${attemptSection}`;
}

function toIndexEntry(
  problem: CapturedProblem,
  filePath: string,
  attempts: number,
  latestDate: string,
): IndexEntry {
  return {
    number: problem.number,
    title: problem.title,
    titleSlug: problem.titleSlug,
    platform: problem.platform,
    difficulty: problem.difficulty,
    topics: problem.topics,
    sheets: [],
    attempts,
    latestApproach: "Brute Force",
    latestDate,
    filePath,
    language: problem.language,
  };
}

async function githubRequest<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<{ data: T; status: number }> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : `GitHub API error: ${response.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return { data, status: response.status };
}

export async function getAuthenticatedUser(token: string): Promise<string> {
  const { data } = await githubRequest<{ login?: string }>("/user", token);
  if (!data.login) {
    throw new Error("Unable to resolve GitHub username.");
  }
  return data.login;
}

async function ensureRepo(token: string): Promise<VaultRepoContext> {
  const username = await getAuthenticatedUser(token);
  const encodedOwner = encodeURIComponent(username);
  const encodedRepo = encodeURIComponent(REPO_NAME);

  try {
    await githubRequest(`/repos/${encodedOwner}/${encodedRepo}`, token);
    return { username, repoName: REPO_NAME };
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status !== 404) {
      throw error;
    }
  }

  try {
    await githubRequest("/user/repos", token, {
      method: "POST",
      body: JSON.stringify({
        name: REPO_NAME,
        private: true,
        auto_init: true,
        description: REPO_DESCRIPTION,
      }),
    });
  } catch (createError) {
    const createStatus = (createError as { status?: number }).status;
    if (createStatus === 422) {
      await githubRequest(`/repos/${encodedOwner}/${encodedRepo}`, token);
      return { username, repoName: REPO_NAME };
    }
    throw createError;
  }

  return { username, repoName: REPO_NAME };
}

async function getFile(
  token: string,
  username: string,
  repoName: string,
  path: string,
): Promise<GitHubFileContent | null> {
  const encodedOwner = encodeURIComponent(username);
  const encodedRepo = encodeURIComponent(repoName);

  try {
    const { data } = await githubRequest<{
      content?: string;
      sha?: string;
      type?: string;
    }>(`/repos/${encodedOwner}/${encodedRepo}/contents/${encodePath(path)}`, token);

    if (!data.content || !data.sha || data.type !== "file") {
      return null;
    }

    return {
      content: fromBase64(data.content),
      sha: data.sha,
    };
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function saveFile(
  token: string,
  username: string,
  repoName: string,
  path: string,
  content: string,
  sha?: string,
): Promise<void> {
  const encodedOwner = encodeURIComponent(username);
  const encodedRepo = encodeURIComponent(repoName);

  await githubRequest(`/repos/${encodedOwner}/${encodedRepo}/contents/${encodePath(path)}`, token, {
    method: "PUT",
    body: JSON.stringify({
      message: `${sha ? "Update" : "Create"} ${path}`,
      content: toBase64(content),
      ...(sha ? { sha } : {}),
    }),
  });
}

async function getIndex(
  token: string,
  username: string,
  repoName: string,
): Promise<IndexEntry[]> {
  const file = await getFile(token, username, repoName, "index.json");
  if (!file) {
    return [];
  }

  try {
    const parsed = JSON.parse(file.content) as IndexEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveIndex(
  token: string,
  username: string,
  repoName: string,
  index: IndexEntry[],
): Promise<void> {
  const existing = await getFile(token, username, repoName, "index.json");
  const sorted = [...index].sort((a, b) => a.title.localeCompare(b.title));

  await saveFile(
    token,
    username,
    repoName,
    "index.json",
    `${JSON.stringify(sorted, null, 2)}\n`,
    existing?.sha,
  );
}

export async function saveProblemToGitHub(
  problem: CapturedProblem,
  githubToken: string,
): Promise<{ success: boolean; message: string; username?: string }> {
  try {
    const { username, repoName } = await ensureRepo(githubToken);

    const solvedAt = problem.submittedAt || new Date().toISOString();
    const filePath = buildFilePath(problem);
    const index = await getIndex(githubToken, username, repoName);

    const existingEntry = index.find(
      (entry) =>
        entry.titleSlug === problem.titleSlug && entry.platform === problem.platform,
    );

    if (existingEntry) {
      const attemptNumber = existingEntry.attempts + 1;
      const targetPath = existingEntry.filePath || filePath;
      const existingFile = await getFile(githubToken, username, repoName, targetPath);

      const markdown = existingFile
        ? appendAttemptToMarkdown(existingFile.content, problem, attemptNumber, solvedAt)
        : buildNewProblemMarkdown(problem, solvedAt, attemptNumber);

      await saveFile(
        githubToken,
        username,
        repoName,
        targetPath,
        markdown,
        existingFile?.sha,
      );

      const updatedEntry = toIndexEntry(
        problem,
        targetPath,
        attemptNumber,
        solvedAt,
      );
      updatedEntry.topics = existingEntry.topics.length
        ? existingEntry.topics
        : problem.topics;

      const nextIndex = index.map((entry) =>
        entry.titleSlug === problem.titleSlug && entry.platform === problem.platform
          ? updatedEntry
          : entry,
      );

      await saveIndex(githubToken, username, repoName, nextIndex);

      return {
        success: true,
        message: `Saved attempt ${attemptNumber} for ${problem.title}`,
        username,
      };
    }

    const markdown = buildNewProblemMarkdown(problem, solvedAt, 1);
    await saveFile(githubToken, username, repoName, filePath, markdown);

    const nextIndex = [...index, toIndexEntry(problem, filePath, 1, solvedAt)];
    await saveIndex(githubToken, username, repoName, nextIndex);

    return {
      success: true,
      message: `Saved ${problem.title} to Vault`,
      username,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to save the problem to GitHub.",
    };
  }
}
