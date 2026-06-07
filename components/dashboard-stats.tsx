"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Flame, Trophy, Zap } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { staggerContainer } from "@/lib/motion";

interface DashboardStatsProps {
  totalSolved: number;
  thisWeek: number;
  currentStreak: number;
  optimalPct: number;
}

export function DashboardStats({
  totalSolved,
  thisWeek,
  currentStreak,
  optimalPct,
}: DashboardStatsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      <StatCard label="Total Solved" value={totalSolved} icon={CheckCircle2} />
      <StatCard label="This Week" value={thisWeek} icon={Flame} />
      <StatCard
        label="Current Streak"
        value={currentStreak}
        icon={Zap}
        suffix=" days"
      />
      <StatCard
        label="Optimal Rate"
        value={optimalPct}
        icon={Trophy}
        suffix="%"
        highlight
      />
    </motion.div>
  );
}
