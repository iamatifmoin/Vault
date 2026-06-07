import { toOrdinal } from "@/lib/share-cards";
import type { ShareableCardData } from "@/types";
import { VaultWatermark } from "@/components/share-cards/vault-watermark";

const CONFETTI = [
  { top: "8%", left: "12%", size: 14, rotate: 15, color: "#22c55e" },
  { top: "15%", left: "78%", size: 10, rotate: -20, color: "#eab308" },
  { top: "22%", left: "45%", size: 8, rotate: 45, color: "#3b82f6" },
  { top: "65%", left: "8%", size: 12, rotate: -35, color: "#ef4444" },
  { top: "72%", left: "85%", size: 16, rotate: 25, color: "#22c55e" },
  { top: "55%", left: "92%", size: 9, rotate: -10, color: "#eab308" },
  { top: "38%", left: "5%", size: 11, rotate: 60, color: "#3b82f6" },
  { top: "85%", left: "35%", size: 13, rotate: -45, color: "#22c55e" },
  { top: "12%", left: "55%", size: 7, rotate: 30, color: "#ef4444" },
  { top: "48%", left: "88%", size: 10, rotate: -55, color: "#eab308" },
];

export function ShareableMilestone({ data }: { data: ShareableCardData }) {
  const count = data.milestoneCount ?? data.totalSolved ?? 0;

  return (
    <div
      className="relative overflow-hidden bg-[#09090b] text-white"
      style={{ width: 800, height: 800, fontFamily: "var(--font-sans)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(34,197,94,0.25), transparent 60%)",
        }}
      />

      {CONFETTI.map((piece, index) => (
        <div
          key={index}
          className="pointer-events-none absolute rounded-sm"
          style={{
            top: piece.top,
            left: piece.left,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotate}deg)`,
            opacity: 0.85,
          }}
        />
      ))}

      <div className="relative flex h-full flex-col items-center justify-center px-12 text-center">
        <p className="max-w-md text-xl text-zinc-400">
          I just solved my {toOrdinal(count)} problem on LeetCode
        </p>

        <p
          className="mt-6 bg-gradient-to-b from-emerald-400 to-emerald-600 bg-clip-text font-mono font-bold tabular-nums text-transparent"
          style={{ fontSize: 180, lineHeight: 1 }}
        >
          {count}
        </p>

        <div className="mt-10 flex items-center gap-3">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatarUrl}
              alt=""
              crossOrigin="anonymous"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-lg font-semibold">
              {data.username.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="font-mono text-lg text-zinc-300">@{data.username}</span>
        </div>

        <div className="absolute bottom-10 right-10">
          <VaultWatermark compact />
        </div>
      </div>
    </div>
  );
}
