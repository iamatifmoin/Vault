"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";
import { listItem } from "@/lib/motion";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  suffix?: string;
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "this week",
  suffix = "",
  highlight = false,
}: StatCardProps) {
  const displayValue = useCountUp(value, 600);

  return (
    <motion.div
      variants={listItem}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-vault-surface p-5 transition-colors duration-200",
        highlight
          ? "border-emerald-800/40 hover:border-emerald-700/60"
          : "border-vault-border hover:border-zinc-600/80",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.015] to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            {label}
          </p>
          <p
            className={cn(
              "font-mono text-3xl font-bold tracking-tight",
              highlight ? "text-emerald-400" : "text-white",
            )}
          >
            {displayValue}
            {suffix}
          </p>
          {trend !== undefined && (
            <p
              className={cn(
                "mt-1.5 text-xs",
                trend > 0
                  ? "text-emerald-400"
                  : trend < 0
                    ? "text-red-400"
                    : "text-zinc-500",
              )}
            >
              {trend > 0 ? "↑" : trend < 0 ? "↓" : "—"}{" "}
              {trend !== 0 ? `${Math.abs(trend)} ` : ""}
              {trendLabel}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
            highlight
              ? "bg-emerald-950/60 text-emerald-400"
              : "bg-zinc-800 text-zinc-400",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  );
}
