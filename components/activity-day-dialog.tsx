"use client";

import Link from "next/link";
import {
  ExternalLink,
  GitCommit,
  GitPullRequest,
  CircleDot,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlatformIcon } from "@/components/platform-icon";
import { PLATFORM_LABELS } from "@/lib/constants";
import { buildGitHubFileUrl, buildPlatformProblemUrl } from "@/lib/problem-urls";
import type { DayActivity, GitHubContributionActivity, GitHubContributionKind } from "@/types";

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function activityDescription(day: DayActivity) {
  const parts: string[] = [];

  if (day.entries.length) {
    const noun = day.entries.length === 1 ? "problem" : "problems";
    parts.push(`${day.entries.length} ${noun}`);
  }

  if (day.githubContributionCount) {
    const noun =
      day.githubContributionCount === 1 ? "contribution" : "contributions";
    parts.push(`${day.githubContributionCount} GitHub ${noun}`);
  }

  return parts.join(" · ");
}

const GITHUB_KIND_LABELS: Record<GitHubContributionKind, string> = {
  commit: "Commits",
  pull_request: "Pull request",
  review: "Review",
  issue: "Issue",
};

function GitHubContributionIcon({ kind }: { kind: GitHubContributionKind }) {
  const className = "mt-0.5 h-4 w-4 shrink-0 text-zinc-500";

  switch (kind) {
    case "commit":
      return <GitCommit className={className} />;
    case "pull_request":
      return <GitPullRequest className={className} />;
    case "review":
      return <MessageSquare className={className} />;
    default:
      return <CircleDot className={className} />;
  }
}

function GitHubContributionItem({
  item,
}: {
  item: GitHubContributionActivity;
}) {
  const linkUrl = item.url ?? item.repositoryUrl;

  return (
    <li className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-start gap-2">
        <GitHubContributionIcon kind={item.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">{item.label}</p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
            {GITHUB_KIND_LABELS[item.kind]} · {item.repository}
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          View on GitHub
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </li>
  );
}

export function ActivityDayDialog({
  date,
  activity,
  username,
  canLinkToVault = false,
  open,
  onOpenChange,
}: {
  date: string | null;
  activity: DayActivity | null;
  username?: string;
  canLinkToVault?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!date || !activity) {
    return null;
  }

  const hasPlatformEntries = activity.entries.length > 0;
  const hasGitHubActivity = activity.githubContributionCount > 0;
  const hasGitHubDetails = activity.githubContributions.length > 0;
  const hiddenGitHubCount = Math.max(
    0,
    activity.githubContributionCount - activity.githubContributions.reduce(
      (sum, item) => sum + item.count,
      0,
    ),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>{formatDateLabel(date)}</DialogTitle>
          <DialogDescription>{activityDescription(activity)}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 scrollbar-thin">
          <div className="space-y-4 pt-1">
            {hasPlatformEntries ? (
              <section>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  Platform solves
                </h3>
                <ul className="space-y-2">
                  {activity.entries.map((entry) => {
                    const platformUrl = buildPlatformProblemUrl(
                      entry.platform,
                      entry.number,
                      entry.title,
                    );
                    const githubUrl =
                      username && entry.filePath
                        ? buildGitHubFileUrl(username, entry.filePath)
                        : null;

                    return (
                      <li
                        key={entry.id}
                        className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3"
                      >
                        <div className="flex items-start gap-2">
                          <PlatformIcon
                            platform={entry.platform}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">
                              {entry.title}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                              {PLATFORM_LABELS[entry.platform]}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <a
                            href={platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                          >
                            {PLATFORM_LABELS[entry.platform]}
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          {canLinkToVault ? (
                            <Link
                              href={`/library/${entry.id}`}
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                            >
                              Vault
                            </Link>
                          ) : null}

                          {githubUrl ? (
                            <a
                              href={githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                            >
                              GitHub
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {hasGitHubActivity ? (
              <section>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  GitHub activity
                </h3>

                {hasGitHubDetails ? (
                  <ul className="space-y-2">
                    {activity.githubContributions.map((item) => (
                      <GitHubContributionItem key={item.id} item={item} />
                    ))}
                  </ul>
                ) : null}

                {hiddenGitHubCount > 0 ? (
                  <p className="mt-2 text-sm text-zinc-400">
                    {hiddenGitHubCount} additional contribution
                    {hiddenGitHubCount === 1 ? "" : "s"} on GitHub
                    {username ? (
                      <>
                        {" "}
                        (
                        <a
                          href={`https://github.com/${username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-200 underline-offset-2 hover:underline"
                        >
                          view profile
                        </a>
                        )
                      </>
                    ) : null}
                    . Some may be from private repositories.
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
