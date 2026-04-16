"use client";

import { Flame } from "lucide-react";

interface StreakCounterProps {
  days: number;
}

export function StreakCounter({ days }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/5 px-3 py-1.5">
      <Flame className="h-4 w-4 text-gold-500" />
      <span className="text-sm font-semibold text-gold-500">{days}</span>
      <span className="text-xs text-[var(--text-muted)]">day streak</span>
    </div>
  );
}
