"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { Deal } from "@/lib/types";

interface RadarChartProps {
  deal: Deal;
}

export function RadarChart({ deal }: RadarChartProps) {
  const data = [
    { principle: "Purpose", score: deal.health_purpose, fullMark: 100 },
    { principle: "Visioning", score: deal.health_visioning, fullMark: 100 },
    { principle: "Knowledge", score: deal.health_knowledge, fullMark: 100 },
    { principle: "Kindness", score: deal.health_kindness, fullMark: 100 },
    { principle: "Leadership", score: deal.health_leadership, fullMark: 100 },
    { principle: "Trust", score: deal.health_trust, fullMark: 100 },
    { principle: "EQ", score: deal.health_emotional_intel, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="rgba(245, 158, 11, 0.12)" />
        <PolarAngleAxis
          dataKey="principle"
          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Health"
          dataKey="score"
          stroke="#F59E0B"
          fill="#F59E0B"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
