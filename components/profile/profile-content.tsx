import type { Session } from "next-auth";
import Link from "next/link";
import {
  APPROACH_BADGE_TONES,
  DIFFICULTY_BADGE_TONES,
  DIFFICULTY_LABELS,
  PLATFORM_LABELS,
  PUBLIC_PLATFORMS,
} from "@/lib/constants";
import { computeActivityMap, computeIRS, computeTopicMastery } from "@/lib/algorithms";
import {
  computeDashboardStats,
  computePlatformBreakdown,
  formatRelativeDate,
  getRecentProblems,
} from "@/lib/stats";
import type { ProblemIndex } from "@/types";
import { IRSWidget } from "@/components/irs-widget";
import { TopicRadar } from "@/components/topic-radar";
import { CombinedHeatmap } from "@/components/combined-heatmap";
import { AppLogo } from "@/components/app-logo";
import { LogoutButton } from "@/components/logout-button";
import { ProfileOwnerShell } from "@/components/profile/profile-owner-shell";
import { cn } from "@/lib/utils";

interface ProfileContentProps {
  index: ProblemIndex[];
  username: string;
  session: Session | null;
  isOwner: boolean;
}

function padProblemNumber(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? digits.padStart(4, "0") : number;
}

export function ProfileContent({
  index,
  username,
  session,
  isOwner,
}: ProfileContentProps) {
  const stats = computeDashboardStats(index);
  const platformBreakdown = computePlatformBreakdown(index);
  const activityMap = computeActivityMap(index);
  const masteryData = computeTopicMastery(index);
  const recent = getRecentProblems(index, 10);
  const optimalPercent =
    index.length > 0 ? Math.round((stats.optimal / index.length) * 100) : 0;
  const avatarUrl =
    isOwner && session?.user?.image
      ? session.user.image
      : `https://github.com/${username}.png`;

  const statBoxes = [
    { label: "Total Problems", value: stats.totalSolved },
    { label: "This Week", value: stats.thisWeek },
    { label: "Optimal %", value: `${optimalPercent}%` },
    { label: "Streak", value: `${stats.currentStreak} days` },
  ];

  const content = (
    <div className={isOwner ? "min-h-screen" : "min-h-screen bg-zinc-950 text-white"}>
      {!isOwner ? (
        <header className="border-b border-zinc-700 px-6 py-4">
          <Link href="/">
            <AppLogo size="sm" />
          </Link>
        </header>
      ) : null}

      <main
        className={cn(
          "mx-auto max-w-6xl px-6 py-10 pb-16",
          isOwner && "pb-24",
        )}
      >
        <section className="flex flex-col items-center text-center">
          <div
            className={cn(
              "mb-4 h-24 w-24 overflow-hidden rounded-full border bg-zinc-900",
              isOwner ? "border-border bg-vault-raised" : "border-zinc-700",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={`${username} avatar`}
              className="h-full w-full object-cover"
            />
          </div>

          <h1
            className={cn(
              "text-3xl font-semibold",
              isOwner ? "text-foreground" : "text-white",
            )}
          >
            @{username}
          </h1>

          <span
            className={cn(
              "mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium",
              isOwner
                ? "border-border text-muted-foreground"
                : "border-zinc-700 text-zinc-400",
            )}
          >
            Vault Profile
          </span>

          <p
            className={cn(
              "mt-2 text-sm",
              isOwner ? "text-muted-foreground" : "text-zinc-500",
            )}
          >
            Put this on your resume
          </p>

          {isOwner ? <LogoutButton /> : null}
        </section>

        <section className="mt-10">
          <IRSWidget problems={index} username={username} />
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statBoxes.map(({ label, value }) => (
            <div
              key={label}
              className={cn(
                "rounded-lg border p-5",
                isOwner
                  ? "surface-card"
                  : "border-zinc-700 bg-zinc-900",
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wider",
                  isOwner ? "text-muted-foreground" : "text-zinc-400",
                )}
              >
                {label}
              </p>
              <p
                className={cn(
                  "mt-2 font-mono text-3xl font-semibold tabular-nums",
                  isOwner ? "text-foreground" : "text-white",
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 flex flex-wrap justify-center gap-3">
          {PUBLIC_PLATFORMS.map((platform) => (
            <div
              key={platform}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2",
                isOwner
                  ? "surface-card"
                  : "border-zinc-700 bg-zinc-900",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  isOwner ? "text-foreground" : "text-zinc-300",
                )}
              >
                {PLATFORM_LABELS[platform]}
              </span>
              <span
                className={cn(
                  "font-mono text-sm tabular-nums",
                  isOwner ? "text-muted-foreground" : "text-zinc-400",
                )}
              >
                {platformBreakdown[platform] ?? 0}
              </span>
            </div>
          ))}
        </section>

        <section
          className={cn(
            "mt-6 rounded-lg border p-6",
            isOwner ? "surface-card" : "border-zinc-700 bg-zinc-900",
          )}
        >
          <h2
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider",
              isOwner ? "text-muted-foreground" : "text-zinc-400",
            )}
          >
            Topic Mastery
          </h2>
          <div className="mt-4 flex justify-center">
            <TopicRadar masteryData={masteryData} size={360} />
          </div>
        </section>

        <section
          className={cn(
            "mt-6 rounded-lg border p-6",
            isOwner ? "surface-card" : "border-zinc-700 bg-zinc-900",
          )}
        >
          <h2
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider",
              isOwner ? "text-muted-foreground" : "text-zinc-400",
            )}
          >
            Activity
          </h2>
          <div className="mt-4">
            <CombinedHeatmap activityMap={activityMap} />
          </div>
        </section>

        <section
          className={cn(
            "mt-6 overflow-hidden rounded-lg border",
            isOwner ? "surface-card" : "border-zinc-700 bg-zinc-900",
          )}
        >
          <div
            className={cn(
              "border-b px-6 py-4",
              isOwner ? "border-border" : "border-zinc-700",
            )}
          >
            <h2
              className={cn(
                "text-[11px] font-medium uppercase tracking-wider",
                isOwner ? "text-muted-foreground" : "text-zinc-400",
              )}
            >
              Recent Solves
            </h2>
          </div>

          <div
            className={cn(
              "divide-y",
              isOwner ? "divide-border" : "divide-zinc-700",
            )}
          >
            {recent.length ? (
              recent.map((problem) => (
                <div
                  key={problem.id}
                  className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate",
                        isOwner ? "text-foreground" : "text-white",
                      )}
                    >
                      <span
                        className={cn(
                          "mr-2 font-mono text-sm",
                          isOwner ? "text-muted-foreground" : "text-zinc-500",
                        )}
                      >
                        {padProblemNumber(problem.number)}
                      </span>
                      {problem.title}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isOwner ? "text-muted-foreground" : "text-zinc-500",
                      )}
                    >
                      {formatRelativeDate(problem.latest_date)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 font-mono text-[11px] uppercase",
                        isOwner
                          ? "border-border text-muted-foreground"
                          : "border-zinc-700 text-zinc-400",
                      )}
                    >
                      {PLATFORM_LABELS[problem.platform] ?? problem.platform}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 font-mono text-[11px] uppercase",
                        DIFFICULTY_BADGE_TONES[problem.difficulty],
                      )}
                    >
                      {DIFFICULTY_LABELS[problem.difficulty]}
                    </span>
                    {problem.latest_approach ? (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-1 font-mono text-[11px]",
                          APPROACH_BADGE_TONES[problem.latest_approach].className,
                        )}
                      >
                        {problem.latest_approach}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p
                className={cn(
                  "px-6 py-8 text-center text-sm",
                  isOwner ? "text-muted-foreground" : "text-zinc-500",
                )}
              >
                No problems solved yet.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );

  if (isOwner && session?.user?.login) {
    return <ProfileOwnerShell login={session.user.login}>{content}</ProfileOwnerShell>;
  }

  return content;
}
