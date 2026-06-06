import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, CalendarDays, Flame, Zap } from "lucide-react";
import { AnimatedMain } from "@/components/animated-main";
import { EmptyState } from "@/components/empty-state";
import { MiniActivityStrip } from "@/components/mini-activity-strip";
import { PageHeader } from "@/components/page-header";
import { auth } from "@/lib/auth";
import {
  APPROACH_BADGE_TONES,
  DIFFICULTY_BADGE_TONES,
  DIFFICULTY_LABELS,
  PLATFORM_LABELS,
} from "@/lib/constants";
import { getIndex } from "@/lib/github";
import {
  buildHeatmap,
  computeDashboardStats,
  computeCurrentStreak,
  formatRelativeDate,
  getRecentProblems,
} from "@/lib/stats";
import { cn } from "@/lib/utils";

function getGreeting(name?: string | null) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${time}, ${name.split(" ")[0]}` : time;
}

const statConfig = [
  { label: "Total Solved", key: "totalSolved" as const, icon: BookOpen },
  { label: "This Week", key: "thisWeek" as const, icon: CalendarDays },
  { label: "Streak", key: "currentStreak" as const, icon: Flame, suffix: " days" },
  { label: "Optimal", key: "optimal" as const, icon: Zap },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);
  const stats = computeDashboardStats(index);
  const recent = getRecentProblems(index, 6);
  const streak = computeCurrentStreak(index);
  const heatmap = buildHeatmap(index);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Dashboard"
        subtitle={getGreeting(session.user?.name)}
        streak={streak}
      />

      <AnimatedMain className="mx-auto max-w-6xl p-container-padding" grid>
        <div className="stagger-children grid gap-gutter md:grid-cols-4">
          {statConfig.map(({ label, key, icon: Icon, suffix }) => {
            const raw = stats[key];
            const value = suffix && typeof raw === "number" ? `${raw}${suffix}` : raw;
            const isStreak = key === "currentStreak";

            return (
              <div key={label} className="surface-card p-6">
                <div className="flex items-center justify-between">
                  <span className="text-micro-label">{label}</span>
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isStreak ? "text-vault-brand" : "text-muted-foreground",
                    )}
                    strokeWidth={1.6}
                  />
                </div>
                <div className="text-stat mt-2">{value}</div>
              </div>
            );
          })}
        </div>

        {index.length > 0 ? (
          <div className="mt-6">
            <MiniActivityStrip days={heatmap} />
          </div>
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
                description="No attempts yet. Fetch your first problem and start building your practice history."
                actionHref="/add"
                actionLabel="Add your first problem"
              />
            )}
          </div>
        </section>
      </AnimatedMain>
    </div>
  );
}
