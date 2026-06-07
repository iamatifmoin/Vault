import { toDateKey } from "@/lib/stats";
import type { GitHubContributionActivity, GitHubContributionKind } from "@/types";

const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const HEATMAP_LOOKBACK_DAYS = 364;
const PAGE_SIZE = 100;
const MAX_PAGES = 25;

export interface GitHubContributionsData {
  calendar: Record<string, number>;
  detailsByDay: Record<string, GitHubContributionActivity[]>;
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

function getContributionDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - HEATMAP_LOOKBACK_DAYS);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

async function githubGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  token?: string,
): Promise<T | null> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GraphqlResponse<T>;

  if (payload.errors?.length || !payload.data) {
    return null;
  }

  return payload.data;
}

function repoLabel(owner: string, name: string) {
  return `${owner}/${name}`;
}

function appendContribution(
  detailsByDay: Record<string, GitHubContributionActivity[]>,
  dateKey: string,
  item: GitHubContributionActivity,
) {
  if (!detailsByDay[dateKey]) {
    detailsByDay[dateKey] = [];
  }

  const existing = detailsByDay[dateKey].find((entry) => entry.id === item.id);
  if (existing && item.kind === "commit" && existing.kind === "commit") {
    existing.count += item.count;
    return;
  }

  if (!existing) {
    detailsByDay[dateKey].push(item);
  }
}

async function fetchContributionCalendar(
  username: string,
  from: string,
  to: string,
  token?: string,
): Promise<Record<string, number>> {
  const data = await githubGraphql<{
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
            }>;
          }>;
        };
      } | null;
    } | null;
  }>(
    `
      query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `,
    { login: username, from, to },
    token,
  );

  const calendar: Record<string, number> = {};
  const weeks =
    data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        calendar[day.date] = day.contributionCount;
      }
    }
  }

  return calendar;
}

async function paginateContributionNodes<
  T extends { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: unknown[] },
>(
  username: string,
  from: string,
  to: string,
  field: string,
  nodeQuery: string,
  token: string | undefined,
  onNodes: (nodes: unknown[]) => void,
) {
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await githubGraphql<{
      user: {
        contributionsCollection: Record<string, T> | null;
      } | null;
    }>(
      `
        query ContributionPage(
          $login: String!
          $from: DateTime!
          $to: DateTime!
          $cursor: String
        ) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              ${field}(first: ${PAGE_SIZE}, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  ${nodeQuery}
                }
              }
            }
          }
        }
      `,
      { login: username, from, to, cursor },
      token,
    );

    const connection = data?.user?.contributionsCollection?.[field];
    if (!connection?.nodes?.length) {
      break;
    }

    onNodes(connection.nodes);

    if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor) {
      break;
    }

    cursor = connection.pageInfo.endCursor;
  }
}

function sortDayContributions(detailsByDay: Record<string, GitHubContributionActivity[]>) {
  for (const items of Object.values(detailsByDay)) {
    items.sort((a, b) => {
      const kindOrder: Record<GitHubContributionKind, number> = {
        commit: 0,
        pull_request: 1,
        review: 2,
        issue: 3,
      };
      const kindDiff = kindOrder[a.kind] - kindOrder[b.kind];
      if (kindDiff !== 0) {
        return kindDiff;
      }
      return a.label.localeCompare(b.label);
    });
  }
}

export function hasGitHubActivity(github?: GitHubContributionsData | null) {
  if (!github) {
    return false;
  }

  return Object.values(github.calendar).some((count) => count > 0);
}

export async function getGitHubContributions(
  username: string,
  token?: string,
): Promise<GitHubContributionsData> {
  const { from, to } = getContributionDateRange();
  const calendar = await fetchContributionCalendar(username, from, to, token);
  const detailsByDay: Record<string, GitHubContributionActivity[]> = {};

  await paginateContributionNodes(
    username,
    from,
    to,
    "commitContributions",
    `
      occurredAt
      commitCount
      repository {
        name
        url
        owner { login }
      }
    `,
    token,
    (nodes) => {
      for (const raw of nodes as Array<{
        occurredAt: string;
        commitCount: number;
        repository: { name: string; url: string; owner: { login: string } };
      }>) {
        const dateKey = toDateKey(raw.occurredAt);
        const owner = raw.repository.owner.login;
        const name = raw.repository.name;
        const key = `${dateKey}:commit:${owner}/${name}`;
        const item: GitHubContributionActivity = {
          id: key,
          kind: "commit",
          label: `${raw.commitCount} commit${raw.commitCount === 1 ? "" : "s"}`,
          repository: repoLabel(owner, name),
          repositoryUrl: raw.repository.url,
          count: raw.commitCount,
          url: raw.repository.url,
        };
        appendContribution(detailsByDay, dateKey, item);
      }
    },
  );

  await paginateContributionNodes(
    username,
    from,
    to,
    "pullRequestContributions",
    `
      occurredAt
      pullRequest {
        title
        url
      }
      repository {
        name
        url
        owner { login }
      }
    `,
    token,
    (nodes) => {
      for (const raw of nodes as Array<{
        occurredAt: string;
        pullRequest: { title: string; url: string };
        repository: { name: string; url: string; owner: { login: string } };
      }>) {
        const dateKey = toDateKey(raw.occurredAt);
        const owner = raw.repository.owner.login;
        const name = raw.repository.name;
        const key = `${dateKey}:pr:${raw.pullRequest.url}`;
        appendContribution(detailsByDay, dateKey, {
          id: key,
          kind: "pull_request",
          label: raw.pullRequest.title,
          repository: repoLabel(owner, name),
          repositoryUrl: raw.repository.url,
          count: 1,
          url: raw.pullRequest.url,
        });
      }
    },
  );

  await paginateContributionNodes(
    username,
    from,
    to,
    "pullRequestReviewContributions",
    `
      occurredAt
      pullRequest {
        title
        url
      }
      repository {
        name
        url
        owner { login }
      }
    `,
    token,
    (nodes) => {
      for (const raw of nodes as Array<{
        occurredAt: string;
        pullRequest: { title: string; url: string };
        repository: { name: string; url: string; owner: { login: string } };
      }>) {
        const dateKey = toDateKey(raw.occurredAt);
        const owner = raw.repository.owner.login;
        const name = raw.repository.name;
        const key = `${dateKey}:review:${raw.pullRequest.url}`;
        appendContribution(detailsByDay, dateKey, {
          id: key,
          kind: "review",
          label: `Reviewed "${raw.pullRequest.title}"`,
          repository: repoLabel(owner, name),
          repositoryUrl: raw.repository.url,
          count: 1,
          url: raw.pullRequest.url,
        });
      }
    },
  );

  await paginateContributionNodes(
    username,
    from,
    to,
    "issueContributions",
    `
      occurredAt
      issue {
        title
        url
      }
      repository {
        name
        url
        owner { login }
      }
    `,
    token,
    (nodes) => {
      for (const raw of nodes as Array<{
        occurredAt: string;
        issue: { title: string; url: string };
        repository: { name: string; url: string; owner: { login: string } };
      }>) {
        const dateKey = toDateKey(raw.occurredAt);
        const owner = raw.repository.owner.login;
        const name = raw.repository.name;
        const key = `${dateKey}:issue:${raw.issue.url}`;
        appendContribution(detailsByDay, dateKey, {
          id: key,
          kind: "issue",
          label: raw.issue.title,
          repository: repoLabel(owner, name),
          repositoryUrl: raw.repository.url,
          count: 1,
          url: raw.issue.url,
        });
      }
    },
  );

  sortDayContributions(detailsByDay);

  return { calendar, detailsByDay };
}
