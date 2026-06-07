import { CORE_DSA_TOPICS } from "@/lib/algorithms";
import { getTargetTierLabel } from "@/lib/share-cards";
import type { CompanyTierTarget, ShareableCardData } from "@/types";
import { VaultWatermark } from "@/components/share-cards/vault-watermark";

const CX = 100;
const CY = 100;
const RADIUS = 70;

function topicToPoint(
  index: number,
  total: number,
  value: number,
  radius: number,
  cx: number,
  cy: number,
) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * (value / 100) * radius,
    y: cy + Math.sin(angle) * (value / 100) * radius,
  };
}

function MiniTopicRadar({
  masteryData,
}: {
  masteryData: ShareableCardData["radarSnapshot"];
}) {
  const scoreByTopic = new Map(
    (masteryData ?? []).map((entry) => [entry.topic, entry.masteryScore]),
  );
  const topics = CORE_DSA_TOPICS.map((topic) => scoreByTopic.get(topic) ?? 0);
  const total = topics.length;
  const points = topics.map((value, index) =>
    topicToPoint(index, total, value, RADIUS, CX, CY),
  );
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 200 200" width={180} height={180} aria-hidden>
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <circle
          key={fraction}
          cx={CX}
          cy={CY}
          r={RADIUS * fraction}
          fill="none"
          stroke="rgb(63 63 70 / 0.5)"
          strokeWidth={1}
        />
      ))}
      {topics.map((_, index) => {
        const tip = topicToPoint(index, total, 100, RADIUS, CX, CY);
        return (
          <line
            key={index}
            x1={CX}
            y1={CY}
            x2={tip.x}
            y2={tip.y}
            stroke="rgb(63 63 70)"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={polygonPoints}
        fill="rgb(34 197 94 / 0.2)"
        stroke="rgb(34 197 94)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 90;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <svg viewBox="0 0 220 130" width={220} height={130} aria-hidden>
      <path
        d="M 20 110 A 90 90 0 0 1 200 110"
        fill="none"
        stroke="#3f3f46"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <path
        d="M 20 110 A 90 90 0 0 1 200 110"
        fill="none"
        stroke="#22c55e"
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
      />
    </svg>
  );
}

export function ShareableReadiness({
  data,
  targetTier = "FAANG",
}: {
  data: ShareableCardData;
  targetTier?: CompanyTierTarget;
}) {
  const score = data.irsScore ?? 0;

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden bg-[#09090b] text-white"
      style={{ width: 800, height: 800, fontFamily: "var(--font-sans)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(34,197,94,0.2), transparent 55%)",
        }}
      />

      <div className="relative flex h-full w-full flex-col items-center px-12 py-14">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-400">
          Interview Readiness
        </p>

        <div className="relative mt-6 flex flex-col items-center">
          <ScoreGauge score={score} />
          <p
            className="absolute font-mono font-bold tabular-nums text-white"
            style={{ fontSize: 120, lineHeight: 1, top: 36 }}
          >
            {score}
          </p>
        </div>

        <span className="mt-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
          {getTargetTierLabel(targetTier)}
        </span>

        <div className="mt-8">
          <MiniTopicRadar masteryData={data.radarSnapshot} />
        </div>

        <div className="mt-auto w-full">
          <div className="flex justify-between">
            <span className="font-mono text-sm text-zinc-500">@{data.username}</span>
            <VaultWatermark compact />
          </div>
        </div>
      </div>
    </div>
  );
}
