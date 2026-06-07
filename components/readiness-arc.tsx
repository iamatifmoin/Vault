"use client";
import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

// Arc constants — half-circle (180° sweep)
const ARC_SIZE = 100;
const ARC_CENTER = 50;
const ARC_RADIUS = 38;
const ARC_CIRCUMFERENCE = Math.PI * ARC_RADIUS; // half circumference ≈ 119.38

function getReadinessColor(pct: number): string {
  if (pct >= 70) return "#22c55e";
  if (pct >= 40) return "#eab308";
  return "#ef4444";
}

interface ReadinessArcProps {
  percent: number;  // 0–100
  size?: "sm" | "md";
}

export function ReadinessArc({ percent, size = "md" }: ReadinessArcProps) {
  const color = getReadinessColor(percent);
  const springPct = useSpring(0, { stiffness: 40, damping: 15 });
  const dashOffset = useTransform(springPct, (p) => ARC_CIRCUMFERENCE * (1 - p / 100));

  useEffect(() => { springPct.set(percent); }, [percent, springPct]);

  const svgSize = size === "sm" ? 80 : 100;

  return (
    <svg
      width={svgSize} height={svgSize / 2 + 8}
      viewBox={`0 0 ${ARC_SIZE} ${ARC_SIZE / 2 + 8}`}
      className="overflow-visible"
    >
      {/* Track arc */}
      <path
        d={`M ${ARC_CENTER - ARC_RADIUS} ${ARC_CENTER}
            A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1
            ${ARC_CENTER + ARC_RADIUS} ${ARC_CENTER}`}
        fill="none" stroke="#27272a" strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <motion.path
        d={`M ${ARC_CENTER - ARC_RADIUS} ${ARC_CENTER}
            A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1
            ${ARC_CENTER + ARC_RADIUS} ${ARC_CENTER}`}
        fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={ARC_CIRCUMFERENCE}
        style={{ strokeDashoffset: dashOffset }}
      />
      {/* Percentage text */}
      <text
        x={ARC_CENTER} y={ARC_CENTER - 4}
        textAnchor="middle"
        fill={color}
        fontSize={size === "sm" ? "14" : "18"}
        fontFamily="var(--font-mono, ui-monospace)"
        fontWeight="700"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}
