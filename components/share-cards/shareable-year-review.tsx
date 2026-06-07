import type { ShareableCardData } from "@/types";
import { VaultWatermark } from "@/components/share-cards/vault-watermark";

export function ShareableYearReview({
  data,
  monthlyCounts,
  year = new Date().getFullYear(),
}: {
  data: ShareableCardData;
  monthlyCounts: { month: string; count: number }[];
  year?: number;
}) {
  const monthly = monthlyCounts;
  const maxCount = Math.max(...monthly.map((entry) => entry.count), 1);

  return (
    <div
      className="relative overflow-hidden bg-[#09090b] text-white"
      style={{ width: 1200, height: 630, fontFamily: "var(--font-sans)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(34,197,94,0.12), transparent 40%)",
        }}
      />

      <div className="relative flex h-full flex-col p-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-500">
              Year in Review
            </p>
            <h1 className="mt-2 text-5xl font-bold tracking-tight">
              My {year} in DSA
            </h1>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2">
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.avatarUrl}
                alt=""
                crossOrigin="anonymous"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold">
                {data.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-mono text-sm text-zinc-300">@{data.username}</span>
          </div>
        </div>

        <div className="mt-10 flex flex-1 items-end gap-10">
          <div>
            <p className="font-mono text-8xl font-bold tabular-nums text-emerald-500">
              {data.totalSolved ?? 0}
            </p>
            <p className="mt-2 text-2xl text-zinc-400">problems solved</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                Strongest: {data.strongestTopic ?? "—"}
              </span>
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
                Longest streak: {data.streak ?? 0} days
              </span>
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-900/60 p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Monthly progression
            </p>
            <div className="flex h-40 items-end justify-between gap-2">
              {monthly.map((entry) => (
                <div key={entry.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-emerald-500"
                    style={{
                      height: `${Math.max((entry.count / maxCount) * 100, entry.count > 0 ? 8 : 2)}%`,
                      minHeight: entry.count > 0 ? 8 : 2,
                    }}
                  />
                  <span className="font-mono text-[10px] text-zinc-500">{entry.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <VaultWatermark />
        </div>
      </div>
    </div>
  );
}
