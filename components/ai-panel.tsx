import { cn } from "@/lib/utils";
import type { AIAnalysis } from "@/types";

const tones = {
  Optimal: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Optimized: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  "Brute Force": "border-zinc-700 bg-zinc-900 text-zinc-300",
} as const;

export function AIPanel({
  analysis,
  footer,
}: {
  analysis: AIAnalysis;
  footer?: React.ReactNode;
}) {
  const sections: Array<{ label: string; items: string[] }> = [
    { label: "What you did well", items: analysis.what_you_did_well },
    { label: "Bottlenecks", items: analysis.bottlenecks },
    { label: "Bugs", items: analysis.bugs },
  ];

  return (
    <div className="surface-card flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-section-title">AI Analysis</h2>
        <div
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-[11px] uppercase",
            tones[analysis.classification],
          )}
        >
          {analysis.classification}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-micro-label">Time</span>
          <div className="rounded-md border border-border bg-vault-raised px-3 py-1.5 font-mono text-sm text-foreground">
            {analysis.time_complexity}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-micro-label">Space</span>
          <div className="rounded-md border border-border bg-vault-raised px-3 py-1.5 font-mono text-sm text-foreground">
            {analysis.space_complexity}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map(({ label, items }) => (
          <div
            key={label}
            className="rounded-md border border-border bg-vault-raised px-4 py-4"
          >
            <h3 className="text-sm font-medium text-foreground">{label}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {items.length ? (
                items.map((item) => <li key={item}>• {item}</li>)
              ) : (
                <li>• None.</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-vault-raised p-4">
        <div className="text-micro-label">Pattern</div>
        <div className="mt-2 text-lg font-medium text-foreground">{analysis.pattern.name}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {analysis.pattern.when_to_use}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {analysis.pattern.related_problems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {footer}
    </div>
  );
}
