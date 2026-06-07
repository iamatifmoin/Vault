"use client";

import { useMemo, useState } from "react";
import { CORE_DSA_TOPICS } from "@/lib/algorithms";
import { cn } from "@/lib/utils";
import type { TopicMastery } from "@/types";

const VIEW_SIZE = 400;
const CX = 200;
const CY = 200;
const RADIUS = 160;
const RING_FRACTIONS = [0.2, 0.4, 0.6, 0.8, 1];
const LABEL_PADDING = 14;

export interface TopicRadarProps {
  masteryData: TopicMastery[];
  size?: number;
}

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

function axisTipPoint(
  index: number,
  total: number,
  radius: number,
  cx: number,
  cy: number,
) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
    angle,
  };
}

function labelPoint(
  index: number,
  total: number,
  radius: number,
  cx: number,
  cy: number,
) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const r = radius + LABEL_PADDING;
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  };
}

function truncateLabel(topic: string): string {
  return topic.length > 8 ? topic.slice(0, 8) : topic;
}

function getTextAnchor(
  x: number,
  cx: number,
): "start" | "middle" | "end" {
  if (x - cx > 8) return "start";
  if (cx - x > 8) return "end";
  return "middle";
}

function getDominantBaseline(
  y: number,
  cy: number,
): "hanging" | "middle" | "auto" {
  if (y - cy > 8) return "hanging";
  if (cy - y > 8) return "auto";
  return "middle";
}

export function TopicRadar({ masteryData, size = 400 }: TopicRadarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const topics = useMemo(() => {
    const scoreByTopic = new Map(
      masteryData.map((entry) => [entry.topic, entry]),
    );

    return CORE_DSA_TOPICS.map((topic) => {
      const entry = scoreByTopic.get(topic);
      return {
        topic,
        masteryScore: entry?.masteryScore ?? 0,
        totalSolved: entry?.totalSolved ?? 0,
      };
    });
  }, [masteryData]);

  const total = topics.length;
  const dataPoints = topics.map((item, index) =>
    topicToPoint(index, total, item.masteryScore, RADIUS, CX, CY),
  );
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const hovered = hoveredIndex !== null ? topics[hoveredIndex] : null;
  const hoveredPoint =
    hoveredIndex !== null ? dataPoints[hoveredIndex] : null;

  return (
    <div className="relative inline-block w-full max-w-full">
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        width={size}
        height={size}
        className="mx-auto block"
        role="img"
        aria-label="Topic mastery radar chart"
      >
        {RING_FRACTIONS.map((fraction) => (
          <circle
            key={fraction}
            cx={CX}
            cy={CY}
            r={RADIUS * fraction}
            fill="none"
            stroke="rgb(63 63 70 / 0.4)"
            strokeWidth={1}
          />
        ))}

        {topics.map((_, index) => {
          const tip = axisTipPoint(index, total, RADIUS, CX, CY);
          return (
            <line
              key={`axis-${index}`}
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

        {dataPoints.map((point, index) => (
          <circle
            key={`dot-${index}`}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === index ? 6 : 4}
            fill="rgb(34 197 94)"
            className="cursor-pointer transition-[r] duration-150"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label={`${topics[index].topic}: ${topics[index].masteryScore}`}
          />
        ))}

        {topics.map((item, index) => {
          const pos = labelPoint(index, total, RADIUS, CX, CY);
          return (
            <text
              key={`label-${index}`}
              x={pos.x}
              y={pos.y}
              fontSize={12}
              fill="rgb(161 161 170)"
              textAnchor={getTextAnchor(pos.x, CX)}
              dominantBaseline={getDominantBaseline(pos.y, CY)}
              className="select-none font-sans"
            >
              {truncateLabel(item.topic)}
            </text>
          );
        })}
      </svg>

      {hovered && hoveredPoint ? (
        <div
          className={cn(
            "pointer-events-none absolute z-10 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md",
          )}
          style={{
            left: `${(hoveredPoint.x / VIEW_SIZE) * 100}%`,
            top: `${(hoveredPoint.y / VIEW_SIZE) * 100}%`,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          <span className="font-medium">{hovered.topic}</span>
          <span className="ml-2 font-mono tabular-nums">
            {hovered.masteryScore}/100
          </span>
        </div>
      ) : null}
    </div>
  );
}
