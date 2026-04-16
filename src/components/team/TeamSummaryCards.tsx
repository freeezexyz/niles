import { Card } from "@/components/ui/card";

interface TeamSummaryCardsProps {
  pipelineValue: number;
  avgHealth: number;
  atRiskCount: number;
}

export function TeamSummaryCards({
  pipelineValue,
  avgHealth,
  atRiskCount,
}: TeamSummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          Team Pipeline
        </p>
        <p className="text-2xl font-bold text-gold-500 mt-1">
          ${pipelineValue.toLocaleString()}
        </p>
      </Card>
      <Card className="border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          Avg Health
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">{avgHealth}</p>
      </Card>
      <Card className="border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          At Risk
        </p>
        <p className={`text-2xl font-bold mt-1 ${atRiskCount > 0 ? "text-destructive" : "text-principle-trust"}`}>
          {atRiskCount}
        </p>
      </Card>
    </div>
  );
}
