"use client";

import { RadarChart, type PrincipleScores } from "@/components/deals/RadarChart";
import { repScoreAverage } from "@/lib/rep-score";
import { PRINCIPLES, type PrincipleKey } from "@/lib/utils/principles";

export function RepDevelopmentCard({ scores }: { scores: PrincipleScores }) {
  const entries = Object.entries(scores) as [PrincipleKey, number][];
  const [weakestKey] = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  const focus = PRINCIPLES[weakestKey];
  const avg = repScoreAverage(scores);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-3xl font-display font-bold text-gradient-gold">
            {avg}
            <span className="text-base text-[var(--text-muted)]">/100</span>
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Development score today
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)]">Focus next</p>
          <p className="text-sm font-medium text-foreground">
            {focus.name}{" "}
            <span className="text-[var(--text-muted)]">{focus.chapterLabel}</span>
          </p>
        </div>
      </div>
      <RadarChart scores={scores} label="Development" />
    </div>
  );
}
