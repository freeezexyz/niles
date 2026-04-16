import { AlertTriangle } from "lucide-react";
import { PRINCIPLES, type PrincipleKey } from "@/lib/utils/principles";
import type { Deal } from "@/lib/types";

interface HealthAlertProps {
  deal: Deal;
  threshold?: number;
}

const healthKeys: { key: PrincipleKey; field: keyof Deal }[] = [
  { key: "purpose", field: "health_purpose" },
  { key: "visioning", field: "health_visioning" },
  { key: "knowledge", field: "health_knowledge" },
  { key: "kindness", field: "health_kindness" },
  { key: "leadership", field: "health_leadership" },
  { key: "trust", field: "health_trust" },
  { key: "emotional", field: "health_emotional_intel" },
];

export function HealthAlert({ deal, threshold = 40 }: HealthAlertProps) {
  const alerts = healthKeys.filter(
    ({ field }) => (deal[field] as number) < threshold
  );

  if (alerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <p className="text-sm font-semibold text-destructive">
          Principle Alert
        </p>
      </div>
      <ul className="space-y-1">
        {alerts.map(({ key, field }) => {
          const principle = PRINCIPLES[key];
          return (
            <li key={key} className="text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-foreground">
                {principle.chapterLabel} — {principle.name}
              </span>{" "}
              is at{" "}
              <span className="text-destructive font-medium">
                {deal[field] as number}/100
              </span>
              . Focus on: {principle.description}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
