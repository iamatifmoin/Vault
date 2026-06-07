import { CORE_DSA_TOPICS } from "@/lib/algorithms";
import type { TopicMastery } from "@/types";

export interface TopicMasteryListProps {
  masteryData: TopicMastery[];
}

export function TopicMasteryList({ masteryData }: TopicMasteryListProps) {
  const scoreByTopic = new Map(
    masteryData.map((entry) => [entry.topic, entry]),
  );

  const sorted = CORE_DSA_TOPICS.map((topic) => {
    const entry = scoreByTopic.get(topic);
    return {
      topic,
      totalSolved: entry?.totalSolved ?? 0,
      optimalCount: entry?.optimalCount ?? 0,
      masteryScore: entry?.masteryScore ?? 0,
    };
  }).sort((a, b) => b.masteryScore - a.masteryScore);

  return (
    <ul className="space-y-2.5">
      {sorted.map((item) => (
        <li
          key={item.topic}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto_auto] items-center gap-3"
        >
          <span className="truncate text-sm text-zinc-400">{item.topic}</span>

          <div
            className="h-1.5 overflow-hidden rounded-full bg-zinc-700"
            role="progressbar"
            aria-valuenow={item.masteryScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${item.topic} mastery`}
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${item.masteryScore}%` }}
            />
          </div>

          <span className="font-mono text-xs tabular-nums text-zinc-400">
            {item.masteryScore}/100
          </span>

          <span className="font-mono text-xs tabular-nums text-zinc-400">
            {item.totalSolved} solved
          </span>
        </li>
      ))}
    </ul>
  );
}
