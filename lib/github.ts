import { Octokit } from "@octokit/rest";
import { REPO_DESCRIPTION, REPO_NAME } from "@/lib/constants";
import { buildProblemId, parseProblemMarkdown } from "@/lib/markdown";
import type {
  ApproachType,
  Difficulty,
  Language,
  Platform,
  ProblemIndex,
  RepoStats,
} from "@/types";

const GITHUB_API = "https://api.github.com";

interface GitHubContentResponse {
  content?: string;
  encoding?: string;
}

function normalizeDifficulty(value: unknown): Difficulty {
  const raw = String(value ?? "easy").toLowerCase();
  if (raw === "medium") return "medium";
  if (raw === "hard") return "hard";
  return "easy";
}

function normalizePlatform(value: unknown): Platform {
  const raw = String(value ?? "leetcode").toLowerCase();
  if (raw === "codeforces") return "codeforces";
  if (raw === "codechef") return "codechef";
  if (raw === "gfg") return "gfg";
  return "leetcode";
}

function normalizeApproach(value: unknown): ApproachType | null {
  if (value === "Brute Force" || value === "Optimized" || value === "Optimal") {
    return value;
  }
  return null;
}

function normalizeLanguage(value: unknown): Language {
  const raw = String(value ?? "python").toLowerCase();
  if (raw === "cpp") return "cpp";
  if (raw === "java") return "java";
  return "python";
}

function normalizeIndexEntry(raw: Record<string, unknown>): ProblemIndex {
  const platform = normalizePlatform(raw.platform);
  const number = String(raw.number ?? "");
  const filePath = String(raw.filePath ?? raw.file_path ?? "");
  const latestDate = String(raw.latestDate ?? raw.latest_date ?? "");
  const attemptCount = Number(raw.attempts ?? raw.attempt_count ?? 0);
  const id =
    typeof raw.id === "string"
      ? raw.id
      : buildProblemId(platform, number);

  return {
    id,
    number,
    title: String(raw.title ?? ""),
    platform,
    difficulty: normalizeDifficulty(raw.difficulty),
    topics: Array.isArray(raw.topics) ? raw.topics.map(String) : [],
    sheets: Array.isArray(raw.sheets)
      ? (raw.sheets as ProblemIndex["sheets"])
      : [],
    attempt_count: Number.isFinite(attemptCount) ? attemptCount : 0,
    latest_approach: normalizeApproach(raw.latestApproach ?? raw.latest_approach),
    latest_date: latestDate,
    latest_language: normalizeLanguage(raw.language ?? raw.latest_language),
    file_path: filePath,
    approach_verified:
      typeof raw.approachVerified === "boolean"
        ? raw.approachVerified
        : typeof raw.approach_verified === "boolean"
          ? raw.approach_verified
          : undefined,
  };
}

export async function getPublicIndex(
  username: string,
): Promise<ProblemIndex[] | null> {
  const encodedOwner = encodeURIComponent(username);
  const url = `${GITHUB_API}/repos/${encodedOwner}/${encodeURIComponent(REPO_NAME)}/contents/index.json`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch public index for ${username}`);
  }

  return await parsePublicIndexResponse(response);
}

async function parsePublicIndexResponse(
  response: Response,
): Promise<ProblemIndex[] | null> {

  const data = (await response.json()) as GitHubContentResponse;

  if (!data.content) {
    return null;
  }

  try {
    const decoded = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString(
      "utf8",
    );
    const parsed = JSON.parse(decoded) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((entry) =>
      normalizeIndexEntry(entry as Record<string, unknown>),
    );
  } catch {
    return [];
  }
}

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
    if ((error as { status?: number }).status !== 404) {
      throw error;
    }
  }

  await octokit.repos.createForAuthenticatedUser({
    name: REPO_NAME,
    private: true,
    auto_init: true,
    description: REPO_DESCRIPTION,
  });

  return { owner, repo: REPO_NAME, created: true };
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
    const parsed = JSON.parse(file.content) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((entry) =>
      normalizeIndexEntry(entry as Record<string, unknown>),
    );
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

  try {
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
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return {
        totalFiles: 0,
        firstSolveDate: null,
        latestSolveDate: null,
      };
    }

    throw error;
  }
}
