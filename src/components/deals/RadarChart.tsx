"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// The 7 Pharaoh principles, keyed the same way everywhere (see principles.ts).
export interface PrincipleScores {
  purpose: number;
  visioning: number;
  knowledge: number;
  kindness: number;
  leadership: number;
  trust: number;
  emotional: number;
}

interface RadarChartProps {
  scores: PrincipleScores;
  /** Series name shown in tooltips/legend (e.g. "Health", "Development"). */
  label?: string;
}

export function RadarChart({ scores, label = "Score" }: RadarChartProps) {
  const data = [
    { principle: "Purpose", score: scores.purpose, fullMark: 100 },
    { principle: "Visioning", score: scores.visioning, fullMark: 100 },
    { principle: "Knowledge", score: scores.knowledge, fullMark: 100 },
    { principle: "Kindness", score: scores.kindness, fullMark: 100 },
    { principle: "Leadership", score: scores.leadership, fullMark: 100 },
    { principle: "Trust", score: scores.trust, fullMark: 100 },
    { principle: "EQ", score: scores.emotional, fullMark: 100 },
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
          name={label}
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
