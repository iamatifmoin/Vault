import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { auth } from "@/lib/auth";
import { APPROACH_BADGE_TONES, DIFFICULTY_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { getIndex } from "@/lib/github";
import { computeDashboardStats, computeCurrentStreak, formatRelativeDate, getRecentProblems } from "@/lib/stats";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);
  const stats = computeDashboardStats(index);
  const recent = getRecentProblems(index, 6);
  const streak = computeCurrentStreak(index);

  return (
    <div className="min-h-screen">
      <PageHeader title="Dashboard" streak={streak} />

      <main className="mx-auto max-w-6xl p-container-padding">
        <div className="grid gap-gutter md:grid-cols-4">
          {[
            ["Total Solved", stats.totalSolved],
            ["This Week", stats.thisWeek],
            ["Streak", `${stats.currentStreak} days`],
            ["Optimal", stats.optimal],
          ].map(([label, value]) => (
            <div key={label} className="surface-card p-6">
              <div className="text-micro-label">{label}</div>
              <div className="text-stat mt-2">{value}</div>
            </div>
          ))}
        </div>

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
                    <span className="rounded-full border border-border px-2 py-1 font-mono text-[11px] uppercase text-foreground">
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
              <div className="px-6 py-10 text-sm text-muted-foreground">
                No attempts yet. Head to
                {" "}
                <Link href="/add" className="text-foreground underline underline-offset-4">
                  Add Problem
                </Link>
                {" "}
                to start the tracker.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
