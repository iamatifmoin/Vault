interface MiniStatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
}

export function MiniStatCard({ label, value, suffix = "" }: MiniStatCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
      <p className="font-mono text-2xl font-bold text-white">
        {value}
        {suffix}
      </p>
      <p className="mt-0.5 text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}
