import { redirect } from "next/navigation";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { PageHeader } from "@/components/page-header";
import { auth } from "@/lib/auth";
import { PLATFORM_LABELS } from "@/lib/constants";
import { getIndex } from "@/lib/github";
import { buildHeatmap, computeBestStreak, computeCurrentStreak, computeDifficultyBreakdown, computePlatformBreakdown } from "@/lib/stats";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);
  const difficulty = computeDifficultyBreakdown(index);
  const platforms = computePlatformBreakdown(index);
  const heatmap = buildHeatmap(index);
  const streak = computeCurrentStreak(index);

  return (
    <div className="min-h-screen">
      <PageHeader title="Profile" streak={streak} />

      <main className="flex justify-center p-container-padding">
        <div className="w-full max-w-[680px] space-y-stack-lg pb-12">
          <section className="flex flex-col items-center justify-center pt-8 text-center">
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border border-border bg-vault-raised p-1">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Profile avatar"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-2xl text-foreground">
                  {(session.user.name ?? "V").slice(0, 1)}
                </div>
              )}
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-vault-raised bg-vault-success" />
            </div>
            <h2 className="text-page-title">{session.user.name ?? "Vault User"}</h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              @{session.user.login ?? "github"}
            </p>
          </section>

          <section className="grid grid-cols-3 gap-4">
            {[
              ["Total Solved", index.length],
              ["Platforms", Object.keys(platforms).length],
              ["Best Streak", computeBestStreak(index)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="surface-card flex flex-col items-center justify-center p-4"
              >
                <span className="text-micro-label mb-1">{label}</span>
                <span className="text-stat">{value}</span>
              </div>
            ))}
          </section>

          <section className="surface-card p-container-padding">
            <h3 className="text-section-title mb-6 text-muted-foreground">
              Difficulty Breakdown
            </h3>
            <div className="space-y-4">
              {[
                ["Easy", difficulty.easy, "bg-emerald-500"],
                ["Medium", difficulty.medium, "bg-blue-500"],
                ["Hard", difficulty.hard, "bg-red-500"],
              ].map(([label, value, tone]) => {
                const total = Math.max(index.length, 1);
                const width = `${Math.round((Number(value) / total) * 100)}%`;

                return (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-20 font-mono text-sm text-muted-foreground">
                      {label}
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-vault-raised">
                      <div className={`h-full ${tone}`} style={{ width }} />
                    </div>
                    <div className="w-12 text-right font-mono text-sm tabular-nums text-foreground">
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {(["leetcode", "codeforces", "codechef"] as const).map((platform) => (
              <div
                key={platform}
                className="surface-card flex items-center justify-between p-4"
              >
                <span className="text-card-title">{PLATFORM_LABELS[platform]}</span>
                <span className="font-mono text-sm text-muted-foreground">
                  {platforms[platform] ?? 0} solved
                </span>
              </div>
            ))}
          </section>

          <section className="surface-card overflow-hidden p-container-padding">
            <h3 className="text-section-title mb-6 text-muted-foreground">Activity</h3>
            <div className="overflow-x-auto pb-2 scrollbar-thin">
              <ActivityHeatmap days={heatmap} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
