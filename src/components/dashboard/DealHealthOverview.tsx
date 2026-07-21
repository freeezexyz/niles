import Link from "next/link";
import type { Deal } from "@/lib/types";
import { HealthBar } from "@/components/shared/HealthBar";

// Pure presentational (server-renderable). Shows active-pipeline health at a
// glance: count, average health, and the deals most in need of attention.
export function DealHealthOverview({ deals }: { deals: Deal[] }) {
  const active = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");

  if (active.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">No active deals yet.</p>
        <Link
          href="/pipeline"
          className="mt-2 inline-block text-sm text-gold-500 hover:underline"
        >
          Add your first deal →
        </Link>
      </div>
    );
  }

  const avgHealth = Math.round(
    active.reduce((s, d) => s + d.health_overall, 0) / active.length
  );
  const atRisk = [...active]
    .sort((a, b) => a.health_overall - b.health_overall)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-4">
        <div>
          <p className="text-3xl font-display font-bold text-foreground">
            {active.length}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">Active deals</p>
        </div>
        <div>
          <p className="text-3xl font-display font-bold text-foreground">
            {avgHealth}
            <span className="text-base text-[var(--text-muted)]">/100</span>
          </p>
          <p className="text-xs text-[var(--text-secondary)]">Avg health</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
          Needs attention
        </p>
        {atRisk.map((d) => (
          <Link
            key={d.id}
            href={`/deals/${d.id}`}
            className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-[var(--input)] transition-colors"
          >
            <span className="flex-1 truncate text-sm text-foreground">
              {d.title}
            </span>
            <span className="w-24 shrink-0">
              <HealthBar score={d.health_overall} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
