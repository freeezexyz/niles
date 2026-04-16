import type { Deal } from "@/lib/types";
import { Card } from "@/components/ui/card";

interface PipelineStatsProps {
  deals: Deal[];
}

export function PipelineStats({ deals }: PipelineStatsProps) {
  const activeDeals = deals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  );
  const totalValue = activeDeals.reduce(
    (sum, d) => sum + (Number(d.value) || 0),
    0
  );
  const avgHealth =
    activeDeals.length > 0
      ? Math.round(
          activeDeals.reduce((sum, d) => sum + d.health_overall, 0) /
            activeDeals.length
        )
      : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          Active Deals
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {activeDeals.length}
        </p>
      </Card>
      <Card className="border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          Pipeline Value
        </p>
        <p className="text-2xl font-bold text-gold-500 mt-1">
          ${totalValue.toLocaleString()}
        </p>
      </Card>
      <Card className="border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          Avg Health
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">{avgHealth}</p>
      </Card>
    </div>
  );
}
