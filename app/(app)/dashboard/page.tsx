import Link from "next/link";
import { redirect } from "next/navigation";
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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-vault-border bg-background/90 px-container-padding backdrop-blur">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          {streak} day streak
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-container-padding">
        <div className="grid gap-gutter md:grid-cols-4">
          {[
            ["Total Solved", stats.totalSolved],
            ["This Week", stats.thisWeek],
            ["Streak", `${stats.currentStreak} days`],
            ["Optimal", stats.optimal],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-md border border-vault-border bg-vault-raised p-6"
            >
              <div className="font-mono text-[11px] uppercase text-zinc-500">{label}</div>
              <div className="mt-2 text-4xl font-semibold text-zinc-50">{value}</div>
            </div>
          ))}
        </div>

        <section className="mt-6 overflow-hidden rounded-md border border-vault-border bg-vault-surface">
          <div className="border-b border-vault-border bg-zinc-950/40 px-6 py-4">
            <h2 className="text-2xl font-semibold text-zinc-50">Recent Activity</h2>
          </div>

          <div className="divide-y divide-vault-border">
            {recent.length ? (
              recent.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/library/${problem.id}`}
                  className="flex flex-col justify-between gap-4 px-6 py-4 transition-colors hover:bg-vault-raised md:flex-row md:items-center"
                >
                  <div>
                    <p className="text-[15px] font-medium text-zinc-50">{problem.title}</p>
                    <p className="mt-1 font-mono text-[11px] text-zinc-500">
                      {formatRelativeDate(problem.latest_date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-sm border border-vault-border px-2 py-1 font-mono text-[11px] uppercase text-zinc-400">
                      {PLATFORM_LABELS[problem.platform]}
                    </span>
                    <span className="rounded-sm border border-vault-border px-2 py-1 font-mono text-[11px] uppercase text-zinc-200">
                      {DIFFICULTY_LABELS[problem.difficulty]}
                    </span>
                    {problem.latest_approach ? (
                      <span
                        className={cn(
                          "rounded-sm border px-2 py-1 font-mono text-[11px]",
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
              <div className="px-6 py-10 text-sm text-zinc-500">
                No attempts yet. Head to
                {" "}
                <Link href="/add" className="text-zinc-100 underline underline-offset-4">
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
