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
