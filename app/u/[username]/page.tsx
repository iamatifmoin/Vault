import type { Metadata } from "next";
import Link from "next/link";
import {
  APPROACH_BADGE_TONES,
  DIFFICULTY_BADGE_TONES,
  DIFFICULTY_LABELS,
  PLATFORM_LABELS,
  PUBLIC_PLATFORMS,
} from "@/lib/constants";
import { computeActivityMap, computeIRS, computeTopicMastery } from "@/lib/algorithms";
import { getPublicIndex } from "@/lib/github";
import { SHARE_BASE_URL } from "@/lib/share-cards";
import {
  computeDashboardStats,
  computePlatformBreakdown,
  formatRelativeDate,
  getRecentProblems,
} from "@/lib/stats";
import { IRSWidget } from "@/components/irs-widget";
import { TopicRadar } from "@/components/topic-radar";
import { CombinedHeatmap } from "@/components/combined-heatmap";
import { AppLogo } from "@/components/app-logo";
import { cn } from "@/lib/utils";

interface PublicProfilePageProps {
  params: { username: string };
}

function getSiteUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  return `https://${SHARE_BASE_URL}`;
}

function padProblemNumber(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? digits.padStart(4, "0") : number;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = params;
  const index = await getPublicIndex(username);
  const siteUrl = getSiteUrl();
  const ogImage = `${siteUrl}/og/profile.png`;

  if (!index) {
    return {
      title: `${username}'s Vault Profile`,
      description: "This profile hasn't been set up yet.",
      openGraph: {
        title: `${username}'s Vault Profile`,
        description: "This profile hasn't been set up yet.",
        images: [{ url: ogImage }],
      },
    };
  }

  const irsScore = computeIRS(index).score;

  return {
    title: `${username}'s Vault Profile`,
    description: `${username} has solved ${index.length} DSA problems. IRS: ${irsScore}/100`,
    openGraph: {
      title: `${username}'s Vault Profile`,
      description: `${username} has solved ${index.length} DSA problems. IRS: ${irsScore}/100`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s Vault Profile`,
      description: `${username} has solved ${index.length} DSA problems. IRS: ${irsScore}/100`,
      images: [ogImage],
    },
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = params;
  const index = await getPublicIndex(username);

  if (index === null) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <header className="border-b border-zinc-700 px-6 py-4">
          <Link href="/">
            <AppLogo size="sm" />
          </Link>
        </header>

        <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-sm uppercase tracking-wider text-zinc-500">
            Vault Profile
          </p>
          <h1 className="mt-3 text-3xl font-semibold">@{username}</h1>
          <p className="mt-4 text-zinc-400">
            This profile hasn&apos;t been set up yet.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Connect Vault and start solving problems to build your public profile.
          </p>
        </main>
      </div>
    );
  }

  const stats = computeDashboardStats(index);
  const platformBreakdown = computePlatformBreakdown(index);
  const activityMap = computeActivityMap(index);
  const masteryData = computeTopicMastery(index);
  const recent = getRecentProblems(index, 10);
  const optimalPercent =
    index.length > 0 ? Math.round((stats.optimal / index.length) * 100) : 0;
  const avatarUrl = `https://github.com/${username}.png`;

  const statBoxes = [
    { label: "Total Problems", value: stats.totalSolved },
    { label: "This Week", value: stats.thisWeek },
    { label: "Optimal %", value: `${optimalPercent}%` },
    { label: "Streak", value: `${stats.currentStreak} days` },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-700 px-6 py-4">
        <Link href="/">
          <AppLogo size="sm" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 pb-16">
        <section className="flex flex-col items-center text-center">
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={`${username} avatar`}
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="text-3xl font-semibold text-white">@{username}</h1>

          <span className="mt-3 inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400">
            Vault Profile
          </span>

          <p className="mt-2 text-sm text-zinc-500">Put this on your resume</p>
        </section>

        <section className="mt-10">
          <IRSWidget problems={index} username={username} />
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statBoxes.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-5"
            >
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                {label}
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-white">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 flex flex-wrap justify-center gap-3">
          {PUBLIC_PLATFORMS.map((platform) => (
            <div
              key={platform}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2"
            >
              <span className="text-sm text-zinc-300">
                {PLATFORM_LABELS[platform]}
              </span>
              <span className="font-mono text-sm tabular-nums text-zinc-400">
                {platformBreakdown[platform] ?? 0}
              </span>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 p-6">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Topic Mastery
          </h2>
          <div className="mt-4 flex justify-center">
            <TopicRadar masteryData={masteryData} size={360} />
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 p-6">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Activity
          </h2>
          <div className="mt-4">
            <CombinedHeatmap activityMap={activityMap} />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
          <div className="border-b border-zinc-700 px-6 py-4">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Recent Solves
            </h2>
          </div>

          <div className="divide-y divide-zinc-700">
            {recent.length ? (
              recent.map((problem) => (
                <div
                  key={problem.id}
                  className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-white">
                      <span className="mr-2 font-mono text-sm text-zinc-500">
                        {padProblemNumber(problem.number)}
                      </span>
                      {problem.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatRelativeDate(problem.latest_date)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-zinc-700 px-2 py-1 font-mono text-[11px] uppercase text-zinc-400">
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
              <p className="px-6 py-8 text-center text-sm text-zinc-500">
                No problems solved yet.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
