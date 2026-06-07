import Link from "next/link";
import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { AnimatedMain } from "@/components/animated-main";
import { DashboardStats } from "@/components/dashboard-stats";
import { EmptyState } from "@/components/empty-state";
import { CombinedHeatmap } from "@/components/combined-heatmap";
import { IRSWidget } from "@/components/irs-widget";
import { PageHeader } from "@/components/page-header";
import { auth } from "@/lib/auth";
import {
  APPROACH_BADGE_TONES,
  DIFFICULTY_BADGE_TONES,
  DIFFICULTY_LABELS,
  PLATFORM_LABELS,
} from "@/lib/constants";
import { buildCombinedActivityMap } from "@/lib/algorithms";
import {
  getGitHubContributions,
  hasGitHubActivity,
} from "@/lib/github-contributions";
import { getIndex } from "@/lib/github";
import {
  computeDashboardStats,
  computeCurrentStreak,
  formatRelativeDate,
  getRecentProblems,
} from "@/lib/stats";
import { MilestoneTrigger } from "@/components/milestone-trigger";
import { buildShareableCardData } from "@/lib/share-cards";
import { cn } from "@/lib/utils";

function getGreeting(name?: string | null) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${time}, ${name.split(" ")[0]}` : time;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const username = session.user?.login ?? "user";
  const [index, githubActivity] = await Promise.all([
    getIndex(session.accessToken),
    getGitHubContributions(username, session.accessToken),
  ]);
  const stats = computeDashboardStats(index);
  const recent = getRecentProblems(index, 6);
  const streak = computeCurrentStreak(index);
  const activityByDay = buildCombinedActivityMap(index, githubActivity);
  const cardData = buildShareableCardData(index, {
    username,
    avatarUrl: session.user?.image ?? "",
  });
  const optimalPct =
    stats.totalSolved > 0
      ? Math.round((stats.optimal / stats.totalSolved) * 100)
      : 0;

  return (
    <div className="min-h-screen">
      <MilestoneTrigger totalSolved={index.length} cardData={cardData} />
      <PageHeader
        title="Dashboard"
        subtitle={getGreeting(session.user?.name)+"!"}
        streak={streak}
      />

      <AnimatedMain className="mx-auto max-w-6xl p-container-padding">
        <DashboardStats
          totalSolved={stats.totalSolved}
          thisWeek={stats.thisWeek}
          currentStreak={stats.currentStreak}
          optimalPct={optimalPct}
        />

        <div className="mt-6">
          <IRSWidget
            problems={index}
            username={session.user?.login}
          />
        </div>

        {index.length > 0 || hasGitHubActivity(githubActivity) ? (
          <section className="surface-card mt-6 p-container-padding">
            <h2 className="text-section-title mb-6 text-center text-muted-foreground">
              Activity
            </h2>
            <CombinedHeatmap
              activityByDay={activityByDay}
              username={username}
              canLinkToVault
            />
          </section>
        ) : null}

        <section className="surface-card mt-6 overflow-hidden">
          <div className="border-b border-border bg-vault-bg/60 px-6 py-4">
            <h2 className="text-section-title">Recent Activity</h2>
          </div>

          <div className="divide-y divide-border">
            {recent.length ? (
              recent.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/library/${problem.id}`}
                  className="flex flex-col justify-between gap-4 px-6 py-4 transition-colors hover:bg-vault-raised md:flex-row md:items-center"
                >
                  <div>
                    <p className="text-card-title">{problem.title}</p>
                    <p className="text-micro-label mt-1 normal-case tracking-normal">
                      {formatRelativeDate(problem.latest_date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-2 py-1 font-mono text-[11px] uppercase text-muted-foreground">
                      {PLATFORM_LABELS[problem.platform]}
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
                </Link>
              ))
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No recent activity"
                description="No attempts yet. Fetch your first problem and start building your practice history."
                action={{ label: "Add your first problem", href: "/add" }}
              />
            )}
          </div>
        </section>
      </AnimatedMain>
    </div>
  );
}
