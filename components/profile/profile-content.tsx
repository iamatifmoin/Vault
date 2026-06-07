import type { Session } from "next-auth";
import Link from "next/link";
import {
  computeActivityMap,
  computeIRS,
  computeTopicMastery,
} from "@/lib/algorithms";
import { PUBLIC_PLATFORMS } from "@/lib/constants";
import {
  computeBestStreak,
  computeDashboardStats,
  computePlatformBreakdown,
  getRecentProblems,
} from "@/lib/stats";
import type { ProblemIndex } from "@/types";
import { IRSWidget } from "@/components/irs-widget";
import { TopicRadar } from "@/components/topic-radar";
import { CombinedHeatmap } from "@/components/combined-heatmap";
import { AppLogo } from "@/components/app-logo";
import { MiniStatCard } from "@/components/profile/mini-stat-card";
import { OwnerMenu } from "@/components/profile/profile-owner-menu";
import { PlatformChip } from "@/components/profile/platform-chip";
import { ProfileOwnerShell } from "@/components/profile/profile-owner-shell";
import { ProfileRecentSolves } from "@/components/profile/profile-recent-solves";
import { cn } from "@/lib/utils";

interface ProfileContentProps {
  index: ProblemIndex[];
  username: string;
  session: Session | null;
  isOwner: boolean;
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
  const recent = getRecentProblems(index, 8);
  const irsData = computeIRS(index);
  const optimalPct =
    index.length > 0 ? Math.round((stats.optimal / index.length) * 100) : 0;
  const longestStreak = computeBestStreak(index);
  const targetTier = "FAANG";

  const platformCounts = PUBLIC_PLATFORMS.map((platform) => ({
    platform,
    count: platformBreakdown[platform] ?? 0,
  }));

  const avatarUrl =
    isOwner && session?.user?.image
      ? session.user.image
      : `https://github.com/${username}.png`;

  const content = (
    <div className={isOwner ? "min-h-screen" : "min-h-screen bg-zinc-950 text-white"}>
      {!isOwner ? (
        <header className="border-b border-zinc-800 px-6 py-4">
          <Link href="/">
            <AppLogo size="sm" />
          </Link>
        </header>
      ) : null}

      <main
        className={cn(
          "mx-auto max-w-6xl px-6 py-8 pb-16",
          isOwner && "pb-24",
        )}
      >
        {/* Hero */}
        <div className="flex items-start gap-5 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={username}
            className="h-16 w-16 flex-shrink-0 rounded-full ring-2 ring-zinc-700"
          />

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">{username}</h1>

            <p className="mt-1 text-sm text-zinc-400">
              {stats.totalSolved} problems solved · IRS {irsData.score}/100
              {targetTier ? ` · Targeting ${targetTier}` : null}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {platformCounts.map(
                ({ platform, count }) =>
                  count > 0 && (
                    <PlatformChip key={platform} platform={platform} count={count} />
                  ),
              )}
            </div>
          </div>

          {isOwner ? <OwnerMenu /> : null}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStatCard label="Total Solved" value={stats.totalSolved} />
          <MiniStatCard label="This Week" value={stats.thisWeek} />
          <MiniStatCard label="Optimal Rate" value={optimalPct} suffix="%" />
          <MiniStatCard label="Best Streak" value={longestStreak} suffix="d" />
        </div>

        {/* Interview Readiness + Topic Mastery */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <IRSWidget problems={index} username={username} className="h-full" />

          <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Topic Mastery
            </h2>
            <div className="flex flex-1 items-center justify-center">
              <TopicRadar masteryData={masteryData} size={280} />
            </div>
          </div>
        </div>

        {index.length > 0 ? (
          <section className="surface-card mt-6 p-container-padding">
            <h2 className="text-section-title mb-6 text-center text-muted-foreground">
              Activity
            </h2>
            <CombinedHeatmap activityMap={activityMap} />
          </section>
        ) : null}

        <section className="surface-card mt-6 overflow-hidden">
          <div className="border-b border-border bg-vault-bg/60 px-6 py-4">
            <h2 className="text-section-title">Recent Solves</h2>
          </div>
          <ProfileRecentSolves problems={recent} />
        </section>
      </main>
    </div>
  );

  if (isOwner && session?.user?.login) {
    return (
      <ProfileOwnerShell login={session.user.login}>{content}</ProfileOwnerShell>
    );
  }

  return content;
}
